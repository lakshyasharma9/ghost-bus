import { createFileRoute, Link } from "@tanstack/react-router";
import { TERMS_CONTENT } from "@/lib/mock-data";
import { FileText, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — GhostBus" },
      { name: "description", content: "Terms and Conditions for using the GhostBus ghost production marketplace platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="container-app pt-12 pb-24 max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="label-eyebrow">Legal</div>
      </div>
      <h1 className="font-display text-4xl font-semibold tracking-tight mb-2">Terms &amp; Conditions</h1>
      <p className="text-muted-foreground mb-2">Version: {TERMS_CONTENT.version}</p>
      <p className="text-sm text-muted-foreground mb-10">
        Please read these Terms and Conditions carefully before using the GhostBus platform.
        By accessing or using our services, you agree to be bound by these terms.
      </p>

      <div className="space-y-6">
        {TERMS_CONTENT.clauses.map((clause, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-3">{clause.title}</h2>
            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {clause.content.split("**").map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-foreground font-semibold">{part}</strong> : part
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 border border-border rounded-2xl text-sm text-muted-foreground">
        <p>For questions about these Terms &amp; Conditions, please contact us through the{" "}
          <Link to="/how-we-work" className="text-primary hover:underline">support portal</Link>.
        </p>
        <p className="mt-2">
          Also see our{" "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>{" "}
          and{" "}
          <Link to="/licensing-legal" className="text-primary hover:underline">Licensing &amp; Legal</Link> pages.
        </p>
      </div>
    </div>
  );
}
