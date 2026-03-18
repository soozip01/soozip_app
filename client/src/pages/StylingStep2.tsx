/* SOOZIP - STEP 02: 기존 가구 정보 전달
 * - 제품 링크 방식: URL + 옵션 입력
 * - 사진+사이즈 방식: 사진 업로드 + 가로/깊이/높이 입력
 * - 저장: survey_submissions.step2 컬럼 (JSON 배열)
 * - 기존 입력 데이터 자동 불러오기 지원
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Link2, Camera, Plus, Trash2,
  ChevronDown, ChevronUp, CheckCircle2, Loader2, X, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

const TERRACOTTA = "#d31400";

type InputMode = "link" | "photo";

interface LinkItem {
  id: string;
  productLink: string;
  productOption: string;
}

interface PhotoItem {
  id: string;
  photoPreview: string;
  photoUrl: string;
  productName: string;
  width: string;
  depth: string;
  height: string;
  notes: string;
  uploading: boolean;
  uploadError: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

/* ─── 저장된 step2 데이터 파싱 ─── */
function parseStep2Data(raw: string | null): { mode: InputMode; linkItems: LinkItem[]; photoItems: PhotoItem[] } | null {
  if (!raw || raw === 'pending' || raw === 'completed') return null;

  try {
    // JSON 배열 형태로 저장된 경우
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // text:: 형태의 텍스트 항목 찾기
      const textItems = parsed.filter((u: string) => typeof u === 'string' && u.startsWith('text::'));
      if (textItems.length > 0) {
        const text = textItems[0].replace('text::', '');
        // 링크 방식인지 사진 방식인지 판단
        if (text.includes('링크:')) {
          const lines = text.split('\n').filter(Boolean);
          const linkItems: LinkItem[] = lines.map((line: string) => {
            const linkMatch = line.match(/링크:\s*(\S+)/);
            const optionMatch = line.match(/옵션:\s*(.+)/);
            return {
              id: generateId(),
              productLink: linkMatch?.[1] ?? '',
              productOption: optionMatch?.[1] ?? '',
            };
          }).filter((item: LinkItem) => item.productLink);
          if (linkItems.length > 0) {
            return { mode: 'link', linkItems, photoItems: [] };
          }
        } else if (text.includes('제품명:') || text.includes('사이즈:')) {
          const lines = text.split('\n').filter(Boolean);
          const photoItems: PhotoItem[] = lines.map((line: string) => {
            const nameMatch = line.match(/제품명:\s*([^/]+)/);
            const sizeMatch = line.match(/사이즈:\s*([^/]+)/);
            const wMatch = sizeMatch?.[1]?.match(/W(\d+)/);
            const dMatch = sizeMatch?.[1]?.match(/D(\d+)/);
            const hMatch = sizeMatch?.[1]?.match(/H(\d+)/);
            const notesMatch = line.match(/특이사항:\s*(.+)/);
            return {
              id: generateId(),
              photoPreview: '',
              photoUrl: '',
              productName: nameMatch?.[1]?.trim() ?? '',
              width: wMatch?.[1] ?? '',
              depth: dMatch?.[1] ?? '',
              height: hMatch?.[1] ?? '',
              notes: notesMatch?.[1]?.trim() ?? '',
              uploading: false,
              uploadError: '',
            };
          }).filter((item: PhotoItem) => item.productName || item.width);
          if (photoItems.length > 0) {
            return { mode: 'photo', linkItems: [], photoItems };
          }
        }
      }
    }
  } catch { /* ignore */ }

  return null;
}

