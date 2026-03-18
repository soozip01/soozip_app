/* SOOZIP - 기존 가구 정보 입력 폼
 * STEP 02: 기존 가구 정보 전달
 * - 제품 링크 방식: URL + 옵션 입력
 * - 사진+사이즈 방식: 사진 업로드 + 가로/깊이/높이 입력
 */
import { useState, useRef, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, Link2, Camera, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2, Loader2, X } from "lucide-react";
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
  photoFile: File | null;
  photoPreview: string;
  photoUrl: string; // 업로드 후 S3 URL
  productName: string;
  width: string;
  depth: string;
  height: string;
  notes: string;
  uploading: boolean;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

/* ─── 제품 링크 아이템 ─── */
function LinkItemCard({
  item,
  index,
  onChange,
  onDelete,
  canDelete,
}: {
  item: LinkItem;
  index: number;
  onChange: (id: string, field: keyof LinkItem, value: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: "#fafafa" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: TERRACOTTA }}
          >
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {item.productLink ? new URL(item.productLink).hostname.replace("www.", "") : `가구 ${index + 1}`}
          </span>
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
  item,
  index,
  onChange,
  onDelete,
  onUpload,
  canDelete,
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
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: TERRACOTTA }}
          >
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {item.productName || `가구 ${index + 1}`}
          </span>
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
                <button
                  onClick={() => {
                    onChange(item.id, "photoUrl", "");
                    onChange(item.id, "photoPreview", "");
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
export default function FurnitureInfoForm() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const progressId = parseInt(params.get("progressId") ?? "0", 10);

  const { user, isLoggedIn } = useSoozipAuth();
  const [mode, setMode] = useState<InputMode>("link");
  const [linkItems, setLinkItems] = useState<LinkItem[]>([
    { id: generateId(), productLink: "", productOption: "" },
  ]);
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([
    { id: generateId(), photoFile: null, photoPreview: "", photoUrl: "", productName: "", width: "", depth: "", height: "", notes: "", uploading: false },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const saveLinkMutation = trpc.furnitureInfo.saveLink.useMutation();
  const savePhotoMutation = trpc.furnitureInfo.savePhoto.useMutation();
  const uploadPhotoMutation = trpc.furnitureInfo.uploadPhoto.useMutation();

  /* ─── 링크 아이템 핸들러 ─── */
  const handleLinkChange = useCallback((id: string, field: keyof LinkItem, value: string) => {
    setLinkItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  const handleLinkDelete = useCallback((id: string) => {
    setLinkItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addLinkItem = () => {
    setLinkItems((prev) => [...prev, { id: generateId(), productLink: "", productOption: "" }]);
  };

  /* ─── 사진 아이템 핸들러 ─── */
  const handlePhotoChange = useCallback((id: string, field: keyof PhotoItem, value: string) => {
    setPhotoItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  const handlePhotoDelete = useCallback((id: string) => {
    setPhotoItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handlePhotoUpload = useCallback(async (id: string, file: File) => {
    // 미리보기 설정
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoItems((prev) => prev.map((item) =>
        item.id === id ? { ...item, photoPreview: e.target?.result as string, uploading: true } : item
      ));
    };
    reader.readAsDataURL(file);

    // S3 업로드
    try {
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
        r.readAsDataURL(file);
      });

      const { url } = await uploadPhotoMutation.mutateAsync({
        userNickname: user?.nickname ?? "unknown",
        fileName: file.name,
        fileBase64: base64,
        mimeType: file.type,
      });

      setPhotoItems((prev) => prev.map((item) =>
        item.id === id ? { ...item, photoUrl: url, uploading: false } : item
      ));
    } catch {
      setPhotoItems((prev) => prev.map((item) =>
        item.id === id ? { ...item, uploading: false } : item
      ));
      toast.error("사진 업로드에 실패했습니다. 다시 시도해주세요.");
    }
  }, [user, uploadPhotoMutation]);

  const addPhotoItem = () => {
    setPhotoItems((prev) => [...prev, {
      id: generateId(), photoFile: null, photoPreview: "", photoUrl: "",
      productName: "", width: "", depth: "", height: "", notes: "", uploading: false,
    }]);
  };

  /* ─── 제출 ─── */
  const handleSubmit = async () => {
    if (!isLoggedIn || !user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!progressId) {
      toast.error("진행 정보를 찾을 수 없습니다.");
      return;
    }

    if (mode === "link") {
      const valid = linkItems.filter((i) => i.productLink.trim());
      if (valid.length === 0) {
        toast.error("제품 링크를 하나 이상 입력해주세요.");
        return;
      }

      setSubmitting(true);
      try {
        await Promise.all(
          valid.map((item, idx) =>
            saveLinkMutation.mutateAsync({
              progressId,
              userNickname: user.nickname,
              productLink: item.productLink,
              productOption: item.productOption || undefined,
              sortOrder: idx,
            })
          )
        );
        toast.success("가구 정보가 저장되었습니다!");
        navigate("/my");
      } catch {
        toast.error("저장에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setSubmitting(false);
      }
    } else {
      const valid = photoItems.filter((i) => i.photoUrl);
      if (valid.length === 0) {
        toast.error("사진을 하나 이상 업로드해주세요.");
        return;
      }
      const uploading = photoItems.some((i) => i.uploading);
      if (uploading) {
        toast.error("사진 업로드가 완료될 때까지 기다려주세요.");
        return;
      }

      setSubmitting(true);
      try {
        await Promise.all(
          valid.map((item, idx) =>
            savePhotoMutation.mutateAsync({
              progressId,
              userNickname: user.nickname,
              photoUrl: item.photoUrl,
              productName: item.productName || undefined,
              width: item.width || undefined,
              depth: item.depth || undefined,
              height: item.height || undefined,
              notes: item.notes || undefined,
              sortOrder: idx,
            })
          )
        );
        toast.success("가구 정보가 저장되었습니다!");
        navigate("/my");
      } catch {
        toast.error("저장에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/my")}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-bold text-foreground">기존 가구 정보 입력</h1>
            <p className="text-xs text-muted-foreground">STEP 02</p>
          </div>
        </div>
      </header>

      <main className="px-4 pt-5">
        {/* 안내 문구 */}
        <div className="mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-1">기존 가구 정보를 알려주세요</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            현재 사용 중인 가구 정보를 입력하면 더 정확한 배치 솔루션을 제안받을 수 있어요.
            제품 링크가 있으면 링크를, 없으면 사진과 사이즈를 입력해주세요.
          </p>
        </div>

        {/* 입력 방식 선택 */}
        <div className="flex gap-2 mb-5">
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
                onClick={addLinkItem}
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
                onClick={addPhotoItem}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus size={16} />
                가구 추가하기
              </button>
            </>
          )}
        </div>
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
              저장 중...
            </>
          ) : (
            "가구 정보 저장하기"
          )}
        </button>
      </div>
    </div>
  );
}
