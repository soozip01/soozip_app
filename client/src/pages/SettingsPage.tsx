/* SOOZIP - 환경설정 페이지 */
import { ArrowLeft, ChevronRight, Bell, FileText, Shield, User, Lock, LogOut, Megaphone } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useSoozipAuth } from "@/contexts/AuthContext";

const SETTINGS_ITEMS = [
  {
    group: "서비스",
    items: [
      { icon: Megaphone, label: "공지사항", action: "notice" },
      { icon: Shield, label: "개인정보처리방침", action: "privacy" },
      { icon: Bell, label: "알림 설정", action: "notification" },
    ],
  },
  {
    group: "계정",
    items: [
      { icon: User, label: "내 정보 수정", action: "edit_profile" },
      { icon: Lock, label: "비밀번호 변경", action: "change_password" },
    ],
  },
];

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { logout } = useSoozipAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("로그아웃 되었습니다.");
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "notice":
        toast.info("공지사항 기능이 준비 중입니다.");
        break;
      case "privacy":
        toast.info("개인정보처리방침 기능이 준비 중입니다.");
        break;
      case "notification":
        toast.info("알림 설정 기능이 준비 중입니다.");
        break;
      case "edit_profile":
        toast.info("내 정보 수정 기능이 준비 중입니다.");
        break;
      case "change_password":
        toast.info("비밀번호 변경 기능이 준비 중입니다.");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/mypage")}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">설정</span>
        </div>
      </header>

      <main className="pb-10">
        {SETTINGS_ITEMS.map((group) => (
          <div key={group.group} className="mt-4">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-secondary/50">
              {group.group}
            </p>
            {group.items.map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={() => handleAction(action)}
                className="w-full flex items-center justify-between px-4 py-4 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        ))}

        {/* 로그아웃 */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-border hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-red-500" strokeWidth={1.5} />
              <span className="text-sm text-red-500 font-medium">로그아웃</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
