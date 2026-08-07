import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — GhostBus Ghost Production Marketplace" },
      { name: "description", content: "Frequently asked questions about GhostBus — ghost production, track purchases, rights transfer, payouts, and more." },
    ],
  }),
  component: FaqPage,
});

const FAQ_CATEGORIES = [
  {
    category: "Buying Tracks",
    questions: [
      { q: "What is ghost production?", a: "Ghost production is a professional music service where elite producers create fully finished original tracks that are sold exclusively to artists or DJs. When you buy a track on GhostBus, you receive 100% copyright ownership, allowing you to legally release it under your own artist name." },
      { q: "What is a ghost producer?", a: "A ghost producer is a professional, industry-verified music creator who produces premium tracks for other artists without receiving public credit. They handle every stage of production — sound design, arrangement, mixing, and mastering — before transferring 100% of the commercial rights to the buyer." },
      { q: "How does ghost production work on GhostBus?", a: "A vetted professional creates a track and lists it on our premium marketplace. You browse, preview, and purchase. The exact second your payment clears, the track is permanently removed from the catalog and full ownership is transferred to you. You download the complete file package including stems, MIDI, and all legal documents." },
      { q: "Are the tracks truly exclusive?", a: "Yes. Every track on GhostBus is sold only once. This is enforced at the database level — once purchased, the track is immediately and permanently removed from the marketplace. No other buyer can ever access it." },
      { q: "What files do I receive after purchase?", a: "You receive: Mastered WAV (Extended and Radio versions, vocal and instrumental), Unmastered WAV, Individual stems (Kick, Bass, Synths, Vocals, FX, etc.), MIDI files for all melodic elements, Project File (when included by the producer), Copyright Transfer Agreement PDF, NDA PDF, and High-resolution artwork." },
      { q: "Do I own the music after purchase?", a: "Yes, absolutely. Every purchase includes a total copyright transfer, master rights acquisition, and full commercial usage rights. You immediately become the sole exclusive owner with complete freedom to release, monetize, distribute, and perform the music globally." },
      { q: "Are there hidden fees?", a: "No. GhostBus operates with absolute pricing transparency. The price displayed is your final cost. We do not charge backend royalties, recurring subscriptions, or hidden fees of any kind." },
      { q: "Is my purchase secure?", a: "All transactions are processed through Stripe — a PCI-DSS compliant payment processor. Your financial data is never stored on our servers. Download links are time-limited signed URLs. All data is encrypted in transit and at rest." },
    ],
  },
  {
    category: "Selling Tracks",
    questions: [
      { q: "How do I become a seller on GhostBus?", a: "Apply through our Producer Verification Program. You'll need to demonstrate your production quality, complete identity verification, and agree to our seller terms. Our A&R team reviews applications within 2–3 business days." },
      { q: "What commission do I earn?", a: "You start at 72% payout (28% platform fee) as a New Seller. As your lifetime sales grow, your payout increases through our 5-tier system: Rising (75%), Pro (78%), Elite (82%), Legend (85%)." },
      { q: "When and how do I get paid?", a: "Payouts are processed via Stripe Connect. You must complete Account Verification (KYC) before payouts are enabled. Once verified, earnings are available for withdrawal at any time." },
      { q: "What formats must I deliver?", a: "Mastered WAV (minimum 24-bit/44.1kHz), Unmastered WAV, Stems ZIP (all individual elements), MIDI files, and high-resolution artwork (minimum 3000×3000px). Optional: Project File ZIP." },
      { q: "What happens if my track is rejected?", a: "You receive detailed written feedback explaining exactly why the track was rejected. You can address the issues and resubmit. Common rejection reasons include audio quality issues, uniqueness scan matches, or incomplete file delivery." },
    ],
  },
  {
    category: "Legal & Rights",
    questions: [
      { q: "Is ghost production legal?", a: "Absolutely. Ghost production is a legitimate, legal commercial arrangement. The producer transfers their rights to you via a legally binding contract. This is the same as hiring a session musician, ghostwriter, or co-producer in any area of the music industry." },
      { q: "What legal documents do I receive?", a: "Every purchase automatically generates: a Copyright Transfer Agreement (transferring 100% of all rights to you) and a Non-Disclosure Agreement (ensuring the producer maintains permanent confidentiality). These documents are stored in your account and cannot be modified after generation." },
      { q: "Can I release the track on Spotify, Beatport, YouTube?", a: "Yes. You can release on any platform — Spotify, Apple Music, Beatport, YouTube, SoundCloud, TikTok, and all others. You keep 100% of all streaming royalties, performance income, and sync licensing revenue." },
    ],
  },
  {
    category: "GhostBus Credits",
    questions: [
      { q: "What are GB Credits?", a: "GB Credits are GhostBus loyalty reward points earned with every purchase. You earn 50 credits per €50 spent above the €249 baseline. Credits accumulate and can be redeemed for discounts on future purchases." },
      { q: "How do I redeem GB Credits?", a: "Once your balance reaches 1,000 credits (€100 value), a redemption option appears at checkout. Credits are redeemable in fixed blocks of 1,000 = €100 discount. Credits expire after 12 months of inactivity." },
    ],
  },
];

function FaqPage() {
  const [search, setSearch] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filtered = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="container-app pt-12 pb-24 max-w-3xl mx-auto">
      <div className="label-eyebrow mb-3">Support</div>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-10">Everything you need to know about GhostBus.</p>

      {/* Search */}
      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      <div className="space-y-10">
        {filtered.map((cat) => (
          <div key={cat.category}>
            <h2 className="font-semibold text-xl mb-4">{cat.category}</h2>
            <div className="space-y-2">
              {cat.questions.map((item, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = openItems.has(key);
                return (
                  <div key={key} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-accent transition-colors"
                    >
                      <span className="font-medium text-sm pr-4">{item.q}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pt-1 text-sm text-foreground/80 leading-relaxed border-t border-border">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-card border border-border rounded-3xl text-center">
        <h2 className="font-semibold text-xl mb-2">Still have questions?</h2>
        <p className="text-muted-foreground text-sm mb-6">Our support team is available to help you with any questions not covered here.</p>
        <Link to="/contact" className="inline-flex h-11 px-6 items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[--color-primary-hover] transition">
          Contact Support
        </Link>
      </div>
    </div>
  );
}
