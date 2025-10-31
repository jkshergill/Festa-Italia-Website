import { useEffect } from 'react';
import './Donate.css';

function Donate() {
  useEffect(() => {
    document.body.id = 'donate-body';
  }, []);

  return (
    <>
      <header className='header'>
        <p className='header-text'>Temporary header</p>
      </header>
      
      <form className='donate-form'> 
        <label className='amount-section'>
          Amount:
        </label>

        <div className='enter-amount-div'>
          <input className='enter-amount' type="number" placeholder="Enter amount" min={1} max={100} required/>
        </div>

        <div className='note-div'>
          <label className='note-section'>
          Note (optional):
          <br />

          <textarea className='note-box' placeholder="Enter a note"></textarea>
          <br />
          </label>
        </div>

      </form>
    </>
  );
}

export default Donate;