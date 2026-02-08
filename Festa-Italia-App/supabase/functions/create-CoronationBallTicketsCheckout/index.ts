import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { amount, orderId } = await req.json();

    if (!amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing amount or orderId" }),
        { status: 400 }
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
          amount, // cents
          currency: "USD",
          merchant_id: Deno.env.get("CLOVER_MERCHANT_ID"),
          redirect_urls: {
            // For local development, use localhost URL
            // Need to replace localhost URL with actual URL when deployed
            success: "/Festa-Italia-Website/Festa-Italia-App/src/PurchasedTickets.jsx", 
            cancel: "https://http://127.0.0.1:5173/cancel", // Replace with your actual cancel URL when user cancels the transaction
          },
          metadata: {
            orderId,
          },
        }),
      }
    );

    const data = await cloverResponse.json();

    if (!cloverResponse.ok) {
      console.error("Clover error:", data);
      return new Response(
        JSON.stringify({ error: "Clover checkout failed" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ checkoutUrl: data.checkout_url }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
});
