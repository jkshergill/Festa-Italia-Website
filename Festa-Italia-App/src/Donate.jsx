import { useEffect } from 'react';
import './Donate.css';
import { useState } from 'react';

function Donate() {

  const maxLength = 500; {/*` Maximum length for the note input */}
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => { /* Handler to limit input length */
    setInputValue(event.target.value.slice(0, maxLength));
  };

  useEffect(() => { {/* Set body ID for styling */}
    document.body.id = 'donate-body-id';
    document.body.className = 'donate-body';
  }, []);

  return (
    <>

      <h1 className='donate-thank-you-message'>
        Thank you for supporting your community!
      </h1>

      <form className='donate-form'> 
        <label className='donate-amount-section'>
          Amount:
        </label>

        <div className='donate-enter-amount-div'>
          <input className='donate-enter-amount' type="number" placeholder="Enter amount" min={1} max={100} required/>
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
            <button className='donate-clover-button'>
              Submit with Clover
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default Donate;