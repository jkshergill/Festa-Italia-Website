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
    transform: 'translateY(-4px)', /*to keep AuthStatus box within the header boundary*/
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,          
    flexGrow: 0,
    minWidth: 0,            /* allows to shrink below content size */
    flexWrap: 'wrap',
    width: 'auto',          /*  adjusts to content */
    maxWidth: '100%',       /* but never exceed container size*/
    marginTop: 0,
    marginBottom: 0,
    position: 'static',
    backgroundColor: '#f7f7f7',
    border: '1.5px solid rgba(0,0,0,0.25)',
    borderRadius: '8px',
    padding: '6px 10px',
    boxSizing: 'border-box',
    overflow: 'hidden',     /* prevents overflowing */
  }}
>
  {userEmail ? (
    <>
      <span
        style={{
          fontSize: '0.9rem',
          color: '#000',
          overflow: 'hidden',       /* contain long emails */
          textOverflow: 'ellipsis', /*truncate with … */
          whiteSpace: 'nowrap',
          maxWidth: '130px',        /* adjust to your requirement*/
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        Signed in as <strong>{userEmail}</strong>
      </span>
      <button
        className="profile-button"
        onClick={() => onProfile?.()}
        type="button"
        style={{
          marginLeft: '6px',
          flexShrink: 0,          /* buttons should never shrink */
          cursor: 'pointer',
          border: '1px solid rgba(0,0,0,0.25)',
          borderRadius: '6px',
          background: '#000',
          color: '#fff',
          padding: '2px 6px',
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
        }}
      >
        Profile
      </button>
      <button
        onClick={handleSignOut}
        style={{
          marginLeft: '6px',
          flexShrink: 0,          /* same here */
          cursor: 'pointer',
          border: '1px solid rgba(0,0,0,0.25)',
          borderRadius: '6px',
          background: '#000',
          color: '#fff',
          padding: '2px 6px',
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
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
        flexShrink: 0,
        cursor: 'pointer',
        border: '1px solid rgba(0,0,0,0.25)',
        borderRadius: '6px',
        background: '#000',
        color: '#fff',
        padding: '2px 8px',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
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
