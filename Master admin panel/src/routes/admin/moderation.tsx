import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Button, StatusBadge, Input } from "@/components/admin/ui";
import { fmtMoney, fmtDate } from "@/lib/admin-mock";
import { useAdminTracks, useReviewTrack, useTrackFiles } from "@/lib/use-admin-api";
import { MRTBadge } from "@/routes/admin/tracks";
import type { AdminTrackRow, TrackFileItem } from "@/lib/api";
import { Check, X, Play, Pause, Download, Loader2, FileAudio, FileArchive, FileText, Music2, Mic2 } from "lucide-react";

// ── File type icon ────────────────────────────────────────────────────────────
function FileIcon({ type }: { type: string }) {
  if (type === "audio")   return <FileAudio   className="w-4 h-4 text-primary shrink-0" />;
  if (type === "archive") return <FileArchive  className="w-4 h-4 text-amber-500 shrink-0" />;
  if (type === "pdf")     return <FileText     className="w-4 h-4 text-rose-500 shrink-0" />;
  return <Music2 className="w-4 h-4 text-muted-foreground shrink-0" />;
}

// ── Single file row with play + download ──────────────────────────────────────
function FileRow({ file, playingUrl, onPlay }: {
  file: TrackFileItem;
  playingUrl: string | null;
  onPlay: (url: string | null) => void;
}) {
  const isAudio    = file.type === "audio";
  const isPlaying  = playingUrl === file.url;
  const hasUrl     = !!file.url;

  const handleDownload = () => {
    if (!file.url) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = `${file.label}.${file.key.includes("Mix") || file.key === "radioEdit" ? "mp3" : file.type === "audio" ? "wav" : file.type === "archive" ? "zip" : file.type === "pdf" ? "pdf" : "bin"}`;
    a.click();
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-t border-border ${isPlaying ? "bg-primary/5" : "hover:bg-muted/40"} transition-colors`}>
      <FileIcon type={file.type} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{file.label}</div>
        <div className="text-xs text-muted-foreground">{fmtBytes(file.size)}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isAudio && hasUrl && (
          <button
            onClick={() => onPlay(isPlaying ? null : file.url)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isPlaying ? "bg-primary text-white" : "bg-muted hover:bg-primary/10 text-foreground"
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        )}
        {hasUrl && (
          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-primary/10 text-foreground transition"
            title={`Download ${file.label}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
        {!hasUrl && (
          <span className="text-xs text-muted-foreground px-2">—</span>
        )}
      </div>
    </div>
  );
}
function FilePill({ label, present }: { label: string; present: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      present
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "bg-muted text-muted-foreground border border-border"
    }`}>
      {present ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ── Format bytes ──────────────────────────────────────────────────────────────
function fmtBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

// ── Vocal type label ──────────────────────────────────────────────────────────
function vocalLabel(v: string) {
  if (v === "exclusive") return "Exclusive Vocals";
  if (v === "ai") return "AI Vocals";
  return "Instrumental (No Vocals)";
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ModerationPage() {
  const { data, isLoading } = useAdminTracks({ status: "pending", limit: "50" });
  const review = useReviewTrack();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);

  const tracks: AdminTrackRow[] = (data as any)?.tracks ?? [];
  const total = (data as any)?.pagination?.total ?? 0;
  const current = tracks[currentIdx];

  // ── File access ──────────────────────────────────────────────────────────────
  const [playingUrl, setPlayingUrl]  = useState<string | null>(null);
  const { data: filesData, isLoading: filesLoading } = useTrackFiles(current?.id ?? null);
  const trackFiles: TrackFileItem[] = (filesData as any)?.files ?? [];

  // Audio element for inline playback
  const handlePlay = (url: string | null) => {
    setPlayingUrl(url);
  };

  // Stop audio when switching tracks
  const switchTrack = (idx: number) => {
    setPlayingUrl(null);
    setCurrentIdx(idx);
  };

  const handleApprove = (id: string) => {
    review.mutate({ id, action: "approve" });
    switchTrack(Math.min(currentIdx + 1, tracks.length - 1));
  };

  const handleReject = () => {
    if (!rejectId) return;
    review.mutate({ id: rejectId, action: "reject", reason: rejectReason });
    setRejectId(null); setRejectReason("");
    switchTrack(Math.min(currentIdx + 1, tracks.length - 1));
  };

  return (
    <div>
      <PageHeader title="Moderation Queue" description={`${total} tracks pending A&R review`} />

      {/* Reject reason input */}
      {rejectId && (
        <div className="mb-4 p-4 rounded-xl border bg-rose-50 border-rose-200 space-y-2">
          <p className="text-sm font-medium text-rose-800">Rejection reason</p>
          <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Audio quality below standards…" className="w-full" />
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={handleReject} disabled={review.isPending}>Confirm Reject</Button>
            <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectReason(""); }}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : tracks.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-50 grid place-items-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-1">All clear!</h3>
          <p className="text-sm text-muted-foreground">No tracks awaiting moderation. Check back later.</p>
        </div>
      ) : current ? (
        <div className="rounded-2xl border bg-card overflow-hidden">

          {/* ── Header ── */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-xl mb-1">{current.title}</h2>
                <p className="text-sm text-muted-foreground">
                  by <strong className="text-foreground">{current.seller?.fullName ?? current.seller?.email}</strong>
                  {" · "}{current.genre}{" · "}{current.bpm ?? "—"} BPM{" · "}{current.key ?? "—"}
                  {" · "}{fmtMoney(current.price)}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Uploaded {fmtDate(current.createdAt)}</span>
                  <span>·</span>
                  <StatusBadge status={current.status?.toLowerCase()} />
                  {current.mrt && (
                    <>
                      <span>·</span>
                      <MRTBadge mrt={current.mrt} />
                    </>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground font-mono shrink-0">
                {currentIdx + 1} / {tracks.length}
              </div>
            </div>
          </div>

          {/* ── Form Data Grid ── */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left: Metadata */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Track Metadata</h3>

              <InfoRow label="Title" value={current.title} />
              <InfoRow label="Genre" value={current.genre} />
              <InfoRow label="BPM" value={current.bpm?.toString() ?? "—"} />
              <InfoRow label="Key" value={current.key ?? "—"} />
              <InfoRow label="Price" value={fmtMoney(current.price)} />
              <InfoRow label="Transparency" value={
                current.transparency === "original"
                  ? "✅ 100% Original Production"
                  : "⚠️ Contains Royalty-Free Loops"
              } />
              <InfoRow label="Vocal Type" value={vocalLabel(current.uploadDetails?.vocalType ?? "none")} />

              {/* Description */}
              {current.description && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Description</div>
                  <p className="text-sm text-foreground/80 leading-relaxed bg-muted/50 rounded-lg p-3 border border-border">
                    {current.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {current.tags && current.tags.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1.5">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {current.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-muted border border-border rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Earnings split */}
              {current.uploadDetails?.sellerPayout != null && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1.5">Earnings Split</div>
                  <div className="flex gap-3 text-sm">
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold">
                      Seller: {fmtMoney(current.uploadDetails.sellerPayout)}
                    </span>
                    <span className="px-3 py-1.5 bg-muted text-muted-foreground border border-border rounded-lg font-semibold">
                      Platform: {fmtMoney(current.uploadDetails.platformFee ?? 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: File Access */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Uploaded Files</h3>

              {/* Inline audio player */}
              {playingUrl && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <Play className="w-3 h-3" /> Now Playing
                  </div>
                  <audio
                    key={playingUrl}
                    src={playingUrl}
                    autoPlay
                    controls
                    onEnded={() => setPlayingUrl(null)}
                    className="w-full h-8"
                    style={{ height: 32 }}
                  />
                </div>
              )}

              {/* File list */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-[1fr_auto] text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-4 py-2 gap-2">
                  <span>File</span>
                  <span className="pr-1">Actions</span>
                </div>

                {filesLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading files…
                  </div>
                ) : trackFiles.length > 0 ? (
                  trackFiles.map((file) => (
                    <FileRow
                      key={file.key}
                      file={file}
                      playingUrl={playingUrl}
                      onPlay={handlePlay}
                    />
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                    File URLs not available.<br />
                    <span className="text-xs">Restart the backend to refresh S3 keys.</span>
                  </div>
                )}
              </div>

              {/* ZIP verification */}
              {current.uploadDetails?.zipVerification && (
                <div className={`p-3 rounded-xl border text-sm ${
                  current.uploadDetails.zipVerification.valid
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                  <strong>ZIP Verification:</strong>{" "}
                  {current.uploadDetails.zipVerification.reason}
                </div>
              )}
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex gap-3 p-6 pt-0">
            <Button variant="success" onClick={() => handleApprove(current.id)} disabled={review.isPending}>
              <Check className="w-4 h-4" /> Approve Track
            </Button>
            <Button variant="danger" onClick={() => setRejectId(current.id)} disabled={review.isPending}>
              <X className="w-4 h-4" /> Reject Track
            </Button>
            <div className="ml-auto">
              <Button variant="secondary" onClick={() => switchTrack(Math.min(currentIdx + 1, tracks.length - 1))} disabled={currentIdx >= tracks.length - 1}>
                Skip →
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Queue list below */}
      {tracks.length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Queue ({tracks.length} pending)</h3>
          <div className="space-y-1">
            {tracks.map((t, i) => (
              <button
                key={t.id}
                onClick={() => switchTrack(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition ${i === currentIdx ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'}`}
              >
                <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                <span className="font-medium text-sm flex-1 truncate">{t.title}</span>
                <span className="text-xs text-muted-foreground">{t.genre}</span>
                <span className="text-xs text-muted-foreground">{fmtMoney(t.price)}</span>
                {t.mrt && <MRTBadge mrt={t.mrt} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-xs font-semibold text-muted-foreground shrink-0 w-32">{label}</span>
      <span className="text-sm text-foreground/90 text-right">{value}</span>
    </div>
  );
}

export const Route = createFileRoute("/admin/moderation")({ component: ModerationPage });
