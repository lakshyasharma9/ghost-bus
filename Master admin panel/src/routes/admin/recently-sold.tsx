import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recentlySoldAPI } from "@/lib/api";
import type { RecentlySoldRow } from "@/lib/api";
import { PageHeader, Button } from "@/components/admin/ui";
import { Plus, Trash2, Edit2, ImageOff, X, Save, GripVertical, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/recently-sold")({
  component: RecentlySoldPage,
});

// ── Form state ────────────────────────────────────────────────────────────────
const emptyForm = () => ({
  trackName: "",
  genre: "",
  soldAt: new Date().toISOString().slice(0, 16), // datetime-local format
});

function RecentlySoldPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Fetch ──
  const { data, isLoading, error: listError, refetch } = useQuery({
    queryKey: ["admin-recently-sold"],
    queryFn: async () => {
      console.log("[RecentlySold] Fetching list...");
      const result = await recentlySoldAPI.list();
      console.log("[RecentlySold] List result:", result);
      return result;
    },
    staleTime: 0,           // always refetch after invalidation
    refetchOnWindowFocus: true,
  });

  if (listError) console.error("[RecentlySold] List error:", listError);

  const items: RecentlySoldRow[] = (data as any)?.items ?? [];

  // ── Create ──
  const createMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      console.log("[RecentlySold] Creating entry...", Object.fromEntries(fd.entries()));
      const result = await recentlySoldAPI.create(fd);
      console.log("[RecentlySold] Create result:", result);
      return result;
    },
    onSuccess: (result) => {
      console.log("[RecentlySold] Create success, invalidating cache");
      qc.invalidateQueries({ queryKey: ["admin-recently-sold"] });
      refetch(); // force immediate reload
      toast.success("Entry created!");
      resetForm();
    },
    onError: (e: Error) => {
      console.error("[RecentlySold] Create error:", e);
      toast.error(`Failed: ${e.message}`);
    },
  });

  // ── Update ──
  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) =>
      recentlySoldAPI.update(id, fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-recently-sold"] });
      refetch();
      toast.success("Entry updated!");
      resetForm();
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  // ── Delete ──
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recentlySoldAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-recently-sold"] });
      refetch();
      toast.success("Entry deleted.");
      setDeleteConfirm(null);
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  // ── Toggle active ──
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      const fd = new FormData();
      fd.append("isActive", String(isActive));
      return recentlySoldAPI.update(id, fd);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-recently-sold"] }); refetch(); },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Helpers ──
  const resetForm = () => {
    setForm(emptyForm());
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowForm(false);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (item: RecentlySoldRow) => {
    setEditingId(item.id);
    setForm({
      trackName: item.trackName,
      genre: item.genre,
      soldAt: item.soldAt ? new Date(item.soldAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
    setSelectedFile(null);
    setPreviewUrl(item.imageUrl ?? null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.trackName.trim()) return toast.error("Track name is required");
    if (!form.genre.trim())     return toast.error("Genre is required");

    const fd = new FormData();
    fd.append("trackName",    form.trackName.trim());
    fd.append("genre",        form.genre.trim());
    fd.append("soldAt",       form.soldAt);
    if (selectedFile) fd.append("photo", selectedFile);

    if (editingId) {
      updateMutation.mutate({ id: editingId, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Recently Sold"
        description="Manage the 'Recently Sold' marquee feed on the homepage. Add, edit, reorder, and remove entries."
      />

      {/* ── Add / Edit Form ── */}
      {!showForm ? (
        <div className="mb-6 flex items-center gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Entry
          </Button>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-base">
              {editingId ? "Edit Entry" : "New Entry"}
            </h2>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Track Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Track Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Protocol"
                  value={form.trackName}
                  onChange={(e) => setForm({ ...form, trackName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Genre *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Techno"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Sold At */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Sold At</label>
                <input
                  type="datetime-local"
                  value={form.soldAt}
                  onChange={(e) => setForm({ ...form, soldAt: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Track Artwork</label>
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div
                    className="w-14 h-14 rounded-lg border border-border bg-muted shrink-0 overflow-hidden flex items-center justify-center"
                    style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                  >
                    {!previewUrl && <ImageOff className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="rs-photo-upload"
                    />
                    <label
                      htmlFor="rs-photo-upload"
                      className="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    >
                      {previewUrl ? "Replace Image" : "Upload Image"}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP · Max 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? "Save Changes" : "Create Entry"}
              </button>
              <button type="button" onClick={resetForm} className="h-10 px-5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Preview of what the homepage card looks like ── */}
      <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Homepage Card Preview</p>
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 relative overflow-hidden flex items-center"
            style={{
              width: 220,
              height: 68,
              background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
            }}
          >
            <div
              className="shrink-0 bg-cover bg-center bg-muted"
              style={{
                width: 68,
                height: 68,
                borderRadius: "10px 0 0 10px",
                ...(previewUrl ? { backgroundImage: `url(${previewUrl})` } : { background: "rgba(255,255,255,0.08)" }),
              }}
            />
            <div className="flex-1 min-w-0 px-3">
              <div className="font-semibold text-white truncate" style={{ fontSize: 12 }}>
                {form.trackName || "Track Name"}
              </div>
              <div className="truncate mt-0.5" style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                {form.genre || "Genre"}
              </div>
            </div>
            {/* Red SOLD ribbon */}
            <div className="absolute top-0 right-0 overflow-hidden" style={{ width: 48, height: 48, pointerEvents: "none" }}>
              <div style={{
                position: "absolute", top: 10, right: -18, width: 72,
                background: "#ef4444", color: "#fff", fontSize: 7, fontWeight: 900,
                letterSpacing: "0.15em", textAlign: "center", padding: "2.5px 0",
                transform: "rotate(45deg)", transformOrigin: "center", textTransform: "uppercase",
              }}>SOLD</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">This is how the card will appear on the homepage marquee.</p>
        </div>
      </div>

      {/* ── Entries List ── */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No entries yet. Add your first recently sold track above.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3 hidden md:table-cell">Genre</th>
                <th className="px-4 py-3 hidden lg:table-cell">Sold At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  {/* Drag handle (visual only) */}
                  <td className="px-4 py-3 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </td>

                  {/* Track info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg shrink-0 bg-muted overflow-hidden"
                        style={item.imageUrl ? {
                          backgroundImage: `url(${item.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        } : {}}
                      >
                        {!item.imageUrl && (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.trackName}</p>
                        <p className="text-xs text-muted-foreground">Order: #{idx + 1}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{item.genre}</td>

                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                    {new Date(item.soldAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate({ id: item.id, isActive: !item.isActive })}
                      disabled={toggleMutation.isPending}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      title={item.isActive ? "Click to hide" : "Click to show"}
                    >
                      {item.isActive
                        ? <><Eye className="h-3 w-3" /> Active</>
                        : <><EyeOff className="h-3 w-3" /> Hidden</>
                      }
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-8 h-8 rounded-lg grid place-items-center hover:bg-muted transition text-muted-foreground hover:text-foreground"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="w-8 h-8 rounded-lg grid place-items-center hover:bg-rose-50 transition text-muted-foreground hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-semibold text-lg mb-2">Delete Entry?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will remove the entry from the recently sold feed. The image will also be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-10 rounded-full border border-border text-sm font-medium hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 h-10 rounded-full bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50 hover:bg-destructive/90 transition"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
