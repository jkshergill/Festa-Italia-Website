// supabase/functions/delete-user/index.ts
// Edge Function to delete a Supabase Auth user using the service_role key.
// Expected env vars (set these in your Supabase project/hosting environment):
// SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

// Provide minimal declarations so editors/TS don't complain about Deno globals
declare const Deno: any;

const corsDeleteHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsDeleteHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsDeleteHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('VITE_SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration on server (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsDeleteHeaders } }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing Authorization bearer token' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsDeleteHeaders } });
    }

    const body = await req.json().catch(() => ({}));
    const userIdFromBody = body?.userId;

    // Fetch the user associated with the provided access token to verify identity
    const userInfoResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey || '',
      },
    });

    if (!userInfoResp.ok) {
      const text = await userInfoResp.text().catch(() => 'no body');
      return new Response(JSON.stringify({ error: `Failed to verify user token: ${userInfoResp.status} ${text}` }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsDeleteHeaders } });
    }

    const userData = await userInfoResp.json();
    const userId = userData?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unable to determine user ID from token' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsDeleteHeaders } });
    }

    // Ensure the request is attempting to delete the same user (safety guard)
    if (userIdFromBody && userIdFromBody !== userId) {
      return new Response(JSON.stringify({ error: 'Token does not match requested userId' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsDeleteHeaders } });
    }

    // Perform admin delete using the service role key
    const deleteResp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    });

    if (!deleteResp.ok) {
      const text = await deleteResp.text().catch(() => 'no body');
      console.error('Delete user error:', deleteResp.status, text);
      return new Response(JSON.stringify({ error: `Failed to delete user: ${deleteResp.status} ${text}` }), { status: 502, headers: { 'Content-Type': 'application/json', ...corsDeleteHeaders } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsDeleteHeaders } });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsDeleteHeaders } });
  }
});
