import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, TrendingUp, Loader2 } from "lucide-react";
import { useSellerStats, useSellerOrders } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview — Dashboard" }] }),
  component: DashboardOverview,
});

const TOP_GENRES = [["Tech House", 42], ["Melodic Techno", 28], ["Afro House", 18], ["Bass House", 12]] as const;

function DashboardOverview() {
  const { data: statsRaw, isLoading: statsLoading } = useSellerStats();
  const stats = statsRaw as any;
  const { data: orders = [], isLoading: ordersLoading } = useSellerOrders();
  const recentSales = (orders as any[]).filter((o) => o.status === "paid").slice(0, 5);

  const statCards = [
    { label: "Total Earned", value: statsLoading ? "—" : `$${(stats?.total_earned ?? 0).toLocaleString()}`, change: "", up: null },
    { label: "Tracks Sold", value: statsLoading ? "—" : String(stats?.sold_tracks ?? 0), change: "", up: null },
    { label: "Pending Review", value: statsLoading ? "—" : String(stats?.pending_tracks ?? 0), change: "", up: null },
    { label: "Active Listings", value: statsLoading ? "—" : String(stats?.active_tracks ?? 0), change: "", up: null },
  ];

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="label-eyebrow mb-2">Welcome back</div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Studio overview</h1>
        </div>
        <Link to="/dashboard/upload" className="h-10 px-5 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[0_8px_24px_rgba(10,132,255,0.28)]">
          Upload Track <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="p-6 rounded-2xl bg-card border border-border">
            <div className="label-eyebrow">{s.label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="label-eyebrow">Earnings · last 30 days</div>
              <div className="mt-1 text-2xl font-semibold">
                {statsLoading ? "—" : `$${(stats?.earned_this_month ?? 0).toLocaleString()}`}
              </div>
            </div>
          </div>
          <div className="h-44 flex items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/50 to-primary hover:from-primary/70 hover:to-primary transition-colors cursor-pointer" style={{ height: `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Day 1</span><span>Day 10</span><span>Day 20</span><span>Day 30</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="label-eyebrow mb-4">Top genres</div>
          <ul className="space-y-3">
            {TOP_GENRES.map(([g, p]) => (
              <li key={g}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{g}</span>
                  <span className="text-muted-foreground">{p}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-5">
          <div className="font-semibold">Recent sales</div>
          <Link to="/dashboard/earnings" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {ordersLoading ? (
          <div className="py-8 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : recentSales.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No sales yet. Upload tracks to start earning.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Track</th>
                  <th className="pb-3">Buyer</th>
                  <th className="pb-3 hidden sm:table-cell">Date</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((o: any) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="py-3 font-medium">{o.tracks?.title ?? "—"}</td>
                    <td className="py-3 text-muted-foreground">{o.profiles?.display_name ?? "—"}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-semibold text-primary">${o.seller_payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
