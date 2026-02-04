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
    <main>
      <h1>
        Forgot Your Password?
      </h1>

      <form className="forgot-form" onSubmit={handleSubmit}>
        <label className="email-label">Email Address:</label>
        <input
          className="forgot-email-input"
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="forgot-button" type="submit">Send Reset Link</button>
      </form>

      {message && <p className="reset-message">{message}</p>}
      <p className="forgot-note">
        <strong>Note:</strong> After clicking the link in the email, please go to the "Reset Password" page to set your new password.
      </p>
    </main>
  )
};