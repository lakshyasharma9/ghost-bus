export type VocalType = "none" | "exclusive" | "ai";

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
  country?: string;
  vocalType?: VocalType;
  projectFileExists?: boolean;
  hasVocals?: boolean;
};

// 20 genres with SEO slugs
export const GENRES = [
  "Afro House", "Tech House", "Melodic Techno", "Deep House",
  "Progressive House", "Bass House", "Mainstage", "Hardstyle",
  "Drum & Bass", "Reggaeton", "Pop", "Trap", "UK Garage",
  "Future House", "Hard Techno", "Bigroom", "Techno", "Dubstep",
  "Hip-Hop & Drill", "Other",
];

export const GENRE_SLUGS: Record<string, string> = {
  "Afro House": "afro-house",
  "Tech House": "tech-house",
  "Melodic Techno": "melodic-techno",
  "Deep House": "deep-house",
  "Progressive House": "progressive-house",
  "Bass House": "bass-house",
  "Mainstage": "mainstage",
  "Hardstyle": "hardstyle",
  "Drum & Bass": "drum-and-bass",
  "Reggaeton": "reggaeton",
  "Pop": "pop",
  "Trap": "trap",
  "UK Garage": "uk-garage",
  "Future House": "future-house",
  "Hard Techno": "hard-techno",
  "Bigroom": "bigroom",
  "Techno": "techno",
  "Dubstep": "dubstep",
  "Hip-Hop & Drill": "hip-hop-and-drill",
  "Other": "other",
};

export const GENRE_SEO: Record<string, { title: string; description: string; keyword: string }> = {
  "Afro House": { title: "Buy Afro House Ghost Production Tracks", description: "Exclusive Afro House ghost produced tracks with full rights transfer. Tribal rhythms, organic percussion, warm basslines.", keyword: "afro house ghost production" },
  "Tech House": { title: "Tech House Ghost Production Tracks", description: "Premium Tech House ghost produced tracks. Rolling basslines, driving grooves, club-ready productions.", keyword: "tech house ghostproduction" },
  "Melodic Techno": { title: "Melodic Techno Ghost Production", description: "Exclusive Melodic Techno tracks with emotional soundscapes and driving energy.", keyword: "melodic techno ghost production" },
  "Deep House": { title: "Deep House Ghost Production Tracks", description: "Soulful deep house ghost produced tracks with full commercial rights.", keyword: "deep house ghost production" },
  "Progressive House": { title: "Progressive House Ghost Production", description: "Festival-ready Progressive House tracks with complete stems and project files.", keyword: "progressive house ghost producers" },
  "Bass House": { title: "Bass House Ghost Production Tracks", description: "Heavy bass house ghost produced tracks optimized for festival and club play.", keyword: "bass house ghost producers" },
  "Mainstage": { title: "Mainstage EDM Ghost Production", description: "Mainstage festival anthems with massive drops, ready for the world's biggest stages.", keyword: "mainstage festival edm tracks" },
  "Hardstyle": { title: "Buy Hardstyle Ghost Production Tracks", description: "Exclusive Hardstyle ghost produced tracks with powerful kicks and euphoric melodies.", keyword: "buy hardstyle music production" },
  "Drum & Bass": { title: "Drum & Bass Ghost Production Tracks", description: "High-energy Drum & Bass ghost produced tracks with full stems and rights transfer.", keyword: "buy drum and bass tracks" },
  "Reggaeton": { title: "Reggaeton Ghost Production Tracks", description: "Commercial Reggaeton ghost produced tracks. Dembow rhythms, urban sound, full rights.", keyword: "buy reggaeton ghost production" },
  "Pop": { title: "Pop Ghost Production Tracks", description: "Radio-ready Pop ghost produced tracks with commercial appeal and full rights transfer.", keyword: "pop ghost production" },
  "Trap": { title: "Buy Trap Ghost Production Beats", description: "Exclusive Trap ghost produced beats with 808s, hi-hats, and full commercial rights.", keyword: "buy trap beats ghost producer" },
  "UK Garage": { title: "UK Garage Ghost Production Tracks", description: "Authentic UK Garage ghost produced tracks with shuffled rhythms and deep grooves.", keyword: "uk garage ghost production" },
  "Future House": { title: "Future House Ghost Production", description: "Cutting-edge Future House ghost produced tracks for DJs and labels.", keyword: "future house edm ghostproduction" },
  "Hard Techno": { title: "Hard Techno Ghost Production Tracks", description: "Industrial Hard Techno ghost produced tracks with crushing basslines and raw energy.", keyword: "hard techno ghost production" },
  "Bigroom": { title: "Bigroom EDM Ghost Production", description: "Massive Bigroom ghost produced tracks engineered for festival main stages.", keyword: "bigroom edm ghost production" },
  "Techno": { title: "Techno Ghost Production Tracks", description: "Underground and commercial Techno ghost produced tracks with full rights transfer.", keyword: "techno dj ghostproduction" },
  "Dubstep": { title: "Dubstep Ghost Production Tracks", description: "Heavy Dubstep ghost produced tracks with massive wobbles and full rights.", keyword: "dubstep ghost producer" },
  "Hip-Hop & Drill": { title: "Hip-Hop & Drill Ghost Production Beats", description: "Exclusive Hip-Hop and Drill ghost produced beats with full commercial rights.", keyword: "buy hip hop drill beats" },
  "Other": { title: "Custom EDM Ghost Production", description: "Custom ghost produced tracks across all electronic genres with full rights transfer.", keyword: "buy custom edm ghost production" },
};

