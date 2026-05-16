import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { buyer_id, track_ids } = session.metadata ?? {};
    if (!buyer_id || !track_ids) return new Response("Missing metadata", { status: 400 });

    const trackIdList = track_ids.split(",");

    // Mark orders as paid
    await supabase
      .from("orders")
      .update({ status: "paid", stripe_payment_intent: session.payment_intent as string })
      .eq("stripe_session_id", session.id);

    // Mark tracks as sold
    await supabase.from("tracks").update({ status: "sold" }).in("id", trackIdList);

    // Notify buyer
    const { data: tracks } = await supabase.from("tracks").select("title, seller_id").in("id", trackIdList);
    if (tracks) {
      for (const track of tracks) {
        // Notify buyer
        await supabase.from("notifications").insert({
          user_id: buyer_id,
          type: "sale",
          title: "Purchase Confirmed! 🎉",
          body: `"${track.title}" is yours. Download your files now.`,
          metadata: { track_id: trackIdList[0] },
        });
        // Notify seller
        const { data: order } = await supabase
          .from("orders")
          .select("seller_payout")
          .eq("stripe_session_id", session.id)
          .eq("seller_id", track.seller_id)
          .single();
        await supabase.from("notifications").insert({
          user_id: track.seller_id,
          type: "sale",
          title: "Track Sold! 💰",
          body: `"${track.title}" just sold for $${(order?.seller_payout ?? 0) / 100}. Payout queued.`,
        });
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await supabase.from("orders").delete().eq("stripe_session_id", session.id).eq("status", "pending");
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
