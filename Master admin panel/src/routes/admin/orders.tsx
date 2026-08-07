import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, DataTable, StatusBadge, FilterBar, Input, Select, Button } from "@/components/admin/ui";
import { fmtDate, fmtMoney } from "@/lib/admin-mock";
import { useAdminOrders, useRefundOrder } from "@/lib/use-admin-api";
import type { OrderRow } from "@/lib/api";

function OrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (status) params.status = status;

  const { data, isLoading } = useAdminOrders(params);
  const refund = useRefundOrder();

  const allRows: OrderRow[] = (data as any)?.orders ?? [];
  const rows = q
    ? allRows.filter(o => o.id.includes(q) || (o.buyer?.email ?? "").toLowerCase().includes(q.toLowerCase()) || (o.buyer?.fullName ?? "").toLowerCase().includes(q.toLowerCase()))
    : allRows;
  const total: number = (data as any)?.pagination?.total ?? 0;
  const totalPages: number = (data as any)?.pagination?.totalPages ?? 1;

  return (
    <div>
      <PageHeader title="Orders" description={`${total} total transactions`} />
      <FilterBar>
        <Input placeholder="Search order ID or buyer…" value={q} onChange={e => setQ(e.target.value)} className="w-72" />
        <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
      </FilterBar>
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="rounded-xl border bg-card p-2">
          <DataTable
            rows={rows}
            columns={[
              { key: "id", header: "Order ID", render: (o: OrderRow) => <span className="font-mono text-xs">{o.id.slice(0, 8)}…</span> },
              { key: "buyer", header: "Buyer", render: (o: OrderRow) => o.buyer?.fullName ?? o.buyer?.email },
              { key: "tracks", header: "Tracks", render: (o: OrderRow) => o.items?.length ?? 0 },
              { key: "total", header: "Total", render: (o: OrderRow) => fmtMoney(o.totalAmount) },
              { key: "status", header: "Status", render: (o: OrderRow) => <StatusBadge status={o.status?.toLowerCase()} /> },
              { key: "stripe", header: "Stripe ID", render: (o: OrderRow) => o.stripePaymentIntentId ? <span className="font-mono text-xs text-muted-foreground">{o.stripePaymentIntentId.slice(0, 14)}…</span> : "—" },
              { key: "date", header: "Created", render: (o: OrderRow) => <span className="text-xs">{fmtDate(o.createdAt)}</span> },
              { key: "actions", header: "", render: (o: OrderRow) => (
                <div className="flex justify-end gap-1">
                  {o.status === "COMPLETED" && (
                    <Button size="sm" variant="secondary" onClick={() => refund.mutate(o.id)} disabled={refund.isPending}>Refund</Button>
                  )}
                </div>
              ), className: "text-right" },
            ]}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t text-sm">
              <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
              <span className="text-muted-foreground">{page} / {totalPages}</span>
              <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/orders")({ component: OrdersPage });
