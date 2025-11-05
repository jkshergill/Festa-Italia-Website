import React, { useState, useEffect } from "react";
import "./CoronationBallTickets.css"; // optional external CSS file if you want to style separately
import { createClient } from '@supabase/supabase-js';

export default function TicketPurchase() {

  const prices = { adult: 20, child: 10, senior: 15 };

  const [quantities, setQuantities] = useState({
    adult: 0,
    child: 0,
    senior: 0,
  });

  const [step, setStep] = useState("selection"); // "selection" or "names"
  const [names, setNames] = useState([]);

  const total =
    quantities.adult * prices.adult +
    quantities.child * prices.child +
    quantities.senior * prices.senior;

  const totalTickets =
    quantities.adult + quantities.child + quantities.senior;

  const handleQuantityChange = (type, value) => {
    setQuantities((prev) => ({
      ...prev,
      [type]: Math.max(0, Number(value)),
    }));
  };

  const handleContinue = () => {
    if (totalTickets === 0) {
      alert("Please select at least one ticket.");
      return;
    }

    // Create blank name inputs
    const newNames = Array(totalTickets).fill("");
    setNames(newNames);
    setStep("names");
  };

  const handleNameChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };
  
  //SUPABASE CLIENT
  const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

  //Hook up checkout to MOCK or CLOVER based on env
  const handleCheckout = async () => {
  try {
    // Build line items (amounts in cents)
    const lineItems = [];
    if (quantities?.adult > 0)  lineItems.push({ name: "Ball Ticket - Adult",  price: 2000, unitQty: quantities.adult });
    if (quantities?.child > 0)  lineItems.push({ name: "Ball Ticket - Child",  price: 1000, unitQty: quantities.child });
    if (quantities?.senior > 0) lineItems.push({ name: "Ball Ticket - Senior", price: 1500, unitQty: quantities.senior });

    if (!lineItems.length) {
      alert("Please select at least one ticket.");
      return;
    }
    if (names?.some((n) => !n || !n.trim())) {
      alert("Please fill in all ticket holder names.");
      return;
    }

    // Get buyer email + JWT (use user token if logged-in; fall back to anon key)
    const [{ data: userRes }, { data: sessionRes }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getSession(),
    ]);
    const buyerEmail = userRes?.user?.email ?? null;
    const jwt = sessionRes?.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

    const url = `${import.meta.env.VITE_SUPABASE_FUNCTION_URL}/create-checkout`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If Verify JWT is ON (recommended), keep BOTH of these:
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        buyerEmail,
        lineItems,
        attendeeNames: names ?? [],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Checkout HTTP ${res.status}:`, text);
      alert(`Checkout failed (${res.status}). See console for details.`);
      return;
    }

    const { href } = await res.json();
    if (!href) {
      console.error("No href in response");
      alert("Checkout link missing. Please try again.");
      return;
    }

    window.location.assign(href); // mock page (dev) or Clover (prod)
  } catch (err) {
    console.error(err);
    alert("Unexpected error. Please try again.");
  }
};


  useEffect(() => {
        document.body.id = 'coronation-ball-tickets-body';
      }, []);

  return (
    <div className="ticket-container">
      <h1>🎟️ Festa Italia Ticket Purchase</h1>

      {step === "selection" && (
        <div className="ticket-section">
          <div className="ticket-type">
            <label>{`Adult Ticket ($${prices.adult})`}</label>
            <input
              type="number"
              min="0"
              value={quantities.adult}
              onChange={(e) => handleQuantityChange("adult", e.target.value)}
            />
          </div>

          <div className="ticket-type">
            <label>{`Child Ticket ($${prices.child})`}</label>
            <input
              type="number"
              min="0"
              value={quantities.child}
              onChange={(e) => handleQuantityChange("child", e.target.value)}
            />
          </div>

          <div className="ticket-type">
            <label>{`Senior Ticket ($${prices.senior})`}</label>
            <input
              type="number"
              min="0"
              value={quantities.senior}
              onChange={(e) => handleQuantityChange("senior", e.target.value)}
            />
          </div>

          <div className="total">{`Total: $${total}`}</div>

          <button onClick={handleContinue}>Continue</button>
        </div>
      )}

      {step === "names" && (
        <div className="ticket-section">
          <h3>Enter Ticket Holder Names</h3>
          {names.map((name, i) => (
            <div className="name-input" key={i}>
              <label>Ticket {i + 1} Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(i, e.target.value)}
                placeholder="Enter name"
                required
              />
            </div>
          ))}
          <button onClick={handleCheckout}>Checkout</button>
        </div>
      )}
    </div>
  );
}
