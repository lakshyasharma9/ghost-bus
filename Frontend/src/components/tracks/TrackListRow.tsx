import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Heart, ChevronDown, ShoppingBag, Loader2 } from "lucide-react";
import type { Track } from "@/lib/mock-data";
import { useAudio, useCart, useWishlist } from "@/store";
import { Waveform } from "@/components/audio/Waveform";

/** Convert "Nova Reign" → "nova-reign" */
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function TrackListRow({ track, queue }: { track: Track; queue?: Track[] }) {
  const [open, setOpen] = useState(false);
  const a = useAudio();
  const cart = useCart();
  const wl = useWishlist();
  const isCurrent = a.current?.id === track.id;
  const isPlaying = isCurrent && a.isPlaying;

  // Real API tracks have seller.username or seller.id; mock tracks get a slugified producer name
  const sellerUsername: string | null =
    (track as any).seller?.username
    ?? (track as any).seller?.id
    ?? ((track as any).sellerUsername)
    ?? (track.producer ? toSlug(track.producer) : null);

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
    <div className={`bg-card border rounded-lg transition-all ${
      isCurrent ? "border-primary/40 shadow-[0_0_0_1px_rgba(6,2,38,0.18)]" : "border-border"
    } ${track.sold ? "opacity-60" : ""}`}>

      {/* ── Main Row ── */}
      <div className="flex items-center gap-3 px-3 py-2.5">

        {/* Artwork + always-visible play button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-14 h-14 rounded-lg shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${track.artwork})` }}
          />
          <button
            onClick={handlePlay}
            disabled={track.sold}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`w-9 h-9 rounded-full grid place-items-center shrink-0 transition-all ${
              isCurrent
                ? "bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(6,2,38,0.40)]"
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
            {track.label}{" · "}
            {sellerUsername ? (
              <Link
                to="/sellers/$username"
                params={{ username: sellerUsername }}
                className="hover:text-primary hover:underline transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {track.producer}
              </Link>
            ) : (
              track.producer
            )}
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
            €{track.price}
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
            <div className="border-t border-border px-4 py-4 space-y-4">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
