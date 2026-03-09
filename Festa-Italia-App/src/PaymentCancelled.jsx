import React from 'react';

export default function PaymentCancelled({ setPage }) {
  return (
    <div className="success-container">
      <div className="success-card">
        <h1>🎟️ Coronation Ball 🎟️</h1>
        <div className="error-icon">⏸️</div>
        <h2>Payment Cancelled</h2>
        <p>Your payment was cancelled. No charges were made.</p>
        <div className="success-actions">
          <button onClick={() => setPage('coronation-tix')} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => setPage('home')} className="btn-secondary">
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}