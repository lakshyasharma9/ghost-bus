import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart, Play, Pause, ShoppingBag, ShieldCheck,
  Lock, CheckCircle2, Info, Music2, Fingerprint,
  Cpu, ScanLine, ChevronRight, BadgeCheck, Loader2, Star,
  FileText, Download, X,
} from "lucide-react";
import type { Track } from "@/lib/mock-data";
import { Waveform } from "@/components/audio/Waveform";
import { TrackListRow } from "@/components/tracks/TrackListRow";
import { useAudio, useCart, useWishlist } from "@/store";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/tracks/$id")({
  loader: async ({ params }): Promise<{ track: Track }> => {
    // Fetch from real API
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/tracks/${params.id}`
      );

      // 404 from backend — track genuinely doesn't exist or isn't approved
      if (res.status === 404) throw notFound();

      // Any other non-2xx — throw notFound so user sees a clean message
      if (!res.ok) throw notFound();

      const json = await res.json();
      const t = json.data?.track;
      if (!t) throw notFound();

      // Map API response to Track type
      const track: Track = {
        id: t.id,
        title: t.title,
        label: t.seller?.fullName || t.seller?.username || 'GhostBus',
        producer: t.seller?.fullName || t.seller?.username || 'Unknown Producer',
        genre: t.genre,
        bpm: t.bpm || 128,
        musicalKey: t.key || 'C maj',
        duration: t.duration ? `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2,'0')}` : '',
        price: t.price,
        artwork: t.coverUrl || '',
        audioUrl: t.previewUrl || '',
        sold: t.sold || false,
        hot: false,
        original: t.transparency === 'original',
        tags: t.tags || [],
        description: t.description || 'An exclusive ghost-produced master with full rights transfer. Includes WAV master, stems, MIDI, and high-resolution artwork. One sale only — once sold, gone forever.',
        vocalType: t.vocalType || 'none',
        projectFileExists: !!t.hasLyrics,
      } as any;

      // Attach extra API data
      (track as any).versions    = t.versions    || null;
      (track as any).previewUrl  = t.previewUrl  || null;
      (track as any).waveformPoints = t.waveformPoints || null;
      (track as any).seller      = t.seller      || null;
      (track as any).sellerUsername = t.seller?.username || t.seller?.id || null;

      return { track };
    } catch (e: any) {
      // Re-throw notFound() as-is; swallow everything else into notFound
      if (e?.isNotFound || e?.message === 'Not Found') throw notFound();
      throw notFound();
    }
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.track.title} by ${loaderData.track.producer} — GhostBus` },
            { name: "description", content: `Buy '${loaderData.track.title}' by ${loaderData.track.producer}. ${loaderData.track.genre}, ${loaderData.track.bpm} BPM. Full rights transfer. One sale only.` },
          ],
        }
      : { meta: [] },
  notFoundComponent: () => (
    <div className="container-app py-32 text-center">
      <h1 className="text-3xl font-semibold mb-2">Track not found</h1>
      <Link to="/tracks" className="text-primary hover:underline">← Back to marketplace</Link>
    </div>
  ),
  component: TrackDetail,
});

// ─── Tooltip row ─────────────────────────────────────────────────────────────
const FILE_TOOLTIPS: Record<string, string> = {
  mastered: "Extended & Radio master vocal + instrumental, engineered natively at 24-bit / 44.1 kHz with optimal club translation.",
  unmastered: "Minus 3 dB dynamic headroom — extended & radio unmaster vocal + instrumental, printed with zero master peak limiting.",
  stems: "Kick, claps, hi-hats, ride, shaker, top loops, lead, synth, pad, chords, bass, midbass, stabs, FX, and vocals. Completely separated and labeled for instant DAW alignment.",
  midi: "Exported MIDI data for all melodic and harmonic progressions. Enables seamless synthesizer patch replacement.",
  vocals: "Lyrics PDF plus Exclusive Vocal Rights Transfer Documentation for commercial use and releases.",
  license: "Signed copyright, confidentiality, and NDA declarations. Establishes absolute commercial ownership worldwide, in perpetuity.",
  project: "Full DAW project directory — sequencing template, automation data, mixer routing, synthesizer plugin states, and all audio assets.",
};

