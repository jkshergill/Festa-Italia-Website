import React, { useState, useEffect } from "react";
import "./CoronationBallTickets.css";
import { supabase } from "./supabaseClient";


export default function TicketPurchase() {
  // Ticket prices
  const prices = { adult: 20, child: 10 };

  const [quantities, setQuantities] = useState({
    adult: 0,
    child: 0,
  });
  // Food options by ticket type
  const FOOD_OPTIONS = {
    adult: [
      { value: "steak", label: "Steak" },
      { value: "fish", label: "Fish" },
      { value: "pasta", label: "Pasta" },
      { value: "veg_gf", label: "Veg/GF" }, // new option
    ],
    child: [
      { value: "hamburger", label: "Hamburger" },
      { value: "cheeseburger", label: "Cheeseburger" },
      { value: "veg_gf", label: "Veg/GF" }, // new option
    ],
  };

  const [step, setStep] = useState("selection"); // "selection" or "names"
  const [ticketTypes, setTicketTypes] = useState([]); // parallel array: "adult" | "child"
  const [names, setNames] = useState([]);
  const [foodChoices, setFoodChoices] = useState([]);
  const [otherTables, setOtherTables] = useState([]);
  const [session, setSession] = useState(null);
  const [authBanner, setAuthBanner] = useState("");

  const total = quantities.adult * prices.adult + quantities.child * prices.child;
  const totalTickets = quantities.adult + quantities.child;

  const handleQuantityChange = (type, value) => {
    setQuantities((prev) => ({
      ...prev,
      [type]: Math.max(0, Number(value)),
    }));
  };

  const handleContinue = () => {
    // Gate: must be signed in to continue
    if (!session) {
      setAuthBanner("Please sign in to purchase tickets");
      return;
    }

    if (totalTickets === 0) {
      alert("Please select at least one ticket.");
      return;
    }

    setAuthBanner("");

    // Build ordered ticket types so we can label each ticket correctly
    const types = [
      ...Array(quantities.adult).fill("adult"),
      ...Array(quantities.child).fill("child"),
    ];
    setTicketTypes(types);

    // Create blank name inputs + default food selection
    const newNames = Array(totalTickets).fill("");
    const newFood = Array(totalTickets).fill(""); // "" means "Please select a dish"
    setNames(newNames);
    setFoodChoices(newFood);

    setStep("names");
  };

  const handleNameChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const handleFoodChange = (index, value) => {
    const updated = [...foodChoices];
    updated[index] = value;
    setFoodChoices(updated);
  };

  const handleTableChange = (index, value) => {
    const updated = [...otherTables];
    updated[index] = value;
    setOtherTables(updated);
  };

  const handleCheckout = async () => {
  try {
    // Validation
    if (!session) {
      setAuthBanner("Please sign in to purchase tickets");
      return;
    }

    if ((quantities?.adult ?? 0) + (quantities?.child ?? 0) === 0) {
      alert("Please select at least one ticket.");
      return;
    }

    if (names?.some((n) => !n || !n.trim())) {
      alert("Please fill in all ticket holder names.");
      return;
    }

    if (foodChoices?.some((f) => !f)) {
      alert("Please pick out a dish");
      return;
    }

    // Create orderData
    const amount_cents = total * 100;
    const orderData = {
      orderId: crypto.randomUUID(),
      ticketTypes,
      names,
      foodChoices,
      quantities,
      purchaserEmail: session.user.email,
      purchaserName: session.user.user_metadata?.full_name || session.user.email
    };

    // Store in pending_orders
    const { data: pendingOrder, error: pendingError } = await supabase
      .from('pending_orders')
      .insert({
        order_id: orderData.orderId,
        user_id: session.user.id,
        buyer_email: session.user.email,
        attendee_names: names,
        ticket_types: ticketTypes,
        food_choices: foodChoices,
        amount: amount_cents,
        metadata: {
          purchaserName: session.user.user_metadata?.full_name
        },
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (pendingError) {
      console.error('Pending order error:', pendingError);
      alert('Failed to create order. Please try again.');
      return;
    }

    console.log('✅ Pending order created:', pendingOrder);

    const { data: { session: freshSession }, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError || !freshSession?.access_token) {
    console.error('Token refresh failed:', refreshError);
    alert('Your session has expired. Please log in again.');
   return;
  }

    const token = freshSession.access_token;
    console.log('✅ Using token:', token.substring(0, 15) + '...');

    // Use supabase.functions.invoke (handles headers automatically)
    const { data, error } = await supabase.functions.invoke(
      'create-CoronationBallTicketsCheckout',
      {
        body: {
          amount: amount_cents,
          orderId: orderData.orderId
        },
        // No need to manually set headers - invoke adds them
      }
    );

    if (error) {
      console.error('Invoke error:', error);
      
      // Clean up pending order
      await supabase
        .from('pending_orders')
        .delete()
        .eq('order_id', orderData.orderId);
      
      alert(`Checkout failed: ${error.message}`);
      return;
    }

    console.log('✅ Redirecting to Clover:', data.checkoutUrl);
    window.location.href = data.checkoutUrl;

  } catch (err) {
    console.error('Checkout error:', err);
    alert("Unexpected error. Please try again.");
  }
};

  useEffect(() => {
    document.body.id = "coronation-ball-tickets-body-id";
    document.body.className = "coronation-ball-tickets-body";
  }, []);

  // Keep auth session in sync
  useEffect(() => {
    let unsubscribe;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession) setAuthBanner("");
      });
      unsubscribe = () => listener?.subscription?.unsubscribe?.();
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="ticket-container">
      <h1 className="coronation-title">
      🎟️ Coronation Ball Tickets 🎟️
      </h1>

      {!session && (
        <div className="auth-banner" role="alert">
          {authBanner || "Please sign in to purchase tickets"}
        </div>
      )}

      {step === "selection" && (
        <div className="ticket-section">
          <div className="ticket-type">
            <label>{`Adult Ticket: $${prices.adult}`}</label>
            <input
              type="number"
              min="0"
              value={quantities.adult}
              onChange={(e) => handleQuantityChange("adult", e.target.value)}
            />
          </div>

          <div className="ticket-type">
            <label>{`Child Ticket: $${prices.child}`}</label>
            <input
              type="number"
              min="0"
              value={quantities.child}
              onChange={(e) => handleQuantityChange("child", e.target.value)}
            />
          </div>

          <div className="total">{`Total: $${total}`}</div>

          <button onClick={handleContinue} disabled={!session}>
            Continue
          </button>
        </div>
      )}

      {step === "names" && (
        <div className="ticket-section">
          <h3>Enter Ticket Holder Names</h3>

          {names.map((name, i) => (
            <div className="name-block" key={i}>
              <div className="ticket-summary">
                <strong>{ticketTypes[i] === "adult" ? "Adult " : "Child "}</strong>
                <span className="ticket-price">
                  ${ticketTypes[i] ? prices[ticketTypes[i]] : ""}
                </span>
              </div>

              <div className="name-input">
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  placeholder="Enter name"
                  className="ticket-name-input"
                  required
                />
              </div>

              <div className="food-input">
                <label>Food Preference?</label>
                <select
                  value={foodChoices[i]}
                  onChange={(e) => handleFoodChange(i, e.target.value)}
                >
                  <option value="">Please select a dish</option>

                  {(FOOD_OPTIONS[ticketTypes[i]] ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {!foodChoices[i] && <div className="food-warning"></div>}
              </div>
            </div>
          ))}
               {
          /* <h4>Other Table Names</h4>
          {otherTables.map((val, idx) => (
            <input
              key={idx}
              type="text"
              value={val}
              placeholder={`Table Name ${idx + 1}`}
              onChange={(e) => handleTableChange(idx, e.target.value)}
              className="table-input"
            />
          ))} */}

          <button onClick={handleCheckout} /*disabled={!session}*/>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}