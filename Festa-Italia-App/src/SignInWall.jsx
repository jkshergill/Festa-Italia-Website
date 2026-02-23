import './SignInWall.css';

/**
 * SignInWall
 * A reusable, self-contained sign-in wall you can import into any page.
 * Props:
 * - onSignIn: optional function called when the user clicks Sign in
 * - title: optional override for the title text
 * - subtitle: optional override for the subtitle text
 */
export default function SignInWall({ onSignIn, title, subtitle }) {
    const handleClick = (e) => {
    if (onSignIn && typeof onSignIn === 'function') {
        onSignIn(e);
        return;
    }
    // Default behaviour for demo: inform the developer
    // Replace this with your auth flow (Supabase, Firebase, etc.)
    console.log('Sign in clicked (no onSignIn provided)');
    // non-blocking gentle UI feedback for local dev
    // avoid alert in production; it's here as a helpful placeholder
    window.requestAnimationFrame(() => alert('Sign in path aint here'));
    };

    return (
        <main className="sign-in-wall" aria-labelledby="signinwall-title">
            <div className="siw-bg" aria-hidden="true" />

            <div className="siw-panel" role="dialog" aria-modal="true" aria-labelledby="signinwall-title">
                <h1 id="signinwall-title" className="siw-title">{title || 'Please sign in to use this page'}</h1>
                <p className="siw-sub">{subtitle || 'Sign in to access this area and manage volunteer features.'}</p>
                <div className="siw-actions">
                <button className="siw-btn" onClick={handleClick}>Sign in</button>
                </div>
            </div>
        </main>
    );
}
