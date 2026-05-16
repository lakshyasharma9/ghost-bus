import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Heart, Play, Pause, ShoppingBag, ShieldCheck, Download, Music2, FileText, Lock, CheckCircle2 } from "lucide-react";
import { TRACKS, type Track } from "@/lib/mock-data";
import { Waveform } from "@/components/audio/Waveform";
import { TrackCard } from "@/components/tracks/TrackCard";
import { useAudio, useCart, useWishlist } from "@/store";

export const Route = createFileRoute("/tracks/$id")({
  loader: ({ params }): { track: Track } => {
    const track = TRACKS.find((t) => t.id === params.id);
    if (!track) throw notFound();
    return { track };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.track.title} — ${loaderData.track.label} · GhostBus` },
          { name: "description", content: `${loaderData.track.title} by ${loaderData.track.producer} on ${loaderData.track.label}. ${loaderData.track.genre}, ${loaderData.track.bpm} BPM.` },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="container-app py-32 text-center">
      <h1 className="text-3xl font-semibold">Track not found</h1>
      <Link to="/tracks" className="mt-4 inline-block text-primary">Back to marketplace</Link>
    </div>
  ),
  component: TrackDetail,
});

function TrackDetail() {
  const { track } = Route.useLoaderData() as { track: Track };
  const a = useAudio();
  const cart = useCart();
  const wl = useWishlist();
  const isCurrent = a.current?.id === track.id;
  const isPlaying = isCurrent && a.isPlaying;
  const similar = TRACKS.filter((t) => t.genre === track.genre && t.id !== track.id).slice(0, 4);

  return (
    <div className="container-app pt-10">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] bg-cover bg-center" style={{ backgroundImage: `url(${track.artwork})` }} />
          <div className="mt-6 h-24 p-4 rounded-2xl bg-card border border-border">
            <Waveform seed={track.id} bars={120} progress={isCurrent ? a.progress : 0} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => (isCurrent ? a.toggle() : a.play(track, [track]))}
              className="h-12 px-6 rounded-full bg-foreground text-background font-medium inline-flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Preview" : "Play Preview"}
            </button>
            <button onClick={() => wl.toggle(track.id)} className="w-12 h-12 grid place-items-center rounded-full border border-border">
              <Heart className={`w-5 h-5 ${wl.has(track.id) ? "fill-destructive text-destructive" : ""}`} />
            </button>
          </div>
        </div>

        <div>
          <div className="label-eyebrow">{track.label}</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight">{track.title}</h1>
          <p className="mt-3 text-muted-foreground">By {track.producer}</p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Stat label="BPM" value={track.bpm} />
            <Stat label="Key" value={track.musicalKey} />
            <Stat label="Length" value={track.duration} />
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="label-eyebrow mb-1">Exclusive Master</div>
                <div className="text-3xl font-semibold tracking-tight">₹{track.price}</div>
              </div>
              <button
                disabled={track.sold}
                onClick={() => cart.add(track)}
                className="h-12 px-6 rounded-full bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 hover:bg-[--color-primary-hover] shadow-[0_10px_30px_rgba(10,132,255,0.3)] disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" /> {track.sold ? "Sold" : "Add to Cart"}
              </button>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-2xl bg-[--color-surface] border border-border flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">{track.original ? "100% Original Production" : "Contains Royalty-Free Loops"}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified unique by DJMonitor. Full rights transfer on purchase. One sale only — once sold, gone forever.</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="label-eyebrow mb-3">Files Included</div>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {["WAV Master 24-bit", "Stems", "MIDI Files", "High-res Artwork"].map((f) => (
                <li key={f} className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                  <Download className="w-4 h-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* What's Included Section */}
          <div className="mt-8 p-6 rounded-2xl bg-accent border border-border">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              What's Included
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong>Extended Mix Master & Mixdown</strong> <span className="text-muted-foreground">(WAV / MP3)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong>Radio Mix Master & Mixdown</strong> <span className="text-muted-foreground">(WAV / MP3)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong>Instrumental Versions</strong> <span className="text-muted-foreground">(Extended & Radio)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong>Grouped Track Stems</strong> <span className="text-muted-foreground">(WAV)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong>MIDI Files</strong> <span className="text-muted-foreground">(Composition Data)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong>Project File</strong> <span className="text-muted-foreground">(Full Project Source - FLP/ABLETON/etc.)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong>License Contract</strong> <span className="text-muted-foreground">(100% Exclusive Rights Agreement PDF)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-card border border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                LICENSE INCLUDED
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  100% Exclusive Ownership
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  Full Copyright Transfer
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  Legally Protected Ownership Rights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  Fully Original Sound & Unique Production Identity
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  One-Time Purchase
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  Unlimited Commercial Release Rights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  Release Under Your Own Artist Name
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  Seller Remains Permanently Anonymous
                </li>
              </ul>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">LEGAL PROTECTION & SECURITY:</strong> Every purchase includes a legally binding copyright transfer agreement, giving you full control and exclusive ownership of the track. All projects are securely handled through GHOSTBUS AUDIO with protected transactions and verified delivery standards.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="label-eyebrow mb-3">Bonus Versions · Free</div>
            <div className="flex flex-wrap gap-2">
              {["Instrumental", "Radio Edit", "Extended Mix"].map((v) => (
                <span key={v} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                  <Music2 className="w-3 h-3" /> {v}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-semibold text-lg mb-3">About this track</h2>
            <p className="text-foreground/80 leading-relaxed">{track.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {track.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-muted text-xs">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-6">Similar tracks</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {similar.map((t) => <TrackCard key={t.id} track={t} queue={similar} />)}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border text-center">
      <div className="label-eyebrow">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
