
import "./forgotpassword.css"

function App() {

  return(
    <div>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Forgot Password</title>
  <header className="fading-header">
    <h1>Forgot Password</h1>
  </header>
  <main>
    <p>Festa Italia Password Reset:</p>
    <div className="form-group">
      <label htmlFor="festa-email" className="form-label">Email Address</label>
      <input id="festa-email" className="form-input" type="email" placeholder="name@domain.com" />
    </div>
    <div className="form-group">
      <label htmlFor="festa-password" className="form-label">New Password</label>
      <input id="festa-password" className="form-input" type="password" placeholder="Enter new password" />
    </div>
    <div className="form-group">
      <label htmlFor="festa-password" className="form-label">Confirm Password</label>
      <input id="festa-password" className="form-input" type="password" placeholder="Confirm new password" />
    </div>
    <button className="submit-button" type="submit">Reset Password</button>
  </main>
</div>
  );
}

export default App