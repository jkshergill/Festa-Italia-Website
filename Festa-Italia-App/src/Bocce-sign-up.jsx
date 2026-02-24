//src/bocce-sign-up.css
import './bocce-sign-up.css'; 
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function BocceSignUp() {

  // State to track if the form has been submitted.
  const [submitted, setSubmitted] = useState(false);

  // Information to be submitted to database.
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(['', '', '', '']);
  const [sponsors, setSponsors] = useState('');

  // Prevent full page reload on submit; ***PLUG IN submit logic later***
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.target);

    // Extract team name, player names, and sponsor name from form data.
    const teamName = formData.get('teamName');
    const playerNames = [
      formData.get('player1-name'),
      formData.get('player2-name'),
      formData.get('player3-name'),
      formData.get('player4-name'),
    ];
    const sponsorName = formData.get('sponsorName') || null; // Set to null if sponsor name is empty

    // Get current user to associate with this team
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      alert('You must be logged in to sign up a bocce team.');
      return;
    }

    // Insert data into Supabase with user_id
    const { data, error } = await supabase
      .from('bocce_teams')
      .insert([
        {
          team_name: teamName,
          player1: playerNames[0],
          player2: playerNames[1],
          player3: playerNames[2],
          player4: playerNames[3],
          sponsor_name: sponsorName,
          user_id: user.id
        }
      ]);

    // Handle any errors that occur during insertion.
    if (error) {
      console.error(error);
      alert('An error occurred while submitting your team. Please try again.');
      return;
    }

    // If submission is successful, update state to show confirmation message.
    setSubmitted(true);
    e.target.reset(); // Clear form after submission

  };

  useEffect(() => { // Set body ID for styling
  document.body.id = 'bocce-body-id';
  document.body.className = 'bocce-body';
  }, []);

  if (submitted) {
    return (
      <div className="bocce-submitted-message">
        <h2>Thank you for signing up your team!</h2>
        <p>We look forward to seeing you at the tournament.</p>
      </div>
    );
  }

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