import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function DeleteAccount({ setPage }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const { data: sessionData } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(userData?.user ?? null);
        setSession(sessionData?.session ?? null);
      } catch (err) {
        if (!mounted) return;
        setError('Unable to check auth status.');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async () => {
    setError('');
    setMessage('');

    if (!user) {
      setError('You must be signed in to delete your account.');
      return;
    }

    if (confirmText !== 'DELETE') {
      setError('Please type DELETE in the confirmation field to proceed.');
      return;
    }
    // Basic client-side checks for email/password
    if (!inputEmail || !inputPassword) {
      setError('Please provide your email and password to confirm.');
      return;
    }

    // Ensure the email entered matches the currently signed-in user's email
    if ((inputEmail || '').trim().toLowerCase() !== (user.email || '').toLowerCase()) {
      setError('The email you entered does not match the signed-in account.');
      return;
    }

    setDeleting(true);

    try {
      // Re-authenticate the user by signing in with the provided credentials.
      // This returns a fresh access token we can send to the server-side
      // deletion endpoint for verification. If the credentials are wrong,
      // Supabase will return an error.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: inputEmail,
        password: inputPassword,
      });

      if (signInError) {
        setError(signInError.message || 'Unable to authenticate. Check your credentials.');
        setDeleting(false);
        return;
      }

      const newUser = signInData?.user ?? null;
      const newSession = signInData?.session ?? null;

      if (!newUser || !newSession) {
        setError('Authentication did not return a valid session.');
        setDeleting(false);
        return;
      }

      // Ensure the authenticated user matches the previously fetched user
      if (newUser.id !== user.id) {
        setError('Authenticated credentials do not match the currently signed-in user.');
        setDeleting(false);
        return;
      }

      const accessToken = newSession.access_token;
      if (!accessToken) {
        setError('Missing access token from authentication.');
        setDeleting(false);
        return;
      }

      // Call the server-side delete endpoint with service-role-protected logic.
      const functionsBase = import.meta.env.VITE_SUPABASE_URL || window.location.origin;
      const resp = await fetch(`${functionsBase}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => 'No response body');
        setError(
          `Server error deleting account: ${resp.status} ${resp.statusText} - ${text}\n\nIf you see a 404 or this endpoint is missing, a server-side delete function needs to be installed (see README or contact an admin).`
        );
        setDeleting(false);
        return;
      }

  setMessage('Your account has been deleted. You will be signed out.');

  // sign out locally
  await supabase.auth.signOut();
  setDeleting(false);
  // Redirect to home page after a short delay for UX
  setTimeout(() => setPage('home'), 1200);
    } catch (err) {
      setError('An unexpected error occurred while deleting the account.');
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="page-root" style={{ padding: '1rem' }}>
        <h2>Delete Account</h2>
        <p>You must be signed in to delete your account.</p>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => setPage('login')} style={{ marginRight: '0.5rem' }}>
            Sign in
          </button>
          <button onClick={() => setPage('home')}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root" style={{ padding: '1rem', maxWidth: 720 }}>
      <h2>Delete Account</h2>
      <p>
        Signed in as <strong>{user.email}</strong>
      </p>

      <div style={{ marginTop: '1rem', background: '#fff8f8', padding: '1rem', borderRadius: 6 }}>
        <p style={{ marginTop: 0 }}>
          Deleting your account is permanent. All your personal data associated with
          this account will be removed. This action cannot be undone.
        </p>

        <label style={{ display: 'block', marginTop: '0.75rem' }}>
          Email (must match the signed-in account):
        </label>
        <input
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          placeholder="Email"
          style={{ marginTop: '0.5rem', padding: '0.5rem', width: '100%', maxWidth: 360 }}
        />

        <label style={{ display: 'block', marginTop: '0.75rem' }}>
          Password:
        </label>
        <input
          type="password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          placeholder="Password"
          style={{ marginTop: '0.5rem', padding: '0.5rem', width: '100%', maxWidth: 360 }}
        />

        <label style={{ display: 'block', marginTop: '0.75rem' }}>
          Type <strong>DELETE</strong> to confirm:
        </label>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
          style={{ marginTop: '0.5rem', padding: '0.5rem', width: '100%', maxWidth: 360 }}
        />

        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: '#c62828', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6 }}
          >
            {deleting ? 'Deleting…' : 'Delete my account'}
          </button>
          <button onClick={() => setPage('home')} style={{ marginLeft: '0.5rem' }}>
            Cancel
          </button>
        </div>

        {message && <p style={{ marginTop: '0.75rem', color: 'green' }}>{message}</p>}
        {error && (
          <pre style={{ marginTop: '0.75rem', color: 'crimson', whiteSpace: 'pre-wrap' }}>{error}</pre>
        )}
      </div>
    </div>
  );
}
