import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Headphones, ShieldCheck, Download, Crown, Globe,
  User, FileCheck, Upload, DollarSign, BarChart2, Wallet,
  ChevronRight, ArrowRight, Check
} from "lucide-react";

export const Route = createFileRoute("/how-we-work")({
  head: () => ({
    meta: [
      { title: "How GhostBus Works — Buy & Sell Exclusive Ghost Productions" },
      { name: "description", content: "Learn how to buy exclusive ghost-produced tracks or sell your music on GhostBus — the world's No.1 premium ghost production marketplace." },
    ],
  }),
  component: HowWeWork,
});

// ─────────────────────────────────────────────
// DATA — BUYER STEPS
// ─────────────────────────────────────────────
const BUYER_STEPS = [
  {
    icon: <Search className="w-6 h-6" />,
    label: "STEP 1 — DISCOVER",
    title: "Browse the Catalogue",
    body: "Browse an extensive catalogue of exclusive ghost-produced music across today's most popular electronic genres. Quickly filter tracks by Genre, BPM, Musical Key, Price, or Vocal / Instrumental.",
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    label: "STEP 2 — PREVIEW",
    title: "Listen Before You Buy",
    body: "Listen to a professional high-quality preview before purchasing. Every preview lets you evaluate overall production quality, melody, groove, arrangement, energy, mix quality, and sound design.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    label: "STEP 3 — SECURE",
    title: "Complete Your Purchase",
    body: "Complete your purchase through our secure checkout. Supported payment methods include Credit & Debit Cards, PayPal, Apple Pay, and Google Pay — all encrypted to modern payment security standards.",
  },
  {
    icon: <Download className="w-6 h-6" />,
    label: "STEP 4 — INSTANT DELIVERY",
    title: "Download Immediately",
    body: "Immediately after payment your complete production package becomes available inside your GHOSTBUS account. No waiting. No manual approval. No email requests. Everything is delivered instantly.",
  },
  {
    icon: <Crown className="w-6 h-6" />,
    label: "STEP 5 — OWNERSHIP",
    title: "Become the Exclusive Owner",
    body: "Once your purchase is complete, ownership is officially transferred to you. Your track is permanently removed from the marketplace. You become the only licensed owner of that production.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    label: "STEP 6 — RELEASE",
    title: "Release Worldwide",
    body: "Publish under your own artist or label name using any distributor — Spotify, Apple Music, Beatport, Amazon Music, YouTube Music, SoundCloud, Traxsource, TIDAL, TikTok, Deezer, and more. You keep 100% of royalties.",
  },
];

// ─────────────────────────────────────────────
// DATA — SELLER STEPS
// ─────────────────────────────────────────────
const SELLER_STEPS = [
  {
    icon: <User className="w-6 h-6" />,
    num: "01",
    title: "Create Your Account",
    body: "Create your free GHOSTBUS seller account in minutes. Build your professional producer profile with your artist name, biography, production experience, preferred genres, and portfolio links.",
  },
  {
    icon: <FileCheck className="w-6 h-6" />,
    num: "02",
    title: "Apply to Become a Ghost Producer",
    body: "Complete the Become a Ghost Producer application form. Every application is individually reviewed by our A&R team to maintain the high quality standards of the GHOSTBUS marketplace.",
    cta: { label: "Apply to Become a Seller", href: "/apply-seller" },
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    num: "03",
    title: "Professional Application Review",
    body: "Every application is personally reviewed. We evaluate music production quality, mixing and mastering standards, originality, commercial potential, genre expertise, and overall production consistency. Most applications are reviewed within 2–3 business days.",
  },
  {
    icon: <Crown className="w-6 h-6" />,
    num: "04",
    title: "Complete Identity Verification",
    body: "Before publishing tracks or requesting payouts, every seller must complete identity verification via National Identity Card and Phone Number. Your personal information is securely encrypted.",
  },
  {
    icon: <Upload className="w-6 h-6" />,
    num: "05",
    title: "Upload Your Exclusive Music",
    body: "Once approved, upload your exclusive productions including Mastered WAV, Unmastered Mixdown, Stem Files, MIDI Files, AI/Exclusive Vocals, Lyrics PDF, and Project File (recommended).",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    num: "06",
    title: "Set Your Selling Price",
    body: "Choose the price that reflects the quality and commercial value of your production. Typical pricing ranges from €149 to €2,000. Our team reviews pricing to ensure consistency while maximising your earning potential.",
  },
  {
    icon: <FileCheck className="w-6 h-6" />,
    num: "07",
    title: "Professional Quality Review",
    body: "Every uploaded track undergoes a comprehensive quality review covering Audio Quality, Mixing, Mastering, Arrangement, Commercial Potential, Originality, and Copyright Compliance. Most reviews are completed within 72 hours.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    num: "08",
    title: "Track Goes Live Worldwide",
    body: "After approval, your production is published on GHOSTBUS and becomes instantly available to buyers worldwide. Once purchased it is permanently removed from the marketplace and can never be sold again.",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    num: "09",
    title: "Track Your Performance",
    body: "Monitor live sales, revenue, pending reviews, track status, earnings, payout history, and sales analytics through your professional seller dashboard. Receive instant email notifications on every sale.",
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    num: "10",
    title: "Receive Your Earnings",
    body: "Request a payout from your seller dashboard. Payments are securely transferred to your selected payout method after verification. Most payout requests are processed within 24 business hours.",
  },
];

