import { useState } from 'react'
import './App.css'
import BocceDash from './Bocce-dashboard'
import BocceSign from './Bocce-sign-up'
import CoronationBall from './coronationball'
import CoronationTix from './CoronationBallTickets'
import Donate from './Donate'
import FestivalInfo from './FestivalInfo'
import ResetPass from './resetPassword'
import Home from './HomePage'
import Login from './Login'
import Scholarship from './Scholarship'
import Signup from './Signup'
import Shopping from './Shopping'
import Volunteer from './Volunteer'

import ForgotPass from './forgotpassword' // Not sure if this will be temporary. Used for Reset Password.

import { useEffect } from 'react'
import AuthStatus from './AuthStatus';
import MockCheckout from "./MockCheckout";
import AdminDashboard from './AdminDashboard'

export default function App(){
    const [page, setPage] = useState('home')
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => { {/* Set body ID for styling */}
        document.body.id = 'app-body-id';
        document.body.className = 'app-body';
      }, []);

  
  //MOCK CHECKOUT ROUTE - REMOVE AFTER ADDING CLOVER
  if (window.location.pathname === "/mock-checkout") {
  return <MockCheckout />;
}

  function renderPage(){
    switch(page){
      case 'admin-dash': return <AdminDashboard />
      case 'bocce-dash': return <BocceDash />
      case 'bocce-sign': return <BocceSign />
      case 'coronation': return <CoronationBall />
      case 'coronation-tix': return <CoronationTix />
      case 'donate': return <Donate />
      case 'festival': return <FestivalInfo />
      case 'reset-pass': return <ResetPass />
      case 'home': return <Home />
      case 'login': return <Login />;
      case 'signup': return <Signup />
      case 'scholarships': return <Scholarship />
      case 'shopping': return <Shopping />
      case 'volunteer': return <Volunteer />

      case 'forgot-pass': return <ForgotPass /> // Not sure if this will be temporary. Used to reset password.
      default: return <Home />
    }
  }

  function burgerButton(){
    return(
      <button
        className="nav-toggle"
        aria-controls="primary-navigation"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        /* ADDED: inline zIndex for belt-and-suspenders in case other CSS overrides */
        style={{ marginLeft:'0.5rem', zIndex: 1001 }}
        onClick={() => setMenuOpen(open => !open)}
      >
        <span className="sr-only">Menu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path className="line-top" d="M3 6h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
          <path className="line-mid" d="M3 12h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
          <path className="line-bottom" d="M3 18h18" fill="none" strokeWidth="2" strokeLinecap="round"></path>
        </svg>
      </button>
    )
  }

  function navButtons(){
    return(
      menuOpen && (
        <div
          className="top-menu"
          role="menu"
          aria-label="App pages"
          /* CHANGED: move panel left of the toggle & ensure it stacks below the button */
          style={{
            position:'absolute',
            right:'4.5rem',   // was 16px
            top:'64px',       // was 56px
            zIndex: 1000,     // sits under the 1001 button
            background:'#fc0000ff',
            borderRadius:8,
            boxShadow:'0 6px 18px rgba(0,0,0,0.12)',
            padding:'0.5rem'
          }}
        >
          <button role="menuitem" onClick={() => { setPage('admin-dash'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Admin Dashboard</button>
          <button role="menuitem" onClick={() => { setPage('home'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Home</button>
          <button role="menuitem" onClick={() => { setPage('festival'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Fishermans Festival</button>
          <button role="menuitem" onClick={() => { setPage('volunteer'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Festival Volunteering</button>
          <button role="menuitem" onClick={() => { setPage('bocce-dash'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Bocce Tournament</button>
          <button role="menuitem" onClick={() => { setPage('coronation'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Queen's Court</button>
          <button role="menuitem" onClick={() => { setPage('scholarships'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Scholarships</button>
          <button role="menuitem" onClick={() => { setPage('donate'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Donate</button>
          <button role="menuitem" onClick={() => { setPage('login'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Log in</button>
          <button role="menuitem" onClick={() => { setPage('shopping'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Shopping</button>
          

          {/* Temporary items you noted */}
          <button role="menuitem" onClick={() => { setPage('bocce-sign'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Bocce Sign up</button>
          <button role="menuitem" onClick={() => { setPage('coronation-tix'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Coronation Ball Tickets</button>
          <button role="menuitem" onClick={() => { setPage('reset-pass'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Reset Password</button>
          <button role="menuitem" onClick={() => { setPage('signup'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Create Account</button>

          <button role="menuitem" onClick={() => { setPage('forgot-pass'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Forgot Password</button>
        </div>
      )
    )
  }

  function header(){
    return(
      <div className="logo-wrap">
        <a href="#" className="logo" aria-label="Festa Italia home" onClick={() => { setPage('home'); setMenuOpen(false);}}>
          <img src="../images/logo2.gif" alt="Festa Italia logo" />
        </a>
      </div>
    )
  }

  function footer(){
    return(
    <div className='footer-div'>
        <div className="container-footer-inner">
            <img className='footer-logo' src="../../images/logo_01.jpeg" alt="Festa Italia logo" height={100} />
            <p className='footer-text'> Festa Italia Foundation, Inc. All rights reserved.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* App header: logo on left, small menu button on the right */}
        <div className="site-header-div">
          <header className="site-header">
            <div className="header-inner">
              <div className="logo-wrap">
                <a href="#" className="logo" aria-label="Festa Italia home" onClick={() => { setPage('home'); setMenuOpen(false); }}>
                  <img src="../images/logo2.gif" alt="Festa Italia logo" />
                </a>
              </div>

              <div style={{ flex: 1 }} />

              <div className="auth-status-wrap">
                <AuthStatus onLogin={() => setPage('login')} />
              </div>

              {burgerButton()}
              {navButtons()}
            </div>
          </header>
        </div>


      <main>
        <div>{renderPage()}</div>
      </main>

        <div className='site-footer-div'>
          <footer className="site-footer">
            {footer()}
          </footer>
        </div>
    </div>
  )
}
