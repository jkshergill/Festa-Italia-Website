import { useEffect } from 'react';
import './Signup.css';
import { useState } from 'react';

function Signup() {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const passwordType = showPassword ? 'text' : 'password'; // Toggle password visibility

  const handleTogglePassword = (e) => { // Handle password visibility toggle
    e.preventDefault();
    setShowPassword((prevState) => !prevState);
  }

  useEffect(() => { // Set body ID for styling
      document.body.id = 'signup-body-id';
      document.body.className = 'signup-body';
    }, []);

  return (

    <div className='signup-border'>
      <img className='signup-logo-02' src='../images/logo2.jpeg'/>
      <span className='signup-text'>
        Signup
      </span>

      <form className='signup-form'>
        <label className='signup-email-section'>
          Email:
        </label>

        <input type='email' className='signup-email-textbox' placeholder='Enter your email' required/>
        
        <div className='signup-password-div'>
          <label className='signup-password-section'>
            Password:
          </label>

          <input type= {passwordType} className='signup-password-textbox' placeholder='Enter your password' required/>

          <button className='signup-show-password-button' onClick={handleTogglePassword}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className='signup-button-div'>
          <button className='signup-button'>
            Signup
          </button>
        </div>
      </form>

      <div className='signup-login-link-div'>
        <a className='signup-login-link' href='#'>
          Login
        </a>
      </div>
    </div>
  );
}

export default Signup