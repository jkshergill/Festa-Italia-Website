// src/Bocce-dashboard.jsx
import './bocce-dashboard.css'; // Reuse existing shared styles

export default function BocceDashboard() {
  return (
    <div className="Bocce-dashboard-body">
      {/* :: PLACEHOLDER :: If you already show the logo/header globally, remove this block */}
      <img
        src="/logo2.gif"
        alt="Festa Italia Logo"
        className="logo"
      />

      <main className="border" role="main" aria-labelledby="bocce-dashboard-title">
        <h1 id="bocce-dashboard-title" className="title">
          Bocce Tournament {new Date().getFullYear()}
        </h1>

        <div className="bocce-game-section">
          <img
            src="/boccegame.jpg"  // Replace with your actual image path
            alt="Bocce game in progress"
            className="bocce-game-image"
          />
        </div>
              
        {/* Future dashboard content goes here */}
      </main>
    </div>
  );
}
