import React from 'react';

export default function PaymentFailed({ setPage }) {
  return (
    <div className="success-container">
      <div className="success-card">
        <h1>🎟️ Coronation Ball 🎟️</h1>
        <div className="error-icon">❌</div>
        <h2>Payment Failed</h2>
        <p>There was an issue processing your payment. Please try again.</p>
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