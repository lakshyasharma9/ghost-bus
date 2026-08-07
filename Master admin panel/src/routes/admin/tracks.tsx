import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, DataTable, StatusBadge, Button, FilterBar, Select, Input } from "@/components/admin/ui";
import { fmtMoney, fmtDate } from "@/lib/admin-mock";
import { useAdminTracks, useReviewTrack, useRetriggerMRTScan, useTrackFiles } from "@/lib/use-admin-api";
import type { AdminTrackRow, TrackFileItem } from "@/lib/api";
import { ChevronDown, ChevronUp, Play, Pause, Download, Loader2 } from "lucide-react";

// ─── MRT Badge component ──────────────────────────────────────────────────────
export function MRTBadge({ mrt }: { mrt: AdminTrackRow["mrt"] }) {
  if (!mrt || mrt.status === "not_scanned") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
        No Scan
      </span>
    );
  }
  if (mrt.status === "scanning") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        Scanning…
      </span>
    );
  }
  if (mrt.status === "clean") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700"
        title={mrt.verdict?.reason ?? "Clean"}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Clean
      </span>
    );
  }
  if (mrt.status === "flagged") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700"
        title={mrt.verdict?.reason ?? "Flagged"}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Flagged
      </span>
    );
  }
  if (mrt.status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700"
        title={mrt.verdict?.reason ?? "Rejected"}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
        MRT Fail
      </span>
    );
  }
  // error
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700"
      title={mrt.verdict?.reason ?? "Scan error"}>
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
      Error
    </span>
  );
}

