import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — GhostBus" },
      { name: "description", content: "GhostBus Refund Policy — our approach to refunds, disputes, and buyer protection for ghost produced track purchases." },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <div className="container-app pt-12 pb-24 max-w-3xl mx-auto">
      <div className="label-eyebrow mb-3">Legal</div>
      <h1 className="font-display text-4xl font-semibold tracking-tight mb-6">Refund Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: February 2026</p>

      <div className="space-y-6">
        {[
          {
            title: "General Policy",
            content: "Due to the exclusive, irreversible nature of digital ghost production transactions, all sales on GhostBus are generally considered final. When you purchase a track, full copyright ownership is immediately and permanently transferred to you, and the track is removed from the marketplace. This transfer cannot be undone.",
          },
          {
            title: "Eligible Refund Cases",
            content: "We will review and process refunds in the following circumstances:\n\n• Technical delivery failure: You did not receive the files after successful payment.\n• Verified copyright issue: After purchase, the track is found to contain unauthorized samples or to match a previously released commercial recording.\n• Misrepresentation: The track significantly differs from the preview or stated specifications in a material way.\n\nRefund requests must be submitted within 14 days of purchase.",
          },
          {
            title: "Non-Eligible Refund Cases",
            content: "We do not process refunds for:\n\n• Change of mind after purchase\n• Dissatisfaction with the track's creative direction\n• Inability to use the files due to technical limitations on your end\n• Failure to review the track preview before purchasing",
          },
          {
            title: "How to Request a Refund",
            content: "Contact our support team through the platform within 14 days of purchase. Include your order ID, the reason for the refund request, and any supporting evidence. Our team will review your case within 5 business days and communicate the outcome.",
          },
          {
            title: "Refund Processing",
            content: "Approved refunds are processed back to the original payment method via Stripe. Processing time is typically 5–10 business days depending on your bank or card provider.",
          },
          {
            title: "Chargebacks",
            content: "If you initiate a chargeback with your bank or card provider without first contacting our support team, your account will be immediately suspended and the copyright license will be revoked. We reserve the right to pursue legal action for fraudulent chargeback activity.",
          },
        ].map((item) => (
          <div key={item.title} className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-3">{item.title}</h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{item.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-sm text-muted-foreground space-x-4">
        <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>
        <Link to="/buyer-protection" className="text-primary hover:underline">Buyer Protection</Link>
        <Link to="/licensing-legal" className="text-primary hover:underline">Licensing &amp; Legal</Link>
      </div>
    </div>
  );
}
