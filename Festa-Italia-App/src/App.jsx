import { useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

import BocceDash from './Bocce-dashboard'
import BocceSign from './Bocce-sign-up'
import CoronationBall from './coronationball'
import CoronationTix from './CoronationBallTickets'
import Donate from './Donate'
import Donation from './Donation'
import FestivalInfo from './FestivalInfo'
import Home from './HomePage'
import Login from './Login'
import ResetPass from './resetPassword'
import Scholarship from './Scholarship'
import Shopping from './Shopping'
import Signup from './Signup'
import Volunteer from './Volunteer'
import DeleteAccount from './DeleteAccount'

import { useEffect } from 'react'
import AdminDashboard from './AdminDashboard'
import AdminFoods from './adminEditMenu'
import AuthStatus from './AuthStatus'
import ForgotPass from './forgotpassword'
import MockCheckout from "./MockCheckout"
//import PageOff from './PageOff'
import SignInWall from './SignInWall'
import UserProfile from './UserProfile' 

 

export default function App(){
    const [page, setPage] = useState('home')
    const [menuOpen, setMenuOpen] = useState(false)
    useEffect(() => { {/* Set body ID for styling */}
        document.body.id = 'app-body-id';
        document.body.className = 'app-body';
    }, []);

    const [user, setUser] = useState(null)
    const [userRole, setUserRole] = useState(null)
    useEffect(() => { {/* Sign-in Status + get user_role */}
      const initUser = async () => {
        try {
          // Get auth session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;


          const currentUser = session?.user ?? null;
          console.log("current user: ", currentUser)
          setUser(currentUser);

          // If signed in, fetch user_role
          if (currentUser!=null) {
            const { data, error: roleError } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", currentUser.id)
              .single();

            if (roleError) throw roleError;

            setUserRole(data.role);
            console.log("userRole fetched:", data.role);
          } else {
            setUserRole(null);
          }
        } catch (err) {
          console.error("Error initializing user:", err);
          setUser(null);
          setUserRole(null);
        }
      };
      initUser();

      // Subscribe to auth state changes
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          // Update role on auth change
          if (currentUser) {
            supabase
              .from("profiles")
              .select("role")
              .eq("id", currentUser.id)
              .single()
              .then(({ data }) => setUserRole(data?.role ?? null))
              .catch((err) => {
                console.error("Error fetching role on auth change:", err);
                setUserRole(null);
              });
          } else {
            setUserRole(null);
          }
        }
      );
      return () => listener.subscription.unsubscribe();
    }, []);

    const [pageVisibility, setPageVisibility] = useState({});
    const [loading, setLoading] = useState(true);
    useEffect(() => { {/* Page Visibility Status */}
        const fetchPageVisibility = async () => {
        try {
            const { data, error } = await supabase
            .from("page_status")
            .select("name, visible"); // fetch all pages
            if (error) throw error;

            // Convert DB rows into an object mapping for easy toggle
            const pageState = data.reduce((acc, page) => {
            acc[page.name] = page.visible; // true = visible, false = hidden
            return acc;
            }, {});

            setPageVisibility(pageState);
        } catch (err) {
            console.error("Error fetching page visibility:", err);
            setPageVisibility({});
        } finally {
            setLoading(false);
        }
        };
        fetchPageVisibility();
    }, []);

  //MOCK CHECKOUT ROUTE - REMOVE AFTER ADDING CLOVER
  if (window.location.pathname === "/mock-checkout") {
    return <MockCheckout />;
  }

  
  if (window.location.pathname === "/resetPassword") {

    return (
      <>
        <header className='site-header'>
          
        </header>
        <ResetPass />  
      </>
    );
  }

  function renderPage(){
    if(loading)return <div>Loading Pages...</div>;
    switch(page){
      case 'admin-dash': return user && userRole === "admin" ? <AdminDashboard /> : <SignInWall />;
      case "admin-foods": return user && userRole === "admin" ? <AdminFoods /> : <SignInWall/>;
      case 'bocce-dash':
        if (pageVisibility["Bocce Dashboard"] === undefined) return null;
        return pageVisibility["Bocce Dashboard"] ? <BocceDash setPage={setPage}/> : <PageOff/>;
      case 'bocce-sign':
        if (pageVisibility["Bocce Dashboard"] === undefined) return null;
        return pageVisibility["Bocce Dashboard"] ? <BocceSign setPage={setPage}/> : <PageOff/>;
      case 'coronation':
        if (pageVisibility["Coronation Ball Info"] === undefined) return null;
        return pageVisibility["Coronation Ball Info"] ? <CoronationBall setPage={setPage}/> : <PageOff/>;
      case 'coronation-tix':
      if (pageVisibility["Coronation Ball Tickets"] === undefined) return null;
        return pageVisibility["Coronation Ball Tickets"] ? <CoronationTix setPage={setPage}/> : <PageOff/>;
      case 'donate':
        if (pageVisibility["Donation"] === undefined) return null;
        return pageVisibility["Donation"] ? <Donate setPage={setPage}/> : <PageOff/>;
      case 'festival':
        if (pageVisibility["Fisherman's Festival Info"] === undefined) return null;
        return pageVisibility["Fisherman's Festival Info"] ? <FestivalInfo setPage={setPage}/> : <PageOff/>;
      case 'reset-pass': return <ResetPass />
      case 'home': return <Home setPage={setPage}/>
      case 'login': return <Login setPage={setPage}/>;
      case 'signup': return <Signup />
      case 'scholarships':
        if (pageVisibility["Scholarships"] === undefined) return null;
        return pageVisibility["Scholarships"] ? <Scholarship setPage={setPage}/> : <PageOff/>;
      case 'shopping':
        if (pageVisibility["Festa Menu"] === undefined) return null;
        return pageVisibility["Festa Menu"] ? <Shopping setPage={setPage}/> : <PageOff/>;
      case 'volunteer':
        if (pageVisibility["Volunteer Sign-Up"] === undefined) return null;
        return !pageVisibility["Volunteer Sign-Up"] ? <PageOff/>: !user ? <SignInWall /> : <Volunteer user={user}/>;
      case 'forgot-pass': return <ForgotPass />
      case 'user-profile': return <UserProfile setPage={setPage} /> // Added by JK
      
      case 'donation': return <Donation />
      case 'delete-account': return <DeleteAccount setPage={setPage} />

      case 'sign-in-wall': return <SignInWall setPage={setPage} />
      case 'page-off': return <PageOff setPage={setPage} />
 
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
          {userRole === "admin" ? <button role="menuitem" onClick={() => { setPage('admin-dash'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Admin Dashboard</button>:""}
          <button role="menuitem" onClick={() => { setPage('admin-foods'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Admin Tool - Food Menu Editor</button>
          <button role="menuitem" onClick={() => { setPage('home'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Home</button>
          <button role="menuitem" onClick={() => { setPage('festival'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Fishermans Festival</button>
          <button role="menuitem" onClick={() => { setPage('volunteer'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Festival Volunteering</button>
          <button role="menuitem" onClick={() => { setPage('bocce-dash'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Bocce Tournament</button>
          <button role="menuitem" onClick={() => { setPage('coronation'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Queen's Court</button>
          <button role="menuitem" onClick={() => { setPage('scholarships'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Scholarships</button>
          <button role="menuitem" onClick={() => { setPage('donate'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Donate</button>
          <button role="menuitem" onClick={() => { setPage('login'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Log in</button>
          <button role="menuitem" onClick={() => { setPage('shopping'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Shopping</button>
          <button role="menuitem" onClick={() => { setPage('donation'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Previous Sponsors</button>
          <button role="menuitem" onClick={() => { setPage('user-profile'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>User Profile</button>  
          <button role="menuitem" onClick={() => { setPage('delete-account'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Delete Account</button>
          {/* Temporary items */}
          <button role="menuitem" onClick={() => { setPage('bocce-sign'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Bocce Sign up</button>
          <button role="menuitem" onClick={() => { setPage('coronation-tix'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Coronation Ball Tickets</button>
          <button role="menuitem" onClick={() => { setPage('reset-pass'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Reset Password</button>
          <button role="menuitem" onClick={() => { setPage('forgot-pass'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Request Reset Password Email</button>
          <button role="menuitem" onClick={() => { setPage('signup'); setMenuOpen(false); }} style={{display:'block',padding:'0.5rem 1rem',textAlign:'left',width:'100%'}}>Create Account</button>

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
      {/* App header */}
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