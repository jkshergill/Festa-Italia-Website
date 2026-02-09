import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const { amount, orderId } = await req.json();

    if (amount == null || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing amount or orderId" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const cloverResponse = await fetch(
      "https://api.clover.com/ecommerce/v1/checkouts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("CLOVER_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "USD",
          merchant_id: Deno.env.get("CLOVER_MERCHANT_ID"),
          redirect_urls: {
            success: "http://localhost:5173/success",
            cancel: "http://localhost:5173/cancel",
          },
          metadata: { orderId },
        }),
      }
    );

    const data = await cloverResponse.json();

    if (!cloverResponse.ok) {
      console.error("Clover error:", data);
      return new Response(
        JSON.stringify({ error: "Clover checkout failed", details: data }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ checkoutUrl: data.checkout_url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
