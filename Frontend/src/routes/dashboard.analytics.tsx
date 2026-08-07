import { createFileRoute } from "@tanstack/react-router";
import { Eye, Play, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import { useMyTracks, useSellerStats } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Dashboard" }] }),
  component: DashboardAnalytics,
});

function DashboardAnalytics() {
  const { data: myTracksData, isLoading: tracksLoading } = useMyTracks();
  const { data: statsRaw, isLoading: statsLoading } = useSellerStats();
  const stats = statsRaw as any;
  const myTracks: any[] = Array.isArray(myTracksData) ? myTracksData : [];

  // Calculate real analytics from seller's tracks
  const totalPlays = myTracks.reduce((sum, t) => sum + (t.playsCount || 0), 0);
  const totalLikes = myTracks.reduce((sum, t) => sum + (t.likesCount || 0), 0);
  const totalTracks = myTracks.length;
  const soldTracks = stats?.sold_tracks ?? 0;
  const conversionRate = totalPlays > 0 ? ((soldTracks / totalPlays) * 100).toFixed(1) : '0.0';

  const isLoading = tracksLoading || statsLoading;

  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Analytics</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Performance Analytics</h1>
      </div>

      {/* KPI Cards — REAL DATA */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Eye className="w-4 h-4" />, label: "Total Plays", value: isLoading ? '—' : totalPlays.toLocaleString() },
          { icon: <Play className="w-4 h-4" />, label: "Total Likes", value: isLoading ? '—' : totalLikes.toLocaleString() },
          { icon: <ShoppingCart className="w-4 h-4" />, label: "Tracks Sold", value: isLoading ? '—' : String(soldTracks) },
          { icon: <TrendingUp className="w-4 h-4" />, label: "Conversion Rate", value: isLoading ? '—' : `${conversionRate}%` },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              {s.icon}
              <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Track Performance Table — REAL DATA */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="label-eyebrow mb-4">Track Performance</div>
        {isLoading ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : myTracks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Upload tracks to see performance data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 pr-4">Track</th>
                  <th className="pb-3 pr-4">Genre</th>
                  <th className="pb-3 pr-4">Plays</th>
                  <th className="pb-3 pr-4">Likes</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {myTracks.slice(0, 10).map((t: any) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium">{t.title}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{t.genre}</td>
                    <td className="py-3 pr-4 tabular-nums">{(t.playsCount || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4 tabular-nums">{(t.likesCount || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        t.status === 'approved' || t.status === 'live' ? 'bg-emerald-50 text-emerald-600' :
                        t.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        t.status === 'sold' ? 'bg-muted text-muted-foreground' :
                        'bg-red-50 text-red-600'
                      }`}>{t.status === 'approved' ? 'live' : t.status}</span>
                    </td>
                    <td className="py-3 font-semibold">€{t.price}</td>
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
