import { createFileRoute, Link, Outlet, useRouterState, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Music, Users, ShieldCheck, DollarSign, BarChart3, Settings, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
    const { data: profile } = await (supabase as any).from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") throw redirect({ to: "/" });
  },
  head: () => ({ meta: [{ title: "Admin — GhostBus" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/tracks", label: "Track Review", icon: Music },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/kyc", label: "KYC Review", icon: ShieldCheck },
  { to: "/admin/orders", label: "Orders", icon: DollarSign },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="container-app pt-10 pb-24 grid lg:grid-cols-[220px_1fr] gap-8">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-1">
          <div className="flex items-center gap-2 px-3 mb-4">
            <div className="w-6 h-6 rounded-lg bg-destructive grid place-items-center">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="label-eyebrow">Admin Panel</span>
          </div>
          {NAV.map((n) => {
            const active = n.to === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.label}
                to={n.to}
                className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm transition ${active ? "bg-accent text-primary font-medium" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}
              >
                <n.icon className="w-4 h-4 shrink-0" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
