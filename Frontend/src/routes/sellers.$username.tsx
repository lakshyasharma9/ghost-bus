import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck, UserPlus, Music, ShoppingBag, Users,
  Play, Pause, Heart, Loader2, BadgeCheck, Calendar,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAudio, useCart, useWishlist } from "@/store";
import { Waveform } from "@/components/audio/Waveform";
import { useAuthContext } from "@/contexts/AuthContext";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/sellers/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} — GhostBus Producer` },
      { name: "description", content: `Exclusive ghost production tracks by ${params.username} on GhostBus.` },
    ],
  }),
  component: SellerProfilePage,
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface SellerProfile {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  memberSince: string;
  sellerVerified: boolean;
  stats: { availableTracks: number; soldTracks: number; followers: number };
  isFollowing: boolean;
}

interface ProfileTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number | null;
  key: string | null;
  price: number;
  coverUrl: string | null;
  duration: number | null;
  tags: string[];
  isExclusive: boolean;
  playsCount: number;
  likesCount: number;
  sold: boolean;
  createdAt: string;
}

// ── Page Component ────────────────────────────────────────────────────────────

function SellerProfilePage() {
  const { username } = Route.useParams();
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"available" | "sold">("available");

  // Fetch profile from backend
  const { data, isLoading, error } = useQuery({
    queryKey: ["seller-profile", username],
    queryFn: async () => {
      const res = await apiClient.get(`/sellers/${username}/profile`);
      return res.data.data as { seller: SellerProfile; tracks: ProfileTrack[] };
    },
    retry: false,
  });

  // Follow / unfollow toggle
  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/sellers/${username}/follow`);
      return res.data.data as { isFollowing: boolean; followers: number };
    },
    onSuccess: (result) => {
      qc.setQueryData(["seller-profile", username], (old: any) =>
        old ? {
          ...old,
          seller: {
            ...old.seller,
            isFollowing: result.isFollowing,
            stats: { ...old.seller.stats, followers: result.followers },
          },
        } : old
      );
      toast.success(result.isFollowing ? "Following!" : "Unfollowed");
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? e?.message ?? "";
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        toast.error("Please log in to follow producers.");
      } else {
        toast.error("Failed to update follow status.");
      }
    },
  });

  // Loading skeleton
  if (isLoading) return <ProfileSkeleton />;

  // Not found — show a graceful "profile not set up yet" page
  if (error || !data) {
    const displayName = username.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return (
      <div className="min-h-screen bg-background">
        {/* Default dark banner */}
        <div
          className="relative w-full overflow-hidden h-40 sm:h-52"
        >
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)" }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid2)" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        </div>

        <div className="container-app">
          <div className="relative -mt-14 pb-8">
            <div
              className="w-28 h-28 rounded-2xl border-4 border-background grid place-items-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #060226 0%, #1a0f8f 100%)" }}
            >
              <span className="text-white font-bold text-4xl">
                {displayName.charAt(0)}
              </span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">{displayName}</h1>
          <p className="text-muted-foreground text-sm mb-1">@{username}</p>
          <p className="text-muted-foreground text-sm mb-8 max-w-md">
            This producer hasn't completed their GhostBus seller verification yet. Once verified, their full profile and tracks will appear here.
          </p>
          <Link
            to="/tracks"
            className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-[--color-primary-hover] transition"
          >
            Browse All Tracks
          </Link>
        </div>
      </div>
    );
  }

  const { seller, tracks } = data;
  const displayName = seller.fullName || seller.username || username;
  const availTracks = tracks.filter((t) => !t.sold);
  const soldTracks = tracks.filter((t) => t.sold);
  const filteredTracks = tab === "available" ? availTracks : soldTracks;
  const isOwnProfile = user?.id === seller.id;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Banner ── */}
      <div className="relative w-full overflow-hidden h-40 sm:h-52 md:h-64">
        {seller.bannerUrl ? (
          <img src={seller.bannerUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)" }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="container-app">
        {/* ── Profile header ── */}
        <div className="relative -mt-16 pb-8 flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            {seller.avatarUrl ? (
              <img
                src={seller.avatarUrl}
                alt={displayName}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-background shadow-[0_8px_30px_rgba(6,2,38,0.25)]"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-2xl border-4 border-background grid place-items-center shadow-[0_8px_30px_rgba(6,2,38,0.25)]"
                style={{ background: "linear-gradient(135deg, #060226 0%, #1a0f8f 100%)" }}
              >
                <span className="text-white font-bold text-4xl">{displayName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-3xl font-bold tracking-tight">{displayName}</h1>
              {seller.sellerVerified && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
            {seller.username && seller.fullName && (
              <p className="text-sm text-muted-foreground mt-0.5">@{seller.username}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Member since {new Date(seller.memberSince).getFullYear()}
            </div>
          </div>

          {/* Follow / Edit buttons */}
          <div className="shrink-0">
            {isOwnProfile ? (
              <Link
                to="/dashboard/settings"
                className="h-11 px-6 rounded-full border border-border text-sm font-semibold inline-flex items-center gap-2 hover:bg-muted transition"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={`h-11 px-6 rounded-full text-sm font-semibold inline-flex items-center gap-2 transition-all ${
                  seller.isFollowing
                    ? "bg-muted text-foreground border border-border hover:bg-muted/70"
                    : "bg-primary text-primary-foreground hover:bg-[--color-primary-hover] shadow-[0_4px_14px_rgba(6,2,38,0.3)]"
                }`}
              >
                {followMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : seller.isFollowing ? (
                  <><UserCheck className="w-4 h-4" /> Following</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Follow</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="flex items-center gap-5 sm:gap-8 pb-8 border-b border-border flex-wrap">
          <Stat icon={<Music className="w-4 h-4" />} value={seller.stats.availableTracks} label="Available" />
          <Stat icon={<ShoppingBag className="w-4 h-4" />} value={seller.stats.soldTracks} label="Sold Tracks" />
          <Stat icon={<Users className="w-4 h-4" />} value={seller.stats.followers} label="Followers" />
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-10 py-10">
          {/* About sidebar */}
          <aside className="space-y-6">
            <div>
              <div className="label-eyebrow mb-3">About {displayName}</div>
              {seller.bio ? (
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{seller.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No bio added yet.</p>
              )}
            </div>
            {seller.sellerVerified && (
              <div>
                <div className="label-eyebrow mb-3">Verification</div>
                <div className="space-y-2 text-sm text-foreground/80">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> A&R Verified Producer</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Original Productions Only</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Copyright Clean</div>
                </div>
              </div>
            )}
          </aside>

          {/* Track listing */}
          <div>
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6">
              {(["available", "sold"] as const).map((t) => {
                const count = t === "available" ? seller.stats.availableTracks : seller.stats.soldTracks;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`h-8 px-4 rounded-lg text-sm font-medium transition capitalize ${
                      tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "available" ? "Available" : "Sold"}{" "}
                    <span className={`ml-1 text-xs ${tab === t ? "text-primary" : "text-muted-foreground"}`}>({count})</span>
                  </button>
                );
              })}
            </div>

            {filteredTracks.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border rounded-2xl">
                <Music className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {tab === "available" ? "No available tracks right now." : "No sold tracks yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <TrackRow key={track.id} track={track} seller={seller} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center min-w-[60px]">
      <div className="flex items-center justify-center gap-1.5 mb-0.5 text-primary">
        {icon}
        <span className="font-display text-2xl font-bold text-foreground">{value.toLocaleString()}</span>
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

function TrackRow({ track, seller }: { track: ProfileTrack; seller: SellerProfile }) {
  const a = useAudio();
  const cart = useCart();
  const wl = useWishlist();

  const storeTrack = {
    id: track.id,
    title: track.title,
    genre: track.genre,
    bpm: track.bpm ?? 0,
    musicalKey: track.key ?? "",
    price: track.price,
    artwork: track.coverUrl ?? "",
    audioUrl: "",
    label: seller.fullName ?? seller.username ?? "",
    producer: seller.username ?? "",
    tags: track.tags,
    sold: track.sold,
    duration: track.duration
      ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}`
      : "",
  } as any;

  const isCurrent = a.current?.id === track.id;
  const isPlaying = isCurrent && a.isPlaying;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-xl flex items-center gap-3 px-3 py-2.5 transition hover:border-primary/20 hover:shadow-sm ${track.sold ? "opacity-60" : ""}`}
    >
      {/* Artwork */}
      <div
        className="w-12 h-12 rounded-lg shrink-0 bg-cover bg-center bg-muted overflow-hidden"
        style={track.coverUrl ? { backgroundImage: `url(${track.coverUrl})` } : {}}
      >
        {!track.coverUrl && (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #060226, #1a0f8f)" }}>
            <span className="text-white text-xs font-bold">G</span>
          </div>
        )}
      </div>

      {/* Play */}
      <button
        onClick={() => { if (!track.sold) isCurrent ? a.toggle() : a.play(storeTrack); }}
        disabled={track.sold}
        className={`w-9 h-9 rounded-full grid place-items-center shrink-0 transition ${
          isCurrent ? "bg-primary text-primary-foreground" : "bg-foreground text-background hover:scale-105"
        } disabled:opacity-40`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to="/tracks/$id" params={{ id: track.id }}
          className="block font-semibold text-sm truncate hover:text-primary transition-colors">
          {track.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground/70">{track.genre}</span>
          {track.bpm && <span className="text-xs text-muted-foreground">{track.bpm} BPM</span>}
          {track.key && <span className="text-xs text-muted-foreground">{track.key}</span>}
        </div>
      </div>

      {/* Waveform */}
      <div className="hidden md:block w-24 h-8 shrink-0">
        <Waveform seed={track.id} bars={28} progress={isCurrent ? a.progress : 0} />
      </div>

      {/* Actions */}
      {track.sold ? (
        <span className="shrink-0 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wider">Sold</span>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => wl.toggle(track.id)}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-muted transition" aria-label="Wishlist">
            <Heart className={`w-3.5 h-3.5 ${wl.has(track.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>
          <button
            onClick={() => cart.add(storeTrack)}
            className="h-9 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[--color-primary-hover] transition shadow-[0_4px_12px_rgba(6,2,38,0.25)]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />€{track.price}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full h-64 bg-muted animate-pulse" />
      <div className="container-app">
        <div className="relative -mt-14 pb-8 flex items-end gap-5">
          <div className="w-28 h-28 rounded-2xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex gap-8 pb-8 border-b border-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1 text-center">
              <div className="h-7 w-12 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
