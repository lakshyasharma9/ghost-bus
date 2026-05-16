import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("orders")
        .select("*, tracks(title, genre), buyer:profiles!orders_buyer_id_fkey(display_name), seller:profiles!orders_seller_id_fkey(display_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const STATUS_STYLES: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-600",
    pending: "bg-amber-50 text-amber-600",
    refunded: "bg-blue-50 text-blue-600",
    disputed: "bg-red-50 text-red-600",
  };

  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Admin · Orders</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Order Management</h1>
      </div>

      {isLoading ? (
        <div className="py-20 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3 hidden md:table-cell">Buyer</th>
                  <th className="px-4 py-3 hidden md:table-cell">Seller</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(orders as any[]).map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{o.tracks?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{o.buyer?.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{o.seller?.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-semibold">${o.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] ?? "bg-muted text-muted-foreground"}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(orders as any[]).length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">No orders yet.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
