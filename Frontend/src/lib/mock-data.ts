export type Track = {
  id: string;
  title: string;
  label: string;
  producer: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  duration: string;
  price: number;
  artwork: string;
  audioUrl?: string;
  sold?: boolean;
  hot?: boolean;
  original?: boolean;
  tags: string[];
  description?: string;
};

export const GENRES = [
  "Afro House", "Tech House", "Melodic Techno", "Deep House",
  "Progressive House", "Bass House", "Mainstage", "Hardstyle",
  "Drum & Bass", "Reggaeton", "Pop", "Trap", "UK Garage",
  "Future House", "Hard Techno",
];

const ARTWORKS = [
  "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&h=800&fit=crop",
];

const KEYS = ["A min", "C maj", "F# min", "G maj", "D min", "E maj", "Bb min", "Am"];

const TITLES = [
  "Midnight Protocol", "Velvet Horizon", "Echo Chamber", "Solar Drift",
  "Neon Cathedral", "Pulse Theory", "Astral Bloom", "Quartz Mirage",
  "Ghost Frequency", "Lunar Tide", "Crystal Voltage", "Indigo Static",
  "Phantom Loop", "Magnetic North", "Halcyon Days", "Voltage Drift",
  "Static Bloom", "Iron Lullaby", "Silver Serpent", "Open Circuit",
];

const LABELS = [
  "Monolith Records", "Skyline Audio", "Pellicano", "Anjuna Black",
  "Defected", "Drumcode", "Diynamic", "Solotoko", "Hot Creations",
];

const PRODUCERS = [
  "Solomon West", "Mira K.", "Atlas Vance", "Nova Reign",
  "Kairo", "Hex & Lume", "Ondine", "Tobias March",
];

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Free demo audio URLs — using reliable sources with CORS enabled
const DEMO_AUDIO_URLS = [
  "https://cdn.pixabay.com/audio/2022/03/10/audio_c8a8e0c3e8.mp3", // Electronic
  "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3", // House
  "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3", // Techno
  "https://cdn.pixabay.com/audio/2022/03/15/audio_c2c0e0f1e0.mp3", // Dance
  "https://cdn.pixabay.com/audio/2023/02/28/audio_550d815fa5.mp3", // EDM
  "https://cdn.pixabay.com/audio/2022/10/25/audio_24ee25f4f3.mp3", // Trance
  "https://cdn.pixabay.com/audio/2022/11/22/audio_3a8d6c9e5e.mp3", // Bass
  "https://cdn.pixabay.com/audio/2023/01/10/audio_7a9f8c0e4d.mp3", // Dubstep
];

export const TRACKS: Track[] = Array.from({ length: 36 }).map((_, i) => {
  const r = rng(i + 7);
  const genre = GENRES[Math.floor(r() * GENRES.length)];
  return {
    id: `trk_${i + 1}`,
    title: TITLES[i % TITLES.length] + (i >= TITLES.length ? " II" : ""),
    label: LABELS[Math.floor(r() * LABELS.length)],
    producer: PRODUCERS[Math.floor(r() * PRODUCERS.length)],
    genre,
    bpm: 118 + Math.floor(r() * 22),
    musicalKey: KEYS[Math.floor(r() * KEYS.length)],
    duration: `${4 + Math.floor(r() * 4)}:${String(Math.floor(r() * 59)).padStart(2, "0")}`,
    price: [299, 349, 399, 449, 499, 599, 749][Math.floor(r() * 7)],
    artwork: ARTWORKS[i % ARTWORKS.length],
    audioUrl: DEMO_AUDIO_URLS[i % DEMO_AUDIO_URLS.length],
    sold: i % 11 === 0,
    hot: i < 6,
    original: i % 3 !== 0,
    tags: ["club", "festival", "warm-up", "peak-time"].slice(0, 2 + (i % 3)),
    description:
      "An exclusive ghost-produced master with full rights transfer. Includes WAV master, stems, MIDI, and high-resolution artwork. One sale only — once sold, gone forever.",
  };
});

export const LABELS_LIST = LABELS.map((name, i) => ({
  id: `lbl_${i + 1}`,
  name,
  trackCount: 24 + i * 7,
  sales: 380 + i * 92,
  hue: i * 41,
}));

export const SERVICES = [
  { id: "s1", title: "Custom Ghost Production", producer: "Atlas Vance", genre: "Tech House", rating: 4.9, delivery: "7 days", price: 1200 },
  { id: "s2", title: "Mixing & Mastering", producer: "Mira K.", genre: "All", rating: 5.0, delivery: "3 days", price: 350 },
  { id: "s3", title: "Vocal Topline Writing", producer: "Nova Reign", genre: "Pop / House", rating: 4.8, delivery: "5 days", price: 600 },
  { id: "s4", title: "Stems Cleanup & Edits", producer: "Kairo", genre: "Techno", rating: 4.9, delivery: "2 days", price: 220 },
  { id: "s5", title: "DJ Edit / Extended Mix", producer: "Tobias March", genre: "House", rating: 4.7, delivery: "4 days", price: 480 },
  { id: "s6", title: "Sound Design Pack", producer: "Hex & Lume", genre: "Bass / Trap", rating: 4.9, delivery: "6 days", price: 540 },
];
