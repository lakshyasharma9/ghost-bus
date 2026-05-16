import { createFileRoute } from "@tanstack/react-router";
import { useWishlist } from "@/store";
import { TRACKS } from "@/lib/mock-data";
import { TrackCard } from "@/components/tracks/TrackCard";

export const Route = createFileRoute("/account/favorites")({
  component: Favorites,
});

function Favorites() {
  const wl = useWishlist();
  const favoriteTracks = TRACKS.filter((t) => wl.has(t.id));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Favorite Tracks</h1>

      {favoriteTracks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {favoriteTracks.map((track) => (
            <TrackCard key={track.id} track={track} queue={favoriteTracks} />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No favorite tracks yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Browse tracks and click the heart icon to add them to your favorites
          </p>
        </div>
      )}
    </div>
  );
}
