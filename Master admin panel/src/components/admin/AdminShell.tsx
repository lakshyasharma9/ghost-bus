import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { navItems, sections } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { getToken, clearToken } from "@/lib/api";
import { useDashboardStats } from "@/lib/use-admin-api";
import { useEffect, useState } from "react";

// ── Token validation (client-only, synchronous) ──────────────────────────────
function validateToken(token: string | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1]));
    if (payload.role !== "ADMIN") return false;
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function AdminShell() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const navigate = useNavigate();
  const grouped = sections.map(s => ({ section: s, items: navItems.filter(i => i.section === s) }));

  // Login page is a child of this layout — render it directly without the shell
  if (pathname === "/admin/login") {
    return <Outlet />;
  }

  return <AdminShellInner navigate={navigate} grouped={grouped} pathname={pathname} />;
}

function AdminShellInner({ navigate, grouped, pathname }: {
  navigate: ReturnType<typeof useNavigate>;
  grouped: { section: string; items: typeof navItems }[];
  pathname: string;
}) {
  const [tokenVerified, setTokenVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!validateToken(token)) {
      clearToken();
      navigate({ to: "/admin/login" });
      setTokenVerified(false);
    } else {
      setTokenVerified(true);
    }
  }, [navigate]);

  // Only fetch stats once token is confirmed valid
  const { data: stats, error: statsError } = useDashboardStats();

  useEffect(() => {
    if (statsError) {
      const msg = (statsError as Error).message ?? "";
      if (msg.startsWith("401") || msg.startsWith("403")) {
        clearToken();
        navigate({ to: "/admin/login" });
      }
    }
  }, [statsError, navigate]);

  // Don't render until token verified
  if (tokenVerified === null || tokenVerified === false) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Authenticating…</div>;
  }

  const s = stats as any;

  const badges = {
    pendingApplications: s?.pendingApplications ?? 0,
    pendingTracks: s?.pendingTracks ?? 0,
    pendingKyc: s?.pendingKyc ?? 0,
  };

  const handleSignOut = () => {
    clearToken();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="h-screen overflow-hidden bg-[oklch(0.985_0.005_247)] flex">
      {/* Sidebar — fixed height, scrolls independently */}
      <aside className="w-64 shrink-0 border-r bg-white flex flex-col h-full">
        <div className="h-14 shrink-0 flex items-center gap-2 px-5 border-b">
          <div className="h-7 w-7 rounded-md bg-primary grid place-items-center text-primary-foreground text-xs font-bold">G</div>
          <div>
            <p className="text-sm font-semibold leading-none">GhostBus</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Master Admin</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 text-sm">
          {grouped.map(({ section, items }) => (
            <div key={section} className="mb-4">
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{section}</p>
              {items.map(item => {
                const active = item.to === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.to || pathname.startsWith(item.to + "/");
                const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-1.5 transition-colors",
                      active ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {badge ? (
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        active ? "bg-primary text-primary-foreground" : "bg-amber-100 text-amber-800")}>{badge}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="shrink-0 border-t p-3 text-xs text-muted-foreground">
          GhostBus Admin v1.0
        </div>
      </aside>

      {/* Main — fills remaining height, scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-14 shrink-0 z-10 bg-white/80 backdrop-blur border-b flex items-center gap-3 px-6">
          <Link to="/admin/search" className="flex-1 max-w-md flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/40 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Search className="h-4 w-4" />
            <span>Search users, tracks, orders…</span>
            <span className="ml-auto text-[10px] border rounded px-1.5 py-0.5">⌘K</span>
          </Link>
          <button className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-muted" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <button className="flex items-center gap-2 h-9 px-2 rounded-md hover:bg-muted">
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">A</div>
            <div className="text-left">
              <p className="text-xs font-medium leading-none">Admin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">MASTER_ADMIN</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <Link to="/admin/login" className="h-9 w-9 grid place-items-center rounded-md hover:bg-muted" aria-label="Sign out" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
