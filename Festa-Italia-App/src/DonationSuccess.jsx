import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './PaymentSuccess.css'; // Reuse the same CSS

export default function DonationSuccess({ setPage }) {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');
  const [donationDetails, setDonationDetails] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    
    console.log('🔍 Donation success page loaded with orderId:', orderId);

    const processSuccessfulDonation = async () => {
      try {
        if (!orderId) {
          setError('No order ID found');
          setStatus('error');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          window.location.href = `/login?redirect=donation-success&orderId=${orderId}`;
          return;
        }

        // Get pending donation
        const { data: pendingDonation, error: pendingError } = await supabase
          .from('pending_orders')
          .select('*')
          .eq('order_id', orderId)
          .eq('order_type', 'donation')
          .single();

        if (pendingError || !pendingDonation) {
          console.error('Pending donation error:', pendingError);
          setError('Donation record not found');
          setStatus('error');
          return;
        }

        setDonationDetails(pendingDonation);

        // Create the actual donation record
        const donationRecord = {
          donor_id: session.user.id,
          amount_cents: pendingDonation.amount,
          donation_type: pendingDonation.metadata.donation_type,
          is_anonymous: false,
          consent_to_share: true,
          donated_at: new Date().toISOString(),
          order_id: orderId,
          donor_name: pendingDonation.metadata.donor_name,
          donor_note: pendingDonation.metadata.donation_note || null
        };

        const { error: insertError } = await supabase
          .from('donors')
          .insert(donationRecord);

        if (insertError) {
          console.error('Donation insert error:', insertError);
          setError('Failed to record donation. Please contact support.');
          setStatus('error');
          return;
        }

        // Clean up pending order
        await supabase
          .from('pending_orders')
          .delete()
          .eq('order_id', orderId);

        setStatus('success');

      } catch (err) {
        console.error('Success handler error:', err);
        setError('An unexpected error occurred');
        setStatus('error');
      }
    };

    processSuccessfulDonation();
  }, []);

  if (status === 'processing') {
    return (
      <div className="success-container">
        <div className="success-card">
          <h1>🎟️ Festa Italia 🎟️</h1>
          <div className="loading-spinner"></div>
          <h2>Processing Your Donation</h2>
          <p>Please wait while we record your generous gift...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    const amount = donationDetails ? (donationDetails.amount / 100).toFixed(2) : '0';
    return (
      <div className="success-container">
        <div className="success-card">
          <h1>🎟️ Festa Italia 🎟️</h1>
          <div className="success-icon">✅</div>
          <h2>Thank You for Your Donation!</h2>
          <p className="success-message">
            Your generous gift of <strong>${amount}</strong> has been received.
          </p>
          {donationDetails?.metadata?.donation_note && (
            <div className="ticket-summary">
              <h3>Your Note</h3>
              <p>{donationDetails.metadata.donation_note}</p>
            </div>
          )}
          <p>A confirmation email has been sent to your inbox.</p>
          <div className="success-actions">
            <button onClick={() => setPage('donation')} className="btn-primary">
              View Donors
            </button>
            <button onClick={() => setPage('home')} className="btn-secondary">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="success-container">
        <div className="success-card">
          <h1>🎟️ Festa Italia 🎟️</h1>
          <div className="error-icon">❌</div>
          <h2>Something Went Wrong</h2>
          <p className="error-message">{error}</p>
          <p>Your donation may have been processed. Please check your email for confirmation.</p>
          <div className="success-actions">
            <button onClick={() => setPage('donate')} className="btn-primary">
              Try Again
            </button>
            <button onClick={() => setPage('home')} className="btn-secondary">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}