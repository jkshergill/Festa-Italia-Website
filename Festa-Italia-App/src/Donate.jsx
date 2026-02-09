import { useEffect } from 'react';
import './Donate.css';
import { useState } from 'react';

function Donate() {

  const maxLength = 500; {/*` Maximum length for the note input */}
  const [inputValue, setInputValue] = useState('');

  // Controlled form fields so we can build the mock-checkout URL
  const [name, setName] = useState('');
  const [donationType, setDonationType] = useState('Basic');
  const [amount, setAmount] = useState('');

  const handleInputChange = (event) => { /* Handler to limit input length */
    setInputValue(event.target.value.slice(0, maxLength));
  };

  useEffect(() => { {/* Set body ID for styling */}
    document.body.id = 'donate-body-id';
    document.body.className = 'donate-body';
  }, []);

  /* For now, the submit handler just validates input and redirects 
  to a mock checkout page with query params. In a real implementation, 
  this would integrate with the Clover API to create a checkout session.
  */
  const handleSubmit = (e) => {
    e?.preventDefault();

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    const amountCents = Math.round(amt * 100);

    // Use donor name as the single attendee name so MockCheckout won't reject
    const safeName = (name || 'Donor').replace(/\|/g, ' ');
    const namesParam = encodeURIComponent(safeName);
    const typesParam = encodeURIComponent(donationType || 'donation');

    const href = `/mock-checkout` +
      `?amount=${amountCents}` +
      `&email=` +
      `&names=${namesParam}` +
      `&types=${typesParam}` +
      `&food=` +
      `&sid=${crypto.randomUUID()}`;

    window.location.assign(href);
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
            />
          </div>
        </div>

        <div className='donate-donation-type-div'>
          <label className='donate-donation-type-message'>
            What kind of donation is this?
          </label>

          <select className='donate-donation-type' value={donationType} onChange={(e) => setDonationType(e.target.value)}>
            <option value='Basic'>
              Basic Donation
            </option>

            <option value='Vendor'>
              Vendor
            </option>

            <option value='Bocce'>
              Bocce
            </option>

            <option value='Queens'>
              Queens Court
            </option>

            <option value='Advertising'>
              Advertising/Sponsorship
            </option>
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
            />
          </div>
        </div>

        <div className='donate-note-div'>
          <label className='donate-note-section'>
          Note (optional):
          <br />
          </label>

          <textarea className='donate-note-box' placeholder="Enter a note" value={inputValue} onChange={handleInputChange}></textarea>
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

          <input className='donate-upload-logo' type='file' accept='.pdf, .png, .jpg, .jpeg'/>

          <div className='donate-clover-button-div'>
            <button className='donate-clover-button' type="submit">
              Submit with Clover
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default Donate;