// AuthStatus.jsx
// -----------------------------------------------------------------------------
// [SUPABASE] Small status pill to show the current auth user next to the hamburger.
// Shows "Signed in as email" or "Not signed in". Includes a Sign out button.
// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
// Minor visual/layout update so it aligns horizontally to the left of the
// hamburger and uses matching background/button styling.
// -----------------------------------------------------------------------------
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function AuthStatus({ onLogin, onProfile }) {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUserEmail(data?.user?.email ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        backgroundColor: '#f7f7f7',               // match hamburger gray
        border: '1.5px solid rgba(0,0,0,0.25)',   // match hamburger border
        borderRadius: '8px',
        padding: '6px 10px',
        height: '36px',
        whiteSpace: 'nowrap',
      }}
    >
      {userEmail ? (
        <>
          <span style={{ fontSize: '0.9rem', color: '#000' }}>
            Signed in as <strong>{userEmail}</strong>
          </span>
          <button
            className="profile-button"
            onClick={() => onProfile?.()}
            type="button"
            style={{
              marginLeft: '6px',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.25)',
              borderRadius: '6px',
              background: '#000000ff',
              color: '#fff',
              padding: '2px 6px',
              fontSize: '0.8rem',
            }}
          >
            Profile
          </button>
          <button
            onClick={handleSignOut}
            style={{
              marginLeft: '6px',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.25)',
              borderRadius: '6px',
              background: '#000000ff',
              color: '#fff',
              padding: '2px 6px',
              fontSize: '0.8rem',
            }}
          >
            Sign out
          </button>
        </>
     ) : (
        <button
          type="button"
          onClick={() => onLogin?.()}
          style={{
            cursor: 'pointer',
            border: '1px solid rgba(0,0,0,0.25)',
            borderRadius: '6px',
            background: '#000',
            color: '#fff',
            padding: '2px 8px',
            fontSize: '0.85rem'
          }}
          aria-label="Sign in"
          title="Sign in"
        >
          Sign In
        </button>
      )}
    </div>
  );
}