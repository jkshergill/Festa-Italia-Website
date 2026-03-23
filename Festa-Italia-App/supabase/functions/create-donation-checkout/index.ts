import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "ngrok-skip-browser-warning": "true"
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { amount, donorName, donationType, donationNote, orderId } = await req.json();

    if (!amount || !donorName || !donationType || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('✅ User verified:', user.id);

    // Create pending donation record
    const { data: pendingDonation, error: pendingError } = await supabase
      .from('pending_orders')
      .insert({
        order_id: orderId,
        user_id: user.id,
        buyer_email: user.email,
        amount: amount,
        order_type: 'donation',
        metadata: {
          donor_name: donorName,
          donation_note: donationNote || null,
          donation_type: donationType
        },
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (pendingError) {
      console.error('Pending donation error:', pendingError);
      return new Response(
        JSON.stringify({ error: "Failed to create donation record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('✅ Pending donation created:', pendingDonation);

    // Determine Clover environment
    const isSandbox = Deno.env.get("CLOVER_ENVIRONMENT") === "sandbox";
    const cloverApiUrl = isSandbox 
      ? "https://apisandbox.dev.clover.com/invoicingcheckoutservice/v1/checkouts"
      : "https://api.clover.com/invoicingcheckoutservice/v1/checkouts";

    // Get Clover credentials
    const cloverApiKey = Deno.env.get("MOCK_CLOVER_API_KEY");
    const cloverMerchantId = Deno.env.get("MOCK_CLOVER_MERCHANT_ID");
    const frontendOrigin = "https://unhonied-unprematurely-jeffry.ngrok-free.dev";

    if (!cloverApiKey || !cloverMerchantId) {
      console.error('Missing Clover credentials');
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare request body for Clover (matching the working ticket format)
const requestBody = {
  customer: {
    email: user.email
  },
  redirectUrls: {
    success: `${frontendOrigin}/?page=donation-success&orderId=${orderId}`,
    cancel: `${frontendOrigin}/?page=donation-cancel&orderId=${orderId}`,
    failure: `${frontendOrigin}/?page=donation-failure&orderId=${orderId}`
  },
  shoppingCart: {
    lineItems: [{
      name: `${donationType} Donation - ${donorName}`,
      price: amount,
      unitQty: 1
    }]
  },
  // Add these fields that were in the working ticket checkout
  merchant_id: cloverMerchantId,
  currency: "USD",
  description: `${donationType} donation from ${donorName}`,
  metadata: {
    orderId: orderId,
    donationType: donationType,
    donorName: donorName
  }
};

    console.log('🔍 Request body being sent to Clover:', JSON.stringify(requestBody, null, 2));

    // Create Clover checkout session
    const cloverResponse = await fetch(cloverApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cloverApiKey}`,
        "Content-Type": "application/json",
        "X-Clover-Merchant-Id": cloverMerchantId,
      },
      body: JSON.stringify(requestBody),
    });

    const contentType = cloverResponse.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await cloverResponse.json();
      console.log('🔍 Clover JSON response:', data);
    } else {
      const text = await cloverResponse.text();
      console.error('❌ Clover returned non-JSON:', text);
      return new Response(
        JSON.stringify({ error: "Clover checkout failed", details: text.substring(0, 200) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!cloverResponse.ok) {
      console.error("Clover error:", data);
      return new Response(
        JSON.stringify({ error: "Clover checkout failed", details: data.message || data.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update pending donation with Clover session info
    await supabase
      .from('pending_orders')
      .update({ 
        metadata: { 
          ...pendingDonation.metadata,
          clover_session_id: data.checkoutSessionId,
          clover_checkout_url: data.href 
        }
      })
      .eq('order_id', orderId);

    console.log('✅ Donation checkout created, redirecting to:', data.href);

    // Return the checkout URL
    return new Response(
      JSON.stringify({ 
        checkoutUrl: data.href,
        orderId: orderId 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("❌ Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});