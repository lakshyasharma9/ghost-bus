import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { useAdminUsers } from "@/lib/use-admin-api";

function GigsPage() {
  // Gigs/Services are tied to verified sellers — show sellers who could offer services
  const { data, isLoading } = useAdminUsers({ role: "SELLER", limit: "50" });
  const sellers = (data as any)?.users ?? [];

  return (
    <div>
      <PageHeader title="Gigs & Services" description="Manage custom production service listings from verified sellers." />

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : sellers.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-2xl">
          <p className="font-semibold mb-1">No sellers yet</p>
          <p className="text-sm text-muted-foreground">Gig listings will appear here when verified sellers create custom service offerings.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sellers.map((seller: any) => (
            <div key={seller.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border bg-card">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{seller.fullName ?? seller.email}</p>
                <p className="text-xs text-muted-foreground">{seller.email} · Verified: {seller.isVerified ? "Yes" : "No"}</p>
              </div>
              <StatusBadge status={seller.isVerified ? "approved" : "pending"} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-5 rounded-xl border bg-amber-50 border-amber-200 text-sm text-amber-800">
        <p className="font-semibold mb-1">Coming Soon</p>
        <p>The full Gigs & Services system (with pricing, delivery timelines, categories, and order management) requires a dedicated services table and order flow. This is planned for the next development phase. Currently, verified sellers are shown for reference.</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/gigs")({ component: GigsPage });
