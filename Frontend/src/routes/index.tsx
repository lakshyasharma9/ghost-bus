import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Zap, Award, ChevronDown,
  Music, Users, Lock, TrendingUp, Star, FileCheck, Globe
} from "lucide-react";
import { GENRES, LABELS_LIST } from "@/lib/mock-data";
import type { Track } from "@/lib/mock-data";
import { TrackCard } from "@/components/tracks/TrackCard";
import { TrackListRow } from "@/components/tracks/TrackListRow";
import { useState, useRef, useEffect } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "World's No. 1 Premium Ghost Production Marketplace — GhostBus" },
      { name: "description", content: "Buy exclusive, release-ready ghost produced tracks from verified ghost producers. Premium EDM ghost production marketplace for DJs, artists, and record labels." },
    ],
  }),
  component: Home,
});

// Updated ticker — removed 12,000+ Producers, updated badges
const TICKER = ["2,400+ Tracks Sold", "4.9 / 5 Rating", "A&R Certified", "100% Exclusive", "€1.7M Paid Out", "5/5 Verified Rating"];

const RECORD_LABELS: { name: string; logo: string; size?: "sm" | "md" | "lg" }[] = [
  { name: "Spinnin' Records", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/flat,750x,075,f-pad,750x1000,f8f8f8-Photoroom.png", size: "lg" },
  { name: "Armada Music", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/LOTM-armada-Music-1718808374-Photoroom.png", size: "md" },
  { name: "STMPD RCRDS", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/5a0cdba2b3703a82521845db9c0641ee-Photoroom.png", size: "lg" },
  { name: "Monstercat", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/143-1431483_monstercat-logo-music-by-monstercat-Photoroom.png", size: "lg" },
  { name: "Musical Freedom", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/Musical_Freedom_Records_New-Photoroom.png", size: "lg" },
  { name: "Insomniac Records", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/Best-of-Insomniac-Music-Group-2021-English-2022-20211218211210-500x500-Photoroom.png", size: "md" },
  { name: "Afterlife Records", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/Gemini_Generated_Image_p3idqap3idqap3id-Photoroom.png", size: "md" },
  { name: "Revealed Recordings", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/Revealed_Recordings_2019_Logo (2)-Photoroom.png", size: "md" },
  { name: "Dim Mak", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/LABEL LOGOS/168-1684277_dim-mak-collection-dim-mak-records-Photoroom.png", size: "lg" },
];

const MEDIA_PLATFORMS: { name: string; logo: string; size?: "sm" | "md" | "lg" }[] = [
  { name: "DJ Mag", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/dj-mag-artwork-Photoroom.png", size: "lg" },
  { name: "Beatport", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/2b554b5dd4021bd4225b57069915070b_fgraphic-Photoroom.png", size: "lg" },
  { name: "1001Tracklists", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/MIAN-Photoroom.png", size: "lg" },
  { name: "Tomorrowland", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/Tomorrowland-Photoroom.png", size: "md" },
  { name: "Amsterdam Dance Event", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/AmsterdamDanceEventLogo-Photoroom.png", size: "md" },
  { name: "edm.com", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/b5fa-16a6-48a6-937c-a937bc7fafd9-Photoroom.png", size: "lg" },
  { name: "We Rave You", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/weraveyou-Photoroom.png", size: "lg" },
  { name: "SiriusXM", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/SiriusXM black TRANSPARENT-Photoroom.png", size: "md" },
  { name: "Dancing Astronaut", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/dancing austranaoutage_jtfhs4jtfhs4jtfh-Photoroom.png", size: "lg" },
  { name: "Capital Dance", logo: "/FINALLLLLLLL LOGO TRANSPARENTs/MEDIA PLATFORMS/images (8)-Photoroom.png", size: "lg" },
];

const FEATURE_BOXES = [
  { title: "Full Copyright Ownership & NDA", desc: "100% rights with permanent worldwide usage. Legal protection with integrated Non-Disclosure Agreement.", icon: <ShieldCheck className="w-6 h-6 text-primary" />, link: null },
  { title: "Exclusive One-Time Sale", desc: "Every track is sold once and removed forever. Absolute exclusivity guaranteed.", icon: <Award className="w-6 h-6 text-primary" />, link: "/tracks" },
  { title: "A&R Verified Quality", desc: "Every track passes our A&R review and MRT originality scan before going live.", icon: <FileCheck className="w-6 h-6 text-primary" />, link: "/tracks" },
  { title: "Instant Digital Delivery", desc: "Download your complete file package — WAV, Stems, MIDI, Legal Docs — immediately after payment.", icon: <Zap className="w-6 h-6 text-primary" />, link: null },
  { title: "Complete File Package", desc: "Mastered WAV, Unmastered WAV, Stems, MIDI, Project File, and all legal documentation included.", icon: <Music className="w-6 h-6 text-primary" />, link: null },
  { title: "Confidential Transaction", desc: "Your identity stays private. The producer signs a legally binding NDA on every sale.", icon: <Lock className="w-6 h-6 text-primary" />, link: null },
];

// Animated counter component
function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const formatted = count >= 1000000
    ? `${(count / 1000000).toFixed(1)}M`
    : count >= 1000
    ? `${(count / 1000).toFixed(1)}k`
    : count.toString();

  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

// Infinite marquee for brand logos
function BrandMarquee({ brands, direction = "left", heading, subtext }: {
  brands: { name: string; logo: string; size?: "sm" | "md" | "lg" }[]; direction?: "left" | "right"; heading: string; subtext: string;
}) {
  // Logo height per size tier — all sized up significantly so they're clearly visible
  const getSizeClasses = (size?: "sm" | "md" | "lg") => {
    switch (size) {
      case "lg": return "h-14 max-w-[160px]";  // icon/compact logos — larger
      case "sm": return "h-10 max-w-[130px]";  // constrained (very wide banners)
      default:   return "h-12 max-w-[150px]";  // standard
    }
  };
  return (
    <div className="relative py-14 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 40%, #1a0f8f 100%)" }} />
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(90,60,255,0.18) 0%, transparent 70%)" }} />
      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
      />

      {/* Header — no badge */}
      <div className="container-app relative mb-10 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(100,80,255,0.4)" }}>
          {heading}
        </h2>
        <p className="mt-2 text-sm text-white/50 max-w-lg mx-auto leading-relaxed">{subtext}</p>
      </div>

      {/* Fade edges — short so logos disappear quickly */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #060226, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #060226, transparent)" }} />

      {/* Marquee track */}
      <div className="overflow-hidden relative">
        <div className={`flex gap-1 items-center ${direction === "right" ? "animate-marquee-reverse" : "animate-marquee"} whitespace-nowrap`}>
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center justify-center cursor-default select-none px-4"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className={`${getSizeClasses(brand.size)} w-auto object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Type for Recently Sold API response ──
interface RecentlySoldItem {
  id: string;
  trackName: string;
  genre: string;
  imageUrl: string | null;
  soldAt: string;
  displayOrder: number;
}

function Home() {
  const [view, setView] = useState<"grid" | "list">("list");
  const [topTracksView, setTopTracksView] = useState<"grid" | "list">("list");
  const [newReleasesPage, setNewReleasesPage] = useState(0);
  const [genres, setGenres] = useState<string[]>([]);

  // Fetch real approved tracks from API
  const { data: realTracksData } = useQuery<Track[]>({
    queryKey: ["marketplace-tracks"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/tracks?limit=50&sortBy=createdAt`);
        if (!res.ok) return [];
        const json = await res.json();
        const apiTracks = json.data?.tracks ?? [];
        return apiTracks.map((t: any) => ({
          id: t.id,
          title: t.title,
          label: t.seller?.fullName || t.seller?.username || 'GhostBus',
          producer: t.seller?.fullName || t.seller?.username || 'Unknown',
          genre: t.genre,
          bpm: t.bpm || 128,
          musicalKey: t.key || 'C maj',
          duration: '',
          price: t.price,
          artwork: t.coverUrl || '',
          audioUrl: t.previewUrl || '',
          sold: t.sold || false,
          hot: false,
          original: t.transparency === 'original',
          tags: t.tags || [],
          description: t.description || '',
          seller: t.seller,
          sellerUsername: t.seller?.username || t.seller?.id,
        }));
      } catch { return []; }
    },
    staleTime: 30_000,
  });

  const realTracks = realTracksData ?? [];

  // Genre filter applies to New Releases
  const filtered = genres.length > 0 ? realTracks.filter((t) => genres.includes(t.genre)) : realTracks;

  // Top Tracks — first 5 real tracks
  const curated = realTracks.slice(0, 5);

  // New Releases — genre-filtered real tracks (paginated)
  const allNewReleases = filtered;

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(allNewReleases.length / PAGE_SIZE);
  const newReleases = allNewReleases.slice(newReleasesPage * PAGE_SIZE, (newReleasesPage + 1) * PAGE_SIZE);

  const toggleGenre = (g: string) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  // ── Fetch real Recently Sold data from API ──
  // Uses plain fetch (no auth interceptor) since this is a public endpoint
  const { data: recentlySoldData, isLoading: recentlySoldLoading } = useQuery({
    queryKey: ["recently-sold"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/recently-sold`
        );
        if (!res.ok) return [] as RecentlySoldItem[];
        const json = await res.json();
        return (json.data?.items ?? []) as RecentlySoldItem[];
      } catch {
        return [] as RecentlySoldItem[];
      }
    },
    staleTime: 0,             // always consider stale so it refetches on page visit
    refetchInterval: 60_000,  // live feed: refresh every 60s
    refetchOnWindowFocus: true,
  });

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative -mt-[72px] min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/12749811_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,2,38,0.10),transparent_60%)]" />
        </div>

        <div className="container-app relative pt-24 pb-16 md:pt-32 md:pb-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-border text-xs font-semibold tracking-widest uppercase"
          >
            Premium Ghost Production Marketplace
          </motion.span>

          {/* Updated H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-8 font-display font-bold tracking-[-0.035em] text-[clamp(32px,6vw,68px)] leading-[1.05]"
          >
            World's No. 1 Premium <br />
            <span style={{ color: "#000019" }}>
              Ghost Production Marketplace
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-base md:text-lg text-foreground font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Buy Exclusive, Release-Ready Tracks From Verified Ghost Producers. <br className="hidden md:block" />
            Premium Music Production Services For DJs, Artists, And Record Labels.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/tracks" className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(6,2,38,0.35)]">
              Browse Tracks <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/services" className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-foreground text-background font-semibold hover:bg-foreground/90 transition shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              Start Custom Order
            </Link>
          </motion.div>

          {/* Updated trust badges — A&R Certified, 5/5 Verified Rating, 24/7 Available */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-foreground/70"
          >
            <TrustBadge icon={<ShieldCheck className="w-4 h-4 text-primary" />}>100% Rights Transfer</TrustBadge>
            <TrustBadge icon={<Award className="w-4 h-4 text-primary" />}>One Sale Only</TrustBadge>
            <TrustBadge icon={<FileCheck className="w-4 h-4 text-primary" />}>A&R Certified</TrustBadge>
            <TrustBadge icon={<Star className="w-4 h-4 text-primary" />}>5/5 Verified Rating</TrustBadge>
            <TrustBadge icon={<Globe className="w-4 h-4 text-primary" />}>24/7 Available</TrustBadge>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground tracking-widest uppercase"
        >
          Scroll
        </motion.div>
      </section>

      {/* ── RECENTLY SOLD LIVE FEED ── */}
      <RecentlySoldSection items={recentlySoldData ?? []} isLoading={recentlySoldLoading} />

      {/* ── CAROUSEL 1: Record Labels ── */}
      <BrandMarquee
        brands={RECORD_LABELS}
        direction="left"
        heading="Released On Leading EDM Labels"
        subtext="Tracks from our premium marketplace have been released on globally recognized electronic music labels."
      />

      {/* ── GENRE FILTER ── */}
      <section className="container-app pt-8">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <div className="label-eyebrow mb-2">Browse by Genre</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Find your sound</h2>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
          <Chip active={genres.length === 0} onClick={() => setGenres([])}>All</Chip>
          {GENRES.map((g) => (
            <Chip key={g} active={genres.includes(g)} onClick={() => toggleGenre(g)}>{g}</Chip>
          ))}
        </div>
      </section>

      {/* ── A&R CURATED TOP TRACKS (5 tracks) with Grid/List toggle ── */}
      <section className="container-app pt-12">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="label-eyebrow mb-2">A&R Curated Selection</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Top Tracks</h2>
          </div>
          <div className="inline-flex p-1 rounded-full bg-muted text-sm">
            <button onClick={() => setTopTracksView("grid")} className={`px-4 h-9 rounded-full transition ${topTracksView === "grid" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>Grid</button>
            <button onClick={() => setTopTracksView("list")} className={`px-4 h-9 rounded-full transition ${topTracksView === "list" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>List</button>
          </div>
        </div>
        {topTracksView === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {curated.map((t) => (
              <TrackCard key={t.id} track={t} queue={curated} />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {curated.map((t) => (
              <TrackListRow key={t.id} track={t} queue={curated} />
            ))}
          </div>
        )}
      </section>

      {/* ── NEW RELEASES (10 per page) ── */}
      <section className="container-app pt-16">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="label-eyebrow mb-2">Just Approved</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">New Releases</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex p-1 rounded-full bg-muted text-sm">
              <button onClick={() => setView("grid")} className={`px-4 h-9 rounded-full transition ${view === "grid" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>Grid</button>
              <button onClick={() => setView("list")} className={`px-4 h-9 rounded-full transition ${view === "list" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>List</button>
            </div>
          </div>
        </div>
        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {newReleases.map((t) => <TrackCard key={t.id} track={t} queue={newReleases} />)}
          </div>
        ) : (
          <div className="space-y-2.5">
            {newReleases.map((t) => <TrackListRow key={t.id} track={t} queue={newReleases} />)}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 mb-12">
            <button
              onClick={() => setNewReleasesPage((p) => Math.max(0, p - 1))}
              disabled={newReleasesPage === 0}
              className="h-10 px-5 rounded-full border border-border bg-card text-sm font-medium disabled:opacity-40 hover:border-primary/40 hover:bg-primary/5 active:scale-95 active:bg-primary/10 transition-all duration-150 select-none"
            >
              ← Prev
            </button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {newReleasesPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setNewReleasesPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={newReleasesPage === totalPages - 1}
              className="h-10 px-5 rounded-full border border-border bg-card text-sm font-medium disabled:opacity-40 hover:border-primary/40 hover:bg-primary/5 active:scale-95 active:bg-primary/10 transition-all duration-150 select-none"
            >
              Next →
            </button>
          </div>
        )}
      </section>

      {/* ── CAROUSEL 2: Media Platforms (reverse direction) ── */}
      <BrandMarquee
        brands={MEDIA_PLATFORMS}
        direction="right"
        heading="Featured Across Global EDM Platforms & Media"
        subtext="Our exclusive EDM ghost production tracks have appeared across globally recognized media, festival, streaming, and DJ platforms."
      />

      {/* ── 6-BOX GLASSMORPHIC FEATURE GRID ── */}
      <section className="container-app pt-24">
        <div className="text-center mb-10">
          <div className="label-eyebrow mb-3">Why GhostBus</div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Premium Industry Level Standard</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Exclusive releases with your own Signature Sonic Identity for top global charts.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_BOXES.map((box) => {
            const inner = (
              <div className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(6,2,38,0.12)] transition-all duration-300 hover:-translate-y-1.5 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-primary/10 grid place-items-center mb-4 group-hover:bg-primary/15 transition-colors">
                  {box.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{box.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{box.desc}</p>
                {box.link && (
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium">
                    Browse tracks <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </div>
            );
            return box.link
              ? <Link key={box.title} to={box.link}>{inner}</Link>
              : <div key={box.title}>{inner}</div>;
          })}
        </div>
      </section>

      {/* ── PAYOUT COUNTER + SELLER SATISFACTION ── */}
      <section className="container-app pt-24">
        <div className="rounded-[32px] bg-gradient-to-br from-[#090446] to-[#1a0f8f] text-white p-8 md:p-16 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="label-eyebrow text-white/50 mb-6">Platform Stats</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-10">The Most Rewarding Premium EDM Ghost Production Marketplace</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
              <Metric value={<><AnimatedCounter target={1700000} prefix="€" />+</>} label="Total Producer Payouts" />
              <Metric value={<><AnimatedCounter target={2400} />+</>} label="Tracks Sold" />
              <Metric value={<><AnimatedCounter target={98} />%</>} label="Buyer Satisfaction" />
              <Metric value="24/7" label="Platform Available" />
            </div>
            {/* 5/5 Seller Satisfaction */}
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl w-fit">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-white">5/5 Seller Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container-app pt-28">
        <div className="rounded-[32px] text-white p-8 md:p-20 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 40%, #1a0f8f 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(90,60,255,0.18) 0%, transparent 70%)" }} />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="label-eyebrow text-white/50 mb-4">For Producers</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Sell once. Sell big.</h2>
            <p className="mt-5 text-white/70 text-lg max-w-lg">Sell exclusive ghost productions on the most curated marketplace in the industry. Earn up to 85%.</p>
            <Link to="/sell" className="mt-8 inline-flex h-12 px-6 items-center gap-2 rounded-full bg-white text-[#060226] font-medium hover:scale-[1.02] transition">
              Become a Seller <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEO ACCORDION CONTENT ── */}
      <section className="container-app pt-28 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="label-eyebrow mb-3">About GhostBus</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4">Professional EDM Ghost Production Marketplace</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Top EDM Ghost Production Marketplace — Buy Exclusive Tracks From The Industry's Premier Platform</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <p className="text-foreground/80 leading-relaxed mb-4">
              Welcome to <strong className="text-foreground">GHOSTBUS</strong>, a next-generation EDM Ghost Production Marketplace built for professional DJs, touring artists, record labels, music producers, entertainment brands, and creators worldwide.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Our marketplace hosts a growing catalog of professionally crafted ghost produced tracks across multiple electronic genres, providing artists with secure access to exclusive music backed by complete ownership rights, confidential transactions, and industry-standard production quality.
            </p>
          </div>

          <Accordion.Root type="multiple" className="space-y-3">
            <AItem value="what-is"><ATrigger>What Is Ghost Production?</ATrigger>
              <AContent>
                <p className="text-foreground/80 leading-relaxed mb-3">Ghost Production is a professional music industry service where experienced audio engineers and music producers create original tracks for DJs, artists, entertainment brands, and record labels. Once purchased, all commercial ownership rights are transferred to the buyer.</p>
                <Link to="/what-is-ghost-production" className="text-primary text-sm hover:underline">Learn more →</Link>
              </AContent>
            </AItem>
            <AItem value="why-djs"><ATrigger>Why Professional DJs Use Ghost Production</ATrigger>
              <AContent>
                <p className="text-foreground/80 leading-relaxed mb-3">Many artists balancing international tours, live performances, and marketing campaigns simply do not have the time to maintain a constant studio workflow. Ghost production allows them to maintain release velocity while focusing on performances and brand building.</p>
              </AContent>
            </AItem>
            <AItem value="why-ghostbus"><ATrigger>Why Artists Choose GHOSTBUS</ATrigger>
              <AContent>
                <div className="grid md:grid-cols-2 gap-2 mb-3">
                  {["100% Copyright Transfer", "Master Rights Ownership", "Royalty-Free Commercial Usage", "Streaming Monetization Rights", "Performance Rights", "Confidential NDA Protection"].map((r) => (
                    <div key={r} className="text-sm text-foreground/70">✓ {r}</div>
                  ))}
                </div>
              </AContent>
            </AItem>
            <AItem value="genres"><ATrigger>Explore Our Premium Genre Marketplace</ATrigger>
              <AContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {GENRES.map((g) => (
                    <Link key={g} to={`/genres/${g.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="bg-accent border border-border rounded-lg px-3 py-2 text-sm font-medium text-center hover:border-primary/40 hover:text-primary transition">
                      {g}
                    </Link>
                  ))}
                </div>
              </AContent>
            </AItem>
          </Accordion.Root>

          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            <Link to="/tracks" className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[--color-primary-hover] transition shadow-[0_8px_24px_rgba(6,2,38,0.30)]">
              Browse Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/what-is-ghost-production" className="h-12 px-6 inline-flex items-center gap-2 rounded-full border border-border bg-card font-medium hover:border-primary/40 transition">
              What Is Ghost Production?
            </Link>
            <Link to="/licensing-legal" className="h-12 px-6 inline-flex items-center gap-2 rounded-full border border-border bg-card font-medium hover:border-primary/40 transition">
              Licensing &amp; Legal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Recently Sold LIVE FEED component ──
function RecentlySoldSection({ items, isLoading }: { items: RecentlySoldItem[]; isLoading?: boolean }) {
  const [paused, setPaused] = useState(false);

  // Heading with properly inline red dot after "Live"
  const SectionHeading = () => (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Recently Sold{" "}
        <span className="inline-flex items-center gap-1.5">
          Live
          <span className="relative inline-flex h-2.5 w-2.5" style={{ verticalAlign: "middle" }}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        </span>
      </h2>
      <span className="text-sm text-muted-foreground hidden sm:block">Exclusive tracks recently sold to artists worldwide.</span>
    </div>
  );

  // Need at least 1 item to render the marquee
  // While loading or empty, show a skeleton placeholder row
  if (isLoading || items.length === 0) {
    return (
      <section className="pt-12 pb-16">
        <div className="container-app">
          <SectionHeading />
        </div>
        {/* Skeleton cards */}
        <div className="overflow-hidden px-6">
          <div className="flex gap-2" style={{ width: "max-content" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center animate-pulse"
                style={{
                  width: 220, height: 68,
                  background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                }}
              >
                <div style={{ width: 68, height: 68, background: "rgba(255,255,255,0.06)", borderRadius: "10px 0 0 10px" }} />
                <div className="flex-1 px-3 space-y-2">
                  <div style={{ height: 10, width: "70%", background: "rgba(255,255,255,0.08)", borderRadius: 4 }} />
                  <div style={{ height: 8, width: "45%", background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Triple the array for seamless infinite scroll
  const display = [...items, ...items, ...items];

  return (
    <section className="pt-12 pb-16">
      <div className="container-app">
        <SectionHeading />
      </div>

      {/* Marquee carousel — full width, pauses in-place on hover */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex gap-2 px-6 animate-marquee"
          style={{ width: "max-content", animationPlayState: paused ? "paused" : "running" }}
        >
          {display.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="shrink-0 relative overflow-hidden flex items-center"
              style={{
                width: 220,
                height: 68,
                background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
              }}
            >
              {/* Square artwork — flush left */}
              <div
                className="shrink-0 bg-cover bg-center"
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "10px 0 0 10px",
                  ...(item.imageUrl
                    ? { backgroundImage: `url(${item.imageUrl})` }
                    : { background: "rgba(255,255,255,0.08)" }),
                }}
              >
                {!item.imageUrl && (
                  <div className="w-full h-full grid place-items-center">
                    <span className="text-white font-bold text-base">G</span>
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0 px-3">
                <div
                  className="font-semibold text-white truncate"
                  style={{ fontSize: 12, lineHeight: "1.3" }}
                >
                  {item.trackName}
                </div>
                <div
                  className="truncate mt-0.5"
                  style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}
                >
                  {item.genre}
                </div>
              </div>

              {/* Red diagonal SOLD corner ribbon */}
              <div
                className="absolute top-0 right-0 overflow-hidden"
                style={{ width: 48, height: 48, pointerEvents: "none" }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: -18,
                    width: 72,
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textAlign: "center",
                    padding: "2.5px 0",
                    transform: "rotate(45deg)",
                    transformOrigin: "center",
                    textTransform: "uppercase",
                  }}
                >
                  SOLD
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyGenreState({ genre }: { genre?: string }) {
  return (
    <div className="py-16 text-center bg-card border border-border rounded-2xl">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 grid place-items-center mb-4">
        <span className="text-2xl">🎵</span>
      </div>
      <h3 className="font-semibold text-lg mb-2">Very Limited in {genre || "this genre"}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
        This genre is in high demand. Tracks sell fast — check back soon or browse all available tracks.
      </p>
      <Link to="/tracks" className="mt-5 inline-flex h-10 px-5 items-center gap-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-[--color-primary-hover] transition">
        View All Tracks <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function Metric({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl font-bold text-white">{value}</div>
      <div className="text-white/60 text-sm mt-1">{label}</div>
    </div>
  );
}

function TrustBadge({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2">{icon}{children}</span>;
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-10 px-4 rounded-full border text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[0_8px_24px_rgba(6,2,38,0.35)]"
          : "bg-card border-border hover:border-primary/40 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function AItem({ children, value }: { children: React.ReactNode; value: string }) {
  return <Accordion.Item value={value} className="bg-card border border-border rounded-xl overflow-hidden">{children}</Accordion.Item>;
}

function ATrigger({ children }: { children: React.ReactNode }) {
  return (
    <Accordion.Header>
      <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold hover:bg-accent transition-colors group">
        <span>{children}</span>
        <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </Accordion.Trigger>
    </Accordion.Header>
  );
}

function AContent({ children }: { children: React.ReactNode }) {
  return (
    <Accordion.Content className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
      <div className="px-6 pb-5 pt-1">{children}</div>
    </Accordion.Content>
  );
}
