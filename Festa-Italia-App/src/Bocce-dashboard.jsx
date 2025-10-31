// src/Bocce-dashboard.jsx
import './bocce-dashboard.css'; // Reuse existing shared styles

export default function BocceDashboard() {
  return (
    <div className="Bocce-dashboard-body">
      {/* If you already show the logo/header globally, remove this block */}
      <img
        src="/logo2.gif"
        alt="Festa Italia Logo"
        className="logo"
      />

      <main className="border" role="main" aria-labelledby="bocce-dashboard-title">
        <h1 id="bocce-dashboard-title" className="title">
          Bocce Tournament 20XX
        </h1>

        {/* Future dashboard content goes here */}
      </main>
    </div>
  );
}
