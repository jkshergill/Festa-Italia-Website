
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

const MAX_LOGIN_ATTEMPTS = 10;

function Login({ setPage }) {
  useEffect(() => {
    document.body.id = 'login-body-id';
    document.body.className = 'login-body';
  }, []);

  // [SUPABASE] Controlled inputs + status message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null); // { type: 'error'|'success', text: string }
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordType = showPassword ? 'text' : 'password';
  const isLockedOut = failedAttempts >= MAX_LOGIN_ATTEMPTS;
  const attemptsRemaining = Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts);

  const handleTogglePassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  // [SUPABASE] Submit handler that checks credentials with Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLockedOut || isSubmitting) {
      setStatus({
        type: 'error',
        text: 'Too many incorrect login attempts. Please reset your password or try again later.',
      });
      return;
    }

    setStatus(null);

    // [SUPABASE] Basic custom validation since native required is disabled
    if (!email.trim() || !password.trim()) {
      setStatus({ type: 'error', text: 'Please enter your email and password.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const nextFailedAttempts = failedAttempts + 1;
        setFailedAttempts(nextFailedAttempts);

        if (nextFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
          setStatus({
            type: 'error',
            text: 'Too many incorrect login attempts. Please reset your password or try again later.',
          });
        } else {
          setStatus({
            type: 'error',
            text: `${error.message} You have ${MAX_LOGIN_ATTEMPTS - nextFailedAttempts} login attempt${
              MAX_LOGIN_ATTEMPTS - nextFailedAttempts === 1 ? '' : 's'
            } remaining.`,
          });
        }
        return;
      }

      setFailedAttempts(0);
      setStatus({ type: 'success', text: 'Login successful!' });

      // Prefer SPA nav via setPage; fallback to hard redirect if not provided
      if (typeof setPage === 'function') {
        setPage('home'); // go to Home "page" in your SPA
      } else {
        window.location.href = '/'; // fallback (full reload)
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form__container">
      {/* [SUPABASE] noValidate disables the browser's native required popups */}
      <form autoComplete="off" className="form" /* method="POST" */ onSubmit={handleSubmit} noValidate>
        <p className="form__title">Welcome Back</p>
        <p className="form__message">Sign in to access your account and event features.</p>

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
            type="email"
            name="Email"
            placeholder="Email address"
            // required  // [SUPABASE] disabled native validation; handled by Supabase + our own checks
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            disabled={isLockedOut || isSubmitting}
          />
        </label>

        {/* [SUPABASE] Password: controlled input; comment out `required` */}
        <label>
          <input
            type={passwordType}
            name="Password"
            placeholder="Password"
            // required  // [SUPABASE] disabled native validation; handled by Supabase + our own checks
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isLockedOut || isSubmitting}
          />
        </label>

        <button
          className="show-password-button"
          onClick={handleTogglePassword}
          aria-pressed={showPassword}
          type="button"
          disabled={isLockedOut || isSubmitting}
        >
          {showPassword ? 'Hide' : 'Show'} Password
        </button>

        <div className="form__actions">
          <button type="submit" className="form__submit" disabled={isLockedOut || isSubmitting}>
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>

          {/* [SUPABASE] Inline status feedback */}
          {status && (
            <p
              className={`form__status ${
                status.type === 'error' ? 'form__status--error' : 'form__status--success'
              }`}
            >
              {status.text}
            </p>
          )}

          {!status && failedAttempts > 0 && !isLockedOut && (
            <p className="form__status form__status--error">
              {attemptsRemaining} login attempt{attemptsRemaining === 1 ? '' : 's'} remaining.
            </p>
          )}
        </div>

        <div className="form__divider" />

        <p className="form__login--redirect">
          Don&apos;t have an account?{' '}
          <a
            href="#"
            className="form__signup--link"
            onClick={(e) => {
              e.preventDefault();
              setPage('signup');
            }}
          >
            Sign Up
          </a>
        </p>

        <p className="form__forgot-password">
          <a
            href="#"
            className="form__forgot-password--link"
            onClick={(e) => {
              e.preventDefault();
              setPage('forgot-pass');
            }}
          >
            Forgot Password?
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
