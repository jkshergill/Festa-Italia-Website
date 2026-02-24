import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function BocceTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bocce_teams")
        .select("id, team_name, player1, player2, player3, player4, sponsor_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setTeams(data || []);
      }

      setLoading(false);
    };

    fetchTeams();
  }, []);

  if (loading) return <p>Loading your teams...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!teams.length) return <p>You are not part of any bocce teams yet.</p>;

  return (
    <div className="bocce-teams-container">
      {teams.map(team => (
        <div key={team.id} className="bocce-team-card">
          <h3>{team.team_name}</h3>
          <p>Registered on {new Date(team.created_at).toLocaleDateString()}</p>
          <ul>
            <li>{team.player1}</li>
            <li>{team.player2}</li>
            <li>{team.player3}</li>
            <li>{team.player4}</li>
          </ul>
          {team.sponsor_name && <p><strong>Sponsor:</strong> {team.sponsor_name}</p>}
        </div>
      ))}
    </div>
  );
}
