/**
 * STEP별 공통 업로드 페이지
 * - 관리자가 업로드한 파일(stepN_m)을 다운로드
 * - 사용자가 파일 또는 텍스트를 업로드하여 Supabase step1~7 컬럼에 저장
 * - Supabase Storage 'soozip_styling_step' 버킷에 파일 저장 후 URL로 변환
 */
import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Download, Upload, X, Plus, FileImage,
  AlertCircle, CheckCircle2, Loader2, MessageSquare, File
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

const TERRACOTTA = "#d31400";

type StepKey = 'step1' | 'step2' | 'step4' | 'step5' | 'step6' | 'step7';

interface UploadedFile {
  id: string;
  name: string;
  url?: string;
  preview?: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

interface StepConfig {
  stepKey: StepKey;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  allowText: boolean;
  allowFiles: boolean;
  requiresAdminFile?: boolean; // true: 디자이너 파일 없으면 사용자 입력 잠금
  textPlaceholder?: string;
  textLabel?: string;
  fileLabel?: string;
  tips: string[];
  progressPercent: number;
}

// STEP별 설정 정의
const STEP_CONFIGS: Record<StepKey, StepConfig> = {
  step1: {
    stepKey: 'step1',
    stepNumber: 1,
    title: "공간 실측",
    subtitle: "STEP 01",
    description: "도면 초안을 다운로드하여 공간의 가로·세로·높이 치수와 창문, 문 위치를 기입한 후 업로드해주세요.",
    allowText: false,
    allowFiles: true,
    fileLabel: "실측 도면 업로드",
    tips: [
      "줄자나 레이저 측정기로 가로·세로·높이를 cm 단위로 측정해주세요",
      "창문과 문의 위치, 크기도 함께 기입해주세요",
      "콘센트, 에어컨 배관 등 고정 설비 위치도 표시해주시면 좋아요",
      "방이 여러 개인 경우 각 방마다 별도 도면을 업로드해주세요",
    ],
    progressPercent: 14,
  },
  step2: {
    stepKey: 'step2',
    stepNumber: 2,
    title: "기존 가구 정보 전달",
    subtitle: "STEP 02",
    description: "현재 보유하고 있는 가구의 제품 링크나 사이즈 정보를 입력해주세요. 유지할 가구와 교체할 가구를 구분해서 알려주시면 좋아요.",
    allowText: true,
    allowFiles: true,
    textLabel: "가구 정보 입력",
    textPlaceholder: "예) 소파: 이케아 KIVIK 3인용 (W228×D83×H83cm), 유지 예정\n식탁: 현재 없음, 새로 구매 희망\n침대: 퀸사이즈, 교체 예정...",
    fileLabel: "가구 사진 또는 제품 링크 스크린샷 업로드",
    tips: [
      "유지할 가구와 교체할 가구를 구분해서 알려주세요",
      "가구 사이즈(가로×세로×높이)를 cm 단위로 기재해주세요",
      "제품 링크가 있다면 텍스트로 입력하거나 스크린샷을 업로드해주세요",
      "가구 사진을 찍어 업로드하면 더 정확한 제안이 가능해요",
    ],
    progressPercent: 28,
  },
  step4: {
    stepKey: 'step4',
    stepNumber: 4,
    title: "피드백 및 수정",
    subtitle: "STEP 04",
    description: "배치안에 대한 피드백을 남겨주세요. 수정을 원하는 부분이나 추가 요청사항을 자세히 작성해주세요.",
    allowText: true,
    allowFiles: true,
    requiresAdminFile: true,
    textLabel: "피드백 작성",
    textPlaceholder: "예) 소파 위치를 창문 쪽으로 옵겨주세요. 식탁은 현재 제안대로 좋습니다. 책상은 좀 더 벽 쪽으로...",
    fileLabel: "참고 이미지 업로드 (선택)",
    tips: [
      "구체적인 피드백일수록 더 정확한 수정이 가능해요",
      "수정을 원하지 않는 부분은 '현재대로 유지'라고 명시해주세요",
      "참고하고 싶은 이미지가 있다면 함께 업로드해주세요",
    ],
    progressPercent: 57,
  },
  step5: {
    stepKey: 'step5',
    stepNumber: 5,
    title: "최종 시안 전달",
    subtitle: "STEP 05",
    description: "최종 배치안과 제품 링크를 확인해주세요. 담당 디자이너가 첨부한 파일을 다운로드하세요.",
    allowText: true,
    allowFiles: false,
    requiresAdminFile: true,
    textLabel: "확인 메모 (선택)",
    textPlaceholder: "최종 시안에 대한 의견이나 확인 사항을 남겨주세요...",
    fileLabel: "",
    tips: [
      "최종 시안을 꼼꼼히 검토해주세요",
      "제품 링크를 통해 가구를 구매하실 수 있어요",
    ],
    progressPercent: 71,
  },
  step6: {
    stepKey: 'step6',
    stepNumber: 6,
    title: "풀 스타일링 진행",
    subtitle: "STEP 06",
    description: "풀 스타일링 작업이 진행 중입니다. 담당 디자이너가 업로드하는 진행 현황을 확인해주세요.",
    allowText: true,
    allowFiles: false,
    textLabel: "추가 요청사항 (선택)",
    textPlaceholder: "진행 중 추가로 요청하고 싶은 사항이 있다면 입력해주세요...",
    tips: [
      "진행 중 변경사항이 생기면 빠르게 알려주세요",
      "추가 요청사항은 담당 디자이너에게 전달됩니다",
    ],
    progressPercent: 85,
  },
  step7: {
    stepKey: 'step7',
    stepNumber: 7,
    title: "가구 및 소품 세팅",
    subtitle: "STEP 07",
    description: "선정된 가구와 소품 세팅이 진행됩니다. 세팅 일정과 관련된 정보를 확인해주세요.",
    allowText: true,
    allowFiles: true,
    textLabel: "세팅 관련 메모 (선택)",
    textPlaceholder: "세팅 시 주의사항이나 특이사항이 있다면 입력해주세요...",
    fileLabel: "세팅 완료 사진 업로드 (선택)",
    tips: [
      "세팅 당일 입장 가능한 시간을 미리 알려주세요",
      "주차 공간이나 엘리베이터 이용 여부를 확인해주세요",
      "세팅 완료 후 사진을 찍어 업로드해주시면 감사해요",
    ],
    progressPercent: 100,
  },
};

interface StylingStepUploadProps {
  stepKey: StepKey;
}

export default function StylingStepUpload({ stepKey }: StylingStepUploadProps) {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();
  const config = STEP_CONFIGS[stepKey];

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [isSavingText, setIsSavingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = user?.id ? String(user.id) : undefined;

  // 내 신청 데이터 조회
  const { data: surveyData, isLoading: surveyLoading, refetch } = trpc.survey.mySubmission.useQuery(
    { userId },
    { enabled: isLoggedIn && !!user?.id }
  );

  // 파일 업로드 mutation
  const uploadMutation = trpc.survey.uploadStepFile.useMutation({
    onSuccess: (data, variables) => {
      const tempId = variables.fileName + variables.fileBase64.slice(0, 8);
      setUploadedFiles(prev =>
        prev.map(f => f.id === tempId ? { ...f, status: "done", url: data.url } : f)
      );
      refetch();
      toast.success("파일이 업로드되었습니다.");
    },
    onError: (err, variables) => {
      const tempId = variables.fileName + variables.fileBase64.slice(0, 8);
      setUploadedFiles(prev =>
        prev.map(f => f.id === tempId ? { ...f, status: "error", error: err.message } : f)
      );
      toast.error("파일 업로드에 실패했습니다.");
    },
  });

  // 파일 삭제 mutation
  const deleteMutation = trpc.survey.deleteStepFile.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("파일이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("파일 삭제에 실패했습니다.");
    },
  });

