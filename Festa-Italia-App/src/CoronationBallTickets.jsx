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
    // Gate: must be signed in to checkout
    if (!session) {
      setAuthBanner("Please sign in to purchase tickets");
      return;
    }

    // Validate ticket count
    if ((quantities?.adult ?? 0) + (quantities?.child ?? 0) === 0) {
      alert("Please select at least one ticket.");
      return;
    }

    // Validate names
    if (names?.some((n) => !n || !n.trim())) {
      alert("Please fill in all ticket holder names.");
      return;
    }

    // Validate food
    if (foodChoices?.some((f) => !f)) {
      alert("Please pick out a dish");
      return;
    }

    // Get buyer email (for display only in mock checkout)
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.error("getUser error:", userErr);
      alert("Could not read user. Please try again.");
      return;
    }
    /*
    const buyerEmail = userRes?.user?.email ?? "";

    // Build ticketTypes array in the SAME order as names/foodChoices
    // (this assumes you created ticketTypes when you hit Continue)
    const amountCents = (quantities.adult * 2000) + (quantities.child * 1000);

    const namesParam = encodeURIComponent((names ?? []).join("|"));
    const typesParam = encodeURIComponent((ticketTypes ?? []).join("|"));
    const foodParam = encodeURIComponent((foodChoices ?? []).join("|"));

    const href =
      `/mock-checkout` +
      `?amount=${amountCents}` +
      `&email=${encodeURIComponent(buyerEmail)}` +
      `&names=${namesParam}` +
      `&types=${typesParam}` +
      `&food=${foodParam}` +
      `&sid=${crypto.randomUUID()}`;

    window.location.assign(href);*/

    const res = await fetch(
      // Hardcoded to supabase project ID - needs to be updated if we deploy to production
      "https://tlbikqgmitrvdtwzgriy.supabase.co/functions/v1/create-CoronationBallTicketsCheckout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount_cents,
          orderId: crypto.randomUUID(), // Unique order ID for idempotency
        }),
      }
    );

    const data = await res.json();

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      console.error("Checkout failed", data);
    }
  } catch (err) {
    console.error(err);
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