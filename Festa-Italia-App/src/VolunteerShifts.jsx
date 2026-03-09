import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function to12Hour(h) {
  const hour = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour}:00 ${ampm}`;
}

function formatRange(h) {
  return `${to12Hour(h)} - ${to12Hour(h + 1)}`;
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
          hour, 
          confirm, 
          booths!volunteer_signups_booth_id_fkey (name)
          `
        )
        .eq("user_id", user.id)
        .order("day", { ascending: true })
        .order("hour", { ascending: true });
      
      

      if (error) {
        if (!cancelled) setError(error.message);
        setLoading(false);
        return;
      }

      if (!cancelled) setShifts(data ?? []);
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
            {formatRange(Number(s.hour))}
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