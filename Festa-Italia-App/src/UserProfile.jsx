import { useState } from "react";
import BocceProfile from "./BocceProfile";
import ProfileInfo from "./ProfileInfo";
import PurchasedTickets from "./PurchasedTickets";
import "./UserProfile.css";
import VolunteerShifts from "./VolunteerShifts";
import ShoppingCart from "./ShoppingCart";

export default function UserProfile({ eventId, setPage, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab ?? "info");
  const [cartItems, setCartItems] = useState([]);

  const totalCartTickets = cartItems.reduce((s, i) => s + (i.qty ?? 0), 0);

  const handleSetPage = (target) => {
    if (target === "profile:cart") {
      setActiveTab("cart");
      return;
    }
    setPage(target);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "tickets":
        return <PurchasedTickets eventId={eventId} />;
      case "info":
        return <ProfileInfo setPage={setPage} />;
      case "volunteer":
        return <VolunteerShifts eventId={eventId} />;
      case "bocce":
        return <BocceProfile />;
      case "cart":
        return (
          <ShoppingCart
            cartItems={cartItems}
            setCartItems={setCartItems}
            setPage={handleSetPage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-profile">
      <h2>My Profile Dashboard</h2>

      <div className="tabs" role="tablist" aria-label="Profile sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "info"}
          className={activeTab === "info" ? "active" : ""}
          onClick={() => setActiveTab("info")}
        >
          Profile Info
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tickets"}
          className={activeTab === "tickets" ? "active" : ""}
          onClick={() => setActiveTab("tickets")}
        >
          Purchased Tickets
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "volunteer"}
          className={activeTab === "volunteer" ? "active" : ""}
          onClick={() => setActiveTab("volunteer")}
        >
          Volunteer Shifts
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "bocce"}
          className={activeTab === "bocce" ? "active" : ""}
          onClick={() => setActiveTab("bocce")}
        >
          Bocce Teams
        </button>

        <button
          type="button" role="tab"
          aria-selected={activeTab === "cart"}
          className={`tab-cart${activeTab === "cart" ? " active" : ""}`}
          onClick={() => setActiveTab("cart")}
          aria-label={`Shopping Cart${totalCartTickets > 0 ? `, ${totalCartTickets} items` : ""}`}
        >
          Cart
          {totalCartTickets > 0 && (
            <span className="tab-cart-badge" aria-hidden="true">
              {totalCartTickets}
            </span>
          )}
        </button>
      </div>

      <div className="tab-content">{renderTab()}</div>
    </div>
  );
}