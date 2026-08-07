import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/what-is-ghost-producer")({
  head: () => ({
    meta: [
      { title: "What Is a Ghost Producer? — GhostBus" },
      { name: "description", content: "A ghost producer is a professional music creator who produces tracks for other artists without receiving public credit. Learn how it works on GhostBus." },
    ],
  }),
  component: WhatIsGhostProducerPage,
});

function WhatIsGhostProducerPage() {
  return (
    <div className="container-app pt-12 pb-24 max-w-4xl mx-auto">
      <div className="label-eyebrow mb-3">Knowledge Base</div>
      <h1 className="font-display text-5xl font-semibold tracking-tight mb-6">What Is a Ghost Producer?</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl">
        A ghost producer is a professional audio engineer and music producer who creates complete, release-ready tracks for other artists — remaining anonymous under a legally binding NDA.
      </p>

      <div className="space-y-6 mb-16">
        {[
          {
            title: "The Role of a Ghost Producer",
            content: "Ghost producers are highly skilled audio professionals who specialize in creating commercial-grade electronic music. They handle every stage of production: sound design, arrangement, mixing, and mastering. Their work is sold to artists, DJs, and labels who release the music under their own name.",
          },
          {
            title: "Skills Required",
            content: "Professional ghost producers typically have 5+ years of production experience, deep knowledge of genre-specific sound design, professional mixing and mastering capabilities, and a thorough understanding of commercial release standards. GhostBus verifies all producers through a rigorous A&R process.",
          },
          {
            title: "The Business Model",
            content: "Ghost production is a legitimate, highly profitable business. Producers earn between €249 and €1,999+ per track sold, with commission tiers that reward high-volume sellers. Top producers on GhostBus earn five and six-figure incomes from their catalogs.",
          },
          {
            title: "Confidentiality & NDA",
            content: "Every GhostBus transaction includes an automatically generated Non-Disclosure Agreement. Ghost producers agree to maintain strict confidentiality regarding all sales. This protects both the artist's brand identity and the producer's business relationships.",
          },
          {
            title: "How to Become a Ghost Producer on GhostBus",
            content: "Apply through our Producer Verification Program. You'll need to demonstrate your production skills, pass originality verification, and complete identity verification. Once approved, you can list tracks on our marketplace and start earning immediately.",
          },
        ].map((item) => (
          <div key={item.title} className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-semibold text-xl mb-3">{item.title}</h2>
            <p className="text-foreground/80 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <Link to="/apply-seller" className="p-6 bg-primary text-primary-foreground rounded-2xl hover:bg-[--color-primary-hover] transition">
          <div className="font-semibold text-lg mb-1">Become a Ghost Producer</div>
          <p className="text-primary-foreground/70 text-sm">Apply to sell your tracks on GhostBus and start earning.</p>
        </Link>
        <Link to="/tracks" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/40 transition">
          <div className="font-semibold text-lg mb-1">Browse Ghost Produced Tracks</div>
          <p className="text-muted-foreground text-sm">Explore our catalog of exclusive, release-ready productions.</p>
        </Link>
      </div>

      <div className="text-sm text-muted-foreground">
        Also see:{" "}
        <Link to="/what-is-ghost-production" className="text-primary hover:underline">What Is Ghost Production?</Link>
        {" · "}
        <Link to="/licensing-legal" className="text-primary hover:underline">Licensing &amp; Legal</Link>
        {" · "}
        <Link to="/how-we-work" className="text-primary hover:underline">How We Work</Link>
      </div>
    </div>
  );
}
