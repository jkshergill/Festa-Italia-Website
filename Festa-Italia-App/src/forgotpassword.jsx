import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./forgotPassword.css";

export default function forgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.body.id = 'forgot-body-id';
    document.body.className = 'forgot-body';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const {error} = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetPassword`
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('If an account with that email exists, a password reset link has been sent. If you don\'t see it, please check your spam folder.');
    }
  }

return (
  <div className="page-root">
    <main className="forgot-page">
      <form className="forgot-form" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>

        <label className="email-label">Email</label>
        <input
          type="email"
          className="forgot-email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="forgot-button">
          Send Reset Link
        </button>

        {message && <p className="reset-message">{message}</p>}

        <p className="forgot-note">
          If an account exists, you will receive an email.
        </p>
      </form>
    </main>
  </div>
);return (
  <div className="page-root">
    <main className="forgot-page">
      <form className="forgot-form" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>

        <label className="email-label">Email</label>
        <input
          type="email"
          className="forgot-email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="forgot-button">
          Send Reset Link
        </button>

        {message && <p className="reset-message">{message}</p>}

        <p className="forgot-note">
          If an account exists, you will receive an email.
        </p>
      </form>
    </main>
  </div>
);
};