// src/Bocce-dashboard.jsx
import './bocce-dashboard.css'; // Reuse existing shared styles

export default function BocceDashboard() {
  return (
    <div className="Bocce-dashboard-body">

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