function TooltipRow({ label, detail, tooltipKey, show = true }: { label: string; detail: string; tooltipKey: string; show?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!show) return null;
  return (
    <div className="flex items-start gap-3 py-4 border-b border-border last:border-0">
      <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">{detail}</span>
          <button type="button" onClick={() => setOpen(v => !v)} className="text-muted-foreground/50 hover:text-primary transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed bg-muted/60 rounded-lg px-4 py-3">{FILE_TOOLTIPS[tooltipKey]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Creation Process tabs ────────────────────────────────────────────────────
type TabId = "overview" | "setup" | "vocals" | "notes";

function CreationProcess({ track, moreTracks }: { track: Track; moreTracks: Track[] }) {
  const [tab, setTab] = useState<TabId>("overview");
  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "setup", label: "Setup" },
    { id: "vocals", label: "Vocals" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <section className="mt-14 mb-12">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">Creation process</h2>
        <div className="flex gap-1 p-1 bg-muted rounded-xl overflow-x-auto max-w-full">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
          className="bg-card border border-border rounded-2xl overflow-hidden">
          {tab === "overview" && (
            <div className="p-6 md:p-8">
              {/* Original & Exclusive declarations */}
              <div className="space-y-3 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <span className="self-start shrink-0 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white"
                    style={{ background: "linear-gradient(135deg, #060226 0%, #1a0f8f 100%)", boxShadow: "0 4px 15px rgba(6,2,38,0.3)" }}>
                    {track.original ? "100% Original Production" : "Contains Royalty-Free Loops"}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong>100% Custom-Made</strong> · <strong>Made From Scratch</strong> · <strong>No Melodic Samples Used</strong>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <span className="self-start shrink-0 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", boxShadow: "0 4px 15px rgba(124,58,237,0.3)" }}>
                    Exclusive
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong>Full Master Rights Transfer</strong> · <strong>Sold Once</strong> · <strong>Permanently Removed from Sale</strong> · <strong>Everything Included Is Yours</strong>
                  </p>
                </div>
              </div>

              {/* Trust Badges — horizontal row with green checkmarks */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 mb-10 py-5 border-y border-border">
                {[
                  { label: "Copyright passed", sub: "Scanned via ACRCloud" },
                  { label: "AI-detection passed", sub: "Safe for all DSP platforms" },
                  { label: "Producer verified", sub: "Identity & ownership confirmed" },
                  { label: "Secured with agreement", sub: "Countersigned PDF emailed at purchase" },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-green-500/15 grid place-items-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm leading-tight">{badge.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{badge.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── How It Works — dark section with timeline ── */}
              <div className="rounded-2xl overflow-hidden mb-8" style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)" }}>
                <div className="p-6 md:p-8">
                  {/* Badge + heading */}
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/30 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                    How It Works
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-white mb-8">
                    From buy button to Spotify in under 5 minutes
                  </h3>

                  {/* 3 Steps — horizontal icons connected by line */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 sm:gap-4 relative">
                    {/* Connecting line */}
                    <div className="absolute top-8 left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-px hidden md:block" style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0.25) 50%, rgba(74,222,128,0.4) 100%)" }} />

                    {/* Step 1 */}
                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full grid place-items-center mb-4 relative z-10 border border-indigo-400/50"
                        style={{ background: "#0b0435", boxShadow: "0 0 15px rgba(99,102,241,0.25), 0 0 30px rgba(99,102,241,0.08)" }}>
                        <ShoppingBag className="w-6 h-6 text-white/80" />
                      </div>
                      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1.5">
                        Step 1 · ~30 sec
                      </div>
                      <h4 className="text-white font-semibold text-sm mb-2">Secure checkout</h4>
                      <p className="text-white/50 text-xs leading-relaxed max-w-[200px] mx-auto">
                        Pay with Card, PayPal or Apple Pay. Track is pulled from sale the moment payment clears.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full grid place-items-center mb-4 relative z-10 border border-purple-400/50"
                        style={{ background: "#0b0435", boxShadow: "0 0 15px rgba(168,85,247,0.25), 0 0 30px rgba(168,85,247,0.08)" }}>
                        <Download className="w-6 h-6 text-white/80" />
                      </div>
                      <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1.5">
                        Step 2 · Instant
                      </div>
                      <h4 className="text-white font-semibold text-sm mb-2">Instant download</h4>
                      <p className="text-white/50 text-xs leading-relaxed max-w-[200px] mx-auto">
                        Get WAV stems, MIDI and the full DAW project. Rights agreement emailed automatically.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex-1 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full grid place-items-center mb-4 relative z-10 border border-green-400/60"
                        style={{ background: "#0b0435", boxShadow: "0 0 15px rgba(74,222,128,0.3), 0 0 30px rgba(74,222,128,0.1)" }}>
                        <Music2 className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1.5">
                        Step 3 · ~3 min
                      </div>
                      <h4 className="text-white font-semibold text-sm mb-2">Release as your own</h4>
                      <p className="text-white/50 text-xs leading-relaxed max-w-[200px] mx-auto">
                        Upload to Spotify, Apple Music or any distributor under your name. Keep 100% royalties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Producer Card ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white font-bold text-xl shrink-0">
                    {track.producer.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-base">{track.producer}</h4>
                      <BadgeCheck className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {moreTracks.length > 0 ? `${moreTracks.length + 1}` : '4'} tracks available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-9 px-4 rounded-full border border-border hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium">
                    <Heart className="w-4 h-4" />
                    Follow
                  </button>
                  <Link to="/sellers/$username" params={{ username: track.producer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }}
                    className="h-9 px-4 rounded-full bg-primary text-primary-foreground hover:bg-[--color-primary-hover] transition-colors flex items-center gap-2 text-sm font-medium">
                    View profile
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          {tab === "setup" && (
            <div className="p-6 md:p-8">
              <p className="text-sm text-muted-foreground mb-5">Equipment, software and plugins used.</p>
              <div className="divide-y divide-border">
                {[["OS", "Windows"], ["DAW", "FL Studio"], ["DAW Version", "Producer Edition v25.2.4 [build 5242]"], ["Software", "Serum 2, Kickstart, OTT, Ozone 8, NS1 Stereo"]].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-6 py-3.5">
                    <span className="text-sm font-semibold w-28 shrink-0">{label}</span>
                    <span className="flex-1 text-sm text-foreground/80 bg-muted/60 px-4 py-2 rounded-lg font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "vocals" && (
            <div className="p-6 md:p-8">
              <p className="text-sm text-muted-foreground mb-5">
                {track.vocalType === "none" ? "This is a fully instrumental production — no vocals included." : "Royalty-free or AI-generated vocals used."}
              </p>
              {track.vocalType === "none" ? (
                <div className="py-8 text-center">
                  <Music2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Instrumental only.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {[["Type", track.vocalType === "ai" ? "AI vocal" : "Exclusive vocals"], ["Company", track.vocalType === "ai" ? "Suno" : "Original artist"]].map(([label, value]) => (
                    <div key={label} className="flex items-start gap-6 py-3.5">
                      <span className="text-sm font-semibold w-28 shrink-0">{label}</span>
                      <span className="flex-1 text-sm text-foreground/80 bg-muted/60 px-4 py-2 rounded-lg font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === "notes" && (
            <div className="p-6 md:p-8">
              <p className="text-sm text-muted-foreground mb-5">Producer's comments on the creation process.</p>
              <div className="flex items-start gap-6 py-3.5">
                <span className="text-sm font-semibold w-28 shrink-0">Process note</span>
                <span className="flex-1 text-sm text-foreground/80 bg-muted/60 px-4 py-3 rounded-lg leading-relaxed font-mono whitespace-pre-wrap">
                  {track.vocalType === "ai" ? "I started producing melodic house and then generated the vocals with AI."
                    : track.vocalType === "exclusive" ? "I composed and recorded the full vocal performance live in studio. Rights are fully transferred to the buyer."
                    : "A pure instrumental production. Every sound was designed from scratch using custom synthesizer patches."}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ─── Version Selector ─────────────────────────────────────────────────────────

interface Versions {
  radioEdit: string | null;
  extendedMix: string | null;
  instrumental: string | null;
}

function VersionSelector({ track, versions, mainUrl }: { track: Track; versions: Versions; mainUrl: string }) {
  const a = useAudio();
  const [selected, setSelected] = useState<'master' | 'radioEdit' | 'extendedMix' | 'instrumental'>('master');

  const options = [
    { key: 'master' as const,         label: 'Master (Full WAV)',  url: mainUrl },
    ...(versions.radioEdit    ? [{ key: 'radioEdit' as const,    label: 'Radio Edit',     url: versions.radioEdit    }] : []),
    ...(versions.extendedMix  ? [{ key: 'extendedMix' as const,  label: 'Extended Mix',   url: versions.extendedMix  }] : []),
    ...(versions.instrumental ? [{ key: 'instrumental' as const, label: 'Instrumental',   url: versions.instrumental }] : []),
  ];

  const handleChange = (key: typeof selected) => {
    setSelected(key);
    const opt = options.find(o => o.key === key);
    if (!opt) return;
    // Build a modified track object with the new URL and play it
    const versionTrack = { ...track, id: `${track.id}-${key}`, audioUrl: opt.url, title: `${track.title} (${opt.label})` } as any;
    a.play(versionTrack);
  };

  const selectedLabel = options.find(o => o.key === selected)?.label ?? 'Master';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <select
          value={selected}
          onChange={e => handleChange(e.target.value as typeof selected)}
          className="h-10 pl-4 pr-9 rounded-full border border-border bg-background text-sm font-medium appearance-none cursor-pointer hover:border-primary/40 transition focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {options.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
        {/* Custom dropdown chevron */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Preview versions</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function TrackDetail() {
  const { track } = Route.useLoaderData() as { track: Track };
  const a = useAudio();
  const cart = useCart();
  const wl = useWishlist();
  const isCurrent = a.current?.id === track.id || (a.current?.id?.startsWith(track.id + '-') ?? false);
  const isPlaying = isCurrent && a.isPlaying;
  const [contractOpen, setContractOpen] = useState(false);

  const moreTracks: Track[] = [];
  const similarTracks: Track[] = [];
  const displayMore = moreTracks.length > 0 ? moreTracks : similarTracks;

  return (
    <div className="min-h-screen pb-32">

      {/* ── Hero — compact single-card layout ───────────────────────── */}
      <div className="border-b border-border">
        <div className="container-app pt-6 pb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
            <Link to="/tracks" className="hover:text-foreground transition-colors">Marketplace</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/60">{track.genre}</span>
          </div>

          {/* Main card */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
            <div className="flex gap-5 md:gap-6">
              {/* Artwork — compact square */}
              <div className="shrink-0">
                <div
                  className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] rounded-xl bg-cover bg-center bg-muted shadow-sm"
                  style={track.artwork ? { backgroundImage: `url(${track.artwork})` } : {}}
                >
                  {!track.artwork && (
                    <div className="w-full h-full rounded-xl grid place-items-center bg-gradient-to-br from-[#060226] to-[#1a0f8f]">
                      <span className="text-white font-bold text-3xl">{track.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content — right side */}
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                {/* Title + Artist */}
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-tight truncate">
                    {track.title}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-muted-foreground text-sm">By</span>
                    <span className="font-semibold text-sm flex items-center gap-1">
                      {track.producer}
                      <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                    </span>
                  </div>
                </div>

                {/* Genre badge */}
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{track.genre}</span>
                </div>

                {/* Version dropdown + Play + Waveform — same line */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  {/* Version selector (inline) */}
                  {(track as any).versions && (
                    (track as any).versions.radioEdit || (track as any).versions.extendedMix || (track as any).versions.instrumental
                  ) ? (
                    <VersionSelector
                      track={track}
                      versions={(track as any).versions}
                      mainUrl={(track as any).previewUrl || track.audioUrl || ''}
                    />
                  ) : null}

                  {/* Play button */}
                  <button
                    onClick={() => isCurrent ? a.toggle() : a.play(track, [track])}
                    disabled={a.loading && isCurrent}
                    className="w-9 h-9 rounded-full bg-primary text-white grid place-items-center shrink-0 hover:bg-[--color-primary-hover] transition shadow-sm disabled:opacity-60"
                  >
                    {a.loading && isCurrent ? <Loader2 className="w-4 h-4 animate-spin" />
                      : isPlaying ? <Pause className="w-4 h-4" />
                      : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  {/* Waveform */}
                  <div className="flex-1 h-8 cursor-pointer min-w-0" onClick={e => {
                    if (!isCurrent) { a.play(track, [track]); return; }
                    const rect = e.currentTarget.getBoundingClientRect();
                    a.seek((e.clientX - rect.left) / rect.width);
                  }}>
                    <Waveform seed={track.id} bars={80} progress={isCurrent ? a.progress : 0} />
                  </div>

                  {/* Duration */}
                  <span className="text-xs text-muted-foreground tabular-nums font-mono shrink-0">
                    {isCurrent && a.duration > 0
                      ? `${Math.floor(a.duration / 60)}:${String(Math.floor(a.duration % 60)).padStart(2, '0')}`
                      : track.duration || '—'}
                  </span>
                </div>

                {/* Metadata pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    `${track.bpm} BPM`,
                    track.musicalKey,
                    track.vocalType === "ai" ? "AI Vocal" : track.vocalType === "exclusive" ? "Exclusive Vocals" : "Instrumental",
                    track.original ? "100% Original Production" : "Contains Royalty-Free Loops",
                  ].map(pill => (
                    <span key={pill} className="h-6 px-2.5 rounded-full bg-muted border border-border text-foreground/70 text-[11px] font-medium flex items-center">
                      {pill}
                    </span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-2xl font-bold tracking-tight">€{track.price}</span>
                  <button
                    disabled={track.sold}
                    onClick={() => cart.add(track)}
                    className="h-10 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center gap-2 hover:bg-[--color-primary-hover] shadow-sm disabled:opacity-50 transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {track.sold ? "Sold Out" : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => wl.toggle(track.id)}
                    className="w-10 h-10 grid place-items-center rounded-full border border-border hover:bg-muted transition"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wl.has(track.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="container-app py-10">

        {/* A&R badge */}
        <div className="flex items-start gap-3 p-5 bg-accent/50 border border-border rounded-xl mb-10">
          <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-base font-semibold">{track.original ? "100% Original Production" : "Royalty-Free Loops"}</span>
            <p className="text-sm text-muted-foreground mt-0.5">A&R Certified · Full rights transfer on purchase · One sale only — once sold, gone forever.</p>
          </div>
        </div>

        {/* Creation Process */}
        <CreationProcess track={track} moreTracks={moreTracks} />

        {/* What's Included */}
        <section className="mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-6">What's included</h2>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* File table — dynamic based on what seller actually uploaded */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-border bg-muted/40">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-4 text-sm text-muted-foreground font-medium">File</th>
                    <th className="text-left px-5 py-4 text-sm text-muted-foreground font-medium hidden sm:table-cell">Includes</th>
                    <th className="text-left px-5 py-4 text-sm text-muted-foreground font-medium">Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Always included */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground/90 text-sm">Mastered WAV</td>
                    <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">Full production master</td>
                    <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">WAV</span></td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground/90 text-sm">Unmastered WAV</td>
                    <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">Pre-master mixdown</td>
                    <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">WAV</span></td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground/90 text-sm">Stems</td>
                    <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">Grouped track stems</td>
                    <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">ZIP</span></td>
                  </tr>
                  {/* MIDI — shown if included */}
                  {(track as any).hasMidi !== false && (
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground/90 text-sm">MIDI Files</td>
                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">Melodic MIDI archives</td>
                      <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">MID</span></td>
                    </tr>
                  )}
                  {/* Optional preview versions — shown based on what was uploaded */}
                  {(track as any).versions?.radioEdit && (
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground/90 text-sm">Radio Edit</td>
                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">2–3 min radio version</td>
                      <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">MP3</span></td>
                    </tr>
                  )}
                  {(track as any).versions?.extendedMix && (
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground/90 text-sm">Extended Mix</td>
                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">4–8 min extended version</td>
                      <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">MP3</span></td>
                    </tr>
                  )}
                  {(track as any).versions?.instrumental && (
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground/90 text-sm">Instrumental</td>
                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">Vocals-free version</td>
                      <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">MP3</span></td>
                    </tr>
                  )}
                  {/* Lyrics PDF — for vocal tracks */}
                  {(track.vocalType !== "none") && (
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground/90 text-sm">Lyrics PDF</td>
                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">Full lyrics document</td>
                      <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">PDF</span></td>
                    </tr>
                  )}
                  {/* Project file */}
                  {track.projectFileExists && (
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground/90 text-sm">Project File</td>
                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">Full DAW project source</td>
                      <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">ZIP</span></td>
                    </tr>
                  )}
                  {/* Always included */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground/90 text-sm">License Agreement</td>
                    <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-sm">Rights transfer document</td>
                    <td className="px-5 py-4"><span className="px-3 py-1.5 rounded bg-muted text-xs font-mono font-semibold text-muted-foreground">PDF</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick file checklist */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">File details</p>
              <div>
                <TooltipRow label="Mastered Version Folder" detail="WAV" tooltipKey="mastered" />
                <TooltipRow label="Unmastered Version Folder" detail="WAV" tooltipKey="unmastered" />
                <TooltipRow label="Separated Stems" detail="ZIP" tooltipKey="stems" />
                {(track as any).hasMidi !== false && <TooltipRow label="Melodic MIDI Archives" detail="MID" tooltipKey="midi" />}
                {(track as any).versions?.radioEdit    && <TooltipRow label="Radio Edit"    detail="MP3" tooltipKey="radioEdit" />}
                {(track as any).versions?.extendedMix  && <TooltipRow label="Extended Mix"  detail="MP3" tooltipKey="extendedMix" />}
                {(track as any).versions?.instrumental && <TooltipRow label="Instrumental"  detail="MP3" tooltipKey="instrumental" />}
                <TooltipRow label="Lyrics & Vocal Package" detail={track.vocalType === "ai" ? "PDF + AI" : "PDF + Rights"} tooltipKey="vocals" show={track.vocalType !== "none"} />
                <TooltipRow label="License Agreement" detail="PDF" tooltipKey="license" />
                <TooltipRow label="DAW Project File" detail="ZIP" tooltipKey="project" show={track.projectFileExists === true} />
              </div>
            </div>
          </div>
        </section>

        {/* License section */}
        <section className="mb-12">
          {/* Mobile: copyright text first, then license table | Desktop: side by side */}
          <div className="grid md:grid-cols-2 gap-6 items-start">

            {/* Copyright transfer — shown FIRST on mobile via order-first */}
            <div className="order-first md:order-last">
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-3">Full copyright transfer</h2>
              <p className="text-foreground/70 text-sm leading-relaxed mb-5">
                Buy and release with confidence. Every track comes with a legal copyright transfer, ensuring you're fully protected as the sole owner and backed by our team every step of the way.
              </p>
              <button
                onClick={() => setContractOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Preview contract <ChevronRight className="w-5 h-5" />
              </button>

              {/* ── Contract Modal ── */}
              <AnimatePresence>
                {contractOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
                    onClick={() => setContractOpen(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ duration: 0.2 }}
                      className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-3xl relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="sticky top-0 bg-background border-b border-border rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
                        <div>
                          <h2 className="font-display text-lg font-semibold">Exclusive Track License Agreement</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Confidentiality & Rights Transfer</p>
                        </div>
                        <button onClick={() => setContractOpen(false)} className="w-9 h-9 rounded-full hover:bg-muted grid place-items-center transition"><X className="w-5 h-5" /></button>
                      </div>

                      {/* Body */}
                      <div className="px-6 py-6 space-y-5 text-sm text-foreground/80 leading-relaxed max-h-[70vh] overflow-y-auto">
                        <p className="text-foreground font-semibold text-base">Exclusive Track License and Confidentiality Agreement</p>
                        <p>This Exclusive Track License and Confidentiality Agreement ("Agreement") is effective as of the purchase date ("Effective Date") and is facilitated by <strong>GHOSTBUS</strong> ("Marketplace"). This Agreement is made between the provider acting under GHOSTBUS ("Producer" or "Licensor") and the purchasing customer ("You" or "Licensee").</p>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-foreground">1. Parties and Definitions</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>"Marketplace" refers to GHOSTBUS, acting exclusively as the platform facilitating the transaction.</li>
                            <li>"Producer" refers to the original creator of the Track, providing services under the GHOSTBUS platform.</li>
                            <li>"Licensee" refers to you, the individual or entity acquiring the exclusive perpetual license.</li>
                            <li>"Track" refers to the music composition, including all audio recordings, musical elements, project files, and related material.</li>
                          </ul>

                          <h3 className="font-semibold text-foreground">2. GhostBus Marketplace Role</h3>
                          <p>GHOSTBUS acts solely as an independent online marketplace and transaction facilitator. GHOSTBUS is not the creator, author, owner, or producer of any Track.</p>

                          <h3 className="font-semibold text-foreground">3. Exclusive License & Commercial Rights Granted</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>The Producer grants the Licensee an exclusive, worldwide, perpetual, irrevocable, transferable, and sublicensable license to use, reproduce, modify, adapt, distribute, publish, publicly perform, communicate, synchronize, monetize, and commercially exploit the Track in any format or medium.</li>
                            <li>Upon successful completion of the purchase, the Track shall be permanently removed from the GHOSTBUS Marketplace.</li>
                            <li>The Licensee may release and commercially exploit the Track under the Licensee's own name without attribution to the Producer.</li>
                            <li>The Licensee holds the exclusive right to reproduce, distribute, publish, adapt, edit, synchronize, publicly perform, monetize, sublicense, and commercially exploit the Track across any media.</li>
                            <li>The Licensee retains the full right to alter, remix, edit, arrange, and adapt the Track in any way.</li>
                          </ul>

                          <h3 className="font-semibold text-foreground">4. Payment & Chargebacks</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>The Licensee agrees to pay the agreed purchase price as specified on the GHOSTBUS platform.</li>
                            <li>No additional royalties, revenue shares, or royalty splits shall be payable.</li>
                            <li>If payment is reversed or charged back, the Licensee's rights automatically cease until resolved.</li>
                          </ul>

                          <h3 className="font-semibold text-foreground">5. File Delivery</h3>
                          <p>Upon payment confirmation, the Track and all associated files will be delivered electronically. Delivered assets include the master audio, unmastered version, stems, MIDI files, and DAW project file (if indicated).</p>

                          <h3 className="font-semibold text-foreground">6. Dispute Policy (STRICT)</h3>
                          <p>Any issues or disputes must be reported within <strong>15 days</strong> from the date of purchase with proper, detailed proof. Claims submitted after this period will generally not qualify for assistance.</p>

                          <h3 className="font-semibold text-foreground">7. Confidentiality</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Both parties agree to keep the terms of this Agreement strictly confidential.</li>
                            <li>The Producer agrees not to disclose that they created the Track to any third party.</li>
                          </ul>

                          <h3 className="font-semibold text-foreground">8. Producer Warranties</h3>
                          <p>The Producer warrants that they own all rights necessary to grant this license, and that the Track is an original work free of third-party claims or encumbrances.</p>

                          <h3 className="font-semibold text-foreground">9. Liability & Indemnification</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>The Licensee agrees to indemnify and hold harmless the Producer and GHOSTBUS from any claims arising from the Licensee's use of the Track.</li>
                            <li>Total liability is strictly limited to the purchase price of the Track.</li>
                          </ul>

                          <h3 className="font-semibold text-foreground">10. General Terms</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Severability:</strong> If any provision is found invalid, the remaining provisions remain in full force.</li>
                            <li><strong>Entire Agreement:</strong> This constitutes the entire understanding between the parties.</li>
                            <li><strong>Electronic Acceptance:</strong> By executing the transaction on GHOSTBUS, both parties electronically accept and agree to be bound by this Agreement. Digital acceptance carries the same legal weight as a physical signature.</li>
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground">By completing the purchase, the Licensee acknowledges that they have read, understood, and agree to be fully bound by all conditions of this Agreement.</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
                        <button onClick={() => setContractOpen(false)} className="h-10 px-5 rounded-full border border-border text-sm font-medium hover:bg-muted transition">Close</button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* License table — shown SECOND on mobile (order-last), FIRST on desktop (md:order-first) */}
            <div className="order-last md:order-first bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-4">License</p>
                <ul className="space-y-3">
                  {["Exclusive ownership", "Full copyright transfer", "Royalty-free", "Unlimited commercial use", "Release under your name", "Seller remains anonymous"].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded grid place-items-center shrink-0 bg-primary/10">
                        <Lock className="w-3 h-3 text-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Security section */}
        <section className="mb-12 py-10 md:py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-10 md:mb-16">
              {/* Left side - Title */}
              <div className="flex-shrink-0">
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight relative">
                  <span className="relative" style={{ 
                    background: 'linear-gradient(90deg, rgba(6, 2, 38, 0.25) 0%, rgba(6, 2, 38, 0.5) 25%, rgba(6, 2, 38, 0.75) 50%, rgba(6, 2, 38, 0.9) 75%, rgba(6, 2, 38, 1) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Quality over Quantity
                  </span>
                </h2>
              </div>
              
              {/* Right side - Description */}
              <div className="flex-1 md:ml-8">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Advanced tech that gives you that little bit of extra peace of mind.
                </p>
              </div>
            </div>

            {/* Icons row */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 ml-0 md:ml-16">
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="text-muted-foreground/40">
                  <ScanLine className="w-16 h-16" strokeWidth={1.5} />
                </div>
                <span className="text-muted-foreground/60 text-base leading-snug max-w-[200px]">
                  Music<br />Recognition<br />Technology
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="text-muted-foreground/40">
                  <Fingerprint className="w-16 h-16" strokeWidth={1.5} />
                </div>
                <span className="text-muted-foreground/60 text-base leading-snug max-w-[200px]">
                  Encrypted<br />Copyright<br />Registration
                </span>
              </div>
              
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="text-muted-foreground/40">
                  <Cpu className="w-16 h-16" strokeWidth={1.5} />
                </div>
                <span className="text-muted-foreground/60 text-base leading-snug max-w-[200px]">
                  AI-Powered<br />Fraud Detection<br />System
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* About + tags */}
        <section className="mb-12">
          <h2 className="font-semibold text-xl mb-3">About this track</h2>
          <p className="text-foreground/80 leading-relaxed text-sm mb-4">{track.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {track.tags.map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground">{t}</span>
            ))}
          </div>
        </section>

        {/* More tracks */}
        {displayMore.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-xl font-semibold tracking-tight mb-5">
              More tracks from {track.producer}
            </h2>
            <div className="space-y-2">
              {displayMore.map(t => <TrackListRow key={t.id} track={t} queue={displayMore} />)}
            </div>
          </section>
        )}

        {/* Producer hire banner */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#060226] to-[#1a0a5e] grid place-items-center text-white font-bold text-xl shrink-0">
            {track.producer.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">(5.0)</span>
              <span className="text-sm font-semibold">{track.producer} is available for hire!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Start a custom project for remix, production, or mastering.</p>
          </div>
          <Link to="/services" className="shrink-0 h-10 px-6 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors">
            Browse services
          </Link>
        </div>
      </div>
    </div>
  );
}
