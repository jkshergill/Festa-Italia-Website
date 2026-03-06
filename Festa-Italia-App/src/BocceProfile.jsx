import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function normalizeSpaces(str = "") {
  return str.trim().replace(/\s+/g, " ");
}

export default function BocceProfile() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTeams() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userErr) {
        setError(userErr.message || "Failed to get current user.");
        setLoading(false);
        return;
      }

      console.log("[BocceProfile] supabase user:", user);
      console.log("[BocceProfile] user_metadata:", user?.user_metadata);

      if (!user) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const first = normalizeSpaces(
        user.user_metadata?.first_name ||
          user.user_metadata?.firstName ||
          user.user_metadata?.given_name ||
          ""
      );

      const last = normalizeSpaces(
        user.user_metadata?.last_name ||
          user.user_metadata?.lastName ||
          user.user_metadata?.family_name ||
          ""
      );

      const fullName = normalizeSpaces(`${first} ${last}`);

const { data: sampleRows, error: sampleErr } = await supabase
  .from("bocce_teams")
  .select("id, team_name, player1, player2, player3, player4")
  .order("team_name", { ascending: true }) // optional: deterministic
  .limit(3);
console.log("[BocceProfile] sampleErr:", sampleErr);
console.log("[BocceProfile] sample row count:", (sampleRows || []).length);
console.log("[BocceProfile] sample rows:", sampleRows);
if (sampleErr) {
  console.log("[BocceProfile] sample bocce_teams query error:", sampleErr);
} else {
  console.log("[BocceProfile] sample bocce_teams row count:", sampleRows?.length ?? 0);
  console.log("[BocceProfile] sample bocce_teams rows (raw):", sampleRows);

  (sampleRows || []).forEach((row, idx) => {
    console.log(
      `[BocceProfile] Row ${idx + 1} (${row.team_name || row.id})`,
      {
        player1: row.player1,
        player2: row.player2,
        player3: row.player3,
        player4: row.player4,
      }
    );
  });
}
      if (!fullName) {
        setTeams([]);
        setError(
          "Could not derive first/last name from Supabase auth user_metadata. Check console logs to see what fields exist."
        );
        setLoading(false);
        return;
      }

      const pattern = `%${fullName}%`;

      // --- DEBUG: log DB search pattern ---
      console.log("[BocceProfile] search pattern (ilike):", pattern);
      
      const { data, error: teamsErr } = await supabase
        .from("bocce_teams")
        .select("id, team_name, sponsor_name, player1, player2, player3, player4, confirm")
        .or(
          `player1.ilike.${pattern},player2.ilike.${pattern},player3.ilike.${pattern},player4.ilike.${pattern}`
        );
      if (!isMounted) return;

      if (teamsErr) {
        console.log("[BocceProfile] teams query error:", teamsErr);
        setError(teamsErr.message || "Failed to load bocce teams.");
        setTeams([]);
      } else {
        console.log("[BocceProfile] matched teams:", data);
        setTeams(data || []);
      }

      setLoading(false);
    }

    loadTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div>Loading bocce team info…</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;
  if (!teams.length) return <div>No bocce team found for your profile name.</div>;

  return (
    <div>
      <h3>My Bocce Teams</h3>
      {teams.map((t) => (
        <div key={t.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{t.team_name}</div>
          <div style={{ marginTop: 6 }}>
            <strong>Sponsored by:</strong> {t.sponsor_name || "—"}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Confirmed:</strong> {t.confirm ? "Yes" : "No"}
          </div>
          <div style={{ marginTop: 10 }}>
            <div><strong>1:</strong> {t.player1 || "—"}</div>
            <div><strong>2:</strong> {t.player2 || "—"}</div>
            <div><strong>3:</strong> {t.player3 || "—"}</div>
            <div><strong>4:</strong> {t.player4 || "—"}</div>
          </div>
        </div>
      ))}
    </div>
  );
}