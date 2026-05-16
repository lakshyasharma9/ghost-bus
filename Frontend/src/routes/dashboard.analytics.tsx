import { createFileRoute } from "@tanstack/react-router";
import { Eye, Play, ShoppingCart, TrendingUp } from "lucide-react";
import { TRACKS } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Dashboard" }] }),
  component: DashboardAnalytics,
});

const TOP_TRACKS = TRACKS.slice(0, 6).map((t, i) => ({
  ...t,
  views: 800 - i * 90,
  plays: 340 - i * 40,
  addedToCart: 120 - i * 14,
  conversionRate: `${(8 - i * 0.8).toFixed(1)}%`,
}));

const WEEKLY_PLAYS = [42, 67, 55, 89, 73, 95, 110];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxPlays = Math.max(...WEEKLY_PLAYS);

function DashboardAnalytics() {
  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Analytics</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Performance Analytics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Eye className="w-4 h-4" />, label: "Total Views", value: "12,840", change: "+14%" },
          { icon: <Play className="w-4 h-4" />, label: "Total Plays", value: "5,320", change: "+22%" },
          { icon: <ShoppingCart className="w-4 h-4" />, label: "Cart Adds", value: "847", change: "+8%" },
          { icon: <TrendingUp className="w-4 h-4" />, label: "Avg. Conversion", value: "5.6%", change: "+1.2%" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              {s.icon}
              <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
            <div className="text-xs text-emerald-500 font-medium mt-1">{s.change} this month</div>
          </div>
        ))}
      </div>

      {/* Weekly Plays Chart */}
      <div className="p-6 rounded-2xl bg-card border border-border mb-6">
        <div className="label-eyebrow mb-1">Weekly Plays</div>
        <div className="text-xl font-semibold mb-6">531 plays this week</div>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY_PLAYS.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary/50 to-primary hover:from-primary/70 hover:to-primary transition-colors cursor-pointer"
                style={{ height: `${(v / maxPlays) * 100}%` }}
                title={`${v} plays`}
              />
              <span className="text-xs text-muted-foreground">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="label-eyebrow mb-4">Conversion Funnel</div>
          {[
            { label: "Track Views", value: 12840, pct: 100 },
            { label: "Audio Plays", value: 5320, pct: 41 },
            { label: "Cart Adds", value: 847, pct: 7 },
            { label: "Purchases", value: 47, pct: 0.4 },
          ].map((f) => (
            <div key={f.label} className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{f.label}</span>
                <span className="text-muted-foreground">{f.value.toLocaleString()} ({f.pct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${f.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="label-eyebrow mb-4">Traffic Sources</div>
          {[
            { label: "Direct / Search", pct: 48 },
            { label: "Social Media", pct: 27 },
            { label: "Label Referrals", pct: 15 },
            { label: "Other", pct: 10 },
          ].map((s) => (
            <div key={s.label} className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{s.label}</span>
                <span className="text-muted-foreground">{s.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Tracks */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-semibold">Top Performing Tracks</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Plays</th>
                <th className="px-4 py-3 hidden md:table-cell">Cart Adds</th>
                <th className="px-4 py-3">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {TOP_TRACKS.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: t.artwork }} />
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-muted-foreground">{t.genre}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.plays.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.addedToCart}</td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-600 font-medium">{t.conversionRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
