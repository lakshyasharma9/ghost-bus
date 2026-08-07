import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, DataTable, StatusBadge, Button, FilterBar, Input } from "@/components/admin/ui";
import { fmtMoney, fmtDate } from "@/lib/admin-mock";
import { useAdminSellers } from "@/lib/use-admin-api";
import type { SellerRow } from "@/lib/api";

function SellersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (q) params.search = q;

  const { data, isLoading } = useAdminSellers(params);
  const rows: SellerRow[] = (data as any)?.sellers ?? [];
  const total: number = (data as any)?.pagination?.total ?? 0;
  const totalPages: number = (data as any)?.pagination?.totalPages ?? 1;

  return (
    <div>
      <PageHeader title="Sellers" description={`${total} registered sellers`} />
      <FilterBar>
        <Input placeholder="Search seller…" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} className="w-64" />
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} of {total}</span>
      </FilterBar>
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="rounded-xl border bg-card p-2">
          <DataTable
            rows={rows}
            columns={[
              { key: "name", header: "Seller", render: (s: SellerRow) => (
                <div>
                  <p className="font-medium text-sm">{s.fullName ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
              )},
              { key: "kyc", header: "KYC", render: (s: SellerRow) => <StatusBadge status={s.kycStatus?.toLowerCase()} /> },
              { key: "verified", header: "Verified", render: (s: SellerRow) => <StatusBadge status={s.sellerVerified ? "approved" : "pending"} /> },
              { key: "stripe", header: "Stripe", render: (s: SellerRow) => s.stripeAccountId
                ? <span className="text-xs text-green-700 font-medium">Connected</span>
                : <span className="text-xs text-muted-foreground">—</span> },
              { key: "tracks", header: "Tracks", render: (s: SellerRow) => s._count?.tracks ?? 0 },
              { key: "earnings", header: "Earnings (72%)", render: (s: SellerRow) => fmtMoney(s.totalEarnings ?? 0) },
              { key: "joined", header: "Joined", render: (s: SellerRow) => <span className="text-xs">{fmtDate(s.createdAt)}</span> },
              { key: "actions", header: "", render: () => (
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="ghost">View</Button>
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

export const Route = createFileRoute("/admin/sellers")({ component: SellersPage });
