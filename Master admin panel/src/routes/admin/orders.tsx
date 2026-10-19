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
  const [expanded, setExpanded] = useState<string | null>(null);

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (status) params.status = status;

  const { data, isLoading } = useAdminOrders(params);
  const refund = useRefundOrder();

  const allRows: OrderRow[] = (data as any)?.orders ?? [];
  const rows = q
    ? allRows.filter(o =>
        o.id.includes(q) ||
        (o.buyer?.email ?? "").toLowerCase().includes(q.toLowerCase()) ||
        (o.buyer?.fullName ?? "").toLowerCase().includes(q.toLowerCase()) ||
        (o.paypalOrderId ?? "").includes(q) ||
        (o.paypalCaptureId ?? "").includes(q)
      )
    : allRows;
  const total: number = (data as any)?.pagination?.total ?? 0;
  const totalPages: number = (data as any)?.pagination?.totalPages ?? 1;

  return (
    <div>
      <PageHeader title="Orders & Payments" description={`${total} total transactions`} />
      <FilterBar>
        <Input
          placeholder="Search order ID, buyer, PayPal ID…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-80"
        />
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
        <div className="rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Buyer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Tracks</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((o: OrderRow) => (
                <>
                  <tr
                    key={o.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{o.buyer?.fullName ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{o.buyer?.email}</div>
                      {o.buyerPhone && <div className="text-xs text-muted-foreground">{o.buyerPhone}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {o.items?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{fmtMoney(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      {o.paymentMethod ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          o.paymentMethod === 'PAYPAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {o.paymentMethod === 'PAYPAL' ? '🅿 PayPal' : o.paymentMethod}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status?.toLowerCase()} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {o.status === "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => { e.stopPropagation(); refund.mutate(o.id); }}
                          disabled={refund.isPending}
                        >
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded details row */}
                  {expanded === o.id && (
                    <tr key={`${o.id}-detail`} className="bg-muted/20">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Payment Info */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Order ID</span>
                                <span className="font-mono text-xs">{o.id}</span>
                              </div>
                              {o.paypalOrderId && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">PayPal Order ID</span>
                                  <span className="font-mono text-xs">{o.paypalOrderId}</span>
                                </div>
                              )}
                              {o.paypalCaptureId && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">PayPal Capture ID</span>
                                  <span className="font-mono text-xs text-green-700">{o.paypalCaptureId}</span>
                                </div>
                              )}
                              {o.stripePaymentIntentId && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Stripe Intent</span>
                                  <span className="font-mono text-xs">{o.stripePaymentIntentId}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span className="font-medium">{o.paymentMethod ?? "—"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Buyer Email</span>
                                <span>{o.buyerEmail ?? o.buyer?.email}</span>
                              </div>
                              {o.buyerPhone && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Buyer Phone</span>
                                  <span>{o.buyerPhone}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold pt-1 border-t">
                                <span>Total Charged</span>
                                <span className="text-primary">{fmtMoney(o.totalAmount)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Purchased Tracks ({o.items?.length ?? 0})
                            </h4>
                            <div className="space-y-2">
                              {(o.items ?? []).map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                                  <div>
                                    <div className="font-medium text-sm">{item.track?.title}</div>
                                    <div className="font-mono text-xs text-muted-foreground">{item.track?.id}</div>
                                  </div>
                                  <div className="font-semibold text-sm">{fmtMoney(item.price)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 p-4 border-t text-sm">
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
