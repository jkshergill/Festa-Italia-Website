import { useEffect, useMemo, useState } from 'react';
import './Signup.css';
import { supabase } from './supabaseClient'; // <-- your file is in src

function Signup({setPage}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const hasLowerCase = /[a-z]/; // This is a regular expression that checks if the password contains at least one lowercase letter
  const hasUpperCase = /[A-Z]/; // This is a regular expression that checks if the password contains at least one uppercase letter
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/; // This is a regular expression that checks if the password contains at least one special 

  // form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');

  // invisible donor field (future use)
  const [isDonor] = useState(false);

  const passwordType = showPassword ? 'text' : 'password';

  // simple email regex (kept lightweight on purpose)
  const emailOk = useMemo(() => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }, [email]);

  const fieldsFilled =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.length >= 8 &&
    confirm.length >= 8;

  const pwMatch = password === confirm;

  const formValid = Boolean(fieldsFilled && emailOk && pwMatch);

  const handleTogglePassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    document.body.id = 'signup-body-id';
    document.body.className = 'signup-body';
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("clicked")
    setErrorMsg('');
    setSuccessMsg('');

    if (!formValid) {
      setErrorMsg('Please complete all fields correctly before continuing.');
      return;
    }

    if(!hasLowerCase.test(password)) { // This is to check if the password contains at least one lowercase letter
      setErrorMsg('Password must contain at least one lowercase letter.');
      return;
    }

    if(!hasUpperCase.test(password)) { // This is to check if the password contains at least one uppercase letter
      setErrorMsg('Password must contain at least one uppercase letter.');
      return;
    }

    if(!hasSpecialChar.test(password)) { // This is to check if the password contains at least one special character
      setErrorMsg('Password must contain at least one special character.');
      return;
    }

    setLoading(true);
    try {
      // This sends the confirmation email. The account will be "unconfirmed"
      // until the user clicks the link.
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: 'user',        // default privilege
            is_donor: isDonor,   // invisible donor flag
          },
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) throw error;

      setSuccessMsg(
        'Almost there! We sent a verification link to your email. Click it to activate your account.'
      );
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirm('');
    } catch (err) {
      setErrorMsg(err?.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='signup-border'>
      
      <img className='signup-logo-02' src='../images/logo2.jpeg' alt='Logo' />
      <span className='signup-text'>Signup</span>

      <form className='signup-form' onSubmit={handleSubmit} noValidate>
        {/* First + Last name */}
        <label className='signup-name-label' htmlFor='firstName'>First name:</label>
        <input
          id='firstName'
          type='text'
          className='signup-name-textbox'
          placeholder='Enter your first name'
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete='given-name'
          required
        />

        <label className='signup-name-label' htmlFor='lastName'>Last name:</label>
        <input
          id='lastName'
          type='text'
          className='signup-name-textbox'
          placeholder='Enter your last name'
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete='family-name'
          required
        />

        {/* Email */}
        <label className='signup-email-section' htmlFor='email'>Email:</label>
        <input
          id='email'
          type='email'
          className='signup-email-textbox'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete='email'
          required
          aria-invalid={email ? (!emailOk).toString() : 'false'}
        />

        {/* Password + Confirm */}
        <div className='signup-password-div'>
          <label className='signup-password-section' htmlFor='password'>Password:</label>
          <input
            id='password'
            type={passwordType}
            className='signup-password-textbox'
            placeholder='Enter your password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='new-password'
            minLength={8}
            required
          />
          <small className='password-rule'>
            Must be at least eight characters with one uppercase letter, one lowercase letter, and one special character
          </small>

          <label className='signup-password-section' htmlFor='confirm'>Confirm password:</label>
          <div className='show'>
          <input
            id='confirm'
            type={passwordType}
            className='signup-password-textbox'
            placeholder='Re-enter your password'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete='new-password'
            minLength={8}
            required
            aria-invalid={confirm ? (!pwMatch).toString() : 'false'}
          />

          <button
            className='signup-show-password-button'
            onClick={handleTogglePassword}
            aria-pressed={showPassword}
            type='button'
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
          </div>
        </div>

        {/* Hidden donor field */}
        <input type='hidden' name='is_donor' value={String(isDonor)} />

        {/* Live validation hints (optional, styled in your CSS additions) */}
        <div className='signup-hints' style={{ fontSize: 8 }}>
          {!emailOk && email.length > 0 && <div>Enter a valid email address.</div>}
          {password && password.length < 8 && <div>Password must be at least 8 characters.</div>}
          {confirm && !pwMatch && <div>Passwords do not match.</div>}
        </div>

        {/* Messages */}
        {errorMsg && <div role='alert' className='signup-error'>{errorMsg}</div>}
        {successMsg && <div role='status' className='signup-success'>{successMsg}</div>}

        {/* signup-button*/}
          <button
            className='up-button'
            type='submit'
            disabled={loading}
            aria-disabled={loading || !formValid}
            title={!formValid ? 'Complete all fields correctly to continue' : 'Create account'}
        
          >
            {loading ? 'Signing up…' : 'Signup'}
          </button>
          {/* </div>    */}
      </form>

{/* /*********  */}

	{/* on Login hyperlink  click redirects to Login page  */}

        <div className="signup-login-link-div">
          
           <span className="signup-login-link" onClick={() => setPage("login")}
            style={{ cursor: "pointer" , color: "blue"}}
            >Login</span>
            </div> 

    </div>
  );
}

export default Signup;

