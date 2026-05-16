import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { trackIds } = await req.json() as { trackIds: string[] };

    const { data: tracks, error: tracksError } = await supabase
      .from("tracks")
      .select("id, title, price, artwork_url, seller_id, status")
      .in("id", trackIds)
      .eq("status", "approved");

    if (tracksError || !tracks?.length) {
      return new Response(JSON.stringify({ error: "Tracks not found or unavailable" }), { status: 400, headers: corsHeaders });
    }

    const lineItems = tracks.map((t) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: t.title,
          images: t.artwork_url ? [t.artwork_url] : [],
          metadata: { track_id: t.id, seller_id: t.seller_id },
        },
        unit_amount: t.price * 100,
      },
      quantity: 1,
    }));

    const origin = req.headers.get("origin") ?? "https://ghostbus.io";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tracks`,
      customer_email: user.email,
      metadata: {
        buyer_id: user.id,
        track_ids: trackIds.join(","),
      },
    });

    // Create pending orders
    for (const track of tracks) {
      const fee = Math.round(track.price * 0.15);
      await supabase.from("orders").insert({
        track_id: track.id,
        buyer_id: user.id,
        seller_id: track.seller_id,
        amount: track.price,
        platform_fee: fee,
        seller_payout: track.price - fee,
        stripe_session_id: session.id,
        status: "pending",
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
