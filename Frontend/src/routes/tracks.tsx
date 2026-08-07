import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GENRES } from "@/lib/mock-data";
import { TrackCard } from "@/components/tracks/TrackCard";
import { TrackListRow } from "@/components/tracks/TrackListRow";
import { ChevronDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/tracks")({
  head: () => ({
    meta: [
      { title: "Browse Tracks — GhostBus Ghost Production Marketplace" },
      { name: "description", content: "Browse exclusive ghost-produced EDM tracks across all genres. Full rights transfer guaranteed. One sale only." },
    ],
  }),
  component: TracksRoot,
});

function TracksRoot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetail = pathname.startsWith("/tracks/") && pathname.length > "/tracks/".length;
  if (isDetail) return <Outlet />;
  return <TracksPage />;
}

type SortBy = "newest" | "price-low" | "price-high" | "bpm-low" | "bpm-high";

function TracksPage() {
  const [genre, setGenre] = useState<string | null>(null);
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 250]);
  const [priceRange, setPriceRange] = useState<[number, number]>([149, 2000]);
  const [view, setView] = useState<"grid" | "list">("list");
  const [hideSold, setHideSold] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [vocalFilter, setVocalFilter] = useState<"all" | "instrumental" | "with-vocals">("all");
  const [keyFilter, setKeyFilter] = useState<string | null>(null);

  // Fetch real API tracks
  const { data: apiTracks } = useQuery({
    queryKey: ["browse-tracks"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/tracks?limit=50`);
        if (!res.ok) return [];
        const json = await res.json();
        return (json.data?.tracks ?? []).map((t: any) => ({
          id: t.id, title: t.title,
          label: t.seller?.fullName || t.seller?.username || 'GhostBus',
          producer: t.seller?.fullName || t.seller?.username || 'Unknown',
          genre: t.genre, bpm: t.bpm || 128, musicalKey: t.key || 'C maj',
          duration: '5:00', price: t.price, artwork: t.coverUrl || '',
          audioUrl: t.previewUrl || '', sold: t.sold || false, hot: false, original: true,
          tags: t.tags || [], description: t.description || '', hasVocals: false,
          seller: t.seller, sellerUsername: t.seller?.username || t.seller?.id,
        }));
      } catch { return []; }
    },
    staleTime: 30_000,
  });

  const allTracks = [...(apiTracks ?? [])];

  const filtered = useMemo(() => {
    let result = allTracks.filter((t) => {
      if (genre && t.genre !== genre) return false;
      if (t.bpm < bpmRange[0] || t.bpm > bpmRange[1]) return false;
      if (t.price < priceRange[0] || t.price > priceRange[1]) return false;
      if (hideSold && t.sold) return false;
      if (vocalFilter === "instrumental" && t.hasVocals) return false;
      if (vocalFilter === "with-vocals" && !t.hasVocals) return false;
      if (keyFilter && t.musicalKey !== keyFilter) return false;
      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "bpm-low": result.sort((a, b) => a.bpm - b.bpm); break;
      case "bpm-high": result.sort((a, b) => b.bpm - a.bpm); break;
      default: break; // newest = default order
    }
    return result;
  }, [allTracks, genre, bpmRange, priceRange, hideSold, sortBy, vocalFilter, keyFilter]);

  const KEYS = ["A min", "A maj", "B min", "B maj", "C min", "C maj", "D min", "D maj", "E min", "E maj", "F min", "F maj", "F# min", "G min", "G maj"];

  return (
    <div className="container-app pt-10 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="label-eyebrow mb-2">Marketplace</div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Browse Tracks</h1>
        <p className="text-muted-foreground mt-2 text-sm">{filtered.length} exclusive tracks · A&R verified · one sale only</p>
      </div>

      {/* ── Filter Bar (inline, reference-style) ── */}
      <div className="mb-6 space-y-3">
        {/* Row 1: Sliders + Sort */}
        <div className="flex flex-wrap items-end gap-3 md:gap-5 p-4 bg-card border border-border rounded-xl">
          {/* BPM Range */}
          <div className="flex-1 min-w-[140px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">BPM</span>
              <span className="text-xs tabular-nums font-medium">{bpmRange[0]} – {bpmRange[1]}</span>
            </div>
            <div className="flex gap-2">
              <input type="range" min={60} max={250} value={bpmRange[0]} onChange={(e) => setBpmRange([+e.target.value, bpmRange[1]])} className="w-full accent-primary h-1.5" />
              <input type="range" min={60} max={250} value={bpmRange[1]} onChange={(e) => setBpmRange([bpmRange[0], +e.target.value])} className="w-full accent-primary h-1.5" />
            </div>
          </div>

          {/* Price Range */}
          <div className="flex-1 min-w-[140px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</span>
              <span className="text-xs tabular-nums font-medium">€{priceRange[0]} – €{priceRange[1]}</span>
            </div>
            <div className="flex gap-2">
              <input type="range" min={149} max={2000} step={50} value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} className="w-full accent-primary h-1.5" />
              <input type="range" min={149} max={2000} step={50} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="w-full accent-primary h-1.5" />
            </div>
          </div>

          {/* Key Filter */}
          <div className="min-w-[120px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Key</span>
            <select
              value={keyFilter ?? ""}
              onChange={(e) => setKeyFilter(e.target.value || null)}
              className="h-9 w-full px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Keys</option>
              {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* Vocals Filter */}
          <div className="min-w-[130px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Vocals</span>
            <select
              value={vocalFilter}
              onChange={(e) => setVocalFilter(e.target.value as any)}
              className="h-9 w-full px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All</option>
              <option value="instrumental">Instrumental</option>
              <option value="with-vocals">With Vocals</option>
            </select>
          </div>

          {/* Sort */}
          <div className="min-w-[140px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="h-9 w-full px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="bpm-low">BPM: Low → High</option>
              <option value="bpm-high">BPM: High → Low</option>
            </select>
          </div>
        </div>

        {/* Row 2: Hide sold toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideSold}
              onChange={(e) => setHideSold(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <span className="text-sm font-medium">Hide sold</span>
          </label>
        </div>

        {/* Row 3: Genre chips */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Genres</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setGenre(null)}
              className={`h-7 px-3 rounded-full text-xs font-medium border transition ${!genre ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/40 text-foreground/70"}`}
            >All</button>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g === genre ? null : g)}
                className={`h-7 px-3 rounded-full text-xs font-medium border transition ${genre === g ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/40 text-foreground/70"}`}
              >{g}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results header ── */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="text-sm text-muted-foreground">{filtered.length} results</div>
        <div className="inline-flex p-1 rounded-full bg-muted text-sm">
          <button onClick={() => setView("grid")} className={`px-4 h-8 rounded-full transition ${view === "grid" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>Grid</button>
          <button onClick={() => setView("list")} className={`px-4 h-8 rounded-full transition ${view === "list" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>List</button>
        </div>
      </div>

      {/* ── Track Listing ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-2xl">
          <p className="font-semibold mb-1">No tracks found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((t) => <TrackCard key={t.id} track={t} queue={filtered} />)}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((t) => <TrackListRow key={t.id} track={t} queue={filtered} />)}
        </div>
      )}
    </div>
  );
}
