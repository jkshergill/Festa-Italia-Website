import './PageOff.css';

/* See Sign in Wall for detailed description */
export default function PageOff({ setPage, title, subtitle }) {
    const handleClick = (e) => {
        if (typeof setPage === 'function') {
            setPage('HomePage'); // go to Home "page" in your SPA
        } else {
            window.location.href = '/'; // fallback (full reload)
        }
    };

    return (
        <main className="page-off" aria-labelledby="signinwall-title">
            <div className="page-off-bg" aria-hidden="true" />

            <div className="page-off-panel" role="dialog" aria-modal="true" aria-labelledby="signinwall-title">
                <h1 id="signinwall-title" className="page-off-title">{title || 'This page is currently not ready- check back soon!'}</h1>
                <p className="page-off-sub">{subtitle || 'Thank you for supporting Festa Italia!'}</p>
                <div className="page-off-actions">
                <button className="page-off-btn" onClick={handleClick}>Home Page</button>
                </div>
            </div>
        </main>
    );
}
