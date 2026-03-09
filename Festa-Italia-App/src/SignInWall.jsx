import './SignInWall.css';

/*
 * Sign in Wall options
 * - onSignIn: function called when the user clicks Sign in
 * - title: override for the title text
 * - subtitle: override for the subtitle text
 */
export default function SignInWall({ setPage, title, subtitle }) {
    const handleClick = (e) => {
        if (typeof setPage === 'function') {
            setPage('login'); // go to login
        } else {
            window.location.href = '/'; // fallback (full reload)
        }
    };

    return (
        <main className="sign-in-wall" aria-labelledby="signinwall-title">
            <div className="siw-bg" aria-hidden="true" />

            <div className="siw-panel" role="dialog" aria-modal="true" aria-labelledby="signinwall-title">
                <h1 id="signinwall-title" className="siw-title">{title || 'Please sign in to use this page'}</h1>
                <p className="siw-sub">{subtitle || 'Thank you for supporting Festa Italia!'}</p>
                <div className="siw-actions">
                <button className="siw-btn" onClick={handleClick}>Sign in</button>
                </div>
            </div>
        </main>
    );
}
