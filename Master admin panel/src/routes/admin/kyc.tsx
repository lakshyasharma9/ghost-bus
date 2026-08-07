import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Tabs, StatusBadge, Button, Input } from "@/components/admin/ui";
import { fmtDate } from "@/lib/admin-mock";
import { useAdminKyc, useReviewKyc } from "@/lib/use-admin-api";
import type { KycRow } from "@/lib/api";
import { FileText } from "lucide-react";

function KycPage() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const params: Record<string, string> = { limit: "50" };
  if (tab !== "all") params.status = tab;
  const { data, isLoading } = useAdminKyc(params);
  const reviewKyc = useReviewKyc();

  const rows: KycRow[] = (data as any)?.submissions ?? [];

  // Tab counts from current data (approximate — for exact counts we'd need all statuses)
  const pendingCount = rows.filter(k => k.status === "PENDING").length;
  const approvedCount = rows.filter(k => k.status === "APPROVED").length;
  const rejectedCount = rows.filter(k => k.status === "REJECTED").length;

  const handleReject = () => {
    if (!rejectId) return;
    reviewKyc.mutate({ id: rejectId, action: "reject", reason: rejectReason });
    setRejectId(null); setRejectReason("");
  };

  return (
    <div>
      <PageHeader title="KYC Review" description="Identity verification documents submitted by sellers." />
      <Tabs
        active={tab}
        onChange={t => setTab(t as typeof tab)}
        tabs={[
          { id: "pending", label: "Pending", count: pendingCount },
          { id: "approved", label: "Approved", count: approvedCount },
          { id: "rejected", label: "Rejected", count: rejectedCount },
          { id: "all", label: "All", count: rows.length },
        ]}
      />

      {rejectId && (
        <div className="mb-4 p-4 rounded-xl border bg-rose-50 border-rose-200 space-y-2">
          <p className="text-sm font-medium text-rose-800">Rejection reason (optional)</p>
          <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Document blurry, please resubmit." className="w-full" />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={handleReject} disabled={reviewKyc.isPending}>Confirm Reject</Button>
            <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectReason(""); }}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">No KYC submissions found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((k: KycRow) => {
            // Parse KYC form data from documentType (stored as JSON)
            let kycData: any = null;
            try { kycData = JSON.parse(k.documentType); } catch { /* not JSON */ }
            const docType = kycData?.documentType ?? k.documentType;

            return (
            <div key={k.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">{k.user?.fullName ?? k.user?.email}</p>
                <StatusBadge status={k.status?.toLowerCase()} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Submitted {fmtDate(k.submittedAt)}</p>

              {/* KYC form details */}
              {kycData && (
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {kycData.firstName && <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{kycData.firstName} {kycData.lastName}</span></div>}
                  {kycData.country && <div><span className="text-muted-foreground">Country:</span> <span className="font-medium">{kycData.country}</span></div>}
                  {kycData.address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{kycData.address}{kycData.zip ? `, ${kycData.zip}` : ''}{kycData.city ? `, ${kycData.city}` : ''}</span></div>}
                  {kycData.paypalEmail && <div className="col-span-2"><span className="text-muted-foreground">PayPal:</span> <span className="font-medium">{kycData.paypalEmail}</span></div>}
                </div>
              )}

              <div className="mt-3 rounded-md border bg-muted/30 p-3 flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{docType}</span>
                {k.documentUrl && (
                  k.documentUrl.startsWith('http') ? (
                    <a href={k.documentUrl} target="_blank" rel="noreferrer" className="ml-auto text-xs text-primary hover:underline">View doc</a>
                  ) : (
                    <span className="ml-auto text-xs text-muted-foreground">Document uploaded</span>
                  )
                )}
              </div>
              {k.rejectionReason && (
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-2 mt-3">{k.rejectionReason}</p>
              )}
              {k.status === "PENDING" && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="success" className="flex-1"
                    onClick={() => reviewKyc.mutate({ id: k.id, action: "approve" })}
                    disabled={reviewKyc.isPending}>Approve</Button>
                  <Button size="sm" variant="danger" className="flex-1"
                    onClick={() => setRejectId(k.id)}
                    disabled={reviewKyc.isPending}>Reject</Button>
                </div>
              )}
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/kyc")({ component: KycPage });
