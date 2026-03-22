/**
 * OrderListPage — 주문/배송 조회 페이지
 * 입금대기 > 결제완료 > 배송준비 > 배송중 > 배송완료 > 리뷰쓰기
 * 교환/반품 신청 기능 포함
 */
import { useState } from "react";
import {
  ArrowLeft,
  Package,
  ChevronDown,
  ChevronUp,
  ImageOff,
  LogIn,
  RotateCcw,
  Star,
  Truck,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ACCENT = "#E84B1A";

// 주문 상태 스텝 정의
const ORDER_STEPS = [
  { key: "pending_payment", label: "입금대기", icon: Clock },
  { key: "paid", label: "결제완료", icon: CreditCard },
  { key: "preparing", label: "배송준비", icon: Package },
  { key: "shipping", label: "배송중", icon: Truck },
  { key: "delivered", label: "배송완료", icon: CheckCircle2 },
  { key: "confirmed", label: "리뷰쓰기", icon: Star },
] as const;

type OrderStatus = (typeof ORDER_STEPS)[number]["key"];

const RETURN_REASONS = [
  { value: "change_of_mind", label: "단순 변심" },
  { value: "defective", label: "상품 불량/파손" },
  { value: "wrong_item", label: "오배송" },
  { value: "size_issue", label: "사이즈 불일치" },
  { value: "other", label: "기타" },
] as const;

function getStepIndex(status: string): number {
  return ORDER_STEPS.findIndex((s) => s.key === status);
}

function StatusBadge({ status }: { status: string }) {
  const step = ORDER_STEPS.find((s) => s.key === status);
  const label = step?.label ?? status;

  const colorMap: Record<string, string> = {
    pending_payment: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    shipping: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    confirmed: "bg-gray-100 text-gray-700",
    return_requested: "bg-red-100 text-red-700",
    exchange_requested: "bg-pink-100 text-pink-700",
  };

  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorMap[status] ?? "bg-secondary text-muted-foreground"}`}>
      {label}
    </span>
  );
}

function ProductImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-secondary text-muted-foreground ${className ?? ""}`}>
        <ImageOff size={20} strokeWidth={1.5} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} draggable={false} />;
}

