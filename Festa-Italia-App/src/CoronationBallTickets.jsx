import React, { useState } from "react";
import "./CoronationBallTickets.css"; // optional external CSS file if you want to style separately

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

  const handleCheckout = () => {
    if (names.some((name) => name.trim() === "")) {
      alert("Please fill in all ticket holder names.");
      return;
    }

    alert(`Proceeding to checkout for ${names.length} tickets.\nThank you!`);
    // Here you could navigate to your checkout route, e.g.:
    // navigate("/checkout");
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
            <label>Adult Ticket (${prices.adult})</label>
            <input
              type="number"
              min="0"
              value={quantities.adult}
              onChange={(e) => handleQuantityChange("adult", e.target.value)}
            />
          </div>

          <div className="ticket-type">
            <label>Child Ticket (${prices.child})</label>
            <input
              type="number"
              min="0"
              value={quantities.child}
              onChange={(e) => handleQuantityChange("child", e.target.value)}
            />
          </div>

          <div className="ticket-type">
            <label>Senior Ticket (${prices.senior})</label>
            <input
              type="number"
              min="0"
              value={quantities.senior}
              onChange={(e) => handleQuantityChange("senior", e.target.value)}
            />
          </div>

          <div className="total">Total: ${total}</div>

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
