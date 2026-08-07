import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { followAPI } from "@/lib/api-client";
import { useAuthContext } from "@/contexts/AuthContext";

export const Route = createFileRoute("/account/following")({
  component: Following,
});

interface FollowedSeller {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  sellerVerified: boolean;
  followers: number;
  trackCount: number;
  followedAt: string;
}

function Following() {
  const { isAuthenticated } = useAuthContext();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["following"],
    queryFn: async () => {
      const res = await followAPI.getFollowing();
      return (res.data?.data?.sellers ?? []) as FollowedSeller[];
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const unfollow = useMutation({
    mutationFn: (username: string) => followAPI.toggleFollow(username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["following"] });
      toast.success("Unfollowed successfully");
    },
    onError: () => toast.error("Failed to unfollow"),
  });

  const sellers = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Following</h1>
        {sellers.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {sellers.length} producer{sellers.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : sellers.length > 0 ? (
        <div className="space-y-3">
          {sellers.map((seller) => {
            const displayName = seller.fullName || seller.username || "Unknown Producer";
            const profileLink = `/sellers/${seller.username || seller.id}`;
            const initials = displayName.slice(0, 2).toUpperCase();

            return (
              <div
                key={seller.id}
                className="bg-card border border-border rounded-2xl p-5 flex items-center gap-5 hover:border-primary/20 transition-colors"
              >
                {/* Avatar */}
                <Link to={profileLink} className="shrink-0">
                  {seller.avatarUrl ? (
                    <img
                      src={seller.avatarUrl}
                      alt={displayName}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {initials}
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={profileLink} className="hover:text-primary transition-colors">
                    <h3 className="font-semibold text-base truncate">{displayName}</h3>
                  </Link>
                  {seller.username && (
                    <p className="text-sm text-muted-foreground">@{seller.username}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span>
                      <strong className="text-foreground">{seller.trackCount}</strong> tracks
                    </span>
                    <span>
                      <strong className="text-foreground">{seller.followers}</strong> followers
                    </span>
                    {seller.sellerVerified && (
                      <span className="text-emerald-600 font-medium">✓ Verified</span>
                    )}
                  </div>
                </div>

                {/* Unfollow */}
                <button
                  onClick={() => {
                    const id = seller.username || seller.id;
                    unfollow.mutate(id);
                  }}
                  disabled={unfollow.isPending}
                  className="shrink-0 h-9 px-4 rounded-full border border-border hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  Unfollow
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold mb-1">Not following anyone yet</p>
          <p className="text-sm text-muted-foreground">
            Visit a producer's profile and click Follow to stay updated on their new releases.
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
