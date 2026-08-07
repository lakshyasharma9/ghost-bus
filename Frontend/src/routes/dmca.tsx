import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dmca")({
  head: () => ({
    meta: [
      { title: "DMCA Policy — GhostBus" },
      { name: "description", content: "GhostBus DMCA Policy — how to report copyright infringement and how we handle takedown requests." },
    ],
  }),
  component: DmcaPage,
});

function DmcaPage() {
  return (
    <div className="container-app pt-12 pb-24 max-w-3xl mx-auto">
      <div className="label-eyebrow mb-3">Legal</div>
      <h1 className="font-display text-4xl font-semibold tracking-tight mb-6">DMCA Policy</h1>
      <p className="text-muted-foreground mb-10">Digital Millennium Copyright Act — Notice and Takedown Procedure</p>

      <div className="space-y-6">
        {[
          { title: "Our Commitment", content: "GhostBus respects the intellectual property rights of others and expects our users to do the same. We respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA) and other applicable intellectual property laws." },
          { title: "Reporting Copyright Infringement", content: "If you believe that content on our platform infringes your copyright, please provide written notice to our designated agent with the following information:\n\n1. A physical or electronic signature of the copyright owner or their authorized representative\n2. Identification of the copyrighted work claimed to have been infringed\n3. Identification of the material that is claimed to be infringing and its location on our platform\n4. Your contact information (address, telephone number, and email)\n5. A statement that you have a good-faith belief that the disputed use is not authorized\n6. A statement that the information in your notice is accurate and, under penalty of perjury, that you are the copyright owner or authorized to act on behalf of the owner" },
          { title: "Counter-Notification", content: "If you believe your content was removed in error, you may submit a counter-notification. Counter-notifications must include: your physical or electronic signature, identification of the removed content, a statement under penalty of perjury that you have a good-faith belief the content was removed by mistake, and your contact information." },
          { title: "Repeat Infringers", content: "GhostBus has a policy of terminating accounts of users who are found to be repeat infringers of copyright. Any seller found to have uploaded infringing content will have their account immediately suspended and all pending payouts withheld." },
          { title: "Our Verification Process", content: "GhostBus employs automated acoustic fingerprinting technology to scan all uploaded tracks against global commercial music databases before any track is published. This significantly reduces the risk of infringing content reaching our marketplace." },
        ].map((item) => (
          <div key={item.title} className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-3">{item.title}</h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
