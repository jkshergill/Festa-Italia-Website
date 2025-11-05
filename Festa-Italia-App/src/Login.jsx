// Login.jsx
// FROM RYAN LEE:---------------------------------------------------------------
// Recent changes are annotated with "// [SUPABASE]" comments.
// - Connect form to Supabase Auth (email+password)
// - Keep First/Last Name ignored (commented out)
// - Disable native "Please fill in this field" by:
//     * commenting out each `required`
//     * adding `noValidate` on the <form>
// -----------------------------------------------------------------------------

// [SUPABASE] Add useState (was missing) for controlled inputs and status
import { useEffect, useState } from 'react';
import './Login.css';
// [SUPABASE] Import the Supabase client
import { supabase } from './supabaseClient';

function Login({ setPage }) {
  useEffect(() => {
    document.body.id = 'login-body';
  }, []);

  // [SUPABASE] Controlled inputs + status message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null); // { type: 'error'|'success', text: string }

  // [SUPABASE] Submit handler that checks credentials with Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus({ type: 'error', text: error.message });
      return;
    }

    setStatus({ type: 'success', text: 'Login successful!' });

    // Prefer SPA nav via setPage; fallback to hard redirect if not provided
    if (typeof setPage === 'function') {
      setPage('home');              // go to Home "page" in your SPA
    } else {
      window.location.href = '/';   // fallback (full reload)
    }
  };

  return (
    <div className="form__container">
      {/* [SUPABASE] noValidate disables the browser's native required popups */}
      <form autoComplete="off" className="form" /* method="POST" */ onSubmit={handleSubmit} noValidate>
        <p className="form__title">Login</p>
        <p className="form__message">Login now to view your dashboard</p>

        {/* Keep First/Last Name kept intact but ignored for now */}
        {/*
        <div className="form__group">
          <label>
            <input type="text" name="FirstName" placeholder="First Name" required />
          </label>
          <label>
            <input type="text" name="LastName" placeholder="Last Name" required />
          </label>
        </div>
        */}

        {/* [SUPABASE] Email: controlled input; comment out `required` */}
        <label>
          <input
            type="text"
            name="Email"
            placeholder="Email"
            // required  // [SUPABASE] disabled native validation; handled by Supabase + our own checks
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>

        {/* [SUPABASE] Password: controlled input; comment out `required` */}
        <label>
          <input
            type="password"
            name="Password"
            placeholder="Password"
            // required  // [SUPABASE] disabled native validation; handled by Supabase + our own checks
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="form__submit">Submit</button>

        {/* [SUPABASE] Inline status feedback */}
        {status && (
          <p
            style={{
              marginTop: '10px',
              color: status.type === 'error' ? '#b00020' : '#0a7d00',
              fontWeight: 600,
            }}
          >
            {status.text}
          </p>
        )}

        <p className="form__login--redirect">
          Don't have an account? <a href="#" className="form__signup--link">Sign Up</a>
        </p>
        <p className="form__forgot-password">
          <a href="#" className="form__forgot-password--link">Forgot Password?</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
