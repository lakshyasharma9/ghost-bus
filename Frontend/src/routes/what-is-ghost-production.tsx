import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Music, Shield, Award, Zap } from "lucide-react";

export const Route = createFileRoute("/what-is-ghost-production")({
  head: () => ({
    meta: [
      { title: "What Is Ghost Production? — GhostBus" },
      { name: "description", content: "Ghost production explained — the professional music service where elite producers create exclusive tracks for DJs, artists, and record labels with full rights transfer." },
    ],
  }),
  component: WhatIsGhostProductionPage,
});

function WhatIsGhostProductionPage() {
  return (
    <div className="container-app pt-12 pb-24 max-w-4xl mx-auto">
      <div className="label-eyebrow mb-3">Knowledge Base</div>
      <h1 className="font-display text-5xl font-semibold tracking-tight mb-6">What Is Ghost Production?</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl">
        Ghost production is a professional music industry service where experienced producers create original tracks for artists, DJs, and labels — with full ownership transfer to the buyer.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: <Music className="w-6 h-6 text-primary" />, title: "Professional Production", desc: "Tracks are produced by verified, industry-level producers with years of experience in commercial electronic music." },
          { icon: <Shield className="w-6 h-6 text-primary" />, title: "Full Rights Transfer", desc: "Upon purchase, 100% of the copyright, master rights, and publishing rights are permanently transferred to you." },
          { icon: <Award className="w-6 h-6 text-primary" />, title: "Exclusive Ownership", desc: "Each track is sold only once. Once you purchase it, it's removed from the marketplace forever." },
          { icon: <Zap className="w-6 h-6 text-primary" />, title: "Instant Delivery", desc: "After payment clears, you receive your complete file package — WAV masters, stems, MIDI, and legal documents — immediately." },
        ].map((item) => (
          <div key={item.title} className="p-6 bg-card border border-border rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-primary/10 grid place-items-center mb-4">{item.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8 mb-16">
        <Section title="How Ghost Production Works">
          <p>Ghost production is a transaction where a professional music producer creates a complete, release-ready track and sells the full commercial rights to a buyer. The buyer — typically a DJ, artist, or record label — then releases the track under their own name.</p>
          <p className="mt-3">The original producer remains anonymous under a legally binding Non-Disclosure Agreement (NDA). This arrangement is standard practice in the electronic music industry and is fully legal and ethical.</p>
        </Section>

        <Section title="Why Do Artists Use Ghost Production?">
          <p>The modern music industry demands a constant stream of releases. Professional touring artists often spend months on the road, leaving little time for studio work. Ghost production allows them to maintain release velocity while focusing on performances, brand building, and fan engagement.</p>
          <p className="mt-3">Ghost production is not a shortcut — it is a professional business arrangement, just like using session musicians, co-writers, or mixing engineers. The music industry has always operated this way.</p>
        </Section>

        <Section title="What You Receive With Every Purchase on GhostBus">
          <ul className="space-y-2 mt-2">
            {[
              "Mastered WAV — Extended and Radio mixes, vocal and instrumental versions",
              "Unmastered WAV — For your own mastering engineer",
              "Individual Stems — All individual audio elements separated",
              "MIDI Files — Full melodic and harmonic data",
              "Project File — Full DAW session (when included by producer)",
              "Legal Documentation — Copyright transfer agreement and NDA",
              "Artwork — High-resolution cover art",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Is Ghost Production Legal?">
          <p>Absolutely. Ghost production is a legitimate, legal commercial arrangement protected by standard copyright law. The producer transfers their rights to you via a legally binding agreement. This is no different from hiring a session musician, ghostwriter, or co-producer in any other area of the music industry.</p>
          <p className="mt-3">Every GhostBus transaction includes automatically generated legal documentation to protect both parties.</p>
        </Section>
      </div>

      <div className="p-8 bg-gradient-to-br from-foreground to-[#1a1a1a] text-background rounded-3xl">
        <h2 className="font-display text-3xl font-semibold mb-3">Ready to buy your first ghost produced track?</h2>
        <p className="text-background/70 mb-6">Browse our catalog of exclusive, release-ready productions across all major EDM genres.</p>
        <Link to="/tracks" className="inline-flex h-12 px-6 items-center gap-2 rounded-full bg-background text-foreground font-semibold hover:scale-[1.02] transition">
          Browse Tracks <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8">
      <h2 className="font-semibold text-xl mb-4">{title}</h2>
      <div className="text-foreground/80 leading-relaxed">{children}</div>
    </div>
  );
}
