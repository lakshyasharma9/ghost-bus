import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { PageHeader, SectionCard, KpiCard } from "@/components/admin/ui";
import { fmtMoney } from "@/lib/admin-mock";
import { useDashboardStats, useRevenueChart, useAdminAnalytics, useAdminTracks } from "@/lib/use-admin-api";
import { Users, Music, Percent } from "lucide-react";

const COLORS = ["oklch(0.55 0.22 264)", "oklch(0.65 0.17 150)", "oklch(0.78 0.17 80)", "oklch(0.65 0.16 230)", "oklch(0.6 0.22 340)", "oklch(0.7 0.18 30)"];

function AnalyticsPage() {
  const { data: stats } = useDashboardStats();
  const { data: chartData } = useRevenueChart();
  const { data: analyticsData } = useAdminAnalytics();
  const { data: tracksData } = useAdminTracks({ status: "approved", limit: "10" });

  const s = stats as any;
  const revenueDaily = (chartData as any)?.data ?? [];
  const genreRevenue = (analyticsData as any)?.genreRevenue ?? [];
  const usersGrowth = (analyticsData as any)?.usersGrowth ?? [];
  const topTracks = (tracksData as any)?.tracks ?? [];

  return (
    <div>
      <PageHeader title="Analytics" description="Data-driven insights into platform performance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Users" value={s?.totalUsers?.toLocaleString() ?? "—"} icon={Users} />
        <KpiCard label="Active Sellers" value={s?.activeSellers ?? "—"} icon={Music} tone="success" />
        <KpiCard label="Total Revenue" value={fmtMoney(s?.totalRevenue ?? 0)} icon={Percent} />
        <KpiCard label="This Month" value={fmtMoney(s?.monthRevenue ?? 0)} icon={Percent} tone="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <SectionCard title="Daily revenue" description="Last 30 days">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={revenueDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.013 255)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} />
                <Line dataKey="revenue" stroke={COLORS[0]} strokeWidth={2} dot={false} name="Revenue" />
                <Line dataKey="commission" stroke={COLORS[1]} strokeWidth={2} dot={false} name="Commission" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="User growth" description="Monthly registrations">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={usersGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.013 255)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area dataKey="users" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <SectionCard title="Tracks by genre">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={genreRevenue} dataKey="value" nameKey="genre" outerRadius={80} label={{ fontSize: 10 }}>
                  {genreRevenue.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Commission vs payouts" description="Stacked by period">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={revenueDaily.filter((_: any, i: number) => i % 5 === 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="commission" stackId="a" fill={COLORS[0]} name="Platform fee" />
                <Bar dataKey="revenue" stackId="a" fill={COLORS[1]} name="Total revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top approved tracks">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Track</th>
              <th className="py-2 pr-4 font-medium">Genre</th>
              <th className="py-2 pr-4 font-medium">Plays</th>
              <th className="py-2 pr-4 font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topTracks.map((t: any, i: number) => (
              <tr key={t.id}>
                <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                <td className="py-2 pr-4">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.seller?.fullName ?? t.seller?.email}</p>
                </td>
                <td className="py-2 pr-4 text-sm">{t.genre}</td>
                <td className="py-2 pr-4">{(t.playsCount ?? 0).toLocaleString()}</td>
                <td className="py-2 pr-4">{fmtMoney(t.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

export const Route = createFileRoute("/admin/analytics")({ component: AnalyticsPage });
