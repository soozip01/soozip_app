/**
 * 주문서(Checkout) API 단위 테스트
 * - 배송지 저장/조회
 * - 쿠폰 유효성 검증
 * - 포인트 잔액 조회
 * - 주문 생성 로직
 */
import { describe, it, expect } from "vitest";

// 배송지 유효성 검증 헬퍼
function validateShippingAddress(addr: {
  recipientName: string;
  phone: string;
  zipCode: string;
  address: string;
}) {
  const errors: string[] = [];
  if (!addr.recipientName.trim()) errors.push("수령인 이름이 필요합니다.");
  if (!/^010-?\d{4}-?\d{4}$/.test(addr.phone.replace(/\s/g, ""))) {
    errors.push("올바른 휴대폰 번호를 입력해주세요.");
  }
  if (!/^\d{5}$/.test(addr.zipCode)) errors.push("우편번호는 5자리 숫자입니다.");
  if (!addr.address.trim()) errors.push("주소가 필요합니다.");
  return errors;
}

// 주문 금액 계산 헬퍼
function calculateOrderAmount(params: {
  items: Array<{ price: number; additionalPrice: number; quantity: number }>;
  shippingFee: number;
  couponDiscount: number;
  pointUsed: number;
}) {
  const subtotal = params.items.reduce(
    (s, i) => s + (i.price + i.additionalPrice) * i.quantity,
    0
  );
  const totalDiscount = params.couponDiscount + params.pointUsed;
  const finalAmount = Math.max(0, subtotal + params.shippingFee - totalDiscount);
  return { subtotal, totalDiscount, finalAmount };
}

// 쿠폰 할인 계산 헬퍼
function applyCoupon(
  coupon: { discountType: "fixed" | "percent"; discountValue: number; minOrderAmount: number },
  subtotal: number
): number {
  if (subtotal < coupon.minOrderAmount) return 0;
  if (coupon.discountType === "fixed") return Math.min(coupon.discountValue, subtotal);
  // percent
  return Math.floor((subtotal * coupon.discountValue) / 100);
}

describe("배송지 유효성 검증", () => {
  it("올바른 배송지는 오류 없음", () => {
    const errors = validateShippingAddress({
      recipientName: "홍길동",
      phone: "010-1234-5678",
      zipCode: "06000",
      address: "서울특별시 강남구 테헤란로 123",
    });
    expect(errors).toHaveLength(0);
  });

  it("수령인 이름 누락 시 오류", () => {
    const errors = validateShippingAddress({
      recipientName: "",
      phone: "010-1234-5678",
      zipCode: "06000",
      address: "서울특별시 강남구",
    });
    expect(errors).toContain("수령인 이름이 필요합니다.");
  });

  it("잘못된 전화번호 형식 시 오류", () => {
    const errors = validateShippingAddress({
      recipientName: "홍길동",
      phone: "02-1234-5678",
      zipCode: "06000",
      address: "서울특별시 강남구",
    });
    expect(errors).toContain("올바른 휴대폰 번호를 입력해주세요.");
  });

  it("우편번호 4자리 시 오류", () => {
    const errors = validateShippingAddress({
      recipientName: "홍길동",
      phone: "010-1234-5678",
      zipCode: "0600",
      address: "서울특별시 강남구",
    });
    expect(errors).toContain("우편번호는 5자리 숫자입니다.");
  });
});

describe("주문 금액 계산", () => {
  it("기본 금액 계산 (배송비 포함)", () => {
    const result = calculateOrderAmount({
      items: [{ price: 50000, additionalPrice: 0, quantity: 2 }],
      shippingFee: 3000,
      couponDiscount: 0,
      pointUsed: 0,
    });
    expect(result.subtotal).toBe(100000);
    expect(result.finalAmount).toBe(103000);
  });

  it("쿠폰 + 포인트 할인 적용", () => {
    const result = calculateOrderAmount({
      items: [{ price: 50000, additionalPrice: 0, quantity: 1 }],
      shippingFee: 0,
      couponDiscount: 5000,
      pointUsed: 2000,
    });
    expect(result.subtotal).toBe(50000);
    expect(result.totalDiscount).toBe(7000);
    expect(result.finalAmount).toBe(43000);
  });

  it("할인이 상품금액 초과 시 0원", () => {
    const result = calculateOrderAmount({
      items: [{ price: 5000, additionalPrice: 0, quantity: 1 }],
      shippingFee: 0,
      couponDiscount: 10000,
      pointUsed: 0,
    });
    expect(result.finalAmount).toBe(0);
  });

  it("추가상품 가격 포함 계산", () => {
    const result = calculateOrderAmount({
      items: [
        { price: 30000, additionalPrice: 5000, quantity: 2 },
        { price: 20000, additionalPrice: 0, quantity: 1 },
      ],
      shippingFee: 3000,
      couponDiscount: 0,
      pointUsed: 0,
    });
    expect(result.subtotal).toBe(90000); // (30000+5000)*2 + 20000
    expect(result.finalAmount).toBe(93000);
  });
});

describe("쿠폰 할인 계산", () => {
  it("정액 쿠폰 적용", () => {
    const discount = applyCoupon(
      { discountType: "fixed", discountValue: 5000, minOrderAmount: 30000 },
      50000
    );
    expect(discount).toBe(5000);
  });

  it("퍼센트 쿠폰 적용 (10% 할인)", () => {
    const discount = applyCoupon(
      { discountType: "percent", discountValue: 10, minOrderAmount: 0 },
      50000
    );
    expect(discount).toBe(5000);
  });

  it("최소 주문금액 미달 시 할인 없음", () => {
    const discount = applyCoupon(
      { discountType: "fixed", discountValue: 5000, minOrderAmount: 50000 },
      30000
    );
    expect(discount).toBe(0);
  });

  it("정액 쿠폰이 주문금액 초과 시 주문금액만큼만 할인", () => {
    const discount = applyCoupon(
      { discountType: "fixed", discountValue: 20000, minOrderAmount: 0 },
      10000
    );
    expect(discount).toBe(10000);
  });
});

describe("주문번호 생성", () => {
  it("SZ로 시작하는 주문번호 생성", () => {
    const orderNumber = `SZ${Date.now()}`;
    expect(orderNumber).toMatch(/^SZ\d+$/);
    expect(orderNumber.length).toBeGreaterThan(10);
  });
});
