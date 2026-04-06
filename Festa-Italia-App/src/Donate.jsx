import { useEffect, useState } from 'react';
import './Donate.css';
import './HomePage.css';
import { supabase } from './supabaseClient';

function Donate() {
  const maxLength = 500;
  const [inputValue, setInputValue] = useState('');
  const [name, setName] = useState('');
  const [donationType, setDonationType] = useState('Basic');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [addImageLink, setAddImageLink] = useState(false);
  const [imageLink, setImageLink] = useState('');

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

  function normalizeUrl(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const normalizedImageLink = addImageLink ? normalizeUrl(imageLink) : null;

    setIsLoading(true);

    try {
      const amount_cents = Math.round(amt * 100);
      const orderId = crypto.randomUUID();

      // NOTE:
      // This sends link + image metadata forward, but your backend / edge function
      // must also be updated to actually save them after payment succeeds.
      const { data, error } = await supabase.functions.invoke(
        'create-donation-checkout',
        {
          body: {
            amount: amount_cents,
            donorName: name.trim(),
            donationType,
            donationNote: inputValue.trim() || null,
            donorLinkUrl: normalizedImageLink,
            imageFileName: selectedFile?.name || null,
            orderId,
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
    <div className="page-root donate-page-root">
      <main>
        <section className="container section">
          <div className="donate-hero-card">
            <h1 className="donate-thank-you-message">
              Thank you for supporting your community!
            </h1>
            <p className="donate-subtext">
              Donations help Festa continue celebrating community, culture, and tradition.
            </p>
          </div>

          <form className="donate-form" onSubmit={handleSubmit}>
            <div className="donate-form-grid">
              <div className="donate-field">
                <label className="donate-label">What is your name?</label>
                <input
                  className="donate-enter-name"
                  type="text"
                  placeholder="Enter name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="donate-field">
                <label className="donate-label">What kind of donation is this?</label>
                <select
                  className="donate-donation-type"
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Basic">Basic Donation</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Bocce">Bocce</option>
                  <option value="Queens">Queens Court</option>
                  <option value="Advertising/Sponsorship">Advertising/Sponsorship</option>
                </select>
              </div>

              <div className="donate-field">
                <label className="donate-label">Amount</label>
                <input
                  className="donate-enter-amount"
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

              <div className="donate-field donate-field-full">
                <label className="donate-label">Note (optional)</label>
                <textarea
                  className="donate-note-box"
                  placeholder="Enter a note"
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <div className="donate-character-counter-div">
                  <p className="donate-character-counter">
                    {inputValue.length}/{maxLength}
                  </p>
                </div>
              </div>

              <div className="donate-field donate-field-full">
                <label className="donate-label">Upload photo/logo</label>
                <input
                  className="donate-upload-logo"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.gif"
                  disabled={isLoading}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="donate-field donate-field-full">
                <label className="donate-checkbox-row">
                  <input
                    type="checkbox"
                    checked={addImageLink}
                    onChange={(e) => {
                      setAddImageLink(e.target.checked);
                      if (!e.target.checked) setImageLink('');
                    }}
                    disabled={isLoading}
                  />
                  <span>Add URL link for image</span>
                </label>

                {addImageLink && (
                  <input
                    className="donate-enter-link"
                    type="url"
                    placeholder="https://example.com"
                    value={imageLink}
                    onChange={(e) => setImageLink(e.target.value)}
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>

            <div className="donate-clover-button-div">
              <button className="donate-clover-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Donate with Clover'}
              </button>
            </div>

            <div className="donate-help-text">
              Corperate and general donations will be displayed on the previous donors webpage unless the . Please get in contact with Festa if you made a mistake entering your info.
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Donate;