import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Upload, Music, DollarSign, MessageCircle, BarChart3, ShieldCheck, Settings } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — GhostBus" }] }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard/", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/upload", label: "Upload", icon: Upload },
  { to: "/dashboard/tracks", label: "My Tracks", icon: Music },
  { to: "/dashboard/earnings", label: "Earnings", icon: DollarSign },
  { to: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/kyc", label: "KYC", icon: ShieldCheck },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="container-app pt-10 pb-24 grid lg:grid-cols-[240px_1fr] gap-8">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-1">
          <div className="label-eyebrow px-3 mb-3">Seller</div>
          {NAV.map((n) => {
            const active = n.to === "/dashboard/"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname.startsWith(n.to);
            return (
              <Link
                key={n.label}
                to={n.to}
                className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm transition ${
                  active
                    ? "bg-accent text-primary font-medium"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <n.icon className="w-4 h-4 shrink-0" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="lg:hidden flex gap-1 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
        {NAV.map((n) => {
          const active = n.to === "/dashboard/"
            ? pathname === "/dashboard" || pathname === "/dashboard/"
            : pathname.startsWith(n.to);
          return (
            <Link
              key={n.label}
              to={n.to}
              className={`shrink-0 h-9 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition ${
                active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
              }`}
            >
              <n.icon className="w-3.5 h-3.5" />
              {n.label}
            </Link>
          );
        })}
      </div>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
