import { useEffect, useState } from 'react';
import './Donate.css';
import { supabase } from './supabaseClient';

function Donate() {
  const maxLength = 500;
  const [inputValue, setInputValue] = useState('');
  const [name, setName] = useState('');
  const [donationType, setDonationType] = useState('Basic');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(null);

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value.slice(0, maxLength));
  };

  useEffect(() => {
    document.body.id = 'donate-body-id';
    document.body.className = 'donate-body';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!session) {
      alert('Please sign in to make a donation.');
      window.location.href = '/?page=login&redirect=donate';
      return;
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    if (!name.trim()) {
      alert('Please enter your name.');
      return;
    }

    setIsLoading(true);

    try {
      const amount_cents = Math.round(amt * 100);
      const orderId = crypto.randomUUID();

      // Call the donation checkout edge function
      const { data, error } = await supabase.functions.invoke(
        'create-donation-checkout',
        {
          body: {
            amount: amount_cents,
            donorName: name.trim(),
            donationType: donationType,
            donationNote: inputValue.trim() || null,
            orderId: orderId
          },
        }
      );

      if (error) {
        console.error('Checkout error:', error);
        alert(`Failed to create checkout: ${error.message}`);
        return;
      }

      console.log('Redirecting to Clover:', data.checkoutUrl);
      window.location.href = data.checkoutUrl;

    } catch (err) {
      console.error('Donation error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className='donate-thank-you-message'>
        Thank you for supporting your community!
      </h1>

      <form className='donate-form' onSubmit={handleSubmit}>
        <div className='donate-name-section-div'>
          <label className='donate-name-section'>
            What is your name?
          </label>
          <div>
            <input
              className='donate-enter-name'
              type="text"
              placeholder='Enter name'
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className='donate-donation-type-div'>
          <label className='donate-donation-type-message'>
            What kind of donation is this?
          </label>
          <select 
            className='donate-donation-type' 
            value={donationType} 
            onChange={(e) => setDonationType(e.target.value)}
            disabled={isLoading}
          >
            <option value='Basic'>Basic Donation</option>
            <option value='Vendor'>Vendor</option>
            <option value='Bocce'>Bocce</option>
            <option value='Queens'>Queens Court</option>
            <option value='Advertising'>Advertising/Sponsorship</option>
          </select>
        </div>

        <div className='donate-amount-section-div'>
          <label className='donate-amount-section'>
            Amount:
          </label>
          <div className='donate-enter-amount-div'>
            <input
              className='donate-enter-amount'
              type="number"
              placeholder="Enter amount"
              min={1}
              max={10000}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className='donate-note-div'>
          <label className='donate-note-section'>
            Note (optional):
            <br />
          </label>
          <textarea 
            className='donate-note-box' 
            placeholder="Enter a note" 
            value={inputValue} 
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <br />
          <div className='donate-character-counter-div'>
            <p className='donate-character-counter'> 
              {inputValue.length}/ {maxLength}
            </p>
          </div>

          <label className='donate-logo-section'>
            Upload photo/logo:
          </label>
          <br />
          <input 
            className='donate-upload-logo' 
            type='file' 
            accept='.pdf, .png, .jpg, .jpeg'
            disabled={isLoading}
          />

          <div className='donate-clover-button-div'>
            <button className='donate-clover-button' type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Donate with Clover'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default Donate;