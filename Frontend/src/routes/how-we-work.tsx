import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/how-we-work")({
  head: () => ({
    meta: [
      { title: "How GhostBus Works" },
      { name: "description", content: "How buyers and sellers work on GhostBus — the premium ghost production marketplace." },
    ],
  }),
  component: HowWeWork,
});

const BUYER = [
  "Discover — Browse using filters (genre, BPM, key, DAW, mood, price)",
  "Preview — Listen to high-quality previews before purchasing",
  "Purchase — Secure checkout with coupons, promotions, Ghost Coins",
  "Download — Instantly access WAV, MP3, Stems, MIDI, Project Files, Legal Docs",
  "Own It — Full copyright, master rights, commercial rights, distribution rights",
  "Release & Earn — Release worldwide, keep 100% streaming revenue, performance royalties"
];
const SELLER = [
  "Create Account — Build your professional seller profile",
  "Submit Application — Complete producer verification (2-3 business days)",
  "Identity Verification — Upload Passport/National ID/Driving Licence",
  "Upload Tracks — Mastered WAV, Unmastered, Stems, MIDI, Project File",
  "Set Price — Choose your price within marketplace ranges",
  "Track Approved — A&R review within 72 hours (quality, originality, commercial potential)",
  "Monitor Sales — Real-time tracking, revenue monitoring, performance data",
  "Get Paid — PayPal/Payoneer payouts within 24 hours"
];

const FAQ = [
  ["What does 'exclusive' mean?", "Once a track is sold on GhostBus, it is removed from the marketplace forever. Only one buyer ever owns it. You receive complete exclusivity and ownership rights."],
  ["Do I get full rights?", "Yes. Every purchase comes with a 100% rights transfer license including copyright ownership, master rights, commercial usage rights, streaming monetization rights, distribution rights, and performance rights."],
  ["How are tracks verified?", "Every upload is reviewed by our A&R team for mix & master quality, commercial loudness standards, originality verification, streaming platform compatibility, and technical audio inspection."],
  ["When do producers get paid?", "Producers can request payouts via PayPal or Payoneer. Most payouts are processed within 24 hours after approval."],
  ["What commission levels are available?", "Bronze (72%), Silver €5k sales (75%), Gold €10k sales (78%), Platinum €30k sales (82%), Diamond €50k sales (85%). Once achieved, levels remain permanently unlocked."],
  ["Can I monetize purchased tracks?", "Yes! You keep 100% of streaming revenue, download revenue, performance royalties, sync licensing revenue, and radio & broadcast revenue across Spotify, Apple Music, Beatport, YouTube, SoundCloud, TikTok, and all major platforms."],
];

function HowWeWork() {
  return (
    <div className="container-app pt-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="label-eyebrow mb-3">How We Work</div>
        <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-[-0.02em]">Simple. Curated. Exclusive.</h1>
      </div>

      <div className="mt-20 grid md:grid-cols-2 gap-8">
        <Flow title="For Buyers" steps={BUYER} />
        <Flow title="For Sellers" steps={SELLER} />
      </div>

      <div className="mt-24 max-w-2xl mx-auto">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-center mb-8">Frequently asked</h2>
        <div className="space-y-2">
          {FAQ.map(([q, a]) => <FAQItem key={q} q={q} a={a} />)}
        </div>
      </div>
    </div>
  );
}

function Flow({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-border">
      <div className="label-eyebrow mb-4">{title}</div>
      <ol className="space-y-5">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-4">
            <span className="w-9 h-9 shrink-0 rounded-full bg-accent text-primary font-semibold grid place-items-center">{i + 1}</span>
            <span className="pt-1.5 text-foreground/90">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-medium">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
