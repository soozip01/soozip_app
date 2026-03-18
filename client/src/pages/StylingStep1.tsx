/**
 * STEP 01 공간 실측 - 실측 정보 입력 페이지
 * - 관리자가 업로드한 도면 초안(step1_m)을 다운로드
 * - 사용자가 치수를 기입한 도면을 여러 장 업로드(step1)
 */
import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Upload, X, Plus, FileImage, AlertCircle, CheckCircle2, Loader2, MessageSquare, File } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

const TERRACOTTA = "#d31400";

interface UploadedFile {
  id: string;
  name: string;
  url?: string;
  preview?: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

export default function StylingStep1() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();

  // URL 파라미터에서 surveyId 추출
  const searchParams = new URLSearchParams(window.location.search);
  const surveyId = searchParams.get("surveyId");

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 내 신청 데이터 조회 (step1_m 도면 URL 포함)
  const userId = user?.id ? String(user.id) : undefined;
  const { data: surveyData, isLoading: surveyLoading } = trpc.survey.mySubmission.useQuery(
    { userId: userId },
    { enabled: isLoggedIn && !!user?.id }
  );

  // 파일 업로드 mutation
  const uploadMutation = trpc.survey.uploadStepFile.useMutation({
    onSuccess: (data, variables) => {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === variables.fileName + variables.fileBase64.slice(0, 8)
            ? { ...f, status: "done", url: data.url }
            : f
        )
      );
    },
    onError: (err, variables) => {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === variables.fileName + variables.fileBase64.slice(0, 8)
            ? { ...f, status: "error", error: err.message }
            : f
        )
      );
      toast.error("파일 업로드에 실패했습니다.");
    },
  });

  // 파일 삭제 mutation
  const deleteMutation = trpc.survey.deleteStepFile.useMutation({
    onSuccess: () => {
      toast.success("파일이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("파일 삭제에 실패했습니다.");
    },
  });

  // 파일을 base64로 변환
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // data:image/png;base64,XXXX → XXXX 만 추출
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 파일 미리보기 URL 생성
  const fileToPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // 파일 처리 (업로드)
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    const userIdStr = String(user.id);

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

      // 임시 상태 추가
      setUploadedFiles(prev => [
        ...prev,
        { id: tempId, name: file.name, preview, status: "uploading" }
      ]);

      // 서버에 업로드
      uploadMutation.mutate({
        userId: userIdStr,
        stepKey: "step1",
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    }
  }, [user, uploadMutation]);

  // 드래그 앤 드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 파일 삭제
  const handleDeleteFile = (fileId: string, fileUrl?: string) => {
    if (!user?.id || !fileUrl) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      return;
    }
    deleteMutation.mutate({ userId: String(user.id), stepKey: "step1", fileUrl });
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // 관리자 도면 다운로드
  const handleDownloadAdminFile = (url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `도면_초안_${index + 1}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 관리자 업로드 도면 URL 파싱
  // step1_m 파싱: 텍스트와 파일 URL이 줄바꿈으로 혼합 저장됨
  const parseAdminContent = (raw: string | null | undefined): { texts: string[]; files: string[] } => {
    if (!raw) return { texts: [], files: [] };
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return {
          files: parsed.filter((s: string) => s.startsWith('http')),
          texts: parsed.filter((s: string) => !s.startsWith('http')),
        };
      }
    } catch { /* not JSON */ }
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return {
      files: lines.filter(l => l.startsWith('http')),
      texts: lines.filter(l => !l.startsWith('http')),
    };
  };

  const { texts: adminTexts, files: adminFiles } = parseAdminContent(surveyData?.step1m);
  const hasAdminContent = adminFiles.length > 0 || adminTexts.length > 0;

  // 기존 업로드된 파일 파싱 (step1 컬럼)
  const parseUserFiles = (raw: string | null | undefined): string[] => {
    if (!raw || raw === "pending" || raw === "completed") return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [raw];
    } catch {
      return [raw];
    }
  };

  const existingUserFiles = parseUserFiles(surveyData?.step1);

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
            <p className="text-[11px] text-gray-400 leading-none mb-0.5">STEP 01</p>
            <h1 className="text-[16px] font-bold text-gray-900 leading-tight">공간 실측</h1>
          </div>
        </div>
        {/* 진행 표시 바 */}
        <div className="h-0.5 bg-gray-100">
          <div className="h-full w-[14%] transition-all duration-500" style={{ background: TERRACOTTA }} />
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
            <div>
              <p className="text-[13px] font-bold text-gray-800 mb-1">실측 방법 안내</p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                아래 도면 초안을 다운로드하여 출력하거나 디지털로 편집한 후,
                공간의 <strong>가로·세로·높이</strong> 치수와 <strong>창문·문 위치</strong>를
                직접 기입해주세요. 완성된 도면을 사진으로 찍거나 파일로 업로드해주세요.
              </p>
            </div>
          </div>
        </div>

        {/* 섹션 1: 담당자 메시지 및 체부파일 (항상 표시) */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: TERRACOTTA }}
            >
              <span className="text-[9px] font-bold text-white">1</span>
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
              <p className="text-[11px] text-gray-400 leading-relaxed">담당자가 메시지나 도면을 등록하면<br />여기서 확인할 수 있어요</p>
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
              {/* 체부 파일 */}
              {adminFiles.map((fileUrl, idx) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
                const fileName = decodeURIComponent(fileUrl.split('/').pop()?.split('?')[0] ?? `파일 ${idx + 1}`);
                return (
                  <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
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

        {/* 섹션 2: 실측 도면 업로드 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: TERRACOTTA }}
            >
              <span className="text-[9px] font-bold text-white">2</span>
            </div>
            <h2 className="text-[14px] font-bold text-gray-800">실측 도면 업로드</h2>
          </div>

          <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">
            치수를 기입한 도면을 업로드해주세요. 방이 여러 개인 경우 각 방의 도면을 모두 업로드해주세요.
          </p>

          {/* 기존 업로드 파일 (서버에서 불러온 것) */}
          {existingUserFiles.length > 0 && (
            <div className="space-y-2 mb-3">
              {existingUserFiles.map((url, idx) => (
                <div
                  key={`existing-${idx}`}
                  className="rounded-xl border border-gray-200 p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={url} alt={`업로드 ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-700 truncate">업로드된 도면 {idx + 1}</p>
                    <p className="text-[11px] text-green-500 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={11} /> 업로드 완료
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (user?.id) {
                        deleteMutation.mutate({ userId: String(user.id), stepKey: "step1", fileUrl: url });
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              ))}
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
                  {/* 미리보기 */}
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
                {isDragOver ? "여기에 놓으세요" : "도면 파일 추가하기"}
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

        {/* 업로드 완료 확인 버튼 */}
        {(uploadedFiles.some(f => f.status === "done") || existingUserFiles.length > 0) && (
          <div className="pt-2">
            <button
              onClick={() => {
                toast.success("실측 도면이 저장되었습니다. 담당자가 확인 후 다음 단계로 안내드릴게요.");
                setTimeout(() => navigate("/mypage"), 1500);
              }}
              className="w-full py-4 rounded-full text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
              style={{ background: TERRACOTTA }}
            >
              제출 완료
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              제출 후에도 추가 업로드가 가능해요
            </p>
          </div>
        )}

        {/* 도움말 */}
        <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
          <p className="text-[12px] font-semibold text-gray-700 mb-2">실측 팁</p>
          <ul className="space-y-1.5">
            {[
              "줄자나 레이저 측정기로 가로·세로·높이를 cm 단위로 측정해주세요",
              "창문과 문의 위치, 크기도 함께 기입해주세요",
              "콘센트, 에어컨 배관 등 고정 설비 위치도 표시해주시면 좋아요",
              "방이 여러 개인 경우 각 방마다 별도 도면을 업로드해주세요",
            ].map((tip, i) => (
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

      </div>
    </div>
  );
}
