import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Tabs, DataTable, StatusBadge, Button } from "@/components/admin/ui";
import { fmtDate, fmtMoney } from "@/lib/admin-mock";
import { useAdminWithdrawals, useProcessWithdrawal } from "@/lib/use-admin-api";
import type { WithdrawalRow } from "@/lib/api";

function WithdrawalsPage() {
  const [tab, setTab] = useState<"pending" | "processed" | "rejected" | "all">("pending");

  const params: Record<string, string> = { limit: "50" };
  if (tab !== "all") params.status = tab;

  const { data, isLoading } = useAdminWithdrawals(params);
  const process = useProcessWithdrawal();
  const rows: WithdrawalRow[] = (data as any)?.withdrawals ?? [];

  const count = (s: string) => rows.filter(w => w.status === s).length;

  return (
    <div>
      <PageHeader title="Withdrawals" description="Manage seller payout requests." />
      <Tabs
        active={tab}
        onChange={t => setTab(t as typeof tab)}
        tabs={[
          { id: "pending", label: "Pending", count: count("pending") },
          { id: "processed", label: "Processed", count: count("processed") },
          { id: "rejected", label: "Rejected", count: count("rejected") },
          { id: "all", label: "All", count: rows.length },
        ]}
      />
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="rounded-xl border bg-card p-2">
          <DataTable
            rows={rows}
            columns={[
              { key: "id", header: "ID", render: (w: WithdrawalRow) => <span className="font-mono text-xs">{w.id.slice(0, 8)}…</span> },
              { key: "seller", header: "Seller", render: (w: WithdrawalRow) => (
                <div>
                  <p className="text-sm font-medium">{w.seller?.fullName ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{w.seller?.email}</p>
                </div>
              )},
              { key: "amount", header: "Amount", render: (w: WithdrawalRow) => fmtMoney(w.amount) },
              { key: "stripe", header: "Stripe acct", render: (w: WithdrawalRow) => w.seller?.stripeAccountId
                ? <span className="font-mono text-xs text-muted-foreground">{w.seller.stripeAccountId.slice(0, 14)}…</span>
                : <span className="text-xs text-muted-foreground">—</span> },
              { key: "status", header: "Status", render: (w: WithdrawalRow) => <StatusBadge status={w.status} /> },
              { key: "req", header: "Requested", render: (w: WithdrawalRow) => <span className="text-xs">{fmtDate(w.createdAt)}</span> },
              { key: "proc", header: "Processed", render: (w: WithdrawalRow) => w.processedAt ? <span className="text-xs">{fmtDate(w.processedAt)}</span> : "—" },
              { key: "actions", header: "", render: (w: WithdrawalRow) => (
                <div className="flex justify-end gap-1">
                  {w.status === "pending" && <>
                    <Button size="sm" variant="success" onClick={() => process.mutate({ id: w.id, action: "approve" })} disabled={process.isPending}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => process.mutate({ id: w.id, action: "reject" })} disabled={process.isPending}>Reject</Button>
                  </>}
                </div>
              ), className: "text-right" },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/withdrawals")({ component: WithdrawalsPage });
