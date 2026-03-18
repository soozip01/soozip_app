/* SOOZIP Design: Japandi Minimalism - Cart Page */
import { ArrowLeft, ShoppingCart, Package, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

export default function CartPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">장바구니</span>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <ShoppingCart size={64} className="text-muted-foreground mb-4" strokeWidth={1} />
        <p className="font-semibold text-foreground mb-2">장바구니가 비어있습니다</p>
        <p className="text-sm text-muted-foreground mb-6 text-center">마음에 드는 상품을 장바구니에 담아보세요</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
        >
          쇼핑 계속하기
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
