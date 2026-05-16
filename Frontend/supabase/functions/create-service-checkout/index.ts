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
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { serviceId, requirements } = await req.json() as { serviceId: string; requirements: string };

    const { data: service, error } = await supabase
      .from("services")
      .select("id, title, price, seller_id")
      .eq("id", serviceId)
      .eq("status", "active")
      .single();

    if (error || !service) return new Response(JSON.stringify({ error: "Service not found" }), { status: 400, headers: corsHeaders });

    const origin = req.headers.get("origin") ?? "https://ghostbus.io";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: service.title },
          unit_amount: service.price * 100,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/dashboard/messages?service_order=success`,
      cancel_url: `${origin}/services`,
      customer_email: user.email,
      metadata: { buyer_id: user.id, service_id: serviceId, seller_id: service.seller_id },
    });

    const deliveryDue = new Date();
    deliveryDue.setDate(deliveryDue.getDate() + 7);

    await supabase.from("service_orders").insert({
      service_id: serviceId,
      buyer_id: user.id,
      seller_id: service.seller_id,
      requirements,
      amount: service.price,
      stripe_session_id: session.id,
      delivery_due_at: deliveryDue.toISOString(),
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
