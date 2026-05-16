import { createFileRoute } from "@tanstack/react-router";
import { Music, Users, DollarSign, ShieldCheck, TrendingUp, Clock } from "lucide-react";
import { useAdminStats } from "@/hooks/use-api";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — GhostBus" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats();

  const cards = [
    { icon: <Music className="w-5 h-5" />, label: "Total Tracks", value: stats?.totalTracks ?? 0, sub: `${stats?.pendingTracks ?? 0} pending review`, color: "text-primary" },
    { icon: <Users className="w-5 h-5" />, label: "Total Users", value: stats?.totalUsers ?? 0, sub: "Registered accounts", color: "text-emerald-500" },
    { icon: <DollarSign className="w-5 h-5" />, label: "Total Revenue", value: `$${((stats?.totalRevenue ?? 0) / 100).toLocaleString()}`, sub: `${stats?.totalOrders ?? 0} orders`, color: "text-primary" },
    { icon: <ShieldCheck className="w-5 h-5" />, label: "Pending KYC", value: stats?.pendingKYC ?? 0, sub: "Awaiting review", color: "text-amber-500" },
  ];

  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Admin</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Platform Overview</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="p-5 rounded-2xl bg-card border border-border">
            <div className={`w-9 h-9 rounded-xl bg-muted grid place-items-center mb-3 ${c.color}`}>{c.icon}</div>
            <div className="text-2xl font-semibold tracking-tight">{isLoading ? "—" : c.value}</div>
            <div className="label-eyebrow mt-1">{c.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">Pending Actions</span>
          </div>
          <ul className="space-y-3">
            {[
              { label: "Tracks awaiting A&R review", count: stats?.pendingTracks ?? 0, to: "/admin/tracks", color: "bg-amber-50 text-amber-600" },
              { label: "KYC submissions to review", count: stats?.pendingKYC ?? 0, to: "/admin/kyc", color: "bg-blue-50 text-blue-600" },
            ].map((item) => (
              <li key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm">{item.label}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.color}`}>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold">Quick Links</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Review Tracks", to: "/admin/tracks" },
              { label: "Review KYC", to: "/admin/kyc" },
              { label: "Manage Users", to: "/admin/users" },
              { label: "View Orders", to: "/admin/orders" },
            ].map((l) => (
              <a key={l.label} href={l.to} className="p-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-center">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
