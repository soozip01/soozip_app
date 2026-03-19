/**
 * 장바구니 Context
 * - localStorage 기반 장바구니 상태 관리
 * - 패키지 제품 및 일반 제품 모두 지원
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  mainCategory: string | null;
  subCategory: string | null;
  salePrice: number;
  originalPrice: number;
  imageUrl: string | null;
  quantity: number;
  memo: string | null;
  source: "package" | "product"; // 패키지 제품인지 일반 제품인지 구분
  packageId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  addAllPackageItems: (items: Omit<CartItem, "quantity" | "source">[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalOriginalPrice: number;
  totalDiscount: number;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "soozip_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id
            ? { ...i, quantity: i.quantity + (newItem.quantity ?? 1) }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: newItem.quantity ?? 1 } as CartItem];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  }, []);

  const addAllPackageItems = useCallback(
    (packageItems: Omit<CartItem, "quantity" | "source">[]) => {
      setItems((prev) => {
        const next = [...prev];
        for (const item of packageItems) {
          const existing = next.find((i) => i.id === item.id);
          if (existing) {
            existing.quantity += 1;
          } else {
            next.push({ ...item, quantity: 1, source: "package" } as CartItem);
          }
        }
        return next;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
  const totalOriginalPrice = items.reduce(
    (sum, i) => sum + i.originalPrice * i.quantity,
    0
  );
  const totalDiscount = totalOriginalPrice - totalPrice;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        addAllPackageItems,
        clearCart,
        totalItems,
        totalPrice,
        totalOriginalPrice,
        totalDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
