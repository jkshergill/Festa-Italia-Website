// src/Bocce-dashboard.jsx
import './bocce-dashboard.css';

export default function BocceDashboard() {
  const currentYear = new Date().getFullYear();

  const previousWinners = [
    { year: currentYear - 1, team: 'Il Tricolore' },
    { year: currentYear - 2, team: 'Palermo Aces' },
    { year: currentYear - 3, team: 'Monterey Rollers' },
    { year: currentYear - 4, team: 'Marin Mafiosi' },
  ];

  return (
    <div className="Bocce-dashboard-body">
      <img src="/logo2.gif" alt="Festa Italia Logo" className="logo" />

      <main className="border" role="main" aria-labelledby="bocce-dashboard-title">
        <h1 id="bocce-dashboard-title" className="title">
          Bocce Tournament {currentYear}
        </h1>

        {/* Top-left: Current Teams */}
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
        </div>

        {/* Main content row */}
        <div className="bocce-dashboard-content">
          {/* Left: bocce image */}
          <div className="bocce-game-section">
            <img
              src="/boccegame.jpg"
              alt="Bocce game in progress"
              className="bocce-game-image"
            />
          </div>

          {/* ✅ Middle: Team Names & Members */}
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

          {/* Right: Previous Winners */}
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
        </div>
      </main>
    </div>
  );
}