// 5-tier commission system based on lifetime Euro sales
export const COMMISSION_TIERS = [
  { name: "New Seller", minSales: 0, maxSales: 4999, platformFee: 0.28, sellerPayout: 0.72 },
  { name: "Rising Seller", minSales: 5000, maxSales: 9999, platformFee: 0.25, sellerPayout: 0.75 },
  { name: "Pro Seller", minSales: 10000, maxSales: 29999, platformFee: 0.22, sellerPayout: 0.78 },
  { name: "Elite Seller", minSales: 30000, maxSales: 49999, platformFee: 0.18, sellerPayout: 0.82 },
  { name: "Legend Seller", minSales: 50000, maxSales: Infinity, platformFee: 0.15, sellerPayout: 0.85 },
] as const;

export function getSellerTier(lifetimeSalesEur: number) {
  return COMMISSION_TIERS.find(
    (t) => lifetimeSalesEur >= t.minSales && lifetimeSalesEur <= t.maxSales
  ) ?? COMMISSION_TIERS[0];
}

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

const COUNTRIES = ["NL", "USA", "DE", "SE", "FR", "IT", "PL", "AU", "UK", "ES"];

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const DEMO_AUDIO_URLS = [
  "https://cdn.pixabay.com/audio/2022/03/10/audio_c8a8e0c3e8.mp3",
  "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
  "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
  "https://cdn.pixabay.com/audio/2022/03/15/audio_c2c0e0f1e0.mp3",
  "https://cdn.pixabay.com/audio/2023/02/28/audio_550d815fa5.mp3",
  "https://cdn.pixabay.com/audio/2022/10/25/audio_24ee25f4f3.mp3",
  "https://cdn.pixabay.com/audio/2022/11/22/audio_3a8d6c9e5e.mp3",
  "https://cdn.pixabay.com/audio/2023/01/10/audio_7a9f8c0e4d.mp3",
];

