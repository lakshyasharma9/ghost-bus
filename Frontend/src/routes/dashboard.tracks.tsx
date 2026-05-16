import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Edit2, Trash2, Eye, MoreHorizontal, Loader2, Plus } from "lucide-react";
import { useMyTracks, useDeleteTrack } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/tracks")({
  head: () => ({ meta: [{ title: "My Tracks — Dashboard" }] }),
  component: DashboardTracks,
});

type StatusFilter = "all" | "approved" | "pending" | "sold" | "rejected";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Live" },
  { key: "pending", label: "Pending Review" },
  { key: "sold", label: "Sold" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  sold: "bg-muted text-muted-foreground",
  rejected: "bg-red-50 text-red-600",
};

function DashboardTracks() {
  const [tab, setTab] = useState<StatusFilter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { data: tracks = [], isLoading } = useMyTracks();
  const deleteTrack = useDeleteTrack();

  const filtered = tab === "all" ? (tracks as any[]) : (tracks as any[]).filter((t) => t.status === tab);

  const handleDelete = (id: string) => {
    deleteTrack.mutate(id, {
      onSuccess: () => setConfirmDelete(null),
    });
  };

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="label-eyebrow mb-2">Tracks</div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">My Tracks</h1>
        </div>
        <Link to="/dashboard/upload" className="h-10 px-5 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[0_8px_24px_rgba(10,132,255,0.28)]">
          <Plus className="w-4 h-4" /> Upload New
        </Link>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6 overflow-x-auto hide-scrollbar">
        {STATUS_TABS.map((t) => {
          const count = t.key === "all" ? (tracks as any[]).length : (tracks as any[]).filter((x) => x.status === t.key).length;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`h-8 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition ${tab === t.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label} <span className={`ml-1 text-xs ${tab === t.key ? "text-primary" : "text-muted-foreground"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="py-20 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-sm">No tracks in this category.</p>
            <Link to="/dashboard/upload" className="mt-3 inline-flex text-sm text-primary hover:underline">Upload your first track →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3 hidden md:table-cell">Genre</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Price</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Views</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Plays</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((track: any) => (
                  <tr key={track.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg shrink-0 bg-muted" style={track.artwork_url ? { backgroundImage: `url(${track.artwork_url})`, backgroundSize: "cover" } : {}} />
                        <div>
                          <div className="font-medium leading-tight">{track.title}</div>
                          <div className="text-xs text-muted-foreground">{track.bpm} BPM · {track.musical_key}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{track.genre}</td>
                    <td className="px-4 py-3 font-semibold hidden sm:table-cell">${track.price}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{(track.views ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{(track.plays ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[track.status] ?? "bg-muted text-muted-foreground"}`}>
                        {track.status === "approved" ? "live" : track.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 relative">
                        {track.status === "approved" && (
                          <Link to="/tracks/$id" params={{ id: track.id }} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => setOpenMenu(openMenu === track.id ? null : track.id)}
                          className="w-8 h-8 rounded-lg grid place-items-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenu === track.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-background border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => { setConfirmDelete(track.id); setOpenMenu(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete track
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-semibold text-lg mb-2">Delete Track?</h2>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone. The track and all its files will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-full border border-border text-sm font-medium">Cancel</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleteTrack.isPending}
                className="flex-1 h-10 rounded-full bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50"
              >
                {deleteTrack.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