// ─────────────────────────────────────────────
// DATA — WHAT'S INCLUDED
// ─────────────────────────────────────────────
const INCLUDED_ITEMS = [
  { title: "Mastered WAV", desc: "Professional 24-bit, 44.1kHz studio-quality master ready for immediate release." },
  { title: "Mastered MP3", desc: "High-quality 320kbps MP3 for personal playback and quick sharing." },
  { title: "Unmastered WAV", desc: "Clean pre-master mixdown ideal for your own mastering engineer or label mastering chain." },
  { title: "Instrumental Version", desc: "Professional instrumental export without vocals when included." },
  { title: "Individual Stems", desc: "Clearly organised stem files — Kick, Bass, Drums, Percussion, FX, Leads, Pads, Vocals, Atmospheres, Synth Layers." },
  { title: "MIDI Files", desc: "Editable MIDI for melodies, chords, basslines, arpeggios, and harmonic elements." },
  { title: "AI & Exclusive Vocals", desc: "Every exclusive vocal & AI vocal includes a professionally formatted full lyrics PDF for recording, publishing, and release preparation." },
  { title: "DAW Project Files", desc: "Where available — FL Studio, Ableton Live, Logic Pro, Cubase, Studio One. Project availability is clearly displayed on each listing." },
  { title: "Rights Transfer Documentation", desc: "Professional ownership documentation confirming your exclusive rights to the production." },
];

// ─────────────────────────────────────────────
// DATA — COMMISSION LEVELS
// ─────────────────────────────────────────────
const COMMISSION_LEVELS = [
  { level: "New Seller", seller: "72%", platform: "28%", highlight: false },
  { level: "Rising Seller", seller: "75%", platform: "25%", highlight: false },
  { level: "Pro Seller", seller: "78%", platform: "22%", highlight: false },
  { level: "Diamond Seller", seller: "80%", platform: "20%", highlight: false },
  { level: "Elite Seller", seller: "82%", platform: "18%", highlight: true },
  { level: "Legend Seller", seller: "85%", platform: "15%", highlight: true },
];

// ─────────────────────────────────────────────
// DATA — WHY SELL
// ─────────────────────────────────────────────
const WHY_SELL = [
  "Global marketplace for exclusive ghost productions",
  "Professional A&R quality review",
  "Secure identity verification",
  "Exclusive one-time sales only",
  "Higher commissions as you grow",
  "Professional seller dashboard",
  "Real-time sales tracking",
  "Fast payout processing",
  "Copyright-focused marketplace protection",
  "Trusted by artists, DJs, producers, labels, and music professionals worldwide",
];

