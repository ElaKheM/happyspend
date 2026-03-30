import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { Home, List, Flame, Sparkles, User as UserIcon } from "lucide-react";

const DM = "'DM Sans', sans-serif";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({
    query: { retry: false, staleTime: 1000 * 60 * 5 }
  });

  // Spend DNA trigger: auto-redirect once on Day 30 — must be before any early returns
  useEffect(() => {
    if (
      user &&
      user.onboardingComplete &&
      (user.streakCount ?? 0) >= 30 &&
      !user.spendDnaUnlocked &&
      location !== "/spend-dna" &&
      location !== "/onboarding" &&
      location !== "/auth"
    ) {
      setLocation("/spend-dna");
    }
  }, [user, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9F6" }}>
        <div
          className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: "#E8E4DC", borderTopColor: "#7C9E8A" }}
        />
      </div>
    );
  }

  const isAuthRoute = location === "/auth";

  if (!user && !isAuthRoute) {
    window.location.href = "/auth";
    return null;
  }

  if (user && !user.onboardingComplete && location !== "/onboarding") {
    window.location.href = "/onboarding";
    return null;
  }

  const hideNav = isAuthRoute || location === "/onboarding" || location === "/spend-dna" || location === "/upgrade";

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden"
      style={{ background: "#FAF9F6", fontFamily: DM }}
    >
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {children}
      </main>

      {!hideNav && (
        <nav
          className="fixed bottom-0 w-full max-w-md pb-safe z-40"
          style={{
            background: "#FFFFFF",
            borderTop: "1px solid #EDE9E0",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.04)",
            borderRadius: "20px 20px 0 0",
            padding: "10px 16px 20px",
          }}
        >
          <div className="flex justify-between items-center">
            <NavItem href="/"        icon={<Home className="w-5 h-5" />}      label="Home"    isActive={location === "/"} />
            <NavItem href="/history" icon={<List className="w-5 h-5" />}      label="History" isActive={location === "/history"} />
            <NavItem href="/habit"   icon={<Flame className="w-5 h-5" />}     label="Habit"   isActive={location === "/habit"} />
            <NavItem href="/summary" icon={<Sparkles className="w-5 h-5" />}  label="Summary" isActive={location === "/summary"} />
            <NavItem href="/profile" icon={<UserIcon className="w-5 h-5" />}  label="Profile" isActive={location === "/profile"} />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string; icon: ReactNode; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 py-1 px-2 rounded-2xl transition-all duration-200"
      style={{
        color: isActive ? "#7C9E8A" : "#999",
        fontFamily: DM,
        fontSize: 10,
        fontWeight: isActive ? 600 : 400,
      }}
    >
      <div
        className="p-1.5 rounded-xl"
        style={{ background: isActive ? "#EEF4F0" : "transparent" }}
      >
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}