// 주문 진행 스텝 바
function OrderProgressBar({ status }: { status: string }) {
  const currentIdx = getStepIndex(status);
  if (currentIdx < 0) return null; // return_requested 등은 스텝바 미표시

  return (
    <div className="px-4 py-4 bg-secondary/30 rounded-xl mt-3">
      <div className="flex items-center justify-between relative">
        {/* 연결선 */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" />
        <div
          className="absolute left-0 top-4 h-0.5 transition-all"
          style={{
            width: currentIdx === 0 ? "0%" : `${(currentIdx / (ORDER_STEPS.length - 1)) * 100}%`,
            background: ACCENT,
          }}
        />
        {ORDER_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center gap-1 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? "border-transparent text-white"
                    : isDone
                    ? "border-transparent text-white"
                    : "border-border bg-background text-muted-foreground"
                }`}
                style={isCurrent || isDone ? { background: ACCENT } : {}}
              >
                <Icon size={14} />
              </div>
              <span
                className={`text-[10px] font-medium ${isCurrent ? "text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/60"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 교환/반품 신청 다이얼로그
function ReturnDialog({
  open,
  onClose,
  orderItemId,
  orderId,
  userId,
  productName,
}: {
  open: boolean;
  onClose: () => void;
  orderItemId: number;
  orderId: number;
  userId: number;
  productName: string;
}) {
  const [type, setType] = useState<"return" | "exchange">("return");
  const [reason, setReason] = useState<string>("change_of_mind");
  const [reasonDetail, setReasonDetail] = useState("");
  const utils = trpc.useUtils();

  const createMutation = trpc.returnRequest.create.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate({ userId });
      toast.success(type === "return" ? "반품 신청이 완료되었습니다." : "교환 신청이 완료되었습니다.");
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-base">교환/반품 신청</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground truncate">{productName}</p>

          {/* 신청 유형 */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">신청 유형</p>
            <div className="flex gap-2">
              {(["return", "exchange"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    type === t ? "border-transparent text-white" : "border-border text-foreground hover:bg-secondary"
                  }`}
                  style={type === t ? { background: ACCENT } : {}}
                >
                  {t === "return" ? "반품" : "교환"}
                </button>
              ))}
            </div>
          </div>

          {/* 사유 선택 */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">신청 사유</p>
            <div className="space-y-1.5">
              {RETURN_REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-[#E84B1A]"
                  />
                  <span className="text-sm text-foreground">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 상세 사유 */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">상세 내용 (선택)</p>
            <Textarea
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="추가 설명이 있으면 입력해주세요"
              className="text-sm min-h-[80px]"
            />
          </div>

          {/* 안내 */}
          <div className="flex gap-2 p-3 bg-secondary/50 rounded-xl">
            <AlertCircle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              신청 후 판매자가 확인하여 처리합니다. 단순 변심 반품 시 왕복 배송비는 고객 부담입니다.
            </p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
          >
            취소
          </button>
          <button
            onClick={() =>
              createMutation.mutate({
                orderItemId,
                orderId,
                userId,
                type,
                reason: reason as "change_of_mind" | "defective" | "wrong_item" | "size_issue" | "other",
                reasonDetail: reasonDetail || undefined,
              })
            }
            disabled={createMutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: ACCENT }}
          >
            {createMutation.isPending ? "신청 중..." : "신청하기"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 주문 카드 컴포넌트
function OrderCard({
  order,
  userId,
  onNavigate,
}: {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    shippingFee: number;
    finalAmount: number;
    createdAt: Date | string;
    items: Array<{
      id: number;
      productId: string | number;
      productName: string;
      brandName?: string | null;
      imageUrl?: string | null;
      optionLabel?: string | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      itemStatus?: string | null;
      reviewWritten?: boolean | null;
    }>;
  };
  userId: number;
  onNavigate: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [returnDialog, setReturnDialog] = useState<{ itemId: number; productName: string } | null>(null);

  const canReturn = ["delivered", "confirmed"].includes(order.status);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* 주문 헤더 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <div className="text-left">
          <p className="text-xs text-muted-foreground mb-0.5">
            {new Date(order.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-xs font-mono text-muted-foreground">{order.orderNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          {expanded ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-3">
          {/* 진행 스텝 바 */}
          <OrderProgressBar status={order.status} />

          {/* 주문 상품 목록 */}
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <button
                  onClick={() => onNavigate(`/products/${item.productId}`)}
                  className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary"
                >
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground truncate">{item.brandName}</p>
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{item.productName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.unitPrice.toLocaleString()}원 × {item.quantity}개
                  </p>
                  {item.itemStatus && item.itemStatus !== order.status && (
                    <StatusBadge status={item.itemStatus} />
                  )}
                </div>
                {/* 상품별 액션 버튼 */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {canReturn && !item.itemStatus?.includes("requested") && (
                    <button
                      onClick={() => setReturnDialog({ itemId: item.id, productName: item.productName })}
                      className="flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-lg text-[11px] font-medium hover:bg-secondary transition-colors"
                    >
                      <RotateCcw size={11} />
                      교환/반품
                    </button>
                  )}
                  {order.status === "delivered" && !item.reviewWritten && (
                    <button
                      onClick={() => onNavigate(`/products/${item.productId}?tab=review`)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: ACCENT }}
                    >
                      <Star size={11} />
                      리뷰쓰기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 결제 금액 */}
          <div className="mt-4 pt-3 border-t border-border space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>상품금액</span>
              <span>{order.totalAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>배송비</span>
              <span>{order.shippingFee === 0 ? "무료" : `+${order.shippingFee.toLocaleString()}원`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground pt-1">
              <span>최종 결제금액</span>
              <span>{order.finalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      )}

      {/* 교환/반품 다이얼로그 */}
      {returnDialog && (
        <ReturnDialog
          open={!!returnDialog}
          onClose={() => setReturnDialog(null)}
          orderItemId={returnDialog.itemId}
          orderId={order.id}
          userId={userId}
          productName={returnDialog.productName}
        />
      )}
    </div>
  );
}

export default function OrderListPage() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data, isLoading } = trpc.order.list.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: isLoggedIn && !!user?.id }
  );

  const orders = data?.orders ?? [];
  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  const filterTabs = [
    { key: "all", label: "전체" },
    { key: "pending_payment", label: "입금대기" },
    { key: "paid", label: "결제완료" },
    { key: "preparing", label: "배송준비" },
    { key: "shipping", label: "배송중" },
    { key: "delivered", label: "배송완료" },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
        <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">주문/배송 조회</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <Package size={52} className="text-muted-foreground mb-4" strokeWidth={1} />
          <p className="text-sm font-medium text-foreground mb-1">로그인 후 이용해 주세요</p>
          <p className="text-xs text-muted-foreground mb-5">주문 내역을 확인하고 배송을 조회할 수 있어요</p>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: ACCENT }}
          >
            <LogIn size={16} />
            로그인 / 회원가입
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-sm">주문/배송 조회</span>
        {orders.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{orders.length}건</span>
        )}
      </header>

      {/* 필터 탭 */}
      <div className="sticky top-[53px] z-30 bg-background border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === tab.key
                  ? "text-white"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
              style={activeFilter === tab.key ? { background: ACCENT } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="h-14 bg-secondary/50" />
                <div className="p-4 space-y-3">
                  <div className="h-20 bg-secondary rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={52} className="text-muted-foreground mb-4" strokeWidth={1} />
            <p className="text-sm font-medium text-foreground mb-1">
              {activeFilter === "all" ? "주문 내역이 없습니다" : "해당 상태의 주문이 없습니다"}
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              {activeFilter === "all" ? "첫 주문을 시작해보세요" : "다른 상태를 확인해보세요"}
            </p>
            {activeFilter === "all" && (
              <button
                onClick={() => navigate("/products")}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                상품 둘러보기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userId={user!.id}
                onNavigate={navigate}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
