import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, ChevronUp, MapPin, Package, Tag, Coins, CreditCard, Check, X, Plus, Edit2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const ACCENT = "#E8562A";

// 결제수단 목록
const PAYMENT_METHODS = [
  { id: "card", label: "신용/체크카드", icon: "💳" },
  { id: "kakao_pay", label: "카카오페이", icon: "🟡" },
  { id: "naver_pay", label: "네이버페이", icon: "🟢" },
  { id: "toss_pay", label: "토스페이", icon: "🔵" },
  { id: "bank_transfer", label: "무통장입금", icon: "🏦" },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]["id"];

interface CheckoutItem {
  productId: string;
  productName: string;
  productImage?: string;
  brandName?: string;
  price: number;
  quantity: number;
  optionLabel?: string;
  additionalPrice: number;
}

interface ShippingAddressForm {
  id?: number;
  label?: string;
  recipientName: string;
  phone: string;
  zipCode: string;
  address: string;
  addressDetail?: string;
  isDefault: boolean;
}

const emptyAddressForm: ShippingAddressForm = {
  recipientName: "",
  phone: "",
  zipCode: "",
  address: "",
  addressDetail: "",
  isDefault: true,
};

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { user } = useSoozipAuth();

  // URL 파라미터 또는 sessionStorage에서 주문 아이템 로드
  const [items, setItems] = useState<CheckoutItem[]>([]);

  useEffect(() => {
    // 1) URL 쿼리 파라미터 ?items=... 우선 확인
    const params = new URLSearchParams(window.location.search);
    const itemsParam = params.get("items");
    if (itemsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(itemsParam));
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          return;
        }
      } catch {
        // 파싱 실패 시 sessionStorage로 폴백
      }
    }
    // 2) sessionStorage 폴백
    const stored = sessionStorage.getItem("checkout_items");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          return;
        }
      } catch {
        toast.error("주문 정보를 불러오지 못했습니다.");
        navigate("/");
        return;
      }
    }
    toast.error("주문할 상품이 없습니다.");
    navigate("/");
  }, []);

  // 배송지
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState<ShippingAddressForm>(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [showAddressList, setShowAddressList] = useState(false);

  // 주문자 정보
  const [ordererName, setOrdererName] = useState(user?.nickname ?? "");
  const [ordererPhone, setOrdererPhone] = useState("");
  const [ordererEmail, setOrdererEmail] = useState(user?.email ?? "");
  const [deliveryMemo, setDeliveryMemo] = useState("");
  const [customMemo, setCustomMemo] = useState("");

  // 쿠폰/포인트
  const [selectedUserCouponId, setSelectedUserCouponId] = useState<number | null>(null);
  const [showCouponSheet, setShowCouponSheet] = useState(false);
  const [pointInput, setPointInput] = useState("");
  const [pointUsed, setPointUsed] = useState(0);

  // 결제수단
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // 동의
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // 배송지 목록 조회
  const { data: addressData, refetch: refetchAddresses } = trpc.shippingAddress.list.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: !!user?.id }
  );

  // 포인트 잔액
  const { data: pointData } = trpc.point.getBalance.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: !!user?.id }
  );

  // 상품 소계
  const subtotal = useMemo(() =>
    items.reduce((s, i) => s + (i.price + i.additionalPrice) * i.quantity, 0),
    [items]
  );

  // 배송비 (5만원 이상 무료)
  const shippingFee = subtotal >= 50000 ? 0 : 3000;

  // 쿠폰 할인 계산
  const { data: couponData } = trpc.coupon.listAvailable.useQuery(
    { userId: user?.id ?? 0, orderAmount: subtotal },
    { enabled: !!user?.id && subtotal > 0 }
  );

  const selectedCoupon = useMemo(() =>
    couponData?.coupons.find(c => c.userCouponId === selectedUserCouponId),
    [couponData, selectedUserCouponId]
  );

  const couponDiscount = useMemo(() => {
    if (!selectedCoupon) return 0;
    let d = selectedCoupon.discountType === "fixed"
      ? selectedCoupon.discountValue
      : Math.floor(subtotal * selectedCoupon.discountValue / 100);
    if (selectedCoupon.maxDiscountAmount) d = Math.min(d, selectedCoupon.maxDiscountAmount);
    return d;
  }, [selectedCoupon, subtotal]);

  const totalAmount = Math.max(0, subtotal + shippingFee - couponDiscount - pointUsed);

  // 기본 배송지 자동 선택
  useEffect(() => {
    if (addressData?.addresses && !selectedAddressId) {
      const def = addressData.addresses.find(a => a.isDefault) ?? addressData.addresses[0];
      if (def) setSelectedAddressId(def.id);
    }
  }, [addressData]);

  // 동의 연동
  useEffect(() => {
    if (agreeAll) { setAgreeTerms(true); setAgreePrivacy(true); }
  }, [agreeAll]);
  useEffect(() => {
    if (agreeTerms && agreePrivacy) setAgreeAll(true);
    else setAgreeAll(false);
  }, [agreeTerms, agreePrivacy]);

  // 배송지 저장
  const createAddress = trpc.shippingAddress.create.useMutation({
    onSuccess: () => { refetchAddresses(); setShowAddressModal(false); toast.success("배송지가 저장되었습니다."); },
  });
  const updateAddress = trpc.shippingAddress.update.useMutation({
    onSuccess: () => { refetchAddresses(); setShowAddressModal(false); toast.success("배송지가 수정되었습니다."); },
  });
  const deleteAddress = trpc.shippingAddress.delete.useMutation({
    onSuccess: () => { refetchAddresses(); toast.success("배송지가 삭제되었습니다."); },
  });

  // 주문 생성
  const createOrder = trpc.checkout.createOrder.useMutation({
    onSuccess: (data) => {
      sessionStorage.removeItem("checkout_items");
      toast.success("주문이 완료되었습니다!");
      navigate(`/orders?new=${data.orderNumber}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const selectedAddress = addressData?.addresses.find(a => a.id === selectedAddressId);

  const handleSubmitOrder = () => {
    if (!user) { toast.error("로그인이 필요합니다."); return; }
    if (!selectedAddress) { toast.error("배송지를 선택해주세요."); return; }
    if (!ordererName.trim()) { toast.error("주문자 이름을 입력해주세요."); return; }
    if (!ordererPhone.trim()) { toast.error("주문자 연락처를 입력해주세요."); return; }
    if (!agreeTerms || !agreePrivacy) { toast.error("필수 약관에 동의해주세요."); return; }

    const memo = deliveryMemo === "직접 입력" ? customMemo : deliveryMemo;

    createOrder.mutate({
      userId: user.id,
      items,
      shippingAddress: {
        recipientName: selectedAddress.recipientName,
        phone: selectedAddress.phone,
        zipCode: selectedAddress.zipCode,
        address: selectedAddress.address,
        addressDetail: selectedAddress.addressDetail ?? undefined,
      },
      ordererName,
      ordererPhone,
      ordererEmail: ordererEmail || undefined,
      deliveryMemo: memo || undefined,
      userCouponId: selectedUserCouponId ?? undefined,
      pointUsed,
      paymentMethod,
      shippingFee,
    });
  };

  const handleSaveAddress = () => {
    if (!user) return;
    if (!addressForm.recipientName || !addressForm.phone || !addressForm.zipCode || !addressForm.address) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    if (editingAddressId) {
      updateAddress.mutate({ ...addressForm, id: editingAddressId, userId: user.id });
    } else {
      createAddress.mutate({ ...addressForm, userId: user.id });
    }
  };

  const handlePointApply = () => {
    const val = parseInt(pointInput) || 0;
    const max = Math.min(pointData?.balance ?? 0, subtotal + shippingFee - couponDiscount);
    if (val > max) { toast.error(`최대 ${max.toLocaleString()}원까지 사용 가능합니다.`); return; }
    setPointUsed(val);
    toast.success(`${val.toLocaleString()}원 포인트가 적용되었습니다.`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
        <button onClick={() => navigate("/auth")} className="px-6 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: ACCENT }}>
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-lg mx-auto flex items-center px-4 h-14">
          <button onClick={() => navigate(-1 as any)} className="mr-3 text-foreground">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 className="text-base font-bold flex-1">주문서</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">

        {/* ── 배송지 섹션 ── */}
        <section className="bg-background rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} style={{ color: ACCENT }} />
              <h2 className="text-sm font-bold">배송지</h2>
            </div>
            <button
              onClick={() => setShowAddressList(!showAddressList)}
              className="text-xs text-muted-foreground flex items-center gap-1"
            >
              변경 {showAddressList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {selectedAddress ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{selectedAddress.recipientName}</span>
                {selectedAddress.label && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{selectedAddress.label}</span>
                )}
                {selectedAddress.isDefault && (
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: ACCENT }}>기본</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{selectedAddress.phone}</p>
              <p className="text-sm">{selectedAddress.address} {selectedAddress.addressDetail}</p>
              <p className="text-xs text-muted-foreground">({selectedAddress.zipCode})</p>
            </div>
          ) : (
            <button
              onClick={() => { setEditingAddressId(null); setAddressForm(emptyAddressForm); setShowAddressModal(true); }}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-foreground/30 transition-colors"
            >
              <Plus size={16} /> 배송지 추가
            </button>
          )}

          {/* 배송지 목록 */}
          {showAddressList && (
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              {addressData?.addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? "border-foreground bg-secondary/50" : "border-border hover:bg-secondary/30"}`}
                  onClick={() => { setSelectedAddressId(addr.id); setShowAddressList(false); }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{addr.recipientName}</span>
                      {addr.isDefault && <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: ACCENT }}>기본</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingAddressId(addr.id); setAddressForm({ ...addr, label: addr.label ?? undefined, addressDetail: addr.addressDetail ?? undefined }); setShowAddressModal(true); }} className="p-1 hover:text-foreground text-muted-foreground"><Edit2 size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteAddress.mutate({ id: addr.id, userId: user.id }); }} className="p-1 hover:text-red-500 text-muted-foreground"><X size={13} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{addr.address} {addr.addressDetail}</p>
                </div>
              ))}
              <button
                onClick={() => { setEditingAddressId(null); setAddressForm(emptyAddressForm); setShowAddressModal(true); setShowAddressList(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-foreground/30 transition-colors"
              >
                <Plus size={14} /> 새 배송지 추가
              </button>
            </div>
          )}

          {/* 배송 메모 */}
          <div className="mt-3">
            <select
              value={deliveryMemo}
              onChange={e => setDeliveryMemo(e.target.value)}
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40"
            >
              <option value="">배송 메모를 선택해주세요</option>
              <option>문 앞에 놓아주세요</option>
              <option>경비실에 맡겨주세요</option>
              <option>배송 전 연락 부탁드립니다</option>
              <option>직접 입력</option>
            </select>
            {deliveryMemo === "직접 입력" && (
              <input
                type="text"
                value={customMemo}
                onChange={e => setCustomMemo(e.target.value)}
                placeholder="배송 메모를 입력해주세요"
                className="mt-2 w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40"
              />
            )}
          </div>
        </section>

        {/* ── 주문자 정보 ── */}
        <section className="bg-background rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-3">주문자 정보</h2>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">이름 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={ordererName}
                onChange={e => setOrdererName(e.target.value)}
                placeholder="주문자 이름"
                className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">연락처 <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={ordererPhone}
                onChange={e => setOrdererPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">이메일 (선택)</label>
              <input
                type="email"
                value={ordererEmail}
                onChange={e => setOrdererEmail(e.target.value)}
                placeholder="이메일 주소"
                className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40"
              />
            </div>
          </div>
        </section>

        {/* ── 주문 상품 ── */}
        <section className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} style={{ color: ACCENT }} />
            <h2 className="text-sm font-bold">주문 상품 ({items.length}개)</h2>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                {item.productImage && (
                  <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {item.brandName && <p className="text-xs text-muted-foreground">{item.brandName}</p>}
                  <p className="text-sm font-medium leading-snug line-clamp-2">{item.productName}</p>
                  {item.optionLabel && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.optionLabel}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{item.quantity}개</span>
                    <span className="text-sm font-bold">
                      {((item.price + item.additionalPrice) * item.quantity).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
            <span className="text-muted-foreground">배송비</span>
            <span className={shippingFee === 0 ? "text-blue-500 font-medium" : ""}>
              {shippingFee === 0 ? "무료" : `${shippingFee.toLocaleString()}원`}
            </span>
          </div>
          {shippingFee > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {(50000 - subtotal).toLocaleString()}원 더 구매하면 무료배송
            </p>
          )}
        </section>

        {/* ── 쿠폰 ── */}
        <section className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} style={{ color: ACCENT }} />
            <h2 className="text-sm font-bold">쿠폰</h2>
          </div>
          <button
            onClick={() => setShowCouponSheet(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-border rounded-xl text-sm hover:bg-secondary/30 transition-colors"
          >
            <span className={selectedCoupon ? "font-medium" : "text-muted-foreground"}>
              {selectedCoupon
                ? `${selectedCoupon.name} (-${couponDiscount.toLocaleString()}원)`
                : `보유 쿠폰 ${couponData?.coupons.length ?? 0}장`}
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </section>

        {/* ── 포인트 ── */}
        <section className="bg-background rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins size={16} style={{ color: ACCENT }} />
              <h2 className="text-sm font-bold">포인트</h2>
            </div>
            <span className="text-xs text-muted-foreground">보유 {(pointData?.balance ?? 0).toLocaleString()}P</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={pointInput}
              onChange={e => setPointInput(e.target.value)}
              placeholder="사용할 포인트 입력"
              className="flex-1 text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40"
            />
            <button
              onClick={handlePointApply}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-secondary/50 transition-colors"
            >
              적용
            </button>
          </div>
          {pointUsed > 0 && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-blue-500">포인트 적용됨</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-500">-{pointUsed.toLocaleString()}P</span>
                <button onClick={() => { setPointUsed(0); setPointInput(""); }} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
              </div>
            </div>
          )}
        </section>

        {/* ── 결제수단 ── */}
        <section className="bg-background rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} style={{ color: ACCENT }} />
            <h2 className="text-sm font-bold">결제수단</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  paymentMethod === pm.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-secondary/30"
                }`}
              >
                <span>{pm.icon}</span>
                <span>{pm.label}</span>
              </button>
            ))}
          </div>
          {paymentMethod === "bank_transfer" && (
            <div className="mt-3 p-3 bg-secondary/50 rounded-xl text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">무통장입금 안내</p>
              <p>입금 계좌: 국민은행 123-456-789012 (주)수집</p>
              <p>주문 후 24시간 내 입금 확인 후 배송이 시작됩니다.</p>
            </div>
          )}
        </section>

        {/* ── 최종 결제금액 ── */}
        <section className="bg-background rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-3">결제 금액</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">상품금액</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">배송비</span>
              <span>{shippingFee === 0 ? "무료" : `+${shippingFee.toLocaleString()}원`}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-blue-500">
                <span>쿠폰 할인</span>
                <span>-{couponDiscount.toLocaleString()}원</span>
              </div>
            )}
            {pointUsed > 0 && (
              <div className="flex justify-between text-blue-500">
                <span>포인트 사용</span>
                <span>-{pointUsed.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>최종 결제금액</span>
              <span style={{ color: ACCENT }}>{totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        {/* ── 약관 동의 ── */}
        <section className="bg-background rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-3">약관 동의</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setAgreeAll(!agreeAll)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${agreeAll ? "border-foreground bg-foreground" : "border-border"}`}
              >
                {agreeAll && <Check size={12} className="text-background" />}
              </div>
              <span className="text-sm font-semibold">전체 동의</span>
            </label>
            <div className="pl-8 space-y-2 border-t border-border pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${agreeTerms ? "border-foreground bg-foreground" : "border-border"}`}
                >
                  {agreeTerms && <Check size={10} className="text-background" />}
                </div>
                <span className="text-sm">[필수] 구매조건 확인 및 결제 진행 동의</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setAgreePrivacy(!agreePrivacy)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${agreePrivacy ? "border-foreground bg-foreground" : "border-border"}`}
                >
                  {agreePrivacy && <Check size={10} className="text-background" />}
                </div>
                <span className="text-sm">[필수] 개인정보 제3자 제공 동의</span>
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* ── 하단 결제 버튼 ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-30">
        <div className="px-4 py-3 bg-background border-t border-border">
          <button
            onClick={handleSubmitOrder}
            disabled={createOrder.isPending}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-50 transition-opacity"
            style={{ background: ACCENT }}
          >
            {createOrder.isPending ? "처리 중..." : `${totalAmount.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>

      {/* ── 배송지 추가/수정 모달 ── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddressModal(false)} />
          <div className="relative w-full max-w-lg bg-background rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{editingAddressId ? "배송지 수정" : "새 배송지 추가"}</h3>
              <button onClick={() => setShowAddressModal(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">배송지 별칭</label>
                <input type="text" value={addressForm.label ?? ""} onChange={e => setAddressForm(f => ({ ...f, label: e.target.value }))} placeholder="집, 회사 등" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">받는 분 <span className="text-red-500">*</span></label>
                <input type="text" value={addressForm.recipientName} onChange={e => setAddressForm(f => ({ ...f, recipientName: e.target.value }))} placeholder="이름" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">연락처 <span className="text-red-500">*</span></label>
                <input type="tel" value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} placeholder="010-0000-0000" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">우편번호 <span className="text-red-500">*</span></label>
                <input type="text" value={addressForm.zipCode} onChange={e => setAddressForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="우편번호" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">주소 <span className="text-red-500">*</span></label>
                <input type="text" value={addressForm.address} onChange={e => setAddressForm(f => ({ ...f, address: e.target.value }))} placeholder="도로명 주소" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">상세 주소</label>
                <input type="text" value={addressForm.addressDetail ?? ""} onChange={e => setAddressForm(f => ({ ...f, addressDetail: e.target.value }))} placeholder="상세 주소 입력" className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:border-foreground/40" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setAddressForm(f => ({ ...f, isDefault: !f.isDefault }))} className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${addressForm.isDefault ? "border-foreground bg-foreground" : "border-border"}`}>
                  {addressForm.isDefault && <Check size={10} className="text-background" />}
                </div>
                <span className="text-sm">기본 배송지로 설정</span>
              </label>
            </div>
            <button
              onClick={handleSaveAddress}
              disabled={createAddress.isPending || updateAddress.isPending}
              className="mt-4 w-full py-3.5 rounded-2xl text-white font-bold disabled:opacity-50"
              style={{ background: ACCENT }}
            >
              저장하기
            </button>
          </div>
        </div>
      )}

      {/* ── 쿠폰 선택 시트 ── */}
      {showCouponSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCouponSheet(false)} />
          <div className="relative w-full max-w-lg bg-background rounded-t-3xl p-5 pb-8 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">쿠폰 선택</h3>
              <button onClick={() => setShowCouponSheet(false)}><X size={20} /></button>
            </div>
            {couponData?.coupons.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">사용 가능한 쿠폰이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {selectedUserCouponId && (
                  <button
                    onClick={() => { setSelectedUserCouponId(null); setShowCouponSheet(false); }}
                    className="w-full py-3 border border-border rounded-xl text-sm text-muted-foreground hover:bg-secondary/30 transition-colors"
                  >
                    쿠폰 적용 안함
                  </button>
                )}
                {couponData?.coupons.map(c => (
                  <button
                    key={c.userCouponId}
                    onClick={() => { setSelectedUserCouponId(c.userCouponId); setShowCouponSheet(false); }}
                    className={`w-full p-4 rounded-xl border text-left transition-colors ${selectedUserCouponId === c.userCouponId ? "border-foreground bg-secondary/50" : "border-border hover:bg-secondary/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className="text-sm font-bold" style={{ color: ACCENT }}>
                        {c.discountType === "fixed" ? `${c.discountValue.toLocaleString()}원` : `${c.discountValue}%`} 할인
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.minOrderAmount > 0 && `${c.minOrderAmount.toLocaleString()}원 이상 구매 시 · `}
                      {c.expiresAt ? `${new Date(c.expiresAt).toLocaleDateString()} 까지` : "기간 제한 없음"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
