import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Clock, Loader2 } from "lucide-react";
import { useServices, useCreateServiceCheckout } from "@/hooks/use-api";
import { SERVICES } from "@/lib/mock-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Producer Services — GhostBus" },
      { name: "description", content: "Hire elite producers for custom production, mixing, mastering, and more." },
    ],
  }),
  component: Services,
});

function Services() {
  const { data: dbServices, isLoading } = useServices();
  const checkout = useCreateServiceCheckout();
  const [hireModal, setHireModal] = useState<any | null>(null);
  const [requirements, setRequirements] = useState("");

  // Fall back to mock data if no DB services yet
  const services = (dbServices && (dbServices as any[]).length > 0) ? dbServices as any[] : SERVICES.map((s) => ({ ...s, seller_id: null, profiles: { display_name: s.producer } }));

  return (
    <div className="container-app pt-12 pb-24">
      <div className="max-w-2xl mb-12">
        <div className="label-eyebrow mb-2">Marketplace · Services</div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Hire elite producers</h1>
        <p className="mt-4 text-lg text-muted-foreground">Custom production, mixing, mastering, vocal toplines and more — delivered by vetted talent.</p>
      </div>

      {isLoading ? (
        <div className="py-20 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s: any) => (
            <div key={s.id} className="p-6 rounded-2xl bg-card border border-border hover:shadow-[0_10px_30px_rgba(10,132,255,0.12)] transition">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[#5BA7FF] grid place-items-center text-white font-bold text-lg shrink-0">
                  {(s.profiles?.display_name ?? s.producer ?? "?").charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{s.profiles?.display_name ?? s.producer}</div>
                  <div className="text-xs text-muted-foreground">{s.genre ?? s.category}</div>
                </div>
              </div>
              <h3 className="mt-5 font-semibold text-lg leading-tight">{s.title}</h3>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-warning fill-warning" /> {s.rating ?? s.rating_avg ?? "5.0"}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.delivery ?? `${s.delivery_days} days`}</span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Starting at</div>
                  <div className="font-semibold text-xl">₹{s.price}</div>
                </div>
                <button
                  onClick={() => setHireModal(s)}
                  className="h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition"
                >
                  Hire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hire Modal */}
      {hireModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-semibold text-lg mb-1">Hire {hireModal.profiles?.display_name ?? hireModal.producer}</h2>
            <p className="text-sm text-muted-foreground mb-4">{hireModal.title} · ₹{hireModal.price}</p>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Project Requirements *</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe your project, genre, references, deadline..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 text-sm resize-none"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setHireModal(null); setRequirements(""); }} className="flex-1 h-10 rounded-full border border-border text-sm font-medium">Cancel</button>
              <button
                onClick={() => {
                  if (!requirements.trim()) return;
                  if (hireModal.seller_id) {
                    checkout.mutate({ serviceId: hireModal.id, requirements });
                  } else {
                    // Mock service — show toast
                    import("sonner").then(({ toast }) => toast.success("Service inquiry sent! (Connect Supabase to enable real checkout)"));
                    setHireModal(null);
                    setRequirements("");
                  }
                }}
                disabled={!requirements.trim() || checkout.isPending}
                className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {checkout.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : `Pay ₹${hireModal.price}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
