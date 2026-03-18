/* SOOZIP - STEP 03: 배치 솔루션 제안
 * - 디자이너가 배치안 이미지 1~n장 업로드
 * - 사용자가 희망 배치안 선택 (라디오 버튼)
 * - 선택 후 피드백 입력 (선택)
 * - 저장: survey_submissions.step3 컬럼 (JSON: { selected: number, feedback: string })
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, AlertCircle, CheckCircle2, Loader2, MessageSquare, File, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

const TERRACOTTA = "#d31400";

interface Step3Data {
  selected: number | null;
  feedback: string;
}

function parseStep3Data(raw: string | null): Step3Data {
  if (!raw || raw === 'pending' || raw === 'completed') {
    return { selected: null, feedback: '' };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      selected: typeof parsed.selected === 'number' ? parsed.selected : null,
      feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
    };
  } catch {
    return { selected: null, feedback: '' };
  }
}

export default function StylingStep3() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const updateTextMutation = trpc.survey.updateStepText.useMutation();
  const completeStepMutation = trpc.survey.completeStep.useMutation();

  // 기존 신청 데이터 조회
  const { data: submission, isLoading: submissionLoading } = trpc.survey.mySubmission.useQuery(
    { userId: user ? String(user.id) : undefined },
    { enabled: isLoggedIn && !!user }
  );

  // 기존 step3 데이터 불러오기
  useEffect(() => {
    if (dataLoaded || submissionLoading) return;
    if (!submission) return;

    const parsed = parseStep3Data(submission.step3);
    if (parsed.selected !== null) {
      setSelectedIndex(parsed.selected);
    }
    if (parsed.feedback) {
      setFeedback(parsed.feedback);
    }
    setDataLoaded(true);
  }, [submission, submissionLoading, dataLoaded]);

  // 디자이너 업로드 파일 파싱
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

  const step3mKey = 'step3m' as const;
  const rawAdminData = submission ? (submission[step3mKey] as string | null) : null;
  const adminFileUrls = parseUrls(rawAdminData);

  // 제출
  const handleSubmit = async () => {
    if (!isLoggedIn || !user) {
      toast.error("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (selectedIndex === null) {
      toast.error("희망 배치안을 선택해주세요.");
      return;
    }

    const userId = String(user.id);
    setSubmitting(true);

    try {
      // step3에 선택 정보 + 피드백 저장 (JSON 형태)
      const data: Step3Data = {
        selected: selectedIndex,
        feedback: feedback.trim(),
      };
      
      await updateTextMutation.mutateAsync({
        userId,
        stepKey: 'step3',
        text: JSON.stringify(data),
      });

      // step3 완료 처리
      try { await completeStepMutation.mutateAsync({ userId, stepKey: 'step3' }); } catch { /* ignore */ }
      
      toast.success("배치안이 선택되었습니다!");
      setTimeout(() => navigate("/mypage"), 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "저장에 실패했습니다.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
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
            onClick={() => navigate("/mypage")}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs text-muted-foreground">STEP 03</p>
            <h1 className="text-base font-bold text-foreground">배치 솔루션 제안</h1>
          </div>
        </div>
        {/* 진행 표시 바 */}
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: "43%", background: TERRACOTTA }}
          />
        </div>
      </header>

      <main className="px-4 pt-5 space-y-5">
        {/* 안내 문구 */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-1">담당 디자이너가 제안한 배치안을 확인하세요</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            제안된 배치안 중 가장 마음에 드는 안을 선택한 후, 필요시 피드백을 남겨주세요.
            디자이너가 피드백을 반영하여 수정해드립니다.
          </p>
        </div>

        {/* 섹션 1: 디자이너 배치안 이미지 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: TERRACOTTA }}
            >
              <span className="text-[9px] font-bold text-white">1</span>
            </div>
            <h2 className="text-[14px] font-bold text-gray-800">배치안 선택</h2>
          </div>

          {adminFileUrls.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-6 flex flex-col items-center gap-2 text-center">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <ImageIcon size={16} className="text-gray-400" />
              </div>
              <p className="text-[13px] font-medium text-gray-500">아직 배치안이 없어요</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">담당자가 배치안 이미지를 업로드하면<br />여기에서 확인할 수 있어요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminFileUrls.map((fileUrl, idx) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
                const isSelected = selectedIndex === idx;
                
                return (
                  <label
                    key={idx}
                    className="block rounded-2xl border-2 p-3 cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected ? TERRACOTTA : "#e5e7eb",
                      background: isSelected ? "#fff5f5" : "#fafafa",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* 라디오 버튼 */}
                      <input
                        type="radio"
                        name="layout-selection"
                        value={idx}
                        checked={isSelected}
                        onChange={() => setSelectedIndex(idx)}
                        className="w-5 h-5 mt-1 shrink-0 cursor-pointer"
                        style={{ accentColor: TERRACOTTA }}
                      />
                      
                      {/* 이미지 미리보기 */}
                      <div className="flex-1 min-w-0">
                        {isImage && (
                          <div className="w-full rounded-xl overflow-hidden bg-gray-100 mb-2" style={{ maxHeight: 180 }}>
                            <img src={fileUrl} alt={`배치안 ${idx + 1}`} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                            {isImage ? (
                              <img src={fileUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <File size={14} className="text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-gray-800 truncate">배치안 {idx + 1}</p>
                            <p className="text-[11px] text-gray-400">담당자 제안</p>
                          </div>
                          {isSelected && (
                            <div className="shrink-0">
                              <CheckCircle2 size={18} className="text-green-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        {/* 섹션 2: 피드백 입력 */}
        {selectedIndex !== null && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: TERRACOTTA }}
              >
                <MessageSquare size={11} className="text-white" />
              </div>
              <h2 className="text-[14px] font-bold text-gray-800">피드백 (선택)</h2>
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="선택한 배치안에 대한 의견을 남겨주세요. 예: 침대 위치 변경 희망, 책장 배치 조정 필요 등..."
              rows={4}
              className="w-full rounded-2xl border border-gray-200 p-4 text-[13px] text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none focus:border-gray-400 transition-colors"
              style={{ background: "#fafafa" }}
            />
            <p className="text-[11px] text-gray-400 mt-2">디자이너가 피드백을 반영하여 수정해드립니다</p>
          </section>
        )}

        {/* 마이페이지로 돌아가기 */}
        <button
          onClick={() => navigate("/mypage")}
          className="w-full py-3 rounded-full text-gray-500 font-medium text-[14px] border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          마이페이지로 돌아가기
        </button>
      </main>

      {/* 하단 제출 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4 bg-background border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={submitting || selectedIndex === null}
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
