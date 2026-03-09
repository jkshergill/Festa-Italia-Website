import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    // Get auth token from request
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { amount, orderId } = await req.json();

    if (amount == null || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing amount or orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase with SERVICE_ROLE_KEY
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user with token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('✅ User verified:', user.id);

    // Get pending order
    const { data: pendingOrder, error: orderError } = await supabase
      .from('pending_orders')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !pendingOrder) {
      console.error('Pending order error:', orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(pendingOrder.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Order has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine which Clover environment to use
    const isSandbox = Deno.env.get("CLOVER_ENVIRONMENT") === "sandbox";
    const cloverApiUrl = isSandbox 
      ? "https://apisandbox.dev.clover.com/invoicingcheckoutservice/v1/checkouts"
      : "https://api.clover.com/invoicingcheckoutservice/v1/checkouts";

    // Get Clover credentials
    const cloverApiKey = Deno.env.get("MOCK_CLOVER_API_KEY");
    const cloverMerchantId = Deno.env.get("MOCK_CLOVER_MERCHANT_ID");

    // 🔥 TEMPORARY: Hardcode your ngrok URL for testing
    const frontendOrigin = 'https://unhonied-unprematurely-jeffry.ngrok-free.dev';
    console.log('🔍 Using hardcoded origin for testing:', frontendOrigin);

    // Log environment variables for debugging
    console.log('🔍 Debug - Environment check:', {
      hasApiKey: !!cloverApiKey,
      hasMerchantId: !!cloverMerchantId,
      apiKeyLength: cloverApiKey?.length,
      merchantId: cloverMerchantId,
      cloverEnvironment: Deno.env.get("CLOVER_ENVIRONMENT"),
      cloverApiUrl: cloverApiUrl
    });

    if (!cloverApiKey || !cloverMerchantId) {
      console.error('Missing Clover credentials');
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare request body
    const requestBody = {
      customer: {
        email: pendingOrder.buyer_email
      },
      redirectUrls: {
        success: `${frontendOrigin}/?page=success&orderId=${orderId}`,
        cancel: `${frontendOrigin}/?page=cancel&orderId=${orderId}`,
        failure: `${frontendOrigin}/?page=failure&orderId=${orderId}`
      },
      shoppingCart: {
        lineItems: pendingOrder.attendee_names.map((name, index) => ({
          name: `${pendingOrder.ticket_types[index]} Ticket - ${name}`,
          price: pendingOrder.ticket_types[index] === 'child' ? 1000 : 2000,
          unitQty: 1
        }))
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

    console.log('🔍 Clover response status:', cloverResponse.status);
    console.log('🔍 Clover response headers:', Object.fromEntries(cloverResponse.headers.entries()));

    // Handle response based on content type
    const contentType = cloverResponse.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await cloverResponse.json();
      console.log('🔍 Clover JSON response:', data);
    } else {
      const text = await cloverResponse.text();
      console.error('❌ Clover returned non-JSON:', text);
      
      return new Response(
        JSON.stringify({ 
          error: "Clover checkout failed", 
          details: text.substring(0, 200)
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!cloverResponse.ok) {
      console.error("Clover error:", data);
      return new Response(
        JSON.stringify({ 
          error: "Clover checkout failed", 
          details: data.message || data.error || JSON.stringify(data)
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update pending order with Clover session info
    await supabase
      .from('pending_orders')
      .update({ 
        metadata: { 
          ...pendingOrder.metadata,
          clover_session_id: data.checkoutSessionId,
          clover_checkout_url: data.href 
        }
      })
      .eq('order_id', orderId);

    console.log('✅ Checkout created successfully, redirecting to:', data.href);

    // Return the checkout URL to frontend
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