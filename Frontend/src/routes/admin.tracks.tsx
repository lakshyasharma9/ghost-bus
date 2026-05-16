import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Play, Pause, ExternalLink, Loader2 } from "lucide-react";
import { useAdminTracks, useAdminReviewTrack } from "@/hooks/use-api";
import { useAudio } from "@/store";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/tracks")({
  head: () => ({ meta: [{ title: "Track Review — Admin" }] }),
  component: AdminTracks,
});

type Status = "pending" | "approved" | "rejected" | "all";

function AdminTracks() {
  const [tab, setTab] = useState<Status>("pending");
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { data: tracks = [], isLoading } = useAdminTracks(tab === "all" ? undefined : tab);
  const review = useAdminReviewTrack();
  const audio = useAudio();

  const TABS: { key: Status; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  const handleApprove = (id: string) => review.mutate({ id, status: "approved" });
  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    review.mutate({ id: rejectModal.id, status: "rejected", rejection_reason: rejectReason });
    setRejectModal(null);
    setRejectReason("");
  };

  return (
    <>
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Admin · A&R</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Track Review Queue</h1>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`h-8 px-4 rounded-lg text-sm font-medium transition ${tab === t.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
      ) : tracks.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-sm">No tracks in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track: any) => {
            const isCurrent = audio.current?.id === track.id;
            const isPlaying = isCurrent && audio.isPlaying;
            return (
              <div key={track.id} className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl shrink-0 bg-muted"
                    style={track.artwork_url ? { backgroundImage: `url(${track.artwork_url})`, backgroundSize: "cover" } : {}}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-semibold">{track.title}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          by {track.profiles?.display_name ?? "Unknown"} · {track.genre} · {track.bpm} BPM · {track.musical_key}
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            track.status === "pending" ? "bg-amber-50 text-amber-600" :
                            track.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                            "bg-red-50 text-red-600"
                          }`}>{track.status}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-muted">${track.price}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-muted capitalize">{track.transparency}</span>
                        </div>
                        {track.rejection_reason && (
                          <div className="mt-2 text-xs text-destructive">Reason: {track.rejection_reason}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {track.watermarked_url && (
                          <button
                            onClick={() => {
                              const mockTrack = { id: track.id, title: track.title, label: track.profiles?.display_name ?? "", producer: "", genre: track.genre, bpm: track.bpm, musicalKey: track.musical_key, duration: "5:00", price: track.price, artwork: track.artwork_url ?? "", tags: [] };
                              isCurrent ? audio.toggle() : audio.play(mockTrack as any);
                            }}
                            className="w-9 h-9 rounded-full bg-muted grid place-items-center hover:bg-accent transition"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        {track.mastered_url && (
                          <a href={track.mastered_url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-muted grid place-items-center hover:bg-accent transition">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {track.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(track.id)}
                              disabled={review.isPending}
                              className="h-9 px-4 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => setRejectModal({ id: track.id, title: track.title })}
                              className="h-9 px-4 rounded-full bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition inline-flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {track.description && (
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{track.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-semibold text-lg mb-1">Reject Track</h2>
            <p className="text-sm text-muted-foreground mb-4">Provide a reason for rejecting "{rejectModal.title}".</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Audio quality below standard, contains uncleared samples..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 h-10 rounded-full border border-border text-sm font-medium">Cancel</button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || review.isPending}
                className="flex-1 h-10 rounded-full bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50"
              >
                {review.isPending ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