// ─── MRT Detail modal ─────────────────────────────────────────────────────────
function MRTDetailModal({ track, onClose }: { track: AdminTrackRow; onClose: () => void }) {
  const mrt = track.mrt;
  const retrigger = useRetriggerMRTScan();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">MRT Scan Result</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{track.title}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition text-xl leading-none">×</button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 mb-5">
          <MRTBadge mrt={mrt} />
          {mrt?.scannedAt && (
            <span className="text-xs text-muted-foreground">Scanned {fmtDate(mrt.scannedAt)}</span>
          )}
        </div>

        {/* Verdict reason */}
        {mrt?.verdict?.reason && (
          <div className={`p-4 rounded-xl mb-4 text-sm leading-relaxed ${
            mrt.status === "clean"    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
            mrt.status === "flagged"  ? "bg-amber-50 text-amber-800 border border-amber-200" :
            mrt.status === "rejected" ? "bg-rose-50 text-rose-800 border border-rose-200" :
            "bg-muted text-foreground/70 border border-border"
          }`}>
            {mrt.verdict.reason}
          </div>
        )}

        {/* Match details */}
        {mrt?.verdict?.details && (
          <div className="bg-muted rounded-xl p-4 mb-4 space-y-2 text-sm">
            {Object.entries(mrt.verdict.details).map(([k, v]) =>
              v != null ? (
                <div key={k} className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="font-medium text-right">{String(v)}</span>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* No scan state */}
        {(!mrt || mrt.status === "not_scanned") && (
          <p className="text-sm text-muted-foreground mb-4">This track has not been scanned by ACRCloud MRT yet.</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { retrigger.mutate(track.id); onClose(); }}
            disabled={retrigger.isPending || mrt?.status === "scanning"}
          >
            {retrigger.isPending ? "Triggering…" : "↻ Re-scan"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function TracksPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [mrtModal, setMrtModal] = useState<AdminTrackRow | null>(null);

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (q) params.search = q;
  if (status) params.status = status;

  const { data, isLoading } = useAdminTracks(params);
  const reviewTrack = useReviewTrack();

  const rows: AdminTrackRow[] = (data as any)?.tracks ?? [];
  const total: number = (data as any)?.pagination?.total ?? 0;
  const totalPages: number = (data as any)?.pagination?.totalPages ?? 1;

  const handleApprove = (id: string) => reviewTrack.mutate({ id, action: "approve" });
  const handleReject = () => {
    if (!rejectId) return;
    reviewTrack.mutate({ id: rejectId, action: "reject", reason: rejectReason });
    setRejectId(null);
    setRejectReason("");
  };

  return (
    <div>
      {mrtModal && <MRTDetailModal track={mrtModal} onClose={() => setMrtModal(null)} />}

      <PageHeader title="Tracks" description={`${total} tracks across all statuses`} />
      <FilterBar>
        <Input
          placeholder="Search title or seller…"
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          className="w-64"
        />
        <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} of {total}</span>
      </FilterBar>

      {rejectId && (
        <div className="mb-4 p-4 rounded-xl border bg-rose-50 border-rose-200 space-y-2">
          <p className="text-sm font-medium text-rose-800">Rejection reason (optional)</p>
          <Input
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Audio quality below standards…"
            className="w-full"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={handleReject} disabled={reviewTrack.isPending}>
              Confirm Reject
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectReason(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_60px_90px_110px_130px_110px_120px_40px] text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-4 py-3 gap-3 border-b border-border">
            <span>Track</span>
            <span>Genre</span>
            <span>BPM</span>
            <span>Price</span>
            <span>Status</span>
            <span>MRT Scan</span>
            <span>Uploaded</span>
            <span className="text-right">Actions</span>
            <span />
          </div>

          {rows.map((t: AdminTrackRow) => (
            <TrackRow
              key={t.id}
              track={t}
              onApprove={() => handleApprove(t.id)}
              onReject={() => setRejectId(t.id)}
              onMrt={() => setMrtModal(t)}
              isPending={reviewTrack.isPending}
            />
          ))}

          {rows.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">No tracks found.</div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 p-4 border-t border-border text-sm">
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

// ─── Expandable Track Row ─────────────────────────────────────────────────────
function TrackRow({ track: t, onApprove, onReject, onMrt, isPending }: {
  track: AdminTrackRow;
  onApprove: () => void;
  onReject: () => void;
  onMrt: () => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const { data: filesData, isLoading: filesLoading } = useTrackFiles(expanded ? t.id : null);
  const files: TrackFileItem[] = (filesData as any)?.files ?? [];

  const audioFiles = files.filter(f => f.type === "audio" && f.url);
  const otherFiles = files.filter(f => f.type !== "audio" && f.url);

  function fmtBytes(b: number | null) {
    if (!b) return "—";
    if (b >= 1048576) return `${(b/1048576).toFixed(1)} MB`;
    return `${(b/1024).toFixed(0)} KB`;
  }

  const vocalLabel = (v: string) => v === "exclusive" ? "Exclusive Vocals" : v === "ai" ? "AI Vocals" : "Instrumental";

  return (
    <>
      {/* Main row */}
      <div className="grid grid-cols-[2fr_1fr_60px_90px_110px_130px_110px_120px_40px] items-center px-4 py-3 gap-3 border-b border-border hover:bg-muted/30 transition-colors">
        <div>
          <p className="font-medium text-sm">{t.title}</p>
          <p className="text-xs text-muted-foreground">{t.seller?.fullName ?? t.seller?.email}</p>
        </div>
        <span className="text-sm">{t.genre}</span>
        <span className="text-sm">{t.bpm ?? "—"}</span>
        <span className="text-sm">{fmtMoney(t.price)}</span>
        <StatusBadge status={t.status?.toLowerCase()} />
        <button onClick={onMrt} className="cursor-pointer hover:opacity-80 transition w-fit">
          <MRTBadge mrt={t.mrt} />
        </button>
        <span className="text-xs text-muted-foreground">{fmtDate(t.createdAt)}</span>
        <div className="flex justify-end gap-1">
          {t.status?.toUpperCase() === "PENDING" && (
            <>
              <Button size="sm" variant="success" onClick={onApprove} disabled={isPending}>Approve</Button>
              <Button size="sm" variant="danger" onClick={onReject} disabled={isPending}>Reject</Button>
            </>
          )}
        </div>
        {/* Expand toggle */}
        <button
          onClick={() => { setExpanded(e => !e); setPlayingUrl(null); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition text-muted-foreground hover:text-foreground"
          title={expanded ? "Collapse" : "Expand details"}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-b border-border bg-muted/20 px-6 py-5">
          {/* Audio player */}
          {playingUrl && (
            <div className="mb-4 p-3 rounded-xl border border-primary/30 bg-primary/5">
              <div className="text-xs font-semibold text-primary mb-2">▶ Now Playing</div>
              <audio key={playingUrl} src={playingUrl} autoPlay controls onEnded={() => setPlayingUrl(null)} className="w-full" style={{ height: 32 }} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left — metadata */}
            <div className="space-y-2 text-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Track Metadata</div>
              {[
                ["Transparency", t.transparency === "original" ? "✅ 100% Original Production" : "⚠️ Contains Royalty-Free Loops"],
                ["Vocal Type", vocalLabel(t.uploadDetails?.vocalType ?? "none")],
                ["Key", t.key ?? "—"],
                ["Plays", t.playsCount?.toString() ?? "0"],
                ...(t.uploadDetails?.sellerPayout != null ? [["Seller Payout", fmtMoney(t.uploadDetails.sellerPayout)]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground text-xs font-semibold w-32 shrink-0">{k}</span>
                  <span className="text-right text-xs">{v}</span>
                </div>
              ))}
              {t.description && (
                <div className="mt-2 p-3 bg-card border border-border rounded-lg text-xs text-foreground/70 leading-relaxed">{t.description}</div>
              )}
              {t.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {t.tags.map((tag: string) => <span key={tag} className="px-2 py-0.5 bg-muted border border-border rounded-full text-xs">{tag}</span>)}
                </div>
              )}
            </div>

            {/* Right — files */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Files</div>
              {filesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
              ) : files.length > 0 ? (
                <div className="rounded-xl border border-border overflow-hidden">
                  {files.map(f => (
                    <div key={f.key} className={`flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 ${playingUrl === f.url ? "bg-primary/5" : "hover:bg-muted/40"} transition-colors`}>
                      <span className="text-xs font-medium flex-1 truncate">{f.label}</span>
                      <span className="text-xs text-muted-foreground w-16 text-right">{fmtBytes(f.size)}</span>
                      <div className="flex gap-1.5">
                        {f.type === "audio" && f.url && (
                          <button
                            onClick={() => setPlayingUrl(playingUrl === f.url ? null : f.url)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${playingUrl === f.url ? "bg-primary text-white" : "bg-muted hover:bg-primary/10"}`}
                          >
                            {playingUrl === f.url ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>
                        )}
                        {f.url && (
                          <a href={f.url} download className="w-7 h-7 rounded-full flex items-center justify-center bg-muted hover:bg-primary/10 transition">
                            <Download className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No files available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute("/admin/tracks")({ component: TracksPage });
