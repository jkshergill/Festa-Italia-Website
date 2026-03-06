import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient"; // adjust path

export default function ProfileInfo() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState({ first_name: "", last_name: "" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      // 1) Auth user (email + id)
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

      if (!cancelled) setUserEmail(user.email ?? "");

      // 2) Profile row (first_name/last_name)
      // Assumes profiles.id === auth.users.id (very common Supabase setup)
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("first_name,last_name,email")
        .eq("id", user.id)
        .single();

      if (profileErr) {
        if (!cancelled) setErr(profileErr.message);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setProfile({
          first_name: profileData?.first_name ?? "",
          last_name: profileData?.last_name ?? "",
        });

        // If you want email from profiles when present:
        if (profileData?.email) setUserEmail(profileData.email);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>Loading profile…</div>;
  if (err) return <div style={{ color: "crimson" }}>Error: {err}</div>;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700 }}>Email</div>
        <div>{userEmail || "—"}</div>
      </div>

      <div>
        <div style={{ fontWeight: 700 }}>First name</div>
        <div>{profile.first_name || "—"}</div>
      </div>

      <div>
        <div style={{ fontWeight: 700 }}>Last name</div>
        <div>{profile.last_name || "—"}</div>
      </div>
    </div>
  );
}