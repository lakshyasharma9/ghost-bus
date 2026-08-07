import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Shield, Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/licensing-legal")({
  head: () => ({
    meta: [
      { title: "Licensing & Legal — GhostBus" },
      { name: "description", content: "GhostBus licensing and legal framework — how copyright transfer, NDAs, and exclusive ownership work on our ghost production marketplace." },
    ],
  }),
  component: LicensingLegalPage,
});

function LicensingLegalPage() {
  return (
    <div className="container-app pt-12 pb-24 max-w-4xl mx-auto">
      <div className="label-eyebrow mb-3">Legal</div>
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6">Licensing &amp; Legal</h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl">
        Every GhostBus transaction is backed by legally binding documentation. Here's exactly what you receive and how it protects you.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {[
          { icon: <FileText className="w-5 h-5 text-primary" />, title: "Copyright Transfer Agreement", desc: "Full ownership of the master recording, composition rights, and all commercial exploitation rights." },
          { icon: <Shield className="w-5 h-5 text-primary" />, title: "Non-Disclosure Agreement", desc: "The producer agrees to permanent confidentiality. Your identity as the artist is never disclosed." },
          { icon: <Lock className="w-5 h-5 text-primary" />, title: "Exclusive License", desc: "The track is sold only once. No other party can ever purchase or license it after your transaction." },
        ].map((item) => (
          <div key={item.title} className="p-6 bg-card border border-border rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center mb-3">{item.icon}</div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6 mb-12">
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-semibold text-xl mb-4">What Rights Do You Receive?</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "100% Copyright Ownership", "Master Recording Rights", "Publishing Rights", "Streaming Monetization Rights",
              "Sync Licensing Rights", "Performance Rights", "Distribution Rights", "Derivative Work Rights",
              "Radio Play Rights", "Commercial Use Rights",
            ].map((right) => (
              <div key={right} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                {right}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-semibold text-xl mb-4">Automatic Legal Document Generation</h2>
          <p className="text-foreground/80 leading-relaxed">All legal documents are automatically generated at the moment of purchase. Documents include your name, the track title, purchase price, date, and a unique transaction ID. Documents are stored permanently in your account and cannot be modified after generation.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-semibold text-xl mb-4">Dispute Resolution</h2>
          <p className="text-foreground/80 leading-relaxed">In the rare event of a copyright dispute or technical delivery issue, GhostBus provides full administrative support. Our team reviews all disputes and takes appropriate action including refunds where applicable.</p>
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-x-4">
        <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        <Link to="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>
        <Link to="/dmca" className="text-primary hover:underline">DMCA Policy</Link>
      </div>
    </div>
  );
}
