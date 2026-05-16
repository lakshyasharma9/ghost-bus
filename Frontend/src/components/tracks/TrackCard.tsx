import { Link } from "@tanstack/react-router";
import { Play, Pause, Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/mock-data";
import { useAudio, useCart, useWishlist } from "@/store";
import { Waveform } from "@/components/audio/Waveform";

export function TrackCard({ track, queue }: { track: Track; queue?: Track[] }) {
  const a = useAudio();
  const cart = useCart();
  const wl = useWishlist();
  const isCurrent = a.current?.id === track.id;
  const isPlaying = isCurrent && a.isPlaying;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-[0_20px_50px_rgba(10,132,255,0.15)] hover:border-primary/30 transition-all duration-300 ${track.sold ? "opacity-60" : ""}`}
    >
      <Link to="/tracks/$id" params={{ id: track.id }} className="block">
        <div
          className="relative aspect-square w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${track.artwork})` }}
        >
          {track.sold && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="px-3 py-1 rounded-full bg-foreground/80 text-background text-xs font-semibold tracking-widest uppercase">Sold</span>
            </div>
          )}
          {track.hot && !track.sold && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-semibold tracking-wide">
              🔥 Hot
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <button
            onClick={(e) => {
              e.preventDefault();
              if (track.sold) return;
              isCurrent ? a.toggle() : a.play(track, queue);
            }}
            className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white text-foreground grid place-items-center shadow-[0_8px_24px_rgba(0,0,0,0.18)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Play"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to="/tracks/$id" params={{ id: track.id }} className="block font-semibold truncate hover:text-primary">
              {track.title}
            </Link>
            <div className="text-xs text-muted-foreground truncate mt-0.5">{track.label} · {track.producer}</div>
          </div>
          <button
            onClick={() => wl.toggle(track.id)}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-muted shrink-0"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wl.has(track.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>
        </div>

        <div className="h-8">
          <Waveform seed={track.id} bars={40} progress={isCurrent ? a.progress : 0} />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Pill>{track.genre}</Pill>
          <Pill>{track.bpm} BPM</Pill>
          <Pill>{track.musicalKey}</Pill>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-semibold tracking-tight">₹{track.price}</span>
          <button
            disabled={track.sold}
            onClick={() => cart.add(track)}
            className="h-9 px-3.5 rounded-full bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-foreground/90 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-muted text-foreground/70">{children}</span>;
}
