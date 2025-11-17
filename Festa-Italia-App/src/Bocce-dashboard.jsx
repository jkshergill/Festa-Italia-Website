import { useEffect } from "react";
import "./bocce-dashboard.css";

export default function BocceDashboard() {
  useEffect(() => {
    // page-level background
    document.body.classList.add("bd-body");
    return () => document.body.classList.remove("bd-body");
  }, []);

  const currentYear = new Date().getFullYear();
  const previousWinners = [
    { year: currentYear - 1, team: "Il Tricolore" },
    { year: currentYear - 2, team: "Palermo Aces" },
    { year: currentYear - 3, team: "Monterey Rollers" },
    { year: currentYear - 4, team: "Marin Mafiosi" },
  ];

  return (
    <div className="bd-page">
      <main className="bd-border" role="main" aria-labelledby="bocce-dashboard-title">
        <h1 id="bocce-dashboard-title" className="bd-title">
          Bocce Tournament {currentYear}
        </h1>

        {/* Three-column layout */}
        <section className="bd-grid">
          {/* LEFT: Current Teams + main image */}
          <div className="bd-col-left">
            <div className="current-teams">
              <h2>Current Teams</h2>
              <ul className="teams-list">
                <li className="team-item">Il Tricolore (Placeholder)</li>
                <li className="team-item">Palermo Aces (Placeholder)</li>
                <li className="team-item">Monterey Rollers (Placeholder)</li>
                <li className="team-item">Marin Mafiosi (Placeholder)</li>
                <li className="team-item">Santa Cruz Shooters (Placeholder)</li>
                <li className="team-item">Capri Kings (Placeholder)</li>
              </ul>

              <button
                type="button"
                className="signup-info-btn"
                aria-label="Sign Up Information"
                onClick={() => (window.location.href = "/signup")}
              >
                Sign Up Information
              </button>
            </div>

            <img
              src="/boccegame.jpg"
              alt="Bocce game in progress"
              className="bocce-game-image"
            />
          </div>

          {/* MIDDLE: Team Names + Sponsor Information */}
          <div className="bd-col-middle">
            <div className="team-members-container">
              <h2>Team Names:</h2>

              <div className="team-card">
                <h3>Il Tricolore (Placeholder)</h3>
                <ul className="member-list">
                  <li>1. Player One (Placeholder)</li>
                  <li>2. Player Two (Placeholder)</li>
                  <li>3. Player Three (Placeholder)</li>
                  <li>4. Player Four (Placeholder)</li>
                </ul>
                <p className="sponsor">Sponsor: Pasta Palace (Placeholder)</p>
              </div>

              <div className="team-card">
                <h3>Palermo Aces (Placeholder)</h3>
                <ul className="member-list">
                  <li>1. Player One (Placeholder)</li>
                  <li>2. Player Two (Placeholder)</li>
                  <li>3. Player Three (Placeholder)</li>
                  <li>4. Player Four (Placeholder)</li>
                </ul>
                <p className="sponsor">Sponsor: Olive Grove (Placeholder)</p>
              </div>
            </div>

            <div className="sponsor-info-box">
              <h2>Sponsor Information</h2>
              <p>
                Interested in sponsoring a Bocce team or event? We’d love your support!
                Sponsors help us keep the community games running and fund event prizes.
              </p>
              <p>
                Please contact us at <strong>info@festa-italia.org</strong> for details on
                sponsorship packages.
              </p>
            </div>
          </div>

          {/* RIGHT: Previous Winners + second image */}
          <div className="bd-col-right">
            <div className="previous-winners" aria-labelledby="prev-winners-title">
              <h2 id="prev-winners-title">Previous Winners</h2>
              <ul className="winners-list">
                {previousWinners.map(({ year, team }) => (
                  <li key={year} className="winner-item">
                    <div className="winner-year">{year}</div>
                    <div className="winner-team">{team}</div>
                  </li>
                ))}
              </ul>
            </div>

            <img
              src="/boccegame.jpg"
              alt="Bocce game crowd"
              className="bocce-side-image"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

