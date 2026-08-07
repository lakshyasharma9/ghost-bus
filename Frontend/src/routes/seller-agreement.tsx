import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2, Lock, FileCheck2, DollarSign, Eye, AlertTriangle, Ban } from "lucide-react";

export const Route = createFileRoute("/seller-agreement")({
  head: () => ({
    meta: [
      { title: "Agreement & Terms — GhostBus" },
      { name: "description", content: "GhostBus Agreement — rights transfer, pricing, exclusivity, confidentiality and quality standards for all tracks sold on our marketplace." },
    ],
  }),
  component: SellerAgreementPage,
});

const AGREEMENT_SECTIONS = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Exclusivity & Rights Transfer",
    content: "Upon sale, you irrevocably transfer 100% of all rights to the buyer — copyright, master, publishing, and all commercial exploitation rights worldwide, in perpetuity. The track must be exclusive to GhostBus and may not be listed elsewhere.",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    title: "Pricing Agreement",
    content: "GhostBus retains a 28% platform fee on every sale. Your payout is 72% of the track price. Prices are set during upload and cannot be changed after submission without contacting support.",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Review & Publication",
    content: "Your track will NOT go live immediately. Our A&R team reviews every submission within 72 hours. If approved, a watermarked preview is generated and the track is published on the marketplace.",
  },
  {
    icon: <FileCheck2 className="w-5 h-5" />,
    title: "Originality & Accuracy",
    content: "You confirm all metadata, files, and transparency declarations are accurate. You must accurately declare whether the track is completely original or contains royalty-free loops. False or misleading information will result in immediate account suspension and potential legal liability.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Confidentiality",
    content: "You agree to maintain strict confidentiality on all transactions. You may not publicly claim authorship of any sold track, disclose buyer details, or share transaction information.",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: "Quality Standards",
    content: "All tracks must meet professional release standards including proper mix and master quality, commercial loudness levels, and complete file delivery (WAV Master, Stems, MIDI, Artwork). Tracks that do not meet our standards will be rejected during A&R review.",
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "Commission Structure & Payouts",
    content: "GhostBus retains a platform commission based on your seller tier. New sellers start at 28% (72% payout). As your lifetime sales grow, your commission rate decreases through our 5-tier reward system. All sellers must complete Account Verification before payouts are enabled.",
  },
  {
    icon: <Ban className="w-5 h-5" />,
    title: "Prohibited Content",
    content: "You may not upload tracks containing: unauthorized commercial samples, AI-generated content (unless declared and approved), adult or offensive content, tracks that infringe any third-party rights. Violations result in immediate account termination and marketplace blacklisting.",
  },
];

function SellerAgreementPage() {
  return (
    <div className="container-app pt-12 pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="label-eyebrow mb-3">Agreement of Price & Terms</div>
        <h1 className="font-display text-4xl font-semibold tracking-tight mb-3">
          GhostBus Track Agreement
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
          Review the terms below. All tracks listed and sold on GhostBus are governed by this agreement. 
          By submitting a track for review, you accept all terms.
        </p>
      </div>

      {/* Pricing summary box */}
      <div className="p-6 rounded-2xl bg-accent border border-primary/20 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Revenue Split</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Applied to every sale</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-background border border-border">
            <div className="font-display text-2xl font-bold text-primary">72%</div>
            <div className="text-xs text-muted-foreground mt-1">Your Payout</div>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border">
            <div className="font-display text-2xl font-bold text-muted-foreground">28%</div>
            <div className="text-xs text-muted-foreground mt-1">Platform Fee</div>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border">
            <div className="font-display text-2xl font-bold text-foreground">72h</div>
            <div className="text-xs text-muted-foreground mt-1">Review Time</div>
          </div>
        </div>
      </div>

      {/* Agreement sections */}
      <div className="space-y-4">
        {AGREEMENT_SECTIONS.map((item) => (
          <div key={item.title} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-base mb-2">{item.title}</h2>
                <p className="text-sm text-foreground/80 leading-relaxed">{item.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acceptance note */}
      <div className="mt-8 p-5 rounded-2xl border border-border bg-muted/30">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            By submitting a track for A&R review, you confirm that you have read, understood, and agree to all terms above. 
            You understand the track will be reviewed within 72 hours before going live, and upon sale, 
            full rights transfer to the buyer is immediate and irrevocable.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/apply-seller" className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[--color-primary-hover] transition shadow-[0_8px_24px_rgba(6,2,38,0.3)]">
          Apply to Sell
        </Link>
        <Link to="/tracks" className="h-12 px-6 inline-flex items-center gap-2 rounded-full border border-border bg-card font-medium hover:border-primary/30 transition">
          Browse Tracks
        </Link>
      </div>
    </div>
  );
}
