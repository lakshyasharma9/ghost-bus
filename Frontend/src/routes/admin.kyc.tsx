import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import { useAdminKYC, useAdminReviewKYC } from "@/hooks/use-api";

export const Route = createFileRoute("/admin/kyc")({
  head: () => ({ meta: [{ title: "KYC Review — Admin" }] }),
  component: AdminKYC,
});

function AdminKYC() {
  const { data: submissions = [], isLoading } = useAdminKYC();
  const review = useAdminReviewKYC();
  const [rejectModal, setRejectModal] = useState<{ id: string; userId: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const filtered = filter === "all" ? submissions : submissions.filter((s: any) => s.status === filter);

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    review.mutate({ id: rejectModal.id, userId: rejectModal.userId, status: "rejected", rejection_reason: rejectReason });
    setRejectModal(null);
    setRejectReason("");
  };

  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Admin · KYC</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">KYC Review</h1>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`h-8 px-4 rounded-lg text-sm font-medium capitalize transition ${filter === s ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">No submissions in this category.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub: any) => (
            <div key={sub.id} className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-sm font-semibold shrink-0">
                    {(sub.profiles?.display_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{sub.profiles?.display_name ?? "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">Submitted {new Date(sub.submitted_at).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">Payout: {sub.payout_method} · {sub.payout_email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {sub.id_document_url && (
                    <a href={sub.id_document_url} target="_blank" rel="noreferrer" className="h-8 px-3 rounded-full border border-border text-xs font-medium inline-flex items-center gap-1.5 hover:bg-muted">
                      <ExternalLink className="w-3 h-3" /> ID Doc
                    </a>
                  )}
                  {sub.address_document_url && (
                    <a href={sub.address_document_url} target="_blank" rel="noreferrer" className="h-8 px-3 rounded-full border border-border text-xs font-medium inline-flex items-center gap-1.5 hover:bg-muted">
                      <ExternalLink className="w-3 h-3" /> Address Doc
                    </a>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sub.status === "pending" ? "bg-amber-50 text-amber-600" :
                    sub.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                    "bg-red-50 text-red-600"
                  }`}>{sub.status}</span>
                  {sub.status === "pending" && (
                    <>
                      <button
                        onClick={() => review.mutate({ id: sub.id, userId: sub.user_id, status: "approved" })}
                        disabled={review.isPending}
                        className="h-8 px-3 rounded-full bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectModal({ id: sub.id, userId: sub.user_id, name: sub.profiles?.display_name ?? "User" })}
                        className="h-8 px-3 rounded-full bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition inline-flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
              {sub.rejection_reason && (
                <div className="mt-3 text-xs text-destructive bg-red-50 px-3 py-2 rounded-lg">Rejection reason: {sub.rejection_reason}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-semibold text-lg mb-1">Reject KYC</h2>
            <p className="text-sm text-muted-foreground mb-4">Provide a reason for rejecting {rejectModal.name}'s KYC.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Document unclear, expired ID, address mismatch..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 h-10 rounded-full border border-border text-sm font-medium">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason.trim() || review.isPending} className="flex-1 h-10 rounded-full bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50">
                {review.isPending ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