  // STEP 완료 mutation
  const completeStepMutation = trpc.survey.completeStep.useMutation();

  // 텍스트 저장 mutation
  const updateTextMutation = trpc.survey.updateStepText.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("내용이 저장되었습니다.");
      setIsSavingText(false);
    },
    onError: () => {
      toast.error("저장에 실패했습니다.");
      setIsSavingText(false);
    },
  });

  // 파일을 base64로 변환
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 파일 미리보기 URL 생성
  const fileToPreview = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  // 파일 처리
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => {
      const isImage = f.type.startsWith("image/");
      const isPdf = f.type === "application/pdf";
      if (!isImage && !isPdf) {
        toast.error(`${f.name}: 이미지 또는 PDF 파일만 업로드 가능합니다.`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name}: 파일 크기는 10MB 이하여야 합니다.`);
        return false;
      }
      return true;
    });

    for (const file of validFiles) {
      const base64 = await fileToBase64(file);
      const preview = file.type.startsWith("image/") ? await fileToPreview(file) : undefined;
      const tempId = file.name + base64.slice(0, 8);

      setUploadedFiles(prev => [
        ...prev,
        { id: tempId, name: file.name, preview, status: "uploading" }
      ]);

      uploadMutation.mutate({
        userId: String(user.id),
        stepKey,
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    }
  }, [user, uploadMutation, stepKey]);

  // 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  // 파일 삭제
  const handleDeleteFile = (fileId: string, fileUrl?: string) => {
    if (!user?.id || !fileUrl) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      return;
    }
    deleteMutation.mutate({ userId: String(user.id), stepKey, fileUrl });
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // 텍스트 저장
  const handleSaveText = () => {
    if (!user?.id) return;
    setIsSavingText(true);
    updateTextMutation.mutate({
      userId: String(user.id),
      stepKey,
      text: textContent,
    });
  };

  // 사용자 업로드 파일 파싱 (JSON 배열 또는 단일 URL)
  const parseUrls = (raw: string | null | undefined): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [raw];
    } catch {
      return raw !== 'pending' && raw !== 'completed' ? [raw] : [];
    }
  };

  // step_m 컬럼 파싱: 텍스트와 파일 URL이 줄바꿈으로 혼합 저장됨
  // 예: "안녕하세요\n\nhttps://...jpg"
  const stepMKey = `${stepKey}m` as keyof typeof surveyData;
  const rawAdminData = surveyData ? (surveyData[stepMKey] as string | null) : null;

  const parseAdminContent = (raw: string | null | undefined): { texts: string[]; files: string[] } => {
    if (!raw) return { texts: [], files: [] };
    // JSON 배열 형태인 경우 (기존 방식)
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const files = parsed.filter((s: string) => s.startsWith('http'));
        const texts = parsed.filter((s: string) => !s.startsWith('http'));
        return { texts, files };
      }
    } catch { /* not JSON */ }
    // 줄바꿈으로 구분된 텍스트+URL 혼합 형태
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const files = lines.filter(l => l.startsWith('http'));
    const texts = lines.filter(l => !l.startsWith('http'));
    return { texts, files };
  };

  const { texts: adminTexts, files: adminFiles } = parseAdminContent(rawAdminData);
  const hasAdminContent = adminFiles.length > 0 || adminTexts.length > 0;

  // 사용자 업로드 파일 파싱 (text:: 항목과 파일 URL 분리)
  const rawStepData = surveyData ? (surveyData[stepKey as keyof typeof surveyData] as string | null) : null;
  const allItems = parseUrls(rawStepData);
  const existingUserFiles = allItems.filter(u => !u.startsWith('text::'));
  const existingText = allItems.find(u => u.startsWith('text::'))?.replace('text::', '') ?? '';

  // 텍스트 초기값 설정 (한 번만)
  const [textInitialized, setTextInitialized] = useState(false);
  if (!textInitialized && existingText && !textContent) {
    setTextContent(existingText);
    setTextInitialized(true);
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-semibold text-gray-800 mb-2">로그인이 필요합니다</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-3 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
            style={{ background: TERRACOTTA }}
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate("/mypage")}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <p className="text-[11px] text-gray-400 leading-none mb-0.5">{config.subtitle}</p>
            <h1 className="text-[16px] font-bold text-gray-900 leading-tight">{config.title}</h1>
          </div>
        </div>
        {/* 진행 표시 바 */}
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${config.progressPercent}%`, background: TERRACOTTA }}
          />
        </div>
      </header>

      <div className="px-4 pt-6 space-y-6">

        {/* 안내 카드 */}
        <div className="rounded-2xl p-4 border border-gray-100" style={{ background: "#fafafa" }}>
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: TERRACOTTA }}
            >
              <AlertCircle size={16} className="text-white" />
            </div>
            <p className="text-[12px] text-gray-600 leading-relaxed">{config.description}</p>
          </div>
        </div>

        {/* 섹션 1: 담당자 메시지 및 첨부파일 (항상 표시) */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: TERRACOTTA }}
            >
              <span className="text-[9px] font-bold text-white">↓</span>
            </div>
            <h2 className="text-[14px] font-bold text-gray-800">담당자 메시지</h2>
          </div>

          {surveyLoading ? (
            <div className="rounded-2xl border border-gray-100 p-6 flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">불러오는 중...</span>
            </div>
          ) : !hasAdminContent ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-5 flex flex-col items-center gap-2 text-center">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare size={16} className="text-gray-400" />
              </div>
              <p className="text-[13px] font-medium text-gray-500">아직 등록된 내용이 없어요</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">담당자가 메시지나 파일을 등록하면<br />여기에서 확인할 수 있어요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 텍스트 메시지 */}
              {adminTexts.length > 0 && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[11px] font-semibold text-blue-500 mb-2 flex items-center gap-1">
                    <MessageSquare size={11} /> 담당자 메시지
                  </p>
                  <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {adminTexts.join('\n')}
                  </p>
                </div>
              )}
              {/* 첨부 파일 */}
              {adminFiles.map((fileUrl, idx) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
                const fileName = decodeURIComponent(fileUrl.split('/').pop()?.split('?')[0] ?? `파일 ${idx + 1}`);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    {/* 이미지 미리보기 */}
                    {isImage && (
                      <div className="w-full rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ maxHeight: 200 }}>
                        <img src={fileUrl} alt={`첨부 ${idx + 1}`} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                        {isImage ? (
                          <img src={fileUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <File size={16} className="text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">{fileName}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">담당자 첨부 파일</p>
                      </div>
                      <a
                        href={fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-[12px] font-bold transition-opacity hover:opacity-90 shrink-0"
                        style={{ background: TERRACOTTA }}
                      >
                        <Download size={13} />
                        다운로드
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 섹션 2: 텍스트 입력 */}
        {config.allowText && (!config.requiresAdminFile || hasAdminContent) && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: TERRACOTTA }}
              >
                <MessageSquare size={11} className="text-white" />
              </div>
              <h2 className="text-[14px] font-bold text-gray-800">{config.textLabel}</h2>
            </div>

            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder={config.textPlaceholder}
              rows={5}
              className="w-full rounded-2xl border border-gray-200 p-4 text-[13px] text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none focus:border-gray-400 transition-colors"
              style={{ background: "#fafafa" }}
            />

            <button
              onClick={handleSaveText}
              disabled={isSavingText || !textContent.trim()}
              className="mt-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
              style={{ background: "#111111" }}
            >
              {isSavingText ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  저장 중...
                </span>
              ) : "내용 저장하기"}
            </button>

            {existingText && (
              <div className="mt-3 rounded-xl border border-green-100 p-3 bg-green-50">
                <p className="text-[11px] text-green-600 flex items-center gap-1 mb-1">
                  <CheckCircle2 size={11} /> 저장된 내용
                </p>
                <p className="text-[12px] text-gray-600 whitespace-pre-wrap">{existingText}</p>
              </div>
            )}
          </section>
        )}

        {/* 섹션 3: 파일 업로드 */}
        {config.allowFiles && (!config.requiresAdminFile || hasAdminContent) && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: TERRACOTTA }}
              >
                <Upload size={11} className="text-white" />
              </div>
              <h2 className="text-[14px] font-bold text-gray-800">{config.fileLabel}</h2>
            </div>

            {/* 기존 업로드 파일 (서버에서 불러온 것) */}
            {existingUserFiles.length > 0 && (
              <div className="space-y-2 mb-3">
                {existingUserFiles.map((url, idx) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
                  const fileName = url.split('/').pop()?.split('?')[0] ?? `파일 ${idx + 1}`;
                  return (
                    <div
                      key={`existing-${idx}`}
                      className="rounded-xl border border-green-100 p-3 flex items-center gap-3 bg-green-50"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                        {isImage ? (
                          <img src={url} alt={`업로드 ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <FileImage size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-gray-700 truncate">{fileName}</p>
                        <p className="text-[11px] text-green-500 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 size={11} /> 업로드 완료
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (user?.id) {
                            deleteMutation.mutate({ userId: String(user.id), stepKey, fileUrl: url });
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                      >
                        <X size={14} className="text-gray-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 현재 세션에서 업로드 중인 파일 */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mb-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-xl border p-3 flex items-center gap-3"
                    style={{
                      borderColor: file.status === "error" ? "#fca5a5" : file.status === "done" ? "#bbf7d0" : "#e5e7eb",
                      background: file.status === "error" ? "#fff5f5" : file.status === "done" ? "#f0fdf4" : "#fafafa",
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileImage size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-[11px] mt-0.5 flex items-center gap-1">
                        {file.status === "uploading" && (
                          <><Loader2 size={11} className="animate-spin text-gray-400" /><span className="text-gray-400">업로드 중...</span></>
                        )}
                        {file.status === "done" && (
                          <><CheckCircle2 size={11} className="text-green-500" /><span className="text-green-500">업로드 완료</span></>
                        )}
                        {file.status === "error" && (
                          <><AlertCircle size={11} className="text-red-400" /><span className="text-red-400">{file.error ?? "오류 발생"}</span></>
                        )}
                      </p>
                    </div>
                    {file.status !== "uploading" && (
                      <button
                        onClick={() => handleDeleteFile(file.id, file.url)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                      >
                        <X size={14} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 드래그 앤 드롭 업로드 영역 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-3 cursor-pointer transition-all"
              style={{
                borderColor: isDragOver ? TERRACOTTA : "#e5e7eb",
                background: isDragOver ? "#fff5f5" : "#fafafa",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: isDragOver ? TERRACOTTA : "#f3f4f6" }}
              >
                {isDragOver ? (
                  <Upload size={20} className="text-white" />
                ) : (
                  <Plus size={20} className="text-gray-400" />
                )}
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-gray-700">
                  {isDragOver ? "여기에 놓으세요" : "파일 추가하기"}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  JPG, PNG, PDF · 최대 10MB · 여러 장 가능
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />
          </section>
        )}

        {/* 팁 섹션 */}
        {config.tips.length > 0 && (
          <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
            <p className="text-[12px] font-semibold text-gray-700 mb-2">안내사항</p>
            <ul className="space-y-1.5">
              {config.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-white"
                    style={{ background: TERRACOTTA }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[11px] text-gray-500 leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 완료 버튼 - 디자이너 파일 필수 STEP에서 파일 없으면 잠금 */}
        {config.requiresAdminFile && !hasAdminContent ? (
          <div className="pt-2">
            <button
              disabled
              className="w-full py-4 rounded-full text-gray-400 font-bold text-[15px] bg-gray-100 cursor-not-allowed"
            >
              담당자 파일 등록 후 진행 가능해요
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={async () => {
                if (user?.id) {
                  try {
                    await completeStepMutation.mutateAsync({ userId: String(user.id), stepKey });
                  } catch { /* 완료 처리 실패해도 이동 허용 */ }
                }
                toast.success("제출이 완료되었습니다!");
                setTimeout(() => navigate("/mypage"), 1200);
              }}
              disabled={completeStepMutation.isPending}
              className="w-full py-4 rounded-full text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70"
              style={{ background: TERRACOTTA }}
            >
              {completeStepMutation.isPending ? "처리 중..." : "제출완료"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
