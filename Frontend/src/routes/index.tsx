import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Award, Sparkles, ChevronDown, Music, Users, Lock, TrendingUp } from "lucide-react";

import { TRACKS, GENRES, LABELS_LIST } from "@/lib/mock-data";
import { TrackCard } from "@/components/tracks/TrackCard";
import { TrackListRow } from "@/components/tracks/TrackListRow";
import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GhostBus — Premium Ghost Production Marketplace" },
      { name: "description", content: "Exclusive ghost-produced tracks. Full rights transfer. One sale only. The luxury marketplace for elite DJs and labels." },
    ],
  }),
  component: Home,
});

const TICKER = ["2,400+ Tracks Sold", "4.9 / 5 Rating", "Instant Delivery", "100% Exclusive", "Global Producers", "DJMonitor Verified"];

function Home() {
  const hot = TRACKS.filter((t) => !t.sold).slice(0, 8);
  const sold = TRACKS.filter((t) => t.sold).slice(0, 4);
  const [view, setView] = useState<"grid" | "list">("list");
  const [genres, setGenres] = useState<string[]>([]);
  const filtered = genres.length > 0 ? hot.filter((t) => genres.includes(t.genre)) : hot;

  const toggleGenre = (g: string) =>
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );

  return (
    <>
      {/* HERO */}
      <section className="relative -mt-[72px] min-h-[100svh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/12749811_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(10,132,255,0.12),transparent_60%)]" />
        </div>

        <div className="container-app relative pt-32 pb-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-border text-xs font-semibold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Premium Ghost Production Marketplace
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-8 font-display font-bold tracking-[-0.035em] text-[clamp(36px,7vw,72px)] leading-[1.05]"
          >
            Professional EDM <br />
            <span style={{ background: 'linear-gradient(135deg, #090446 0%, #1a0f8f 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Ghost Production Marketplace</span>
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
            <Link to="/tracks" className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(10,132,255,0.3)]">
              Browse Tracks <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/services" className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-foreground text-background font-semibold hover:bg-foreground/90 transition shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              Start Custom Order
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-foreground/70"
          >
            <Badge icon={<ShieldCheck className="w-4 h-4 text-primary" />}>100% Rights Transfer</Badge>
            <Badge icon={<Award className="w-4 h-4 text-primary" />}>One Sale Only</Badge>
            <Badge icon={<ShieldCheck className="w-4 h-4 text-primary" />}>DJMonitor Verified</Badge>
            <Badge icon={<Zap className="w-4 h-4 text-primary" />}>Instant Download</Badge>
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

      {/* TICKER */}
      <section className="bg-[--color-surface] border-y border-border overflow-hidden">
        <div className="py-5 flex animate-marquee whitespace-nowrap">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="mx-8 text-sm font-medium text-foreground/70 inline-flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* GENRES */}
      <section className="container-app pt-20">
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

      {/* HOT PICKS */}
      <section className="container-app pt-12">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="label-eyebrow mb-2">Curated Selection</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Latest Hot Picks</h2>
          </div>
          <div className="inline-flex p-1 rounded-full bg-muted text-sm">
            <button onClick={() => setView("grid")} className={`px-4 h-9 rounded-full transition ${view === "grid" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>Grid</button>
            <button onClick={() => setView("list")} className={`px-4 h-9 rounded-full transition ${view === "list" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}>List</button>
          </div>
        </div>

        {view === "grid" ? (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filtered.map((t) => (
              <motion.div key={t.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <TrackCard track={t} queue={filtered} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((t) => <TrackListRow key={t.id} track={t} queue={filtered} />)}
          </div>
        )}
      </section>

      {/* RECENTLY SOLD */}
      <section className="container-app pt-24">
        <div className="mb-8">
          <div className="label-eyebrow mb-2">Hall of Fame</div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Recently Sold</h2>
          <p className="text-muted-foreground mt-2">Once sold, gone forever. That's exclusivity.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {sold.map((t) => <TrackCard key={t.id} track={t} />)}
        </div>
      </section>

      {/* TOP LABELS */}
      <section className="container-app pt-24">
        <div className="mb-8">
          <div className="label-eyebrow mb-2">Featured Imprints</div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Top Labels</h2>
        </div>
        <div className="flex gap-5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
          {LABELS_LIST.map((l) => (
            <motion.div
              whileHover={{ y: -4 }}
              key={l.id}
              className="min-w-[260px] bg-card rounded-2xl border border-border p-6 hover:shadow-[0_10px_30px_rgba(10,132,255,0.12)] transition"
            >
              <div className="w-14 h-14 rounded-2xl mb-5" style={{ background: `linear-gradient(135deg, hsl(${l.hue} 70% 65%), hsl(${l.hue + 40} 70% 55%))` }} />
              <div className="font-semibold text-lg">{l.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{l.trackCount} tracks · {l.sales} sales</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-app pt-28">
        <div className="rounded-[32px] bg-gradient-to-br from-foreground to-[#1a1a1a] text-background p-12 md:p-20 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <div className="label-eyebrow text-background/60 mb-4">For Producers</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Sell once. Sell big.</h2>
            <p className="mt-5 text-background/70 text-lg max-w-lg">List exclusive ghost productions on the most curated marketplace in the industry.</p>
            <Link to="/sell" className="mt-8 inline-flex h-12 px-6 items-center gap-2 rounded-full bg-background text-foreground font-medium hover:scale-[1.02] transition">
              Become a Seller <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO CONTENT SECTION */}
      <section className="container-app pt-28 pb-32">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="label-eyebrow mb-3">About GhostBus</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Professional Music Marketplace
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Top EDM Ghost Production Marketplace — Buy Exclusive Tracks From The Industry's Premier Platform
            </p>
          </div>

          {/* Intro Text */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <p className="text-foreground/80 leading-relaxed mb-4">
              Welcome to <strong className="text-foreground">GHOSTBUS</strong>, a next-generation EDM Ghost Production Marketplace built for professional DJs, touring artists, record labels, music producers, entertainment brands, and creators worldwide. As a premium platform specializing in exclusive, royalty-free electronic music, GHOSTBUS delivers festival-ready productions engineered to modern commercial standards.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Our marketplace hosts a growing catalog of professionally crafted ghost produced tracks across multiple electronic genres, providing artists with secure access to exclusive music backed by complete ownership rights, confidential transactions, and industry-standard production quality.
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-accent border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Licensing Systems</h3>
              <p className="text-sm text-muted-foreground">Protected transactions with full legal documentation</p>
            </div>
            <div className="bg-accent border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Digital Delivery</h3>
              <p className="text-sm text-muted-foreground">Download complete packages immediately after purchase</p>
            </div>
            <div className="bg-accent border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Industry-Level Audio Standards</h3>
              <p className="text-sm text-muted-foreground">Professional mixing and mastering for all platforms</p>
            </div>
            <div className="bg-accent border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Verified Producer Network</h3>
              <p className="text-sm text-muted-foreground">Curated professionals with proven track records</p>
            </div>
          </div>

          {/* Accordion Sections */}
          <Accordion.Root type="multiple" className="space-y-3">
            {/* What Is Ghost Production */}
            <AccordionItem value="what-is">
              <AccordionTrigger>What Is Ghost Production?</AccordionTrigger>
              <AccordionContent>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Ghost Production is a professional music industry service where experienced audio engineers and music producers create original tracks for DJs, artists, entertainment brands, and record labels.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Once purchased, all commercial ownership rights are transferred to the buyer, allowing the track to be legally released, monetized, distributed, and promoted under the buyer's own artist name while the original producer remains anonymous.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Ghost production has become a globally recognized part of the modern electronic music industry, trusted by artists worldwide.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Why DJs Use Ghost Production */}
            <AccordionItem value="why-djs">
              <AccordionTrigger>Why Professional DJs Use Ghost Production</AccordionTrigger>
              <AccordionContent>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  The global electronic music industry operates at an extremely fast pace. Many artists balancing international tours, live performances, content creation, radio appearances, label schedules, and marketing campaigns simply do not have the time required to maintain a constant studio workflow.
                </p>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">Maintain consistent release schedules</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">Expand their music catalog faster</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">Focus on touring and performances</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">Strengthen artist branding</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">Access advanced production expertise</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">Release industry-standard music regularly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">Compete professionally in the streaming era</span>
                  </div>
                </div>
                <div className="bg-accent rounded-lg p-4">
                  <p className="text-sm text-foreground/70"><strong>Optimized for:</strong> Spotify, Apple Music, Beatport, SoundCloud, YouTube, Club Sound Systems, Radio Broadcasting, Commercial Sync Usage</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Why Choose GHOSTBUS */}
            <AccordionItem value="why-ghostbus">
              <AccordionTrigger>Why Artists Choose GHOSTBUS</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Exclusive Marketplace System
                    </h4>
                    <p className="text-foreground/80 text-sm leading-relaxed mb-3">
                      Every track listed on GHOSTBUS is sold only once. Once purchased, the track is permanently removed from the marketplace, guaranteeing complete exclusivity for the buyer.
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="text-sm text-foreground/70">✓ 100% Copyright Transfer</div>
                      <div className="text-sm text-foreground/70">✓ Master Rights Ownership</div>
                      <div className="text-sm text-foreground/70">✓ Royalty-Free Commercial Usage</div>
                      <div className="text-sm text-foreground/70">✓ Streaming Monetization Rights</div>
                      <div className="text-sm text-foreground/70">✓ Performance Rights</div>
                      <div className="text-sm text-foreground/70">✓ Confidential NDA Protection</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">What You Receive With Every Purchase</h4>
                    <div className="bg-accent rounded-lg p-4 space-y-2 text-sm text-foreground/80">
                      <div>• Professionally Mixed & Mastered WAV</div>
                      <div>• High Quality MP3 Version</div>
                      <div>• Unmastered Version</div>
                      <div>• Individual Audio Stems</div>
                      <div>• Full MIDI Files</div>
                      <div>• Project Files (when included)</div>
                      <div>• Legal Ownership Documentation</div>
                      <div>• Secure Instant Download Access</div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Genres */}
            <AccordionItem value="genres">
              <AccordionTrigger>Explore Our Premium Genre Marketplace</AccordionTrigger>
              <AccordionContent>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Our producer network specializes in high-end electronic music production across multiple genres and subgenres.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    "Tech House", "Melodic Techno", "Afro House", "Progressive House",
                    "Drum & Bass", "Big Room", "Hard Techno", "Bass House",
                    "Dubstep", "Future Rave", "Hardstyle", "UK Garage",
                    "Deep House", "Pop", "Reggaeton"
                  ].map((genre) => (
                    <div key={genre} className="bg-accent border border-border rounded-lg px-3 py-2 text-sm font-medium text-center">
                      {genre}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Label Standards */}
            <AccordionItem value="labels">
              <AccordionTrigger>Engineered To Major Label Standards</AccordionTrigger>
              <AccordionContent>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Productions sourced through the GHOSTBUS network are designed to compete within the modern electronic music industry at a professional commercial level.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Our producers create music inspired by the sonic quality standards associated with labels such as:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "STMPD RCRDS", "Spinnin' Records", "Revealed Recordings", "Armada Music",
                    "Musical Freedom", "Afterlife", "Drumcode", "Defected Records",
                    "Toolroom", "Monstercat", "Mau5trap", "Heldeep Records",
                    "Dirtybird", "Subsidia", "Protocol Recordings", "Hexagon HQ",
                    "Anjunadeep", "Axtone", "Dharma Worldwide", "Insomniac Records"
                  ].map((label) => (
                    <span key={label} className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium">
                      {label}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Future Vision */}
            <AccordionItem value="vision">
              <AccordionTrigger>Built For The Future Of Electronic Music</AccordionTrigger>
              <AccordionContent>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  GHOSTBUS is built around a long-term vision to become the world's leading professional ghost production marketplace.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm mb-1">Secure Global Transactions</div>
                      <div className="text-xs text-muted-foreground">Protected payments and instant delivery worldwide</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm mb-1">Exclusive Music Ownership</div>
                      <div className="text-xs text-muted-foreground">One sale only, complete rights transfer</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm mb-1">Verified Producer Ecosystems</div>
                      <div className="text-xs text-muted-foreground">Curated network of professional creators</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm mb-1">Artist Career Development</div>
                      <div className="text-xs text-muted-foreground">Tools and support for growing artists</div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion.Root>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            <Link to="/tracks" className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[--color-primary-hover] transition shadow-[0_8px_24px_rgba(10,132,255,0.25)]">
              Browse Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/apply-seller" className="h-12 px-6 inline-flex items-center gap-2 rounded-full border border-border bg-card font-medium hover:border-primary/40 transition">
              Apply To Become A Ghost Producer
            </Link>
            <Link to="/legal" className="h-12 px-6 inline-flex items-center gap-2 rounded-full border border-border bg-card font-medium hover:border-primary/40 transition">
              Licensing & Legal Information
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2">{icon}{children}</span>;
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-10 px-4 rounded-full border text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[0_8px_24px_rgba(10,132,255,0.28)]"
          : "bg-card border-border hover:border-primary/40 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}


function AccordionItem({ children, value }: { children: React.ReactNode; value: string }) {
  return (
    <Accordion.Item value={value} className="bg-card border border-border rounded-xl overflow-hidden">
      {children}
    </Accordion.Item>
  );
}

function AccordionTrigger({ children }: { children: React.ReactNode }) {
  return (
    <Accordion.Header>
      <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold hover:bg-accent transition-colors group">
        <span>{children}</span>
        <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </Accordion.Trigger>
    </Accordion.Header>
  );
}

function AccordionContent({ children }: { children: React.ReactNode }) {
  return (
    <Accordion.Content className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
      <div className="px-6 pb-5 pt-1">
        {children}
      </div>
    </Accordion.Content>
  );
}
