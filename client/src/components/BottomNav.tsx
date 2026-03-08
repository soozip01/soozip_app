/* SOOZIP Design: Monochrome + Terracotta Orange - Bottom Navigation
 * 5 tabs: 홈 | 제품카테고리 | 스타일링샷/쇼핑 | 마이페이지 | 장바구니
 * Active state: terracotta accent color
 */
import { useLocation } from "wouter";

/* ── 아이콘 컴포넌트 ── */
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CategoryIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

/* 스타일링샷 + 쇼핑 탭 아이콘 (하트+쇼핑백 조합) */
const StylingShopIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const MyPageIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const navItems = [
  { Icon: HomeIcon, label: "홈", path: "/" },
  { Icon: CategoryIcon, label: "제품", path: "/products" },
  { Icon: StylingShopIcon, label: "스타일링", path: "/styling-shop" },
  { Icon: MyPageIcon, label: "마이", path: "/mypage" },
  { Icon: CartIcon, label: "장바구니", path: "/cart", badge: 0 },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ Icon, label, path, badge }) => {
          const isActive =
            path === "/"
              ? location === "/"
              : location === path || location.startsWith(path + "/") || location.startsWith(path + "?");

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative"
              style={{ color: isActive ? "oklch(0.58 0.16 38)" : "oklch(0.5 0 0)" }}
            >
              <div className="relative">
                <Icon active={isActive} />
                {badge !== undefined && badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1.5 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ background: "oklch(0.58 0.16 38)" }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: isActive ? "oklch(0.58 0.16 38)" : "oklch(0.5 0 0)" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
