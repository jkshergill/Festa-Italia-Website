// supabase/functions/create-order-tickets/index.ts
// Edge Function: create an order and its tickets atomically (best-effort) using
// the service role key, then send a confirmation email via SendGrid.

// Avoid redeclaring Deno in editors; rely on deno.json for types in the functions folder.
const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

async function sendEmail(sendgridKey: string, to: string, name: string, tickets: any[]) {
  const rows = tickets.map((t) => `<tr><td style="padding:8px;border:1px solid #ddd">${escapeHtml(t.holder_name)}</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(t.ticket_type)}</td><td style="padding:8px;border:1px solid #ddd">$${((t.price_cents||0)/100).toFixed(2)}</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(t.qr_token)}</td></tr>`).join('');
  const html = `
    <div style="font-family:system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color:#111;">
      <h2>Festa Italia - Ticket Confirmation</h2>
      <p>Hi ${escapeHtml(name || to)},</p>
      <p>Thank you for your purchase. Your tickets:</p>
      <table style="border-collapse:collapse;width:100%"><thead><tr><th style="text-align:left;padding:8px;border:1px solid #ddd">Name</th><th style="text-align:left;padding:8px;border:1px solid #ddd">Type</th><th style="text-align:left;padding:8px;border:1px solid #ddd">Price</th><th style="text-align:left;padding:8px;border:1px solid #ddd">QR Token</th></tr></thead><tbody>${rows}</tbody></table>
      <p>Bring this email or show the QR tokens at check-in.</p>
      <p>— Festa Italia</p>
    </div>`;

  const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sendgridKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'tickets@festa-italia.org', name: 'Festa Italia' },
      subject: 'Your Festa Italia Tickets',
      content: [{ type: 'text/html', value: html }],
    }),
  });
  return resp;
}

function escapeHtml(s: string) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('VITE_SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase configuration on server' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization bearer token' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const payload = await req.json().catch(() => ({}));
  const tickets = payload.tickets || [];
  const amount_cents = payload.amount_cents || tickets.reduce((s: number, t: any) => s + (t.price_cents || 0), 0);
  const orderId = payload.orderId || crypto.randomUUID();
  const purchaserEmail = payload.purchaserEmail;
  const purchaserName = payload.purchaserName || purchaserEmail;
  // Orders table requires an event name and currency; accept from payload or derive from tickets
  const eventName = payload.event || (tickets[0] && tickets[0].event) || 'Festa Italia Coronation Ball 2026';
  const currency = payload.currency || 'USD';

    // Verify token -> get user id
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey || '' },
    });
    if (!userResp.ok) {
      const txt = await userResp.text().catch(() => 'no body');
      return new Response(JSON.stringify({ error: `Failed to verify token: ${userResp.status} ${txt}` }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    const userData = await userResp.json();
    const userId = userData?.id;
    if (!userId) return new Response(JSON.stringify({ error: 'Unable to determine user from token' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    // Compute quantity (orders table requires quantity NOT NULL). If tickets contain a quantity field use it,
    // otherwise treat each ticket payload entry as a single ticket.
    const quantity = tickets.reduce((s: number, t: any) => s + (typeof t.quantity === 'number' ? t.quantity : 1), 0);

    // Build line_items JSON for the order (orders.line_items is NOT NULL in the DB).
    // We derive line items from the tickets array; since each ticket object represents a seat,
    // group identical ticket_type + price into aggregated line items for compactness.
    const grouped: Record<string, any> = {};
    for (const t of tickets) {
      const key = `${t.ticket_type}::${t.price_cents || 0}`;
      if (!grouped[key]) grouped[key] = { ticket_type: t.ticket_type, price_cents: t.price_cents || 0, quantity: 0, dinner_choices: [] };
      grouped[key].quantity += (typeof t.quantity === 'number' ? t.quantity : 1);
      if (t.dinner_choice) grouped[key].dinner_choices.push(t.dinner_choice);
    }
    const line_items = Object.values(grouped).map((g) => ({ ticket_type: g.ticket_type, price_cents: g.price_cents, quantity: g.quantity, dinner_choices: g.dinner_choices }));

    // Insert order using service role key
  const orderPayload = [{ id: orderId, purchaser_profile_id: userId, event: eventName, amount_cents, currency, quantity, line_items, status: 'completed', created_at: new Date().toISOString() }];
    const orderResp = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResp.ok) {
      const txt = await orderResp.text().catch(() => 'no body');
      console.error('Order insert failed:', orderResp.status, txt);
      return new Response(JSON.stringify({ error: `Order insert failed: ${orderResp.status} ${txt}` }), { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Prepare tickets with order_id
    const ticketsPayload = tickets.map((t: any) => ({
      ...t,
      purchaser_profile_id: userId,
      holder_profile_id: userId,
      order_id: orderId,
      issued_at: new Date().toISOString(),
    }));

    const ticketsResp = await fetch(`${supabaseUrl}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(ticketsPayload),
    });

    if (!ticketsResp.ok) {
      const txt = await ticketsResp.text().catch(() => 'no body');
      console.error('Ticket insert failed:', ticketsResp.status, txt);
      // Attempt best-effort rollback: delete the order we created
      await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey } }).catch(() => {});
      return new Response(JSON.stringify({ error: `Ticket insert failed: ${ticketsResp.status} ${txt}` }), { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const insertedTickets = await ticketsResp.json();

    // Send confirmation email if key exists (best-effort)
    if (sendgridKey && purchaserEmail) {
      try {
        const sgResp = await sendEmail(sendgridKey, purchaserEmail, purchaserName, insertedTickets);
        if (!sgResp.ok) {
          const txt = await sgResp.text().catch(() => 'no body');
          console.warn('SendGrid error:', sgResp.status, txt);
        }
      } catch (e) {
        console.warn('SendGrid send failed', e);
      }
    }

    return new Response(JSON.stringify({ success: true, tickets: insertedTickets }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
