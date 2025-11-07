// supabase/functions/create-checkout/index.ts

// No imports needed — Supabase Edge Functions run on Deno and expose Deno.serve

const corsHeaders = {
  "access-control-allow-origin": "*", // tighten to your domain if you want
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {

  // DEBUG: Return env vars
/*if (req.method === "GET") {
  const MOCK = Deno.env.get("MOCK_CLOVER");
  const FRONTEND = Deno.env.get("FRONTEND_ORIGIN");
  const CLOVER_ID = Deno.env.get("CLOVER_MERCHANT_ID") ?? "(none)";
  const CLOVER_KEY = Deno.env.get("CLOVER_PRIVATE_KEY") ?? "(none)";
  const data = { MOCK, FRONTEND, CLOVER_ID, CLOVER_KEY };
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
} */

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    const { buyerEmail, lineItems, attendeeNames } = await req.json();

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return new Response("Missing or invalid line items", { status: 400, headers: corsHeaders });
    }

    const MOCK = (Deno.env.get("MOCK_CLOVER") ?? "").toLowerCase() === "1";
    const FRONTEND_ORIGIN = Deno.env.get("FRONTEND_ORIGIN") || "http://localhost:5173";

    const merchantId = Deno.env.get("CLOVER_MERCHANT_ID") || "";
    const cloverPrivateKey = Deno.env.get("CLOVER_PRIVATE_KEY") || "";

    // Mock mode (or when creds aren’t set yet)
    if (MOCK || !merchantId || !cloverPrivateKey) {
      const totalCents = lineItems.reduce(
        (sum: number, li: any) => sum + (Number(li.price) || 0) * (Number(li.unitQty) || 1),
        0
      );
      const sid = crypto.randomUUID();

      const href = `${FRONTEND_ORIGIN}/mock-checkout?sid=${encodeURIComponent(
        sid
      )}&amount=${totalCents}&names=${encodeURIComponent(
        (attendeeNames ?? []).join("|")
      )}&email=${encodeURIComponent(buyerEmail ?? "")}`;

      return new Response(JSON.stringify({ href, mock: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      });
    }

    // Real Clover call (sandbox)
    const payload = {
      customer: buyerEmail ? { email: buyerEmail } : {},
      shoppingCart: { lineItems },
      order: { note: `Festa Italia Ball Tickets: ${attendeeNames?.join(", ") ?? ""}` },
    };

    const resp = await fetch(
      "https://apisandbox.dev.clover.com/invoicingcheckoutservice/v1/checkouts",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "X-Clover-Merchant-Id": merchantId,
          authorization: `Bearer ${cloverPrivateKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Clover API error:", errorText);
      return new Response("Failed to create Clover checkout", { status: 502, headers: corsHeaders });
    }

    const data = await resp.json(); // { href, checkoutSessionId, ... }
    return new Response(JSON.stringify({ href: data.href }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response("Internal server error", { status: 500, headers: corsHeaders });
  }
});