export const TRACKS: Track[] = Array.from({ length: 36 }).map((_, i) => {
  const r = rng(i + 7);
  const genre = GENRES[Math.floor(r() * GENRES.length)];
  const vocalTypes: VocalType[] = ["none", "exclusive", "ai"];
  return {
    id: `trk_${i + 1}`,
    title: TITLES[i % TITLES.length] + (i >= TITLES.length ? " II" : ""),
    label: LABELS[Math.floor(r() * LABELS.length)],
    producer: PRODUCERS[Math.floor(r() * PRODUCERS.length)],
    genre,
    bpm: 118 + Math.floor(r() * 22),
    musicalKey: KEYS[Math.floor(r() * KEYS.length)],
    duration: `${4 + Math.floor(r() * 4)}:${String(Math.floor(r() * 59)).padStart(2, "0")}`,
    price: [249, 299, 349, 399, 449, 499, 599, 749, 899, 999][Math.floor(r() * 10)],
    artwork: ARTWORKS[i % ARTWORKS.length],
    audioUrl: DEMO_AUDIO_URLS[i % DEMO_AUDIO_URLS.length],
    sold: i % 11 === 0,
    hot: i < 6,
    original: i % 3 !== 0,
    tags: ["club", "festival", "warm-up", "peak-time"].slice(0, 2 + (i % 3)),
    description: "An exclusive ghost-produced master with full rights transfer. Includes WAV master, stems, MIDI, and high-resolution artwork. One sale only — once sold, gone forever.",
    country: COUNTRIES[i % COUNTRIES.length],
    vocalType: vocalTypes[i % 3],
    projectFileExists: i % 4 !== 0,
    hasVocals: i % 2 === 0,
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

// T&C content from PDF 1
export const TERMS_CONTENT = {
  version: "18-02-2026",
  clauses: [
    {
      title: "1. Definitions",
      content: `The following definitions are made for better understanding and easier reading of these Terms and Conditions of GHOSTBUS:

**GHOSTBUS:** The organization that provides services, applications, and tools as a marketplace, in the form of an online platform, that facilitates the online buying and selling of new custom-made Tracks (sound recordings/compositions) and related audio services.

**Products:** The GHOSTBUS website, related websites, services, applications, and tools.

**User(s) of GHOSTBUS:** Sellers, Buyers, and third parties acting as a natural person, or (persons representing) any legal person, accessing the website of GHOSTBUS and/or its related Products and tools.

**Seller(s) / Author(s) / Licensor(s):** Any User who registers on the Website to use the Service with the sole intention of selling their Work to Buyers.

**Buyer(s) / Licensee(s):** Any User who registers on the Website to use the Service with the sole intention of buying Works from Sellers and becoming the owner of author copyrights and neighboring rights performers' share of a Track delivered by a Seller.

**Track / Work / Product:** Master Recording, music licenses, and files (such as tracks, beats, loops, samples, sounds, etc.) composed, produced, and recorded by Sellers and offered for sale on the Website, including both the composition and the master recording.

**Ghost Production:** An economic transaction in which the Author composes and/or produces the Work, and the Buyer purchases it to publish and release it under his or her artistic name, brand, or company.

**Rights / Copyrights:** All rights derived from a composed and produced musical creation (including the composition and the master recording).`
    },
    {
      title: "2. General Terms and Conditions for Users",
      content: "These Terms and Conditions are applicable to all Users of GHOSTBUS, especially to Sellers and Buyers, and to all agreements between GHOSTBUS and Sellers or Buyers. GHOSTBUS grants Users, for their personal use only, a limited, non-exclusive, non-transferable license to access and make use of the Products."
    },
    {
      title: "3. Prohibited Activities",
      content: `Users are strictly prohibited from:
- Using samples, being the reuse of a portion of a sound recording in another recording
- Using any type of pre-recorded samples, templates, or MIDI files, unless explicitly cleared and stated
- Supplying dry/unprocessed royalty-free vocals in their track
- Posting any threatening, abusive, defamatory, obscene, or indecent material
- Circumventing temporary or permanent suspensions to use GHOSTBUS's site and services
- Harassing other Users and/or employees of GHOSTBUS
- Distributing viruses or any other technologies that may harm GHOSTBUS or its users
- Bypassing measures used to prevent or restrict access to GHOSTBUS`
    },
    {
      title: "4. Measures by GHOSTBUS",
      content: "GHOSTBUS reserves the right to refuse or delete content, restrict User usage, inform other Users to be cautious, limit or terminate GHOSTBUS service, remove hosted content, and take technical and legal steps to keep problem-creating Users off GHOSTBUS."
    },
    {
      title: "5. Custom Projects",
      content: "After a Custom Project has been created on the Website, both the Seller and the Buyer are strictly prohibited from negotiating and executing a Project transaction, including making or refunding any payments, outside the Service and the Website."
    },
    {
      title: "6. Fee, Payment, and Refunds",
      content: "The fees for GHOSTBUS's services are quoted in Euros (EUR). Buyers of Tracks are obliged to pay all GHOSTBUS fees directly when due. GHOSTBUS is entitled not to refund to Users any fees paid for use of our sites in cases of breach of these Terms, content removed by Users, or posting duplicate/illegal Tracks. A Track can only be considered sold when a payment from the Buyer is final."
    },
    {
      title: "7. Conditions for Sellers",
      content: "Sellers are able to use the Service to offer their Work for sale. Sellers may submit Ready-made Works or provide customized production services through the Custom Projects service. By using the Service, the Seller agrees to provide a quality Work that meets the specifications outlined."
    },
    {
      title: "8. Conditions for Buyers",
      content: "Buyers can use the Service to purchase Works from Sellers. After purchasing a track, the Buyer acknowledges that project files are only included if explicitly stated in the track's feature list on the product page."
    },
    {
      title: "9. About Content and Licenses",
      content: "Content stored in GHOSTBUS's Products is protected pursuant to copyright laws. Users are forbidden to copy, distribute, modify, disassemble, or reverse engineer content from GHOSTBUS. When uploading a Track, Users grant to GHOSTBUS a worldwide, exclusive, royalty-free, transferable license to use, reproduce, distribute, prepare derivative works, display, and perform the uploaded content."
    },
    {
      title: "10. Transfer of Rights by Sellers & Legal Rights of Buyers",
      content: "Sellers and Buyers understand and accept the lawfulness of digital autographs as legally binding for written agreements. Buyers can use their distinguished rights on Tracks after having bought and paid for them. The Buyer is the new Owner of the acquired Track (Master) and the associated author's rights. After payment, the Track will be removed from the GHOSTBUS store."
    },
    {
      title: "11. Handling Infringements",
      content: "Sellers guarantee that they do not post Tracks that infringe the rights of third parties. GHOSTBUS will remove a Track immediately when a confirmed infringement report is received. A User not respecting the terms and conditions and/or intellectual property rights of other Users will be charged an initial standard penalty of EUR 500.00."
    },
    {
      title: "12. General Policy on AI-Generated Content",
      content: "AI-generated content is strictly prohibited unless it has been clearly disclosed in the track listing and approved by GHOSTBUS. Any Track containing AI-generated elements must be explicitly labeled as such during the upload process."
    },
    {
      title: "13. Chargebacks and Disputes",
      content: "If a Work is purchased and the payment is reversed (chargeback/dispute), the license is automatically revoked. Publishing fraudulently obtained Works on third-party platforms (Spotify, YouTube, etc.) constitutes a material breach, and GHOSTBUS reserves the right to take legal action."
    },
    {
      title: "14. Privacy and Data Protection",
      content: "GHOSTBUS is committed to protecting user privacy in accordance with applicable data protection laws. User data is collected and processed only as necessary to provide the Services. Please refer to our Privacy Policy for complete details on how we handle your personal information."
    },
    {
      title: "15. Ending of the Relationship",
      content: "Sellers and Buyers can terminate the agreement by notifying GHOSTBUS or closing their account. GHOSTBUS can terminate the agreement in cases of breach of Terms, legal mandates, or commercial non-viability. Upon deletion of a Track or account, the Track will be immediately and completely removed from GHOSTBUS servers."
    },
    {
      title: "16. Final Provisions",
      content: "Changes in or updates of these Terms and Conditions will be immediately effective on the date of publishing on the GHOSTBUS website. If any provision in these Terms is declared invalid or unenforceable, it shall be substituted or deemed as not included, and the remaining provisions shall not be affected."
    },
    {
      title: "17. Governing Law",
      content: "These Terms and Conditions shall be governed by and construed in accordance with applicable international law. Any disputes arising under these Terms shall be resolved through the dispute resolution process established by GHOSTBUS."
    },
    {
      title: "18. Contact",
      content: "For any questions regarding these Terms and Conditions, please contact GHOSTBUS through the official support channels available on the platform. All notices must be sent via the official contact methods listed on the website."
    },
  ]
};


