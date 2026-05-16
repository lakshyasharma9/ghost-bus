import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Heart, ChevronDown, ShoppingBag, Loader2, FileText, Check } from "lucide-react";
import type { Track } from "@/lib/mock-data";
import { useAudio, useCart, useWishlist } from "@/store";
import { Waveform } from "@/components/audio/Waveform";

export function TrackListRow({ track, queue }: { track: Track; queue?: Track[] }) {
  const [open, setOpen] = useState(false);
  const a = useAudio();
  const cart = useCart();
  const wl = useWishlist();
  const isCurrent = a.current?.id === track.id;
  const isPlaying = isCurrent && a.isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (track.sold) return;
    if (isCurrent) {
      a.toggle();
    } else {
      a.play(track, queue);
      setOpen(true);
    }
  };

  return (
    <div className={`bg-card border rounded-2xl transition-all ${
      isCurrent ? "border-primary/40 shadow-[0_0_0_1px_rgba(10,132,255,0.15)]" : "border-border"
    } ${track.sold ? "opacity-60" : ""}`}>

      {/* ── Main Row ── */}
      <div className="flex items-center gap-3 px-3 py-2.5">

        {/* Artwork + always-visible play button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-12 h-12 rounded-xl shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${track.artwork})` }}
          />
          <button
            onClick={handlePlay}
            disabled={track.sold}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`w-9 h-9 rounded-full grid place-items-center shrink-0 transition-all ${
              isCurrent
                ? "bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(10,132,255,0.35)]"
                : "bg-foreground text-background hover:scale-105"
            } disabled:opacity-40`}
          >
            {isCurrent && a.loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : isPlaying
                ? <Pause className="w-4 h-4" />
                : <Play className="w-4 h-4 ml-0.5" />
            }
          </button>
        </div>

        {/* Title + producer */}
        <div className="min-w-0 flex-1">
          <Link
            to="/tracks/$id"
            params={{ id: track.id }}
            className="block font-semibold text-sm truncate hover:text-primary transition-colors"
          >
            {track.title}
          </Link>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {track.label} · {track.producer}
          </div>
        </div>

        {/* Mini waveform — only when playing */}
        <div className="hidden md:block w-32 h-8 shrink-0">
          <Waveform seed={track.id} bars={40} progress={isCurrent ? a.progress : 0} />
        </div>

        {/* Meta pills */}
        <div className="hidden lg:flex items-center gap-2 text-xs shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-muted font-medium text-foreground">{track.genre}</span>
          <span className="px-2.5 py-1 rounded-full bg-muted font-medium text-foreground tabular-nums">{track.bpm} BPM</span>
          <span className="px-2.5 py-1 rounded-full bg-muted font-medium text-foreground">{track.musicalKey}</span>
          <span className="tabular-nums text-muted-foreground w-10 text-right">{track.duration}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => wl.toggle(track.id)}
            className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition-colors"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wl.has(track.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>

          <button
            disabled={track.sold}
            onClick={() => cart.add(track)}
            className="h-9 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[--color-primary-hover] disabled:opacity-40 transition-colors shadow-[0_4px_12px_rgba(10,132,255,0.25)]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            ₹{track.price}
          </button>

          <button
            onClick={() => setOpen((o) => !o)}
            className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition-colors"
            aria-label="Expand"
          >
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Expanded Player ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-4 space-y-6">

              {/* Track details */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <div className="label-eyebrow mb-2">Files Included</div>
                  <ul className="text-sm space-y-1 text-foreground/80">
                    <li>WAV Master (24-bit)</li>
                    <li>Stems ZIP</li>
                    <li>MIDI Files</li>
                    <li>High-res Artwork</li>
                  </ul>
                </div>
                <div>
                  <div className="label-eyebrow mb-2">Bonus Versions</div>
                  <ul className="text-sm space-y-1 text-foreground/80">
                    <li>Instrumental · Free</li>
                    <li>Radio Edit · Free</li>
                    <li>Extended Mix · Free</li>
                  </ul>
                </div>
                <div>
                  <div className="label-eyebrow mb-2">About</div>
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">
                    {track.description}
                  </p>
                </div>
              </div>

              {/* What's Included Section */}
              <div className="bg-accent border border-border rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">What's Included</h3>
                    <p className="text-sm text-muted-foreground">Complete professional release package</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Extended Mix Master & Mixdown (WAV/MP3)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Radio Mix Master & Mixdown (WAV/MP3)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Extended Instrumental (WAV/MP3)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Radio Instrumental (WAV/MP3)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Grouped Track Stems (WAV)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>MIDI Files (MID)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Full Project Source (FLP)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Exclusive Rights Agreement (PDF)</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="bg-card rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="font-medium">100% Exclusive Ownership</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="font-medium">Full Copyright Transfer</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="font-medium">Unlimited Commercial Release Rights</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="font-medium">Release Under Your Own Artist Name</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="font-medium">Seller Remains Permanently Anonymous</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
