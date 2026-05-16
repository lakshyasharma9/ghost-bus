import { createFileRoute } from "@tanstack/react-router";
import { LABELS_LIST } from "@/lib/mock-data";

export const Route = createFileRoute("/account/following")({
  component: Following,
});

function Following() {
  // Mock data - in real app, this would come from database
  const followedLabels = LABELS_LIST.slice(0, 3);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Followed Producers</h1>

      {followedLabels.length > 0 ? (
        <div className="space-y-4">
          {followedLabels.map((label) => (
            <div
              key={label.id}
              className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6"
            >
              <div
                className="w-20 h-20 rounded-2xl shrink-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${label.hue} 70% 65%), hsl(${label.hue + 40} 70% 55%))`,
                }}
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{label.name}</h3>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">{label.trackCount}</span> Available Tracks
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{label.sales}</span> Sold Tracks
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">176</span> Followers
                  </div>
                </div>
              </div>
              <button className="h-10 px-6 rounded-full border border-border hover:bg-muted transition-colors text-sm font-medium">
                Unfollow Producer
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Not following any producers yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Discover producers and follow them to get updates on new releases
          </p>
        </div>
      )}
    </div>
  );
}
