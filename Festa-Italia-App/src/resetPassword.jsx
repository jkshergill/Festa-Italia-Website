
import "./resetPassword.css"
import { supabase } from "./supabaseClient";
import { useState } from "react";
import { useEffect } from "react";

function App() {

  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordType = showPassword ? 'text' : 'password';
  const hasLowerCase = /[a-z]/; // This is a regular expression that checks if the password contains at least one lowercase letter
  const hasUpperCase = /[A-Z]/; // This is a regular expression that checks if the password contains at least one uppercase letter
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/; // This is a regular expression that checks if the password contains at least one special character

  // Form Fields 
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleTogglePassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    document.body.id = 'reset-body-id';
    document.body.className = 'reset-body';
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if(newPassword !== confirmPassword) { // This is to check if the new password and confirm password match
      setMessage('Passwords do not match.');
      return;
    }

    if(!hasLowerCase.test(newPassword)) { // This is to check if the password contains at least one lowercase letter
      setMessage('Password must contain at least one lowercase letter.');
      return;
    }

    if(!hasUpperCase.test(newPassword)) { // This is to check if the password contains at least one uppercase letter
      setMessage('Password must contain at least one uppercase letter.');
      return;
    }

    if(!hasSpecialChar.test(newPassword)) { // This is to check if the password contains at least one special character
      setMessage('Password must contain at least one special character.');
      return;
    }

    if(newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    try {
      const {data, error} = await supabase.auth.updateUser({password:newPassword}); // This will turn the new password into the user's password
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Password updated successfully! If you entered this page through the "Reset Password" email, please close this tab.');
      }
    } catch (error) {
      setMessage(error.message);
    }

  };

  return(
    <div>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset Password</title>
  {/*<header className="fading-header">*/}
    {/*<h1>Forgot Password</h1>*/}
  {/*</header>*/}

  <main className="main-reset-content">
    <p className="reset-text">Festa Italia Password Reset:</p>

    <p> 
      <strong>
        Disclaimer: You must be logged in to reset your password. 
      </strong>
    </p>
    
    <p>
      <strong>
        If you have forgotten your password, please use the "Request Reset Password Email" link from the top-right menu to receive a password reset email link and then return to this page.
      </strong>
    </p>

    <div className="form-group">
      <form className="reset-form" onSubmit={handleUpdatePassword}>
        <label htmlFor="festa-email" className="form-label">Email Address</label>
        <input id="festa-email" className="form-input" type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>

        <label htmlFor="festa-password" className="form-label">New Password</label>
        <input id="festa-password" minLength={8} className="form-input" type={passwordType} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/>

        <label htmlFor="festa-password" className="form-label">Confirm Password</label>
        <input id="festa-password" minLength={8} className="form-input" type={passwordType} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
      
        <button className="submit-button" type="submit">Reset Password</button>  
        
        <button
          className='show-password-button'
          onClick={handleTogglePassword}
          aria-pressed={showPassword}
          type='button'
        >
          {showPassword ? 'Hide Password' : 'Show Password'}
        </button> 

        {message && <p className="status-message">{message}</p>}

        <p>
          <br/>
          Your password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.
        </p>
      </form>
    </div>

  </main>
</div>
  );
}

export default App