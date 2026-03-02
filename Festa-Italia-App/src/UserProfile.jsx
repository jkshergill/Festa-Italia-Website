import { useState } from "react";
import PurchasedTickets from "./PurchasedTickets";
import ProfileInfo from "./ProfileInfo";
import BocceTeams from "./BocceTeams";
import "./UserProfile.css";

export default function UserProfile({ eventId, setPage }) {
  const [activeTab, setActiveTab] = useState("tickets");

  const renderTab = () => {
    switch (activeTab) {
      case "tickets":
        return <PurchasedTickets eventId={eventId} />;
      case "info":
        return <ProfileInfo />;
      case "settings":
        return <p>Settings coming soon.</p>;
      case "bocce":
        return <BocceTeams />;
      default:
        return null;
    }
  };

  return (
    <div className="user-profile">
      <h2>My Dashboard</h2>
      <div className="tabs">
        <button
          className={activeTab === "tickets" ? "active" : ""}
          onClick={() => {
            setActiveTab("tickets");
          }}
        >
          Purchased Tickets
        </button>
        <button
          className={activeTab === "info" ? "active" : ""}
          onClick={() => setActiveTab("info")}
        >
          Profile Info
        </button>
        <button
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
        <button
          className={activeTab === "bocce" ? "active" : ""}
          onClick={() => setActiveTab("bocce")}
        >
          Bocce Teams
        </button>
      </div>
      <div className="tab-content">{renderTab()}</div>
    </div>
  );
}
