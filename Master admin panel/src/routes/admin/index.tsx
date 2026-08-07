import { createFileRoute, Link } from "@tanstack/react-router";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Store, DollarSign, TrendingUp, Shield, AlertOctagon, RotateCcw, FileCheck2, ArrowRight } from "lucide-react";
import { PageHeader, KpiCard, SectionCard, StatusBadge, DataTable } from "@/components/admin/ui";
import { fmtMoney, fmtDate } from "@/lib/admin-mock";
import { useDashboardStats, useRevenueChart, useAdminTracks, useAdminOrders } from "@/lib/use-admin-api";

function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData } = useRevenueChart();
  const { data: tracksData } = useAdminTracks({ limit: "5", sortBy: "plays" });
  const { data: ordersData } = useAdminOrders({ limit: "5" });

  const topTracks = (tracksData as any)?.tracks ?? [];
  const latestOrders = (ordersData as any)?.orders ?? [];
  const revenueDaily = (chartData as any)?.data ?? [];

  const s = stats as any;

  return (
    <div>
      <PageHeader title="Dashboard" description="Platform health and pending actions at a glance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Users" value={statsLoading ? "—" : (s?.totalUsers ?? 0).toLocaleString()} icon={Users} />
        <KpiCard label="Active Sellers" value={statsLoading ? "—" : (s?.activeSellers ?? 0)} icon={Store} />
        <KpiCard label="Total Revenue" value={statsLoading ? "—" : fmtMoney(s?.totalRevenue ?? 0)} icon={DollarSign} tone="success" />
        <KpiCard label="Revenue This Month" value={statsLoading ? "—" : fmtMoney(s?.monthRevenue ?? 0)} icon={TrendingUp} tone="success" />
        <KpiCard label="Tracks Pending" value={statsLoading ? "—" : (s?.pendingTracks ?? 0)} icon={Shield} tone="warn" />
        <KpiCard label="Open Disputes" value={statsLoading ? "—" : (s?.openDisputes ?? 0)} icon={AlertOctagon} tone="alert" />
        <KpiCard label="Pending Refunds" value={statsLoading ? "—" : (s?.pendingRefunds ?? 0)} icon={RotateCcw} tone="warn" />
        <KpiCard label="Seller Applications" value={statsLoading ? "—" : (s?.pendingApplications ?? 0)} icon={FileCheck2} tone="warn" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <SectionCard title="Revenue — last 30 days" description="Daily gross sales">
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={revenueDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.013 255)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.55 0.046 257)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.55 0.046 257)" />
                  <Tooltip formatter={(v: number) => fmtMoney(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="oklch(0.55 0.22 264)" strokeWidth={2} dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="commission" stroke="oklch(0.65 0.17 150)" strokeWidth={2} dot={false} name="Commission" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Pending actions" description="Things waiting on you">
          <ul className="space-y-2 text-sm">
            <ActionRow to="/admin/moderation" label="Tracks to moderate" count={s?.pendingTracks ?? 0} />
            <ActionRow to="/admin/kyc" label="KYC submissions" count={s?.pendingKyc ?? 0} />
            <ActionRow to="/admin/seller-applications" label="Seller applications" count={s?.pendingApplications ?? 0} />
            <ActionRow to="/admin/refunds" label="Refund requests" count={s?.pendingRefunds ?? 0} />
            <ActionRow to="/admin/disputes" label="Open disputes" count={s?.openDisputes ?? 0} />
            <ActionRow to="/admin/withdrawals" label="Withdrawals" count={s?.pendingWithdrawals ?? 0} />
          </ul>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title="Top selling tracks" actions={<Link to="/admin/tracks" className="text-xs text-primary font-medium">View all</Link>}>
          <DataTable
            columns={[
              { key: "title", header: "Track", render: (r: any) => (
                <div>
                  <p className="font-medium text-foreground text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.seller?.fullName ?? r.seller?.email}</p>
                </div>
              )},
              { key: "plays", header: "Plays", render: (r: any) => (r.playsCount ?? 0).toLocaleString() },
              { key: "price", header: "Price", render: (r: any) => fmtMoney(r.price) },
            ]}
            rows={topTracks}
          />
        </SectionCard>
        <SectionCard title="Latest uploads" actions={<Link to="/admin/moderation" className="text-xs text-primary font-medium">Moderation queue</Link>}>
          <DataTable
            columns={[
              { key: "title", header: "Track", render: (r: any) => <p className="font-medium text-sm">{r.title}</p> },
              { key: "seller", header: "Seller", render: (r: any) => <p className="text-sm">{r.seller?.fullName ?? r.seller?.email}</p> },
              { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status?.toLowerCase()} /> },
              { key: "date", header: "Uploaded", render: (r: any) => <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span> },
            ]}
            rows={topTracks}
          />
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Latest orders" actions={<Link to="/admin/orders" className="text-xs text-primary font-medium">View all</Link>}>
          <DataTable
            columns={[
              { key: "id", header: "Order", render: (r: any) => <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span> },
              { key: "buyer", header: "Buyer", render: (r: any) => r.buyer?.fullName ?? r.buyer?.email },
              { key: "tracks", header: "Tracks", render: (r: any) => r.items?.length ?? 0 },
              { key: "total", header: "Total", render: (r: any) => fmtMoney(r.totalAmount) },
              { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status?.toLowerCase()} /> },
              { key: "date", header: "Created", render: (r: any) => fmtDate(r.createdAt) },
            ]}
            rows={latestOrders}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function ActionRow({ to, label, count }: { to: string; label: string; count: number }) {
  return (
    <li>
      <Link to={to} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
        <span>{label}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5">{count}</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      </Link>
    </li>
  );
}

export const Route = createFileRoute("/admin/")({ component: Dashboard });
