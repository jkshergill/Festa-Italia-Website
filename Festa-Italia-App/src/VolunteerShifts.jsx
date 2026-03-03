import { useEffect, useMemo, useState } from "react";
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
  const [error, setError] = useState(null);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        if (!cancelled) {
          setError(authErr.message);
          setLoading(false);
        }
        return;
      }

      const user = authData?.user;
      if (!user) {
        if (!cancelled) {
          setError("You must be signed in to view your volunteer shifts.");
          setLoading(false);
        }
        return;
      }

      // Requires FK: volunteer_signups.booth_id -> booths.id
      const { data, error: qErr } = await supabase
        .from("volunteer_signups")
        .select("id, day, hour, confirm, booths ( name )")
        .eq("user_id", user.id)
        .order("day", { ascending: true })
        .order("hour", { ascending: true });

      if (!cancelled) {
        if (qErr) {
          setError(qErr.message);
          setShifts([]);
        } else {
          setShifts(data ?? []);
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const byDay = new Map();
    for (const s of shifts) {
      const day = (s.day ?? "").toLowerCase();
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(s);
    }
    return byDay;
  }, [shifts]);

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

  const dayOrder = ["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"];

  return (
    <div>
      <h3>My Volunteer Shifts</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: ".5rem" }}>Day</th>
              <th style={{ textAlign: "left", padding: ".5rem" }}>Time</th>
              <th style={{ textAlign: "left", padding: ".5rem" }}>Booth</th>
              <th style={{ textAlign: "left", padding: ".5rem" }}>Confirmed</th>
            </tr>
          </thead>
          <tbody>
            {dayOrder
              .filter((d) => grouped.has(d))
              .flatMap((d) => grouped.get(d).map((s) => ({ ...s, _day: d })))
              .map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: ".5rem" }}>{s._day.charAt(0).toUpperCase() + s._day.slice(1)}</td>
                  <td style={{ padding: ".5rem" }}>{formatRange(Number(s.hour))}</td>
                  <td style={{ padding: ".5rem" }}>{s.booths?.name ?? "(unknown)"}</td>
                  <td style={{ padding: ".5rem" }}>{s.confirm ? "Yes" : "No"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}