import React, { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setNavOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="logo-wrap">
          <a href="#" className="logo" aria-label="Festa Italia home">
            <img src="/images/logo2.gif" alt="Festa Italia logo" />
          </a>
        </div>

        <button
          className="nav-toggle"
          aria-controls="primary-navigation"
          aria-expanded={navOpen}
          aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setNavOpen(v => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path className="line-top" d="M3 6h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
            <path className="line-mid" d="M3 12h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
            <path className="line-bottom" d="M3 18h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
          </svg>
        </button>
      </div>

      <nav
        id="primary-navigation"
        className={`primary-nav ${navOpen ? 'open' : ''}`}
        aria-hidden={!navOpen}
        aria-label="Primary Navigation"
      >
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/events">Events</a></li>
          <li><a href="/tickets">Tickets</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}
