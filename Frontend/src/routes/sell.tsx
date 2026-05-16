import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, ShieldCheck, DollarSign, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell on GhostBus — Premium Marketplace for Producers" },
      { name: "description", content: "Upload exclusive tracks. Set your price. Keep the lion's share. Get paid instantly." },
    ],
  }),
  component: Sell,
});

function Sell() {
  return (
    <div className="container-app pt-16">
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" /> For Producers
        </span>
        <h1 className="mt-6 font-display text-5xl md:text-6xl font-semibold tracking-[-0.02em] leading-[1]">
          Sell once. <span className="text-gradient-blue">Sell big.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Join the most curated ghost-production marketplace. Exclusive sales, transparent pricing, instant payouts.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium shadow-[0_10px_30px_rgba(10,132,255,0.28)]">
            Apply as a Seller <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/how-we-work" className="h-12 px-6 inline-flex items-center rounded-full border border-border font-medium">How we work</Link>
        </div>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-5">
        {[
          { icon: <Upload className="w-5 h-5" />, t: "Upload in minutes", d: "Drag and drop your stems, masters, and metadata. Our 5-step wizard handles the rest." },
          { icon: <ShieldCheck className="w-5 h-5" />, t: "A&R curated", d: "Every track is reviewed by our A&R team. Quality over quantity, always." },
          { icon: <DollarSign className="w-5 h-5" />, t: "Instant payouts", d: "Powered by Stripe Connect. Your money, in your account, the moment a sale closes." },
        ].map((b) => (
          <div key={b.t} className="p-8 rounded-2xl bg-card border border-border">
            <div className="w-11 h-11 rounded-xl bg-accent text-accent-foreground grid place-items-center">{b.icon}</div>
            <h3 className="mt-5 font-semibold text-lg">{b.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-24 rounded-[28px] bg-[--color-surface] border border-border p-12 grid md:grid-cols-4 gap-8 text-center">
        {[
          ["$2.4M+", "Paid to producers"],
          ["12,000+", "Active buyers"],
          ["4.9/5", "Seller satisfaction"],
          ["48hrs", "Avg. review time"],
        ].map(([n, l]) => (
          <div key={l}>
            <div className="font-display text-4xl font-semibold tracking-tight text-gradient-blue">{n}</div>
            <div className="mt-2 text-sm text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