type Tab = "buyers" | "sellers";

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function HowWeWork() {
  const [tab, setTab] = useState<Tab>("buyers");

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section
        className="relative pt-16 pb-12 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #060226 0%, #0d0540 55%, #1a0f8f 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(90,60,255,0.22) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />
        <div className="container-app relative text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display font-bold tracking-[-0.03em] text-white mb-4 whitespace-nowrap" style={{ fontSize: "clamp(28px,5vw,58px)", lineHeight: 1.1 }}>
              How GhostBus Works
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto">
              Everything you need to know about buying exclusive ghost-produced tracks, selling your music, and earning on the world's No.1 premium marketplace.
            </p>
          </motion.div>

          {/* ── TAB SWITCHER ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 inline-flex p-1.5 rounded-2xl gap-1"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <TabBtn active={tab === "buyers"} onClick={() => setTab("buyers")}>
              <Headphones className="w-4 h-4" /> For Buyers
            </TabBtn>
            <TabBtn active={tab === "sellers"} onClick={() => setTab("sellers")}>
              <Upload className="w-4 h-4" /> For Sellers
            </TabBtn>
          </motion.div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <AnimatePresence mode="wait">
        {tab === "buyers" ? (
          <motion.div key="buyers" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
            <BuyerContent />
          </motion.div>
        ) : (
          <motion.div key="sellers" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
            <SellerContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// BUYER CONTENT
// ─────────────────────────────────────────────
function BuyerContent() {
  return (
    <div className="container-app py-20 max-w-5xl mx-auto space-y-24">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="label-eyebrow mb-3">How GhostBus Works for Buyers</div>
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">Browse, Secure &amp; Release Exclusive Music</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">Under your own artist name. Simple, secure, and designed for professional artists.</p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent hidden md:block" />
        <div className="space-y-8">
          {BUYER_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="flex gap-6 group"
            >
              {/* Icon circle */}
              <div
                className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white z-10"
                style={{ background: "linear-gradient(135deg, #0d0540, #1a0f8f)", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 0 20px rgba(100,80,255,0.18)" }}
              >
                {step.icon}
              </div>
              {/* Card */}
              <div className="flex-1 p-6 rounded-2xl bg-card border border-border group-hover:border-primary/30 group-hover:shadow-[0_8px_30px_rgba(6,2,38,0.10)] transition-all duration-300">
                <div className="text-[11px] font-bold tracking-widest uppercase text-primary/70 mb-1">{step.label}</div>
                <h3 className="font-display font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What's Included */}
      <div>
        <div className="text-center mb-10">
          <div className="label-eyebrow mb-3">Every Purchase Includes</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Complete Production Package</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INCLUDED_ITEMS.map((item) => (
            <div key={item.title}
              className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-[0_8px_24px_rgba(6,2,38,0.08)] transition-all duration-300 group"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1">{item.title}</div>
                  <div className="text-muted-foreground text-xs leading-relaxed">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits grid */}
      <div className="rounded-[28px] overflow-hidden" style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)" }}>
        <div className="p-10 md:p-14">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-4">After Your Purchase</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Your Music. Your Rules.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "100% Exclusive Ownership", body: "Every exclusive listing is sold only once. Your release remains uniquely yours forever." },
              { title: "Keep 100% of Royalties", body: "Every stream, download, performance, sync opportunity — every royalty belongs to you. No commission. No hidden fees." },
              { title: "Worldwide Distribution", body: "Release through any distributor of your choice — Spotify, Beatport, Apple Music, TikTok, TIDAL, Traxsource, and 15+ more platforms." },
              { title: "Perform Anywhere", body: "Use your track in DJ Sets, Festivals, Radio Shows, Podcasts, Live Streams, Concert Tours, and Promotional Videos." },
            ].map((b) => (
              <div key={b.title} className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <div className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center" style={{ background: "rgba(139,92,246,0.3)" }}>
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="font-semibold text-white text-sm mb-2">{b.title}</div>
                <div className="text-white/55 text-xs leading-relaxed">{b.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h3 className="font-display text-2xl font-semibold mb-4">Ready to find your sound?</h3>
        <Link to="/tracks" className="inline-flex h-12 px-8 items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(6,2,38,0.30)]">
          Browse Tracks <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SELLER CONTENT
// ─────────────────────────────────────────────
function SellerContent() {
  return (
    <div className="container-app py-20 max-w-5xl mx-auto space-y-24">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="label-eyebrow mb-3">How GhostBus Works for Sellers</div>
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">Turn Your Music Into a Professional Income Stream</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">Join a global marketplace built exclusively for professional ghost producers.</p>
      </div>

      {/* Steps — numbered cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SELLER_STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-[0_12px_36px_rgba(6,2,38,0.12)] transition-all duration-300 overflow-hidden"
          >
            {/* bg number watermark */}
            <div className="absolute right-4 top-2 font-display font-black text-6xl text-primary/5 select-none pointer-events-none leading-none">{step.num}</div>
            <div className="flex items-start gap-4 relative">
              <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-primary"
                style={{ background: "linear-gradient(135deg, rgba(6,2,38,0.08), rgba(26,15,143,0.12))", border: "1px solid rgba(139,92,246,0.25)" }}>
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold tracking-widest uppercase text-primary/60 mb-0.5">Step {step.num}</div>
                <h3 className="font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
                {step.cta && (
                  <Link to={step.cta.href} className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all">
                    {step.cta.label} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Commission Table */}
      <div>
        <div className="text-center mb-10">
          <div className="label-eyebrow mb-3">GhostBus Commission Levels</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">Earn More As Your Career Grows</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Your commission increases automatically as your total marketplace sales grow. Once you unlock a level, it is permanent — you never lose it.
          </p>
        </div>

        <div className="rounded-[24px] overflow-hidden border border-border">
          {/* Table header */}
          <div className="grid grid-cols-3 text-xs font-bold tracking-widest uppercase px-6 py-4"
            style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 60%, #1a0f8f 100%)", color: "rgba(255,255,255,0.55)" }}>
            <span>Seller Level</span>
            <span className="text-center">Your Fee</span>
            <span className="text-center">GHOSTBUS Fee</span>
          </div>
          {COMMISSION_LEVELS.map((row, i) => (
            <div
              key={row.level}
              className={`grid grid-cols-3 items-center px-6 py-4 border-b border-border last:border-0 transition-colors ${row.highlight ? "bg-primary/5" : i % 2 === 0 ? "bg-card" : "bg-background"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${row.highlight ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <span className={`font-semibold text-sm ${row.highlight ? "text-primary" : ""}`}>{row.level}</span>
                {row.highlight && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary tracking-wider uppercase">Top</span>}              </div>
              <div className="text-center font-display font-bold text-xl" style={row.highlight ? { color: "#ffffff" } : {}}>{row.seller}</div>
              <div className="text-center text-muted-foreground font-medium">{row.platform}</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
          Your progress is calculated using your total marketplace sales value. Once you unlock a commission level, it is permanent — you never lose your level.
        </p>
      </div>

      {/* Why Sell */}
      <div className="rounded-[28px] overflow-hidden" style={{ background: "linear-gradient(135deg, #060226 0%, #0d0540 50%, #1a0f8f 100%)" }}>
        <div className="p-10 md:p-14">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-4">Why Sell on GhostBus</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">The Smarter Way to Sell Ghost Productions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHY_SELL.map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="shrink-0 w-5 h-5 rounded-full bg-primary/40 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/80 text-sm leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h3 className="font-display text-2xl font-semibold mb-4">Ready to start selling?</h3>
        <Link to="/apply-seller" className="inline-flex h-12 px-8 items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-[--color-primary-hover] transition shadow-[0_10px_30px_rgba(6,2,38,0.30)]">
          Become a Seller <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────
function TabBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
        active
          ? "bg-white text-[#060226] shadow-lg"
          : "text-white/60 hover:text-white/90"
      }`}
    >
      {children}
    </button>
  );
}
