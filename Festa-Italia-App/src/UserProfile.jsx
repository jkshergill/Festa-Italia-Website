import { useState } from "react";
import PurchasedTickets from "./PurchasedTickets";
import ProfileInfo from "./ProfileInfo";
import BocceTeams from "./BocceTeams";
import VolunteerShifts from "./VolunteerShifts";
import "./UserProfile.css";

export default function UserProfile({ eventId, setPage }) {
  const [activeTab, setActiveTab] = useState("tickets");

  const renderTab = () => {
    switch (activeTab) {
      case "tickets":
        return <PurchasedTickets eventId={eventId} />;
      case "info":
        return <ProfileInfo />;
      case "volunteer":
        return <VolunteerShifts />;
      case "bocce team":
        return <BocceTeams />;
      default:
        return null;
    }
  };

  return (
    <div className="user-profile">
      <h2>My Profile Dashboard</h2>
      <div className="tabs">
        <button
          className={activeTab === "info" ? "active" : ""}
          onClick={() => setActiveTab("info")}
        >
          Profile Info
        </button>
        <button
          className={activeTab === "tickets" ? "active" : ""}
          onClick={() => {
            setActiveTab("tickets");
          }}
        >
          Purchased Tickets
        </button>
        <button
          className={activeTab === "volunteer" ? "active" : ""}
          onClick={() => setActiveTab("volunteer")}
        >
          Volunteer Shifts
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
