import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/ui";
import { usePlatformSettings } from "@/lib/use-admin-api";
import { useAdminSellers } from "@/lib/use-admin-api";

// Commission tiers — matches the frontend mock-data.ts COMMISSION_TIERS
const TIERS = [
  { name: "New Seller", minSales: 0, maxSales: 4999, platformFee: 28, sellerPayout: 72 },
  { name: "Rising Seller", minSales: 5000, maxSales: 9999, platformFee: 25, sellerPayout: 75 },
  { name: "Pro Seller", minSales: 10000, maxSales: 29999, platformFee: 22, sellerPayout: 78 },
  { name: "Elite Seller", minSales: 30000, maxSales: 49999, platformFee: 18, sellerPayout: 82 },
  { name: "Legend Seller", minSales: 50000, maxSales: Infinity, platformFee: 15, sellerPayout: 85 },
];

function SellerTiersPage() {
  const { data: sellersData } = useAdminSellers({ limit: "100" });
  const sellers = (sellersData as any)?.sellers ?? [];

  // Count sellers in each tier based on their totalEarnings
  const tierCounts = TIERS.map(tier => ({
    ...tier,
    count: sellers.filter((s: any) => {
      const earnings = s.totalEarnings ?? 0;
      return earnings >= tier.minSales && earnings <= tier.maxSales;
    }).length,
  }));

  return (
    <div>
      <PageHeader title="Seller Tiers" description="View the 5-tier commission structure and seller distribution." />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tierCounts.map((tier, i) => (
          <div key={tier.name} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{tier.name}</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {tier.count} seller{tier.count !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-semibold">{tier.platformFee}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller Payout</span>
                <span className="font-semibold text-green-700">{tier.sellerPayout}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sales Range</span>
                <span className="text-xs font-mono">
                  €{tier.minSales.toLocaleString()} — {tier.maxSales === Infinity ? '∞' : `€${tier.maxSales.toLocaleString()}`}
                </span>
              </div>
            </div>
            {/* Progress bar showing tier fill */}
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(100, (tier.count / Math.max(sellers.length, 1)) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tier rules explanation */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-3">How Tier Upgrades Work</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            Sellers automatically upgrade when their lifetime earnings cross the tier threshold
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            Once achieved, tier levels remain permanently unlocked — they never drop back down
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            New sellers start at 72% payout (28% platform fee) as "New Seller"
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            The top "Legend Seller" tier earns 85% — only 15% platform commission
          </li>
        </ul>
      </div>

      <div className="mt-6 p-5 rounded-xl border bg-muted/30 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Configuration</p>
        <p>Tier thresholds and commission rates are currently configured in the application code. To change the platform commission percentage, go to Settings → Platform Commission (%).</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/seller-tiers")({ component: SellerTiersPage });
