import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { Home, List, Sparkles, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading, error } = useGetMe({
    query: { retry: false, staleTime: 1000 * 60 * 5 }
  });

  // Global auth guard
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
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

  // Hide nav on specific immersive screens
  const hideNav = isAuthRoute || location === "/onboarding";

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 w-full max-w-md bg-card/80 backdrop-blur-xl border-t border-border pb-safe pt-2 px-6 pb-6 z-40 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center">
            <NavItem href="/" icon={<Home />} label="Home" isActive={location === "/"} />
            <NavItem href="/history" icon={<List />} label="History" isActive={location === "/history"} />
            <NavItem href="/summary" icon={<Sparkles />} label="Summary" isActive={location === "/summary"} />
            <NavItem href="/profile" icon={<UserIcon />} label="Profile" isActive={location === "/profile"} />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string, icon: ReactNode, label: string, isActive: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300",
      isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    )}>
      <div className={cn(
        "p-1.5 rounded-xl transition-colors",
        isActive ? "bg-primary/10" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium font-display">{label}</span>
    </Link>
  );
}
