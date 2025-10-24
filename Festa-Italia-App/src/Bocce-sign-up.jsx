import React from 'react';
import './bocce-sign-up.css'; //src/bocce-sign-up.css

export default function BocceSignUp() {
  // Prevent full page reload on submit; ***PLUG IN submit logic later***
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    // Using a wrapper instead of <body>. "body" class for styling.
    <div className="body">
      {/* Logo (place logo2.gif in /public so it serves at /logo2.gif) */}
      <img
        src="/logo2.gif"              // If you put logo2.gif in the project's /public folder
        alt="Festa Italia Logo"
        className="logo"
      />

      {/* Border wrapper */}
      <div className="border">
        {/* Heading */}
        <h1 className="title">Bocce Team Sign-up</h1>

        {/* Form */}
        <form className="signup-form" onSubmit={handleSubmit}>
          {/* Team name */}
          <label htmlFor="team-name" className="team-label">
            What is the name of your team?
          </label>
          <input type="text" id="team-name" name="team-name" required />

          {/* Players heading */}
          <p className="players-heading">Who will be your team members?</p>

          {/* Four players (INPUT ONLY ATM) */}
          <div className="players-list">
            <label htmlFor="player1-name">1.</label>
            <input type="text" id="player1-name" name="player1-name" required />

            <label htmlFor="player2-name">2.</label>
            <input type="text" id="player2-name" name="player2-name" required />

            <label htmlFor="player3-name">3.</label>
            <input type="text" id="player3-name" name="player3-name" required />

            <label htmlFor="player4-name">4.</label>
            <input type="text" id="player4-name" name="player4-name" required />
          </div>

          {/* Submit */}
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}