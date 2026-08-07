import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { useAdminOrders } from "@/lib/use-admin-api";

function DisputesPage() {
  // Disputes are a subset of orders — currently no dedicated disputes table
  // Show orders that might have issues (refunded or failed)
  const { data, isLoading } = useAdminOrders({ status: "refunded", limit: "50" });
  const refundedOrders = (data as any)?.orders ?? [];

  return (
    <div>
      <PageHeader title="Disputes" description="Track buyer/seller disputes and resolutions. Disputes are created when a refunded order is contested." />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : refundedOrders.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-2xl">
          <p className="font-semibold mb-1">No disputes</p>
          <p className="text-sm text-muted-foreground">No refunded orders with potential disputes found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {refundedOrders.map((order: any) => (
            <div key={order.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border bg-card">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Order {order.id.slice(0, 8)}…</p>
                <p className="text-xs text-muted-foreground">
                  Buyer: {order.buyer?.fullName ?? order.buyer?.email} · {order.items?.length ?? 0} track(s) · €{order.totalAmount}
                </p>
              </div>
              <StatusBadge status="refunded" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-5 rounded-xl border bg-muted/30 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Note</p>
        <p>A dedicated disputes system with buyer/seller claims and admin resolution will be available once Stripe payment processing is fully integrated. Currently, disputes are tracked through the order refund flow.</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/disputes")({ component: DisputesPage });
