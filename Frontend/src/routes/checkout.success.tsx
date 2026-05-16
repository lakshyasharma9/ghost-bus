import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Download, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/store";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({ meta: [{ title: "Purchase Confirmed — GhostBus" }] }),
  component: CheckoutSuccess,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: search.session_id as string | undefined,
  }),
});

function CheckoutSuccess() {
  const { session_id } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orders, setOrders] = useState<any[]>([]);
  const cart = useCart();

  useEffect(() => {
    if (!session_id) { setStatus("error"); return; }
    const verify = async () => {
      const { data, error } = await (supabase as any)
        .from("orders")
        .select("*, tracks(id, title, genre, artwork_url, bpm, musical_key, mastered_url, stems_url, midi_url)")
        .eq("stripe_session_id", session_id)
        .eq("status", "paid");
      if (error || !data?.length) { setStatus("error"); return; }
      setOrders(data);
      setStatus("success");
      cart.clear();
    };
    verify();
  }, [session_id]);

  if (status === "loading") {
    return (
      <div className="container-app pt-32 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Confirming your purchase...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container-app pt-32 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">We couldn't verify your purchase. If you were charged, please contact support.</p>
        <Link to="/tracks" className="mt-6 inline-flex h-11 px-6 items-center rounded-full bg-primary text-primary-foreground font-medium">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app pt-16 pb-24 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 grid place-items-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Purchase Confirmed!</h1>
        <p className="text-muted-foreground mt-3">Your tracks are ready. Full rights transfer complete.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-16 h-16 rounded-xl shrink-0 bg-muted"
                style={order.tracks?.artwork_url ? { backgroundImage: `url(${order.tracks.artwork_url})`, backgroundSize: "cover" } : {}}
              />
              <div>
                <div className="font-semibold text-lg">{order.tracks?.title}</div>
                <div className="text-sm text-muted-foreground">{order.tracks?.genre} · {order.tracks?.bpm} BPM · {order.tracks?.musical_key}</div>
                <div className="text-sm font-semibold text-primary mt-1">${order.amount} — Full Rights Transfer</div>
              </div>
            </div>

            <div className="label-eyebrow mb-3">Download Your Files</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Mastered WAV", url: order.tracks?.mastered_url },
                { label: "Stems ZIP", url: order.tracks?.stems_url },
                { label: "MIDI Files", url: order.tracks?.midi_url },
              ].filter((f) => f.url).map((f) => (
                <a
                  key={f.label}
                  href={f.url}
                  download
                  className="flex items-center gap-2 p-3 rounded-xl bg-muted hover:bg-accent transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4 text-primary" /> {f.label}
                </a>
              ))}
              {(!order.tracks?.mastered_url) && (
                <div className="col-span-2 p-3 rounded-xl bg-muted text-sm text-muted-foreground">
                  Download links will be emailed to you within 5 minutes.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-2xl bg-accent border border-primary/20 text-sm text-foreground/80">
        <strong>What's included:</strong> Mastered WAV (24-bit), Unmastered WAV, Stems ZIP, MIDI files, High-res artwork. All files are yours forever with full commercial rights.
      </div>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link to="/tracks" className="h-11 px-6 inline-flex items-center rounded-full border border-border font-medium text-sm">
          Continue Browsing
        </Link>
        <Link to="/dashboard" className="h-11 px-6 inline-flex items-center rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-[0_8px_24px_rgba(10,132,255,0.28)]">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
