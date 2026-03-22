import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const DAY_ORDER = ["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"];
const TIMEFRAME_ORDER = ["morning", "evening", "night"];

function prettyTimeframe(value) {
  if (!value) return "Timeframe TBD";
  const lower = String(value).toLowerCase();
  if (lower === "morning") return "Morning";
  if (lower === "evening") return "Evening";
  if (lower === "night") return "Night";
  return String(value);
}

export default function VolunteerShifts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        if (!cancelled) setError(userErr.message);
        setLoading(false);
        return;
      }

      const user = userData?.user;
      if (!user) {
        if (!cancelled) setError("Not logged in.");
        setLoading(false);
        return;
      }

      // Requires FK: volunteer_signups.booth_id -> booths.id
      const { data, error } = await supabase
        .from("volunteer_signups")
        .select(
          `
          id, 
          day, 
          timeframe,
          confirm, 
          booths!volunteer_signups_booth_id_fkey (name)
          `
        )
        .eq("user_id", user.id)
        .order("day", { ascending: true });
      
      

      if (error) {
        if (!cancelled) setError(error.message);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        const sorted = [...(data ?? [])].sort((a, b) => {
          const dayA = DAY_ORDER.indexOf(String(a.day || "").toLowerCase());
          const dayB = DAY_ORDER.indexOf(String(b.day || "").toLowerCase());
          const safeDayA = dayA === -1 ? Number.MAX_SAFE_INTEGER : dayA;
          const safeDayB = dayB === -1 ? Number.MAX_SAFE_INTEGER : dayB;
          if (safeDayA !== safeDayB) return safeDayA - safeDayB;

          const tfA = TIMEFRAME_ORDER.indexOf(String(a.timeframe || "").toLowerCase());
          const tfB = TIMEFRAME_ORDER.indexOf(String(b.timeframe || "").toLowerCase());
          const safeTfA = tfA === -1 ? Number.MAX_SAFE_INTEGER : tfA;
          const safeTfB = tfB === -1 ? Number.MAX_SAFE_INTEGER : tfB;
          return safeTfA - safeTfB;
        });

        setShifts(sorted);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /*const grouped = useMemo(() => {
    const byDay = new Map();
    for (const s of shifts) {
      const day = (s.day ?? "").toLowerCase();
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(s);
    }
    return byDay;
  }, [shifts]);*/

  if (loading) return <p>Loading your volunteer shifts…</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  if (!shifts.length) {
    return (
      <div>
        <h3>My Volunteer Shifts</h3>
        <p>You don’t have any volunteer shifts yet.</p>
      </div>
    );
  }

  // const dayOrder = ["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"];

  return (
  <div style={{ display: "grid", gap: 12 }}>
      {shifts.map((s) => (
        <div
          key={s.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 12,
          }}
        >
          <div style={{ fontWeight: 700 }}>
            {s.booths?.name || "Booth"}
          </div>

          <div style={{ opacity: 0.8 }}>
            {s.day?.charAt(0).toUpperCase() + s.day?.slice(1)} •{" "}
            {prettyTimeframe(s.timeframe)}
          </div>

          <div style={{ marginTop: 8, fontSize: 14 }}>
            <div>
              <strong>Status:</strong>{" "}
              {s.confirm ? "Confirmed" : "Pending confirmation"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}