//src/bocce-sign-up.css
import './bocce-sign-up.css'; 
import { useEffect } from 'react';

export default function BocceSignUp() {
  // Prevent full page reload on submit; ***PLUG IN submit logic later***
  const handleSubmit = (e) => {
    e.preventDefault();
  };

    useEffect(() => { // Set body ID for styling
      document.body.id = 'bocce-body-id';
      document.body.className = 'bocce-body';
    }, []);

  return (
    // Using a wrapper instead of <body>. "body" class for styling.
    <div className="Bocce-signup-body">

      {/* Border wrapper */}
      <div className="bocce-border">
        {/* Heading */}
        <h1 className="bocce-title">Bocce Team Sign-up</h1>

        {/* Form */}
        <form className="bocce-signup-form" onSubmit={handleSubmit}>
          {/* Team name */}
          <div className="players-list team-input">
            <label>What is the name of your team:</label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              placeholder="Team Name"
            />
          </div>

          {/* Players heading */}
          <p className="players-heading">Who will be your team members?</p>
          <div className="players-section">
            {/* Player inputs */}
            <div className="players-list">
              <label htmlFor="player1-name">1.</label>
              <input type="text" id="player1-name" name="player1-name" placeholder="Player 1 name" required />

              <label htmlFor="player2-name">2.</label>
              <input type="text" id="player2-name" name="player2-name" placeholder="Player 2 name" required />

              <label htmlFor="player3-name">3.</label>
              <input type="text" id="player3-name" name="player3-name" placeholder="Player 3 name" required />

              <label htmlFor="player4-name">4.</label>
              <input type="text" id="player4-name" name="player4-name" placeholder="Player 4 name" required />

              <label>Sponsor:</label>
              <input
                type="text"
                id="sponsorName"
                name="sponsorName"
                placeholder="Sponsor's name"
              />
            </div>

            {/* Bocce balls image */}
            <img
              src="/bocceball.png"
              alt="Bocce balls"
              className="bocce-image"
              decoding="async"
              loading="eager"
            />
          </div>
          
          {/* Submit */}
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}