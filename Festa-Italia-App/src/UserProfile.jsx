import { useState } from "react";
import BocceProfile from "./BocceProfile";
import ProfileInfo from "./ProfileInfo";
import PurchasedTickets from "./PurchasedTickets";
import "./UserProfile.css";
import VolunteerShifts from "./VolunteerShifts";

export default function UserProfile({ eventId, setPage }) {
  const [activeTab, setActiveTab] = useState("info");

  const renderTab = () => {
    switch (activeTab) {
      case "tickets":
        return <PurchasedTickets eventId={eventId} />;
      case "info":
        return <ProfileInfo setPage={setPage}/>;
      case "volunteer":
        return <VolunteerShifts eventId={eventId} />;
      case "bocce":
        return <BocceProfile />;
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
