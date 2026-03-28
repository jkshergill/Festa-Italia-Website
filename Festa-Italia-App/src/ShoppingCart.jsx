import { useEffect, useState } from "react";
import "./ShoppingCart.css";
import { supabase } from "./supabaseClient";
// NEED TO ADD CART_ITEMS TABLE TO SUPABASE WITH FIELDS: id (uuid), user_id (uuid), item (jsonb), created_at (timestamp)
// Keep these in sync with CoronationBallTickets.jsx
const TICKET_PRICES = { adult: 20, child: 10 };

const FOOD_OPTIONS = {
  adult: [
    { value: "steak",  label: "Steak"  },
    { value: "fish",   label: "Fish"   },
    { value: "pasta",  label: "Pasta"  },
    { value: "veg_gf", label: "Veg/GF" },
  ],
  child: [
    { value: "hamburger",    label: "Hamburger"    },
    { value: "cheeseburger", label: "Cheeseburger" },
    { value: "veg_gf",       label: "Veg/GF"       },
  ],
};

const CATEGORY_META = {
  ticket:       { label: "Ticket",       color: "#009246" },
  //registration: { label: "Registration", color: "#1a6eb5" },
  //merchandise:  { label: "Merch",        color: "#7c3aed" },
};

// ---------------------------------------------------------------------------
// ShoppingCart
//
// Props
//   cartItems    – shared array from UserProfile (in-memory state)
//   setCartItems – setter for the shared state
//   setPage      – app router; used for "Continue Shopping" link
// ---------------------------------------------------------------------------
export default function ShoppingCart({ cartItems = [], setCartItems, setPage }) {
  const [session,     setSession]     = useState(null);
  const [loading,     setLoading]     = useState(true);  // loading cart from DB
  const [checkingOut, setCheckingOut] = useState(false);
  const [removed,     setRemoved]     = useState([]);
  const [authBanner,  setAuthBanner]  = useState("");

  // ── Auth sync ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let unsubscribe;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const sess = data?.session ?? null;
      setSession(sess);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession) setAuthBanner("");
      });
      unsubscribe = () => listener?.subscription?.unsubscribe?.();
    })();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Load unpaid cart_items from Supabase on mount 
  // This is the key piece that makes the cart survive page refreshes and
  // reflects any items the user added during a previous session.
  useEffect(() => {
    if (!session) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select("item")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("cart_items fetch error:", error);
          return;
        }

        if (data && data.length > 0) {
          const dbItems = data.map((row) => row.item);
          // Merge: keep in-memory items that aren't already in DB (e.g. just
          // added this session and optimistically pushed to state already),
          // then append DB items that aren't in memory.
          setCartItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newFromDb   = dbItems.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newFromDb];
          });
        }
      } finally {
        setLoading(false);
      }
    })();
    // Run once per session change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // ── Derived totals ───────────────────────────────────────────────────────
  // Each cart item stores a `prices` map from the ticket page; fall back to
  // the local TICKET_PRICES constant for items that predate this field.
  const getUnitPrice = (item, type) =>
    (item.prices ?? TICKET_PRICES)[type] ?? item.price ?? 0;

  const subtotal = cartItems.reduce((sum, item) => {
    // Items from CoronationBallTickets have ticketTypes array + quantities map
    if (item.ticketTypes && item.quantities) {
      return (
        sum +
        (item.quantities.adult ?? 0) * getUnitPrice(item, "adult") +
        (item.quantities.child ?? 0) * getUnitPrice(item, "child")
      );
    }
    // Generic fallback for items added by other pages
    return sum + getUnitPrice(item, item.ticketType) * (item.qty ?? 1);
  }, 0);

  // Change these to what Clover or client has set up for tax calculations
  const taxDisplay   = subtotal * 0.0875;
  const totalDisplay = subtotal + taxDisplay;

  // ── Per-ticket field helpers ──────────────────────────────────────────────
  const handleNameChange = (itemId, ticketIndex, value) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const names = [...(item.names ?? Array(item.qty).fill(""))];
        names[ticketIndex] = value;
        // Sync to Supabase (fire-and-forget; full save on checkout)
        syncCartItem({ ...item, names });
        return { ...item, names };
      })
    );
  };

  const handleFoodChange = (itemId, ticketIndex, value) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const foodChoices = [...(item.foodChoices ?? Array(item.qty).fill(""))];
        foodChoices[ticketIndex] = value;
        syncCartItem({ ...item, foodChoices });
        return { ...item, foodChoices };
      })
    );
  };

  // ── Sync a single updated cart item back to Supabase ────────────────────
  const syncCartItem = async (updatedItem) => {
    const { error } = await supabase
      .from("cart_items")
      .update({ item: updatedItem })
      .eq("id", updatedItem.id);
    if (error) console.error("cart_items sync error:", error);
  };

  // ── Remove item from cart (both state + DB) ───────────────────────────────
  const removeItem = async (id) => {
    const item = cartItems.find((i) => i.id === id);
    setRemoved((prev) => [...prev, item]);
    setCartItems((prev) => prev.filter((i) => i.id !== id));

    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) console.error("cart_items delete error:", error);
  };

  const undoRemove = async () => {
    const last = removed[removed.length - 1];
    if (!last) return;
    setCartItems((prev) => [...prev, last]);
    setRemoved((prev) => prev.slice(0, -1));
    // Re-insert to DB
    await supabase.from("cart_items").insert({ id: last.id, user_id: session?.user?.id, item: last });
  };

  // ── Checkout ─────────────────────────────────────────────────────────────
  // Mirrors CoronationBallTickets.jsx handleCheckout exactly:
  //   1. Validate
  //   2. Write pending_orders (same schema)
  //   3. Refresh JWT
  //   4. Invoke edge function → get checkoutUrl
  //   5. Redirect to Clover
  //   6. On any failure after step 2: delete the pending_orders row
  const handleCheckout = async () => {
    if (!session) { setAuthBanner("Please sign in to complete your purchase."); return; }
    if (cartItems.length === 0) return;

    // Validate names
    if (cartItems.some((item) => (item.names ?? []).some((n) => !n?.trim()))) {
      alert("Please fill in all ticket holder names before checking out.");
      return;
    }
    // Validate food choices
    if (cartItems.some((item) => (item.foodChoices ?? []).some((f) => !f))) {
      alert("Please select a dish for every ticket before checking out.");
      return;
    }

    setCheckingOut(true);
    try {
      // Flatten all ticket info across every cart item into parallel arrays,
      // exactly matching what CoronationBallTickets.jsx writes to pending_orders.
      const allTicketTypes = cartItems.flatMap((item) => item.ticketTypes ?? []);
      const allNames       = cartItems.flatMap((item) => item.names       ?? []);
      const allFood        = cartItems.flatMap((item) => item.foodChoices  ?? []);
      const amount_cents   = Math.round(subtotal * 100);
      const orderId        = crypto.randomUUID();

      // Write pending_orders row
      const { error: pendingError } = await supabase
        .from("pending_orders")
        .insert({
          order_id:       orderId,
          user_id:        session.user.id,
          buyer_email:    session.user.email,
          attendee_names: allNames,
          ticket_types:   allTicketTypes,
          food_choices:   allFood,
          amount:         amount_cents,
          metadata: {
            purchaserName: session.user.user_metadata?.full_name,
            cartSnapshot:  cartItems,
          },
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        });

      if (pendingError) {
        console.error("Pending order error:", pendingError);
        alert("Failed to create order. Please try again.");
        return;
      }

      // Refresh JWT
      const { data: { session: freshSession }, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError || !freshSession?.access_token) {
        console.error("Token refresh failed:", refreshError);
        await supabase.from("pending_orders").delete().eq("order_id", orderId);
        alert("Your session has expired. Please log in again.");
        return;
      }

      // Invoke edge function (same function as CoronationBallTickets)
      const { data, error: invokeError } = await supabase.functions.invoke(
        "create-CoronationBallTicketsCheckout",
        { body: { amount: amount_cents, orderId } }
      );

      if (invokeError) {
        console.error("Edge function error:", invokeError);
        await supabase.from("pending_orders").delete().eq("order_id", orderId);
        alert(`Checkout failed: ${invokeError.message}`);
        return;
      }

      // Clear cart_items from DB now that we have a Clover session
      // (items will be confirmed/deleted by the webhook after payment)
      const cartIds = cartItems.map((i) => i.id);
      await supabase.from("cart_items").delete().in("id", cartIds);

      // Redirect to Clover
      console.log("✅ Redirecting to Clover:", data.checkoutUrl);
      window.location.href = data.checkoutUrl;

    } catch (err) {
      console.error("Checkout error:", err);
      alert("Unexpected error. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const totalTicketCount = cartItems.reduce((s, i) => s + (i.qty ?? 0), 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="sc-root">

      {/* Header */}
      <div className="sc-header">
        <span className="sc-icon" aria-hidden="true">🛒</span>
        <h3>Shopping Cart</h3>
        {totalTicketCount > 0 && (
          <span className="sc-badge" aria-label={`${totalTicketCount} items`}>
            {totalTicketCount}
          </span>
        )}
      </div>

      {/* Auth banner */}
      {!session && (
        <div className="sc-auth-banner" role="alert">
          {authBanner || "Please sign in to complete your purchase."}
        </div>
      )}

      {/* Undo bar */}
      {removed.length > 0 && (
        <div className="sc-undo-bar" role="status">
          <span>Item removed.</span>
          <button type="button" className="sc-undo-btn" onClick={undoRemove}>Undo</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="sc-loading">
          <span className="sc-spinner" aria-hidden="true" />
          Loading your cart…
        </div>
      ) : cartItems.length === 0 ? (
        /* Empty state */
        <div className="sc-empty">
          <div className="sc-empty-icon" aria-hidden="true">🛍️</div>
          <p className="sc-empty-title">Your cart is empty</p>
          <p className="sc-empty-sub">
            Browse events and add tickets or registrations to get started.
          </p>
          {setPage && (
            <button
              type="button"
              className="sc-browse-btn"
              onClick={() => setPage("coronation")}
            >
              Browse Events
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Item list */}
          <ul className="sc-list" aria-label="Cart items">
            {cartItems.map((item) => {
              const meta = CATEGORY_META[item.category] ?? CATEGORY_META.ticket;

              // Per-ticket rows: use ticketTypes array if present (CoronationBall items),
              // otherwise synthesise from ticketType + qty.
              const ticketRows = item.ticketTypes
                ? item.ticketTypes
                : Array(item.qty ?? 1).fill(item.ticketType ?? "adult");

              const names      = (item.names       ?? []).concat(Array(Math.max(0, ticketRows.length - (item.names?.length       ?? 0))).fill(""));
              const foodChoices= (item.foodChoices  ?? []).concat(Array(Math.max(0, ticketRows.length - (item.foodChoices?.length ?? 0))).fill(""));

              // Line total
              const lineTotal = ticketRows.reduce(
                (s, type) => s + getUnitPrice(item, type), 0
              );

              return (
                <li key={item.id} className="sc-item">

                  {/* Item header */}
                  <div className="sc-item-top">
                    <div className="sc-item-meta">
                      <span
                        className="sc-cat-pill"
                        style={{ background: meta.color + "1a", color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <p className="sc-item-name">{item.name}</p>
                      {item.event && <p className="sc-item-sub">🎟 {item.event}</p>}
                      {item.date  && <p className="sc-item-sub">📅 {item.date}</p>}
                    </div>

                    <div className="sc-item-controls">
                      <p className="sc-item-price">${lineTotal.toFixed(2)}</p>
                      <button
                        type="button"
                        className="sc-remove-btn"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>

                  {/* Per-ticket name + food rows */}
                  {ticketRows.map((type, idx) => {
                    const foodOpts = FOOD_OPTIONS[type] ?? [];
                    return (
                      <div key={idx} className="sc-ticket-row">
                        <span className="sc-ticket-label">
                          {type === "adult" ? "Adult" : "Child"} #{idx + 1}
                          <span className="sc-ticket-unit-price">
                            {" "}· ${getUnitPrice(item, type).toFixed(2)}
                          </span>
                        </span>

                        <div className="sc-ticket-fields">
                          {/* Name */}
                          <div className="sc-field">
                            <label className="sc-field-label" htmlFor={`name-${item.id}-${idx}`}>
                              Name
                            </label>
                            <input
                              id={`name-${item.id}-${idx}`}
                              type="text"
                              className={`sc-field-input${!names[idx]?.trim() ? " sc-field-input--warn" : ""}`}
                              value={names[idx] ?? ""}
                              onChange={(e) => handleNameChange(item.id, idx, e.target.value)}
                              placeholder="Ticket holder name"
                            />
                          </div>

                          {/* Food */}
                          {foodOpts.length > 0 && (
                            <div className="sc-field">
                              <label className="sc-field-label" htmlFor={`food-${item.id}-${idx}`}>
                                Meal
                              </label>
                              <select
                                id={`food-${item.id}-${idx}`}
                                className={`sc-field-select${!foodChoices[idx] ? " sc-field-input--warn" : ""}`}
                                value={foodChoices[idx] ?? ""}
                                onChange={(e) => handleFoodChange(item.id, idx, e.target.value)}
                              >
                                <option value="">Please select a dish</option>
                                {foodOpts.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </li>
              );
            })}
          </ul>

          {/* Order summary */}
          <div className="sc-summary" aria-label="Order summary">
            <div className="sc-summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="sc-summary-row sc-summary-tax">
              <span>Est. Tax</span>
              <span>${taxDisplay.toFixed(2)}</span>
            </div>
            <div className="sc-summary-row sc-summary-total">
              <span>Est. Total</span>
              <span>${totalDisplay.toFixed(2)}</span>
            </div>

            <p className="sc-tax-note">
              Final total is calculated by Clover at checkout.
            </p>

            <div className="sc-clover-note" aria-label="Payment processor">
              <svg className="sc-clover-logo" viewBox="0 0 60 60" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="30" cy="30" r="30" fill="#1DA462"/>
                <path d="M30 14C21.163 14 14 21.163 14 30s7.163 16 16 16 16-7.163 16-16S38.837 14 30 14zm0 28c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12z" fill="white"/>
                <circle cx="30" cy="30" r="5" fill="white"/>
              </svg>
              <span>Payments securely processed by Clover</span>
            </div>

            <button
              type="button"
              className={`sc-checkout-btn${checkingOut ? " sc-checkout-btn--loading" : ""}`}
              onClick={handleCheckout}
              disabled={checkingOut || !session}
            >
              {checkingOut ? (
                <><span className="sc-spinner" aria-hidden="true" />Redirecting to Clover…</>
              ) : (
                `Proceed to Checkout — $${subtotal.toFixed(2)}`
              )}
            </button>

            <p className="sc-secure-note">
              🔒 You'll complete payment on Clover's secure checkout page.
            </p>
          </div>
        </>
      )}
    </div>
  );
}