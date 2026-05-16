import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useSellerOrders, useSellerStats, useRequestWithdrawal, useMyWithdrawals, useMyKYC } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Dashboard" }] }),
  component: DashboardEarnings,
});

function DashboardEarnings() {
  const { data: statsRaw } = useSellerStats();
  const stats = statsRaw as any;
  const { data: orders = [], isLoading } = useSellerOrders();
  const { data: withdrawals = [] } = useMyWithdrawals();
  const { data: kycRaw } = useMyKYC();
  const kyc = kycRaw as any;
  const requestWithdrawal = useRequestWithdrawal();
  const [withdrawing, setWithdrawing] = useState(false);

  const pendingPayout = (stats?.total_earned ?? 0) - withdrawals.filter((w: any) => w.status === "paid").reduce((s: number, w: any) => s + w.amount, 0);

  const handleWithdraw = async () => {
    if (kyc?.status !== "approved") {
      toast.error("Complete KYC verification before withdrawing.");
      return;
    }
    if (pendingPayout < 50) {
      toast.error("Minimum withdrawal is ₹50.");
      return;
    }
    setWithdrawing(true);
    requestWithdrawal.mutate({
      amount: pendingPayout,
      payout_method: kyc?.payout_method ?? "paypal",
      payout_destination: kyc?.payout_email ?? "",
    }, { onSettled: () => setWithdrawing(false) });
  };

  const paidOrders = orders.filter((o: any) => o.status === "paid");

  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Earnings</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Earnings & Payouts</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <DollarSign className="w-4 h-4" />, label: "Total Earned", value: `₹${(stats?.total_earned ?? 0).toLocaleString()}`, sub: "All time" },
          { icon: <TrendingUp className="w-4 h-4" />, label: "This Month", value: `₹${(stats?.earned_this_month ?? 0).toLocaleString()}`, sub: "Current month" },
          { icon: <Clock className="w-4 h-4" />, label: "Pending Payout", value: `₹${Math.max(0, pendingPayout).toLocaleString()}`, sub: "Available to withdraw" },
          { icon: <CheckCircle2 className="w-4 h-4" />, label: "Tracks Sold", value: stats?.sold_tracks ?? 0, sub: "Lifetime" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              {s.icon}
              <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Withdraw */}
      <div className="p-6 rounded-2xl bg-card border border-border mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="label-eyebrow mb-1">Available Balance</div>
            <div className="text-3xl font-semibold">₹{Math.max(0, pendingPayout).toLocaleString()}</div>
            {kyc?.status !== "approved" && (
              <p className="text-xs text-amber-600 mt-1">Complete KYC verification to withdraw</p>
            )}
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || requestWithdrawal.isPending || pendingPayout < 50 || kyc?.status !== "approved"}
            className="h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[0_8px_24px_rgba(10,132,255,0.28)] disabled:opacity-50 inline-flex items-center gap-2"
          >
            {(withdrawing || requestWithdrawal.isPending) ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Request Withdrawal"}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="font-semibold">Transaction History</div>
          <span className="text-xs text-muted-foreground">{paidOrders.length} transactions</span>
        </div>
        {isLoading ? (
          <div className="py-12 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : paidOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No sales yet. Upload tracks to start earning.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3 hidden md:table-cell">Buyer</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Gross</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Fee</th>
                  <th className="px-4 py-3">Net</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paidOrders.map((o: any) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{o.tracks?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{o.profiles?.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">₹{o.amount}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">-₹{o.platform_fee}</td>
                    <td className="px-4 py-3 font-semibold text-primary">₹{o.seller_payout}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">{o.status}</span>
                    </td>
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
