import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './PaymentSuccess.css';

export default function PaymentSuccess({ setPage }) {
  const [status, setStatus] = useState('processing');
  const [ticketCount, setTicketCount] = useState(0);
  const [error, setError] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => {
    // 🔍 DEBUG: Log the full URL and all parameters
    console.log('🔍 FULL URL:', window.location.href);
    console.log('🔍 SEARCH PARAMS:', window.location.search);
    
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const orderId = params.get('orderId');
    
    console.log('🔍 PARSED PARAMS:', { pageParam, orderId });

    // If we're not on the success page, redirect to home
    if (pageParam !== 'success') {
      console.log('❌ Not success page, redirecting to home');
      setPage('home');
      return;
    }

    const processSuccessfulPayment = async () => {
      try {
        if (!orderId) {
          console.error('❌ No orderId found in URL');
          setError('No order ID found');
          setStatus('error');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('🔐 No session, redirecting to login');
          window.location.href = `/login?redirect=success&orderId=${orderId}`;
          return;
        }

        console.log('✅ Processing payment for order:', orderId);

        const { data: pendingOrderData, error: pendingError } = await supabase
          .from('pending_orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (pendingError || !pendingOrderData) {
          console.error('❌ Pending order error:', pendingError);
          setError('Order not found');
          setStatus('error');
          return;
        }

        console.log('✅ Found pending order:', pendingOrderData);
        setPendingOrder(pendingOrderData);

        const ticketsPayload = pendingOrderData.attendee_names.map((name, index) => ({
          event: 'Festa Italia Coronation Ball 2026',
          holder_name: name,
          holder_email: pendingOrderData.buyer_email,
          ticket_type: pendingOrderData.ticket_types[index],
          price_cents: pendingOrderData.ticket_types[index] === 'child' ? 1000 : 2000,
          qr_token: crypto.randomUUID(),
          dinner_choice: pendingOrderData.food_choices?.[index] || null,
          order_id: orderId
        }));

        console.log('📦 Creating tickets:', ticketsPayload);

        const response = await supabase.functions.invoke(
          'create-order-tickets',
          {
            body: {
              orderId: orderId,
              purchaserEmail: pendingOrderData.buyer_email,
              purchaserName: pendingOrderData.metadata?.purchaserName || pendingOrderData.buyer_email,
              amount_cents: pendingOrderData.amount,
              tickets: ticketsPayload
            },
          }
        );

        if (response.error) {
          console.error('❌ Ticket creation error:', response.error);
          setError('Failed to create tickets: ' + response.error.message);
          setStatus('error');
          return;
        }

        console.log('✅ Tickets created:', response.data);

        await supabase
          .from('pending_orders')
          .delete()
          .eq('order_id', orderId);

        setTicketCount(response.data.tickets.length);
        setStatus('success');

      } catch (err) {
        console.error('❌ Success handler error:', err);
        setError('An unexpected error occurred');
        setStatus('error');
      }
    };

    processSuccessfulPayment();
  }, [setPage]);

  // Log render state
  console.log('🔄 Rendering with status:', status);

  if (status === 'processing') {
    return (
      <div className="success-container">
        <div className="success-card">
          <h1>🎟️ Coronation Ball 🎟️</h1>
          <div className="loading-spinner"></div>
          <h2>Processing Your Payment</h2>
          <p>Please wait while we create your tickets...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="success-container">
        <div className="success-card">
          <h1>🎟️ Coronation Ball 🎟️</h1>
          <div className="success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p className="success-message">
            Your payment has been received and {ticketCount} ticket(s) have been created.
          </p>
          {pendingOrder && (
            <div className="ticket-summary">
              <h3>Order Summary</h3>
              <p><strong>Order ID:</strong> {new URLSearchParams(window.location.search).get('orderId')}</p>
              <p><strong>Email:</strong> {pendingOrder.buyer_email}</p>
              <p><strong>Total:</strong> ${(pendingOrder.amount / 100).toFixed(2)}</p>
            </div>
          )}
          <p>A confirmation email has been sent to your inbox.</p>
          <div className="success-actions">
            <button onClick={() => setPage('my-tickets')} className="btn-primary">
              View My Tickets
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
          <h1>🎟️ Coronation Ball 🎟️</h1>
          <div className="error-icon">❌</div>
          <h2>Something Went Wrong</h2>
          <p className="error-message">{error}</p>
          <p>Your payment may have been processed. Please check your email for confirmation.</p>
          <div className="success-actions">
            <button onClick={() => setPage('coronation-tix')} className="btn-primary">
              Try Again
            </button>
            <button onClick={() => setPage('home')} className="btn-secondary">
              Return to Home
            </button>
          </div>
          {new URLSearchParams(window.location.search).get('orderId') && (
            <p className="order-id">Order ID: {new URLSearchParams(window.location.search).get('orderId')}</p>
          )}
        </div>
      </div>
    );
  }
}