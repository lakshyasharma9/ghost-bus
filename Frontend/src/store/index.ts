import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track } from "@/lib/mock-data";

// ─── Singleton audio element (lives outside React) ───────────────────────────
let audioEl: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (typeof window === "undefined") return {} as HTMLAudioElement;
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
    audioEl.crossOrigin = "anonymous";
  }
  return audioEl;
}

// ============== Audio Player ==============
type AudioState = {
  current: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;   // 0..1
  duration: number;   // seconds
  volume: number;     // 0..1
  showQueue: boolean;
  loading: boolean;
  play: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (p: number) => void;
  setProgress: (p: number) => void;
  setVolume: (v: number) => void;
  toggleQueue: () => void;
  enqueue: (track: Track) => void;
  _onTimeUpdate: () => void;
  _onEnded: () => void;
  _onLoadStart: () => void;
  _onCanPlay: () => void;
};

export const useAudio = create<AudioState>((set, get) => {
  // Wire up audio element events once
  if (typeof window !== "undefined") {
    const el = getAudio();

    el.addEventListener("timeupdate", () => {
      const { duration } = el;
      if (duration > 0) {
        set({ progress: el.currentTime / duration, duration });
      }
    });

    el.addEventListener("ended", () => {
      get().next();
    });

    el.addEventListener("loadstart", () => set({ loading: true }));
    el.addEventListener("canplay", () => set({ loading: false }));
    el.addEventListener("error", () => set({ loading: false, isPlaying: false }));
  }

  return {
    current: null,
    queue: [],
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.7,
    showQueue: false,
    loading: false,

    play: (track, queue) => {
      const el = getAudio();
      const url = track.audioUrl ?? "";
      
      console.log("Playing track:", track.title, "URL:", url);

      // If same track — just toggle
      if (get().current?.id === track.id) {
        if (el.paused) {
          el.play().catch((err) => {
            console.error("Playback failed:", err);
            set({ isPlaying: false, loading: false });
          });
          set({ isPlaying: true });
        } else {
          el.pause();
          set({ isPlaying: false });
        }
        return;
      }

      // New track
      el.src = url;
      el.volume = get().volume;
      el.currentTime = 0;
      el.load(); // Force load the new source
      
      set({
        current: track,
        isPlaying: true,
        progress: 0,
        duration: 0,
        queue: queue ?? get().queue,
        loading: true,
      });
      
      // Play after load
      el.play().catch((err) => {
        console.error("Playback failed:", err);
        set({ isPlaying: false, loading: false });
      });
    },

    toggle: () => {
      const el = getAudio();
      if (!get().current) return;
      if (el.paused) {
        el.play().catch(() => {});
        set({ isPlaying: true });
      } else {
        el.pause();
        set({ isPlaying: false });
      }
    },

    next: () => {
      const { queue, current } = get();
      if (!current || queue.length === 0) return;
      const idx = queue.findIndex((t) => t.id === current.id);
      const nxt = queue[(idx + 1) % queue.length];
      get().play(nxt, queue);
    },

    prev: () => {
      const el = getAudio();
      // If more than 3s played — restart current
      if (el.currentTime > 3) {
        el.currentTime = 0;
        set({ progress: 0 });
        return;
      }
      const { queue, current } = get();
      if (!current || queue.length === 0) return;
      const idx = queue.findIndex((t) => t.id === current.id);
      const prv = queue[(idx - 1 + queue.length) % queue.length];
      get().play(prv, queue);
    },

    seek: (p: number) => {
      const el = getAudio();
      const clamped = Math.max(0, Math.min(1, p));
      if (el.duration > 0) {
        el.currentTime = clamped * el.duration;
      }
      set({ progress: clamped });
    },

    // Legacy alias kept for compatibility
    setProgress: (p: number) => get().seek(p),

    setVolume: (v: number) => {
      const el = getAudio();
      el.volume = v;
      set({ volume: v });
    },

    toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),

    enqueue: (track) => set((s) => ({ queue: [...s.queue, track] })),

    _onTimeUpdate: () => {},
    _onEnded: () => {},
    _onLoadStart: () => {},
    _onCanPlay: () => {},
  };
});

// ============== Cart ==============
type CartItem = { track: Track };
type CartState = {
  items: CartItem[];
  open: boolean;
  add: (track: Track) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (o: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (track) =>
        set((s) =>
          s.items.find((i) => i.track.id === track.id)
            ? { ...s, open: true }
            : { items: [...s.items, { track }], open: true },
        ),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.track.id !== id) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "ghostbus-cart", storage: createJSONStorage(() => localStorage) },
  ),
);

// ============== Wishlist ==============
type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "ghostbus-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);
