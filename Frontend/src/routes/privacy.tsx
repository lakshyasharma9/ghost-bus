import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GhostBus" },
      { name: "description", content: "GhostBus Privacy Policy — how we collect, use, and protect your personal information." },
    ],
  }),
  component: PrivacyPage,
});

// Sections will be replaced with client-provided content
const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, payment information, and any other information you choose to provide.",
  },
  {
    title: "2. How We Use Your Information",
    content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional and promotional communications, and comply with legal obligations.",
  },
  {
    title: "3. Information Sharing",
    content: "We do not sell, trade, or otherwise transfer your personally identifiable information to third parties without your consent, except as described in this policy. We may share your information with service providers who assist us in operating our platform.",
  },
  {
    title: "4. Data Security",
    content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is transmitted using industry-standard SSL encryption.",
  },
  {
    title: "5. Cookies and Tracking",
    content: "We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.",
  },
  {
    title: "6. Data Retention",
    content: "We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your personal data at any time, subject to certain legal obligations.",
  },
  {
    title: "7. Your Rights",
    content: "You have the right to access, correct, or delete your personal information. You may also have the right to object to or restrict certain processing of your data. To exercise these rights, please contact us through the support portal.",
  },
  {
    title: "8. Third-Party Services",
    content: "Our platform integrates with third-party services including Stripe for payment processing and AWS for file storage. These services have their own privacy policies governing their use of your information.",
  },
  {
    title: "9. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date. Your continued use of the platform after changes constitutes acceptance.",
  },
  {
    title: "10. Contact Us",
    content: "If you have any questions about this Privacy Policy or our data practices, please contact us through the official support channels on the platform.",
  },
];

function PrivacyPage() {
  return (
    <div className="container-app pt-12 pb-24 max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="label-eyebrow">Legal</div>
      </div>
      <h1 className="font-display text-4xl font-semibold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">
        Last updated: February 2026. This policy describes how GhostBus handles your personal information.
      </p>

      <div className="space-y-6">
        {SECTIONS.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-3">{s.title}</h2>
            <p className="text-sm text-foreground/80 leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 border border-border rounded-2xl text-sm text-muted-foreground">
        <p>Also see our{" "}
          <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>{" "}
          and{" "}
          <Link to="/licensing-legal" className="text-primary hover:underline">Licensing &amp; Legal</Link> pages.
        </p>
      </div>
    </div>
  );
}
