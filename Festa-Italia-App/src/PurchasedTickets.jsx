import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient"; // <- adjust path to your project

export default function PurchasedTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      // 1) Get the currently logged-in user
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        if (!cancelled) setErr(userErr.message);
        setLoading(false);
        return;
      }

      const user = userData?.user;
      if (!user) {
        if (!cancelled) setErr("Not logged in.");
        setLoading(false);
        return;
      }

      // Assumption (common Supabase pattern): profiles.id === auth.users.id
      const profileId = user.id;

      // 2) Query tickets purchased by this profile
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          id,
          event,
          ticket_type,
          price_cents,
          issued_at,
          checked_in_at,
          revoked_at,
          holder_name,
          holder_email,
          qr_token,
          order_id
        `
        )
        .eq("purchaser_profile_id", profileId)
        .order("issued_at", { ascending: false });

      if (error) {
        if (!cancelled) setErr(error.message);
        setLoading(false);
        return;
      }

      if (!cancelled) setTickets(data ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Loading tickets…</div>;
  if (err) return <div style={{ color: "crimson" }}>Error: {err}</div>;

  if (!tickets.length) {
    return <div>No purchased tickets found.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {tickets.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 12,
          }}
        >
          <div style={{ fontWeight: 700 }}>{t.event}</div>
          <div style={{ opacity: 0.8 }}>
            {t.ticket_type || "Ticket"} • ${(Number(t.price_cents || 0) / 100).toFixed(2)}
          </div>

          <div style={{ marginTop: 8, fontSize: 14 }}>
            <div>
              <strong>Holder:</strong> {t.holder_name || "—"} ({t.holder_email || "—"})
            </div>
            <div>
              <strong>Issued:</strong>{" "}
              {t.issued_at ? new Date(t.issued_at).toLocaleString() : "—"}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              {t.revoked_at
                ? "Revoked"
                : t.checked_in_at
                ? "Checked in"
                : "Active"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
