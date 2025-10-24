import './Signup.css';

function Signup() {
  return (
    <div className='signup-border'>
      <img className='logo-02' src='../images/logo2.jpeg'/>
      <span className='signup-text'>
        Signup
      </span>

      <form className='signup-form'>
        <label className='email-section'>
          Email:
        </label>

        <input type='email' className='email-textbox' placeholder='Enter your email' required/>
        
        <div className='password-div'>
          <label className='password-section'>
            Password:
          </label>

          <input type='text' className='password-textbox' placeholder='Enter your password' required/>
        </div>

        <div className='signup-button-div'>
          <button className='signup-button'>
            Signup
          </button>
        </div>
      </form>

      <div className='login-link-div'>
        <a className='login-link' href='#'>
          Login
        </a>
      </div>
    </div>
  );
}

export default Signup