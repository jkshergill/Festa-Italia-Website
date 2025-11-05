// src/MockCheckout.jsx
import { useMemo } from "react";

export default function MockCheckout() {
  const params = new URLSearchParams(window.location.search);
  const amount = Number(params.get("amount") || 0);
  const names = (params.get("names") || "").split("|").filter(Boolean);
  const email = params.get("email") || "";
  const sid = params.get("sid") || "mock";

  const dollars = useMemo(() => (amount / 100).toFixed(2), [amount]);

  const complete = () => {
    alert(`Mock payment successful for $${dollars} (session ${sid})`);
    window.location.assign("/?page=coronation-tix");
  };

  const cancel = () => {
    alert("Mock payment canceled.");
    window.location.assign("/?page=coronation-tix");
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Mock Checkout</h1>
      <p>This simulates Clover’s Hosted Checkout screen.</p>
      <hr />
      <p><strong>Buyer:</strong> {email || "Guest"}</p>
      <p><strong>Attendees:</strong> {names.length ? names.join(", ") : "—"}</p>
      <p><strong>Total:</strong> ${dollars}</p>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={complete}>Pay ${dollars}</button>
        <button onClick={cancel}>Cancel</button>
      </div>
    </div>
  );
}
