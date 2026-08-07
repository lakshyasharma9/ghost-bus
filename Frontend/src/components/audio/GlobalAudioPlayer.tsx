import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, ShoppingBag, Heart, Loader2, X } from "lucide-react";
import { useAudio, useCart, useWishlist } from "@/store";
import { Waveform } from "@/components/audio/Waveform";
import { useRef } from "react";

function VolumeSlider({ volume, onChange }: { volume: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const calcVolume = (e: React.MouseEvent | MouseEvent) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const raw = (e.clientX - rect.left) / rect.width;
    return Math.min(1, Math.max(0, raw));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    onChange(calcVolume(e));
    const onMove = (ev: MouseEvent) => onChange(calcVolume(ev));
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      className="relative w-20 h-4 flex items-center cursor-pointer group"
      role="slider"
      aria-valuenow={Math.round(volume * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Track */}
      <div className="w-full h-[3px] rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-none"
          style={{ width: `${volume * 100}%` }}
        />
      </div>
      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `calc(${volume * 100}% - 5px)` }}
      />
    </div>
  );
}

export function GlobalAudioPlayer() {
  const a = useAudio();
  const cart = useCart();
  const wl = useWishlist();
  const fmtTime = (secs: number) => {
    const s = Math.floor(secs);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const currentSecs = a.duration * a.progress;
  const remainingSecs = a.duration - currentSecs;

  return (
    <AnimatePresence>
      {a.current && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border"
        >
          {/* Queue Panel */}
          <AnimatePresence>
            {a.showQueue && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 300, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-border"
              >
                <div className="container-app py-4 h-full overflow-y-auto">
                  <div className="label-eyebrow mb-3">Up Next · {a.queue.length} tracks</div>
                  <div className="space-y-1">
                    {a.queue.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => a.play(t, a.queue)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                          a.current?.id === t.id ? "bg-accent" : "hover:bg-muted"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${t.artwork})` }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium truncate ${a.current?.id === t.id ? "text-primary" : ""}`}>
                            {t.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{t.label}</div>
                        </div>
                        {a.current?.id === t.id && a.isPlaying && (
                          <div className="flex items-end gap-[2px] h-4 shrink-0">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-[3px] rounded-full bg-primary bar-eq"
                                style={{ height: "100%", animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{t.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="container-app h-20 flex items-center gap-4">
            {/* Left — Track info + Controls */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Track Artwork */}
              <div
                className="w-12 h-12 rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.12)] shrink-0 relative overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${a.current.artwork})` }}
              >
                {a.loading && (
                  <div className="absolute inset-0 bg-black/40 grid place-items-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="min-w-0 w-32">
                <div className="text-sm font-semibold truncate">{a.current.title}</div>
                <div className="text-xs text-muted-foreground truncate">{a.current.producer}</div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={a.prev}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted transition-colors"
                  aria-label="Previous"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={a.toggle}
                  disabled={a.loading}
                  className="w-9 h-9 grid place-items-center rounded-lg bg-foreground text-background hover:scale-105 transition disabled:opacity-60"
                  aria-label={a.isPlaying ? "Pause" : "Play"}
                >
                  {a.loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : a.isPlaying
                      ? <Pause className="w-4 h-4" />
                      : <Play className="w-4 h-4 ml-0.5" />
                  }
                </button>
                <button
                  onClick={a.next}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted transition-colors"
                  aria-label="Next"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center — Time + Waveform */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <span className="text-xs text-muted-foreground tabular-nums font-mono shrink-0">
                {fmtTime(currentSecs)}
              </span>
              <div
                className="flex-1 h-10 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  a.seek((e.clientX - rect.left) / rect.width);
                }}
              >
                <Waveform seed={a.current.id} bars={300} progress={a.progress} className="opacity-90" />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums font-mono shrink-0">
                {a.duration > 0 ? fmtTime(a.duration) : a.current.duration}
              </span>
            </div>

            {/* Right — Volume + Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Volume Control */}
              <button
                onClick={() => a.setVolume(a.volume > 0 ? 0 : 0.7)}
                className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Volume"
              >
                {a.volume === 0
                  ? <VolumeX className="w-4 h-4" />
                  : <Volume2 className="w-4 h-4" />
                }
              </button>
              <VolumeSlider volume={a.volume} onChange={a.setVolume} />

              {/* Wishlist */}
              <button
                onClick={() => wl.toggle(a.current!.id)}
                className="w-9 h-9 grid place-items-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-4.5 h-4.5 ${wl.has(a.current.id) ? "fill-destructive text-destructive" : ""}`} />
              </button>

              {/* Add to Cart */}
              <button
                onClick={() => cart.add(a.current!)}
                className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-[--color-primary-hover] inline-flex items-center gap-2 shadow-[0_6px_18px_rgba(10,132,255,0.28)] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                €{a.current.price}
              </button>

              {/* Queue Toggle */}
              <button
                onClick={a.toggleQueue}
                aria-label="Queue"
                className={`w-9 h-9 grid place-items-center rounded-lg transition-colors ${
                  a.showQueue ? "bg-accent text-primary" : "hover:bg-muted"
                }`}
              >
                <ListMusic className="w-4 h-4" />
              </button>

              {/* Dismiss / Close */}
              <button
                onClick={a.dismiss}
                aria-label="Close player"
                className="w-9 h-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
