import { useEffect, useState } from "react";
import "./CoronationBallTickets.css";
import { supabase } from "./supabaseClient";


export default function TicketPurchase({ setPage, setCartItems }) {
  const prices = { adult: 20, child: 10 };

  const [quantities, setQuantities] = useState({ adult: 0, child: 0 });
  const [step, setStep] = useState("selection");
  const [ticketTypes, setTicketTypes] = useState([]);
  const [names, setNames] = useState([]);
  const [foodChoices, setFoodChoices] = useState([]);
  const [otherTables, setOtherTables] = useState([]);
  const [session, setSession] = useState(null);
  const [authBanner, setAuthBanner] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [maxTickets, setMaxTickets] = useState(null);
  const [soldTickets, setSoldTickets] = useState(null);

  const remainingTickets = maxTickets !== null && soldTickets !== null
    ? maxTickets - soldTickets
    : null;

  const FOOD_OPTIONS = {
    adult: [
      { value: "steak", label: "Steak" },
      { value: "fish", label: "Fish" },
      { value: "pasta", label: "Pasta" },
      { value: "veg_gf", label: "Veg/GF" },
    ],
    child: [
      { value: "hamburger", label: "Hamburger" },
      { value: "cheeseburger", label: "Cheeseburger" },
      { value: "veg_gf", label: "Veg/GF" },
    ],
  };

  const total = quantities.adult * prices.adult + quantities.child * prices.child;
  const totalTickets = quantities.adult + quantities.child;

  useEffect(() => {
    const loadTicketAvailability = async () => {
      try {
        const { data: settings, error: settingsError } = await supabase
          .from('settings')
          .select('value, max_tickets')
          .eq('key', 'current_event')
          .single();

        if (settingsError) throw settingsError;

        setMaxTickets(settings.max_tickets);

        const { count, error: countError } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('event', settings.value);

        if (countError) throw countError;

        setSoldTickets(count ?? 0);
      } catch (err) {
        console.error('Error loading ticket availability:', err);
      }
    };

    loadTicketAvailability();
  }, []);

  useEffect(() => {
    document.body.id = "coronation-ball-tickets-body-id";
    document.body.className = "coronation-ball-tickets-body";
  }, []);

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
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleQuantityChange = (type, value) => {
    setQuantities((prev) => ({ ...prev, [type]: Math.max(0, Number(value)) }));
  };

  const handleContinue = () => {
    if (!session) { setAuthBanner("Please sign in to purchase tickets"); return; }
    if (totalTickets === 0) { alert("Please select at least one ticket."); return; }

    if (remainingTickets !== null && totalTickets > remainingTickets) {
      alert(remainingTickets === 0
        ? "Sorry, this event is sold out!"
        : `Only ${remainingTickets} ticket${remainingTickets === 1 ? '' : 's'} remaining. Please reduce your quantity.`
      );
      return;
    }

    setAuthBanner("");
    const types = [
      ...Array(quantities.adult).fill("adult"),
      ...Array(quantities.child).fill("child"),
    ];
    setTicketTypes(types);
    setNames(Array(totalTickets).fill(""));
    setFoodChoices(Array(totalTickets).fill(""));
    setStep("names");
  };

  const handleNameChange = (index, value) => {
    const updated = [...names]; updated[index] = value; setNames(updated);
  };

  const handleFoodChange = (index, value) => {
    const updated = [...foodChoices]; updated[index] = value; setFoodChoices(updated);
  };

  const handleTableChange = (index, value) => {
    const updated = [...otherTables]; updated[index] = value; setOtherTables(updated);
  };

  const handleAddToCart = async () => {
    if (!session) { setAuthBanner("Please sign in to purchase tickets"); return; }
    if (names.some((n) => !n?.trim())) { alert("Please fill in all ticket holder names."); return; }
    if (foodChoices.some((f) => !f)) { alert("Please pick a dish for every ticket."); return; }

    // Fresh availability check
    const { data: freshSettings } = await supabase
      .from('settings')
      .select('value, max_tickets')
      .eq('key', 'current_event')
      .single();

    const { count, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event', freshSettings.value);

    if (!countError) {
      const fresh_remaining = freshSettings.max_tickets - (count ?? 0);
      if (totalTickets > fresh_remaining) {
        alert(fresh_remaining === 0
          ? "Sorry, this event is just sold out!"
          : `Only ${fresh_remaining} ticket${fresh_remaining === 1 ? '' : 's'} remaining. Please reduce your quantity.`
        );
        setSoldTickets(count ?? 0);
        return;
      }
    }

    setAddingToCart(true);
    try {
      const amount_cents = total * 100;
      const orderId = crypto.randomUUID();

      const itemPayload = {
        order_id: orderId,
        buyer_email: session.user.email,
        attendee_names: names,
        ticket_types: ticketTypes,
        food_choices: foodChoices,
        amount: amount_cents,
        order_type: "Coronation Ball",
        metadata: { purchaserName: session.user.user_metadata?.full_name },
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      const { data: cartItem, error: cartError } = await supabase
        .from("cart_items")
        .insert({ user_id: session.user.id, item: itemPayload })
        .select()
        .single();

      if (cartError) { console.error("Add-to-cart error:", cartError); alert("Failed to add to cart. Please try again."); return; }

      if (typeof setCartItems === "function") {
        setCartItems((prev) => [...prev, {
          id: cartItem.id,
          order_id: orderId,
          price: amount_cents / 100,
          ticketTypes,
          quantities: { ...quantities },
          names: [...names],
          foodChoices: [...foodChoices],
          buyer_email: session.user.email,
          order_type: "Coronation Ball",
          expires_at: itemPayload.expires_at,
          category: "ticket",
          name: "Coronation Ball",
          event: "Coronation Ball",
          prices: { ...prices },
        }]);
      }

      setPage("user-profile:cart");
    } catch (err) {
      console.error("Add-to-cart error:", err);
      alert("Unexpected error. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!session) { setAuthBanner("Please sign in to purchase tickets"); return; }
      if ((quantities?.adult ?? 0) + (quantities?.child ?? 0) === 0) { alert("Please select at least one ticket."); return; }
      if (names?.some((n) => !n || !n.trim())) { alert("Please fill in all ticket holder names."); return; }
      if (foodChoices?.some((f) => !f)) { alert("Please pick out a dish"); return; }

      // Fresh availability check
      const { data: freshSettings } = await supabase
        .from('settings')
        .select('value, max_tickets')
        .eq('key', 'current_event')
        .single();

      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event', freshSettings.value);

      const fresh_remaining = freshSettings.max_tickets - (count ?? 0);
      if (totalTickets > fresh_remaining) {
        alert(fresh_remaining === 0
          ? "Sorry, this event is just sold out!"
          : `Only ${fresh_remaining} ticket${fresh_remaining === 1 ? '' : 's'} remaining. Please reduce your quantity.`
        );
        setSoldTickets(count ?? 0);
        setStep("selection");
        return;
      }

      const amount_cents = total * 100;
      const orderData = {
        orderId: crypto.randomUUID(),
        ticketTypes, names, foodChoices, quantities,
        purchaserEmail: session.user.email,
        purchaserName: session.user.user_metadata?.full_name || session.user.email
      };

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
          metadata: { purchaserName: session.user.user_metadata?.full_name },
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (pendingError) { console.error('Pending order error:', pendingError); alert('Failed to create order. Please try again.'); return; }

      const { data: { session: freshSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !freshSession?.access_token) { alert('Your session has expired. Please log in again.'); return; }

      const { data, error } = await supabase.functions.invoke(
        'create-CoronationBallTicketsCheckout',
        { body: { amount: amount_cents, orderId: orderData.orderId } }
      );

      if (error) {
        await supabase.from('pending_orders').delete().eq('order_id', orderData.orderId);
        alert(`Checkout failed: ${error.message}`);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      alert("Unexpected error. Please try again.");
    }
  };

  return (
    <div className="ticket-container">
      <h1 className="coronation-title">🎟️ Coronation Ball Tickets 🎟️</h1>

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
              type="number" min="0" value={quantities.adult}
              onChange={(e) => handleQuantityChange("adult", e.target.value)}
            />
          </div>
          <div className="ticket-type">
            <label>{`Child Ticket: $${prices.child}`}</label>
            <input
              type="number" min="0" value={quantities.child}
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
                <span className="ticket-price">${ticketTypes[i] ? prices[ticketTypes[i]] : ""}</span>
              </div>
              <div className="name-input">
                <label>Name:</label>
                <input
                  type="text" value={name}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  placeholder="Enter name" className="ticket-name-input" required
                />
              </div>
              <div className="food-input">
                <label>Food Preference?</label>
                <select value={foodChoices[i]} onChange={(e) => handleFoodChange(i, e.target.value)}>
                  <option value="">Please select a dish</option>
                  {(FOOD_OPTIONS[ticketTypes[i]] ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {!foodChoices[i] && <div className="food-warning"></div>}
              </div>
            </div>
          ))}

          <div className="cbt-action-row">
            <button className="cbt-checkout-btn" onClick={handleCheckout} disabled={!session}>
              Checkout
            </button>
            <button className="cbt-add-to-cart-btn" onClick={handleAddToCart} disabled={addingToCart || !session}>
              {addingToCart ? "Adding…" : "Add to Cart"}
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setPage('coronation')}>Back</button>
    </div>
  );
}