import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TRACKS, GENRES } from "@/lib/mock-data";
import { TrackCard } from "@/components/tracks/TrackCard";
import { TrackListRow } from "@/components/tracks/TrackListRow";
import { Filter, X } from "lucide-react";

export const Route = createFileRoute("/tracks")({
  head: () => ({
    meta: [
      { title: "Browse Tracks — GhostBus" },
      { name: "description", content: "Exclusive ghost-produced tracks across all genres. Full rights transfer guaranteed." },
    ],
  }),
  component: TracksPage,
});

function TracksPage() {
  const [genre, setGenre] = useState<string | null>(null);
  const [bpm, setBpm] = useState<[number, number]>([100, 160]);
  const [maxPrice, setMaxPrice] = useState(800);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawer, setDrawer] = useState(false);

  const filtered = useMemo(
    () =>
      TRACKS.filter(
        (t) =>
          (!genre || t.genre === genre) &&
          t.bpm >= bpm[0] && t.bpm <= bpm[1] &&
          t.price <= maxPrice,
      ),
    [genre, bpm, maxPrice],
  );

  return (
    <div className="container-app pt-12">
      <div className="mb-10">
        <div className="label-eyebrow mb-2">Marketplace</div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Browse Tracks</h1>
        <p className="text-muted-foreground mt-3 max-w-xl">{filtered.length} exclusive tracks · curated · verified unique</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <FilterPanel genre={genre} setGenre={setGenre} bpm={bpm} setBpm={setBpm} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 gap-3">
            <button onClick={() => setDrawer(true)} className="lg:hidden h-10 px-4 rounded-full border border-border inline-flex items-center gap-2 text-sm font-medium">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="text-sm text-muted-foreground">{filtered.length} results</div>
            <div className="ml-auto inline-flex p-1 rounded-full bg-muted text-sm">
              <button onClick={() => setView("grid")} className={`px-4 h-9 rounded-full ${view === "grid" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>Grid</button>
              <button onClick={() => setView("list")} className={`px-4 h-9 rounded-full ${view === "list" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>List</button>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {filtered.map((t) => <TrackCard key={t.id} track={t} queue={filtered} />)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((t) => <TrackListRow key={t.id} track={t} queue={filtered} />)}
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setDrawer(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-background p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold">Filters</span>
              <button onClick={() => setDrawer(false)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel genre={genre} setGenre={setGenre} bpm={bpm} setBpm={setBpm} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel(props: {
  genre: string | null; setGenre: (g: string | null) => void;
  bpm: [number, number]; setBpm: (b: [number, number]) => void;
  maxPrice: number; setMaxPrice: (n: number) => void;
}) {
  return (
    <div className="space-y-8 sticky top-24">
      <div>
        <div className="label-eyebrow mb-3">Genre</div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => props.setGenre(null)}
            className={`h-8 px-3 rounded-full text-xs font-medium border ${!props.genre ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/40"}`}
          >All</button>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => props.setGenre(g === props.genre ? null : g)}
              className={`h-8 px-3 rounded-full text-xs font-medium border ${props.genre === g ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:border-primary/40"}`}
            >{g}</button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="label-eyebrow">BPM</span>
          <span className="text-xs tabular-nums">{props.bpm[0]}–{props.bpm[1]}</span>
        </div>
        <input type="range" min={80} max={180} value={props.bpm[0]} onChange={(e) => props.setBpm([parseInt(e.target.value), props.bpm[1]])} className="w-full accent-primary" />
        <input type="range" min={80} max={180} value={props.bpm[1]} onChange={(e) => props.setBpm([props.bpm[0], parseInt(e.target.value)])} className="w-full accent-primary" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="label-eyebrow">Max Price</span>
          <span className="text-xs tabular-nums">${props.maxPrice}</span>
        </div>
        <input type="range" min={100} max={1000} step={50} value={props.maxPrice} onChange={(e) => props.setMaxPrice(parseInt(e.target.value))} className="w-full accent-primary" />
      </div>

      <button onClick={() => { props.setGenre(null); props.setBpm([100, 160]); props.setMaxPrice(800); }} className="text-sm text-primary font-medium">
        Reset filters
      </button>
    </div>
  );
}
