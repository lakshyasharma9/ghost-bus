import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "@/store";
import { TrackListRow } from "@/components/tracks/TrackListRow";
import apiClient from "@/lib/api-client";

export const Route = createFileRoute("/account/favorites")({
  component: Favorites,
});

function Favorites() {
  const wl = useWishlist();
  const ids = wl.ids as string[];

  // Filter to real API IDs only (UUID format) — skip mock "trk_X" IDs
  const realIds = ids.filter((id) => /^[0-9a-f-]{36}$/.test(id));

  // Fetch each track individually in parallel
  const trackQueries = useQueries({
    queries: realIds.map((id) => ({
      queryKey: ["track", id],
      queryFn: async () => {
        const { data } = await apiClient.get(`/tracks/${id}`);
        return data.data?.track ?? data.data ?? null;
      },
      staleTime: 60_000,
      retry: false,
    })),
  });

  const isLoading = trackQueries.some((q) => q.isLoading);
  const tracks = trackQueries
    .map((q) => q.data)
    .filter(Boolean)
    .map((t: any) => ({
      id: t.id,
      title: t.title,
      label: t.seller?.fullName || t.seller?.username || "GhostBus",
      producer: t.seller?.fullName || t.seller?.username || "Unknown",
      genre: t.genre,
      bpm: t.bpm || 128,
      musicalKey: t.key || "",
      duration: "",
      price: t.price,
      artwork: t.coverUrl || "",
      audioUrl: t.previewUrl || "",
      sold: t.sold || false,
      hot: false,
      original: t.transparency === "original",
      tags: t.tags || [],
      description: t.description || "",
      seller: t.seller,
      sellerUsername: t.seller?.username || t.seller?.id,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Favorites</h1>
        {tracks.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {tracks.length} track{tracks.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : tracks.length > 0 ? (
        <div className="space-y-2.5">
          {tracks.map((track) => (
            <TrackListRow key={track.id} track={track} queue={tracks} />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold mb-1">No favorites yet</p>
          <p className="text-sm text-muted-foreground">
            Click the ♡ heart on any track to save it here.
          </p>
          <Link
            to="/tracks"
            className="mt-5 inline-flex h-10 px-5 items-center gap-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[--color-primary-hover] transition"
          >
            Browse Tracks
          </Link>
        </div>
      )}
    </div>
  );
}
