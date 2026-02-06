// src/MockCheckout.jsx
import { useMemo } from "react";
import { supabase } from "./supabaseClient";

const isUuid = (v) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export default function MockCheckout() {
  const params = new URLSearchParams(window.location.search);
  const amount = Number(params.get("amount") || 0);
  const names = (params.get("names") || "").split("|").filter(Boolean);
  const email = params.get("email") || "";
  const sid = params.get("sid") || ""; // could be non-uuid
  const types = (params.get("types") || "").split("|").filter(Boolean); // adult|child...
  const food = (params.get("food") || "").split("|").filter(Boolean);   // steak|fish|pasta...

  const dollars = useMemo(() => (amount / 100).toFixed(2), [amount]);

  const complete = async () => {
    const { data: sessionRes } = await supabase.auth.getSession();
    console.log("ROLE:", sessionRes?.session ? "authenticated" : "anon", sessionRes?.session?.user?.id);

    try {
      // Make sure we're signed in (required by your RLS policy)
      const { data: sessionRes, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;

      const user = sessionRes?.session?.user;
      if (!user) {
        alert("Please sign in to purchase tickets.");
        return;
      }

      if (!names.length) {
        alert("No attendee names were passed to checkout.");
        return;
      }

      // order_id is uuid in your table — ensure it's a uuid
      const orderId = isUuid(sid) ? sid : crypto.randomUUID();

      const tickets = names.map((name, i) => {
        const t = types[i] || "adult";
        const price_cents = t === "child" ? 1000 : 2000;

        return {
          event: "Festa Italia Coronation Ball 2026",
          purchaser_profile_id: user.id,
          holder_profile_id: user.id,
          holder_name: name,
          holder_email: user.email ?? email ?? null,
          issued_at: new Date().toISOString(),
          ticket_type: t,
          price_cents,
          order_id: null,
          qr_token: crypto.randomUUID(),
          dinner_choice: food[i] || "steak",
        };
      });

      const { data, error } = await supabase.from("tickets").insert(tickets).select();

      if (error) {
        console.error("Ticket insert failed:", error);
        alert(`Ticket insert failed: ${error.message}`);
        return;
      }

      console.log("Inserted tickets:", data);
      alert(`Mock payment successful for $${dollars} (order ${orderId})`);
      window.location.assign("/?page=coronation-tix");
    } catch (err) {
      console.error(err);
      alert(`Unexpected error: ${err?.message ?? err}`);
    }
  };

  const cancel = () => {
    alert("Mock payment canceled.");
    window.location.assign("/?page=coronation-tix");
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Mock Checkout</h1>
      <p>This simulates Clover’s Hosted Checkout screen.</p>
      <hr />
      <p><strong>Buyer:</strong> {email || "Guest"}</p>
      <p><strong>Attendees:</strong> {names.length ? names.join(", ") : "—"}</p>
      <p><strong>Total:</strong> ${dollars}</p>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={complete}>Pay ${dollars}</button>
        <button onClick={cancel}>Cancel</button>
      </div>
    </div>
  );
}