/* ─── 제품 링크 아이템 ─── */
function LinkItemCard({
  item, index, onChange, onDelete, canDelete,
}: {
  item: LinkItem;
  index: number;
  onChange: (id: string, field: keyof LinkItem, value: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  let hostname = `가구 ${index + 1}`;
  try {
    if (item.productLink) hostname = new URL(item.productLink).hostname.replace("www.", "");
  } catch { /* ignore */ }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: "#fafafa" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: TERRACOTTA }}>
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-gray-800">{hostname}</span>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              제품 링크 <span style={{ color: TERRACOTTA }}>*</span>
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus-within:border-gray-400 transition-colors">
              <Link2 size={14} className="text-gray-400 shrink-0" />
              <input
                type="url"
                placeholder="https://www.example.com/product/..."
                value={item.productLink}
                onChange={(e) => onChange(item.id, "productLink", e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-300"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">쿠팡, 이케아, 한샘 등 구매 페이지 URL을 입력해주세요</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              옵션 / 색상 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              placeholder="예: 오크 / 화이트 / 2인용"
              value={item.productOption}
              onChange={(e) => onChange(item.id, "productOption", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 사진+사이즈 아이템 ─── */
function PhotoItemCard({
  item, index, onChange, onDelete, onUpload, canDelete,
}: {
  item: PhotoItem;
  index: number;
  onChange: (id: string, field: keyof PhotoItem, value: string) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string, file: File) => void;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: "#fafafa" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: TERRACOTTA }}>
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-gray-800">{item.productName || `가구 ${index + 1}`}</span>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-4 space-y-4">
          {/* 사진 업로드 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              가구 사진 <span style={{ color: TERRACOTTA }}>*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(item.id, file);
              }}
            />
            {item.photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={item.photoPreview} alt="가구 사진" className="w-full h-40 object-cover" />
                {item.uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
                )}
                {!item.uploading && item.photoUrl && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                )}
                {!item.uploading && item.uploadError && (
                  <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                    <AlertCircle size={14} className="text-white" />
                  </div>
                )}
                <button
                  onClick={() => {
                    onChange(item.id, "photoUrl", "");
                    onChange(item.id, "photoPreview", "");
                    onChange(item.id, "uploadError", "");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 left-2 bg-black/50 rounded-full p-1"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors bg-gray-50"
              >
                <Camera size={24} className="text-gray-300" />
                <span className="text-xs text-gray-400">사진을 선택해주세요</span>
                <span className="text-[10px] text-gray-300">JPG, PNG, HEIC 지원</span>
              </button>
            )}
          </div>

          {/* 제품명 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              제품명 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              placeholder="예: 4인용 식탁, 3인 소파"
              value={item.productName}
              onChange={(e) => onChange(item.id, "productName", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
            />
          </div>

          {/* 사이즈 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              사이즈 (mm) <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { field: "width" as keyof PhotoItem, label: "가로 W", placeholder: "1200" },
                { field: "depth" as keyof PhotoItem, label: "깊이 D", placeholder: "600" },
                { field: "height" as keyof PhotoItem, label: "높이 H", placeholder: "750" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                  <div className="flex items-center border border-gray-200 rounded-xl px-2.5 py-2 bg-gray-50 focus-within:border-gray-400 transition-colors">
                    <input
                      type="number"
                      placeholder={placeholder}
                      value={(item[field] as string) || ""}
                      onChange={(e) => onChange(item.id, field, e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none w-0 min-w-0 placeholder:text-gray-300"
                    />
                    <span className="text-[10px] text-gray-400 shrink-0">mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 특이사항 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              특이사항 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              placeholder="예: 다리 제거 가능, 색상 변경 예정 등"
              value={item.notes}
              onChange={(e) => onChange(item.id, "notes", e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 outline-none focus:border-gray-400 transition-colors resize-none placeholder:text-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function StylingStep2() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();
  const [mode, setMode] = useState<InputMode>("link");
  const [linkItems, setLinkItems] = useState<LinkItem[]>([
    { id: generateId(), productLink: "", productOption: "" },
  ]);
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([
    { id: generateId(), photoPreview: "", photoUrl: "", productName: "", width: "", depth: "", height: "", notes: "", uploading: false, uploadError: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const uploadFileMutation = trpc.survey.uploadStepFile.useMutation();
  const updateTextMutation = trpc.survey.updateStepText.useMutation();
  const completeStepMutation = trpc.survey.completeStep.useMutation();

  // 기존 신청 데이터 조회
  const { data: submission, isLoading: submissionLoading } = trpc.survey.mySubmission.useQuery(
    { userId: user ? String(user.id) : undefined },
    { enabled: isLoggedIn && !!user }
  );

  // 기존 step2 데이터 불러오기
  useEffect(() => {
    if (dataLoaded || submissionLoading) return;
    if (!submission) return;

    const parsed = parseStep2Data(submission.step2);
    if (parsed) {
      setMode(parsed.mode);
      if (parsed.mode === 'link' && parsed.linkItems.length > 0) {
        setLinkItems(parsed.linkItems);
      } else if (parsed.mode === 'photo' && parsed.photoItems.length > 0) {
        setPhotoItems(parsed.photoItems);
      }
    }
    setDataLoaded(true);
  }, [submission, submissionLoading, dataLoaded]);

  /* ─── 링크 핸들러 ─── */
  const handleLinkChange = useCallback((id: string, field: keyof LinkItem, value: string) => {
    setLinkItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  const handleLinkDelete = useCallback((id: string) => {
    setLinkItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /* ─── 사진 핸들러 ─── */
  const handlePhotoChange = useCallback((id: string, field: keyof PhotoItem, value: string) => {
    setPhotoItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  const handlePhotoDelete = useCallback((id: string) => {
    setPhotoItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handlePhotoUpload = useCallback(async (id: string, file: File) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    // 미리보기 설정
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoItems((prev) => prev.map((item) =>
        item.id === id ? { ...item, photoPreview: e.target?.result as string, uploading: true, uploadError: "" } : item
      ));
    };
    reader.readAsDataURL(file);

    // S3/Supabase 업로드
    try {
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
        r.readAsDataURL(file);
      });

      const result = await uploadFileMutation.mutateAsync({
        userId: String(user.id),
        stepKey: "step2",
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      });

      const uploadedUrl = (result as { urls?: string[]; url?: string }).urls?.[0]
        ?? (result as { url?: string }).url
        ?? "";
      setPhotoItems((prev) => prev.map((item) =>
        item.id === id ? { ...item, photoUrl: uploadedUrl, uploading: false } : item
      ));
    } catch {
      setPhotoItems((prev) => prev.map((item) =>
        item.id === id ? { ...item, uploading: false, uploadError: "업로드 실패" } : item
      ));
      toast.error("사진 업로드에 실패했습니다. 다시 시도해주세요.");
    }
  }, [user, uploadFileMutation]);

  /* ─── 제출 ─── */
  const handleSubmit = async () => {
    if (!isLoggedIn || !user) {
      toast.error("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const userId = String(user.id);

    if (mode === "link") {
      const valid = linkItems.filter((i) => i.productLink.trim());
      if (valid.length === 0) {
        toast.error("제품 링크를 하나 이상 입력해주세요.");
        return;
      }
      setSubmitting(true);
      try {
        // 링크 정보를 텍스트로 직렬화하여 step2에 저장
        const text = valid.map((item, idx) =>
          `[가구 ${idx + 1}] 링크: ${item.productLink}${item.productOption ? ` / 옵션: ${item.productOption}` : ""}`
        ).join("\n");
        await updateTextMutation.mutateAsync({
          userId,
          stepKey: "step2",
          text,
        });
        // step2 완료 처리
        try { await completeStepMutation.mutateAsync({ userId, stepKey: 'step2' }); } catch { /* ignore */ }
        toast.success("가구 정보가 저장되었습니다!");
        setTimeout(() => navigate("/styling/step3"), 1000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "저장에 실패했습니다.";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    } else {
      const uploading = photoItems.some((i) => i.uploading);
      if (uploading) {
        toast.error("사진 업로드가 완료될 때까지 기다려주세요.");
        return;
      }
      const valid = photoItems.filter((i) => i.photoUrl);
      if (valid.length === 0) {
        toast.error("사진을 하나 이상 업로드해주세요.");
        return;
      }
      setSubmitting(true);
      try {
        // 사진 정보를 텍스트로 직렬화하여 step2에 저장
        const text = valid.map((item, idx) => {
          const parts = [`[가구 ${idx + 1}]`];
          if (item.productName) parts.push(`제품명: ${item.productName}`);
          const sizes = [item.width && `W${item.width}`, item.depth && `D${item.depth}`, item.height && `H${item.height}`].filter(Boolean);
          if (sizes.length) parts.push(`사이즈: ${sizes.join(" × ")}mm`);
          if (item.notes) parts.push(`특이사항: ${item.notes}`);
          return parts.join(" / ");
        }).join("\n");
        await updateTextMutation.mutateAsync({
          userId,
          stepKey: "step2",
          text,
        });
        // step2 완료 처리
        try { await completeStepMutation.mutateAsync({ userId, stepKey: 'step2' }); } catch { /* ignore */ }
        toast.success("가구 정보가 저장되었습니다!");
        setTimeout(() => navigate("/styling/step3"), 1000);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "저장에 실패했습니다.";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // 로딩 상태
  if (submissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/styling/step1")}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs text-muted-foreground">STEP 02</p>
            <h1 className="text-base font-bold text-foreground">기존 가구 정보 전달</h1>
          </div>
          {/* 기존 데이터 불러온 경우 배지 표시 */}
          {dataLoaded && submission?.step2 && submission.step2 !== 'pending' && (
            <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full text-white font-medium" style={{ background: TERRACOTTA }}>
              이전 입력 불러옴
            </span>
          )}
        </div>
      </header>

      <main className="px-4 pt-5 space-y-5">
        {/* 안내 문구 */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-1">기존 가구 정보를 알려주세요</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            현재 사용 중인 가구 정보를 입력하면 더 정확한 배치 솔루션을 제안받을 수 있어요.
            제품 링크가 있으면 링크를, 없으면 사진과 사이즈를 입력해주세요.
          </p>
        </div>

        {/* 입력 방식 선택 */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("link")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all"
            style={{
              borderColor: mode === "link" ? TERRACOTTA : "#e5e7eb",
              color: mode === "link" ? TERRACOTTA : "#9ca3af",
              background: mode === "link" ? "#fff5f5" : "#fafafa",
            }}
          >
            <Link2 size={16} />
            제품 링크 있음
          </button>
          <button
            onClick={() => setMode("photo")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all"
            style={{
              borderColor: mode === "photo" ? TERRACOTTA : "#e5e7eb",
              color: mode === "photo" ? TERRACOTTA : "#9ca3af",
              background: mode === "photo" ? "#fff5f5" : "#fafafa",
            }}
          >
            <Camera size={16} />
            사진으로 입력
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="space-y-3">
          {mode === "link" ? (
            <>
              {linkItems.map((item, idx) => (
                <LinkItemCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onChange={handleLinkChange}
                  onDelete={handleLinkDelete}
                  canDelete={linkItems.length > 1}
                />
              ))}
              <button
                onClick={() => setLinkItems((prev) => [...prev, { id: generateId(), productLink: "", productOption: "" }])}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus size={16} />
                가구 추가하기
              </button>
            </>
          ) : (
            <>
              {photoItems.map((item, idx) => (
                <PhotoItemCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onChange={handlePhotoChange}
                  onDelete={handlePhotoDelete}
                  onUpload={handlePhotoUpload}
                  canDelete={photoItems.length > 1}
                />
              ))}
              <button
                onClick={() => setPhotoItems((prev) => [...prev, {
                  id: generateId(), photoPreview: "", photoUrl: "",
                  productName: "", width: "", depth: "", height: "", notes: "", uploading: false, uploadError: "",
                }])}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus size={16} />
                가구 추가하기
              </button>
            </>
          )}
        </div>

        {/* 마이페이지로 돌아가기 */}
        <button
          onClick={() => navigate("/mypage")}
          className="w-full py-3 rounded-full text-gray-500 font-medium text-[14px] border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          마이페이지로 돌아가기
        </button>
      </main>

      {/* 하단 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4 bg-background border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-full text-white font-bold text-[15px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: TERRACOTTA }}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              처리 중...
            </>
          ) : (
            "제출완료"
          )}
        </button>
      </div>
    </div>
  );
}
