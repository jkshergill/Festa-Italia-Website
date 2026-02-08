import React, { useState } from 'react';
import './AdminDashboard.css';
import TicketManagement from './TicketManagement';
import './TicketManagement.css';
import GuestList from './GuestList';
import './GuestList.css';
function AdminDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showGuestListModal, setShowGuestListModal] = useState(false);
    const [userRole, setUserRole] = useState(null);


    // List of available pages for the dropdown
    const pageOptions = [
        { value: 'home', label: 'Home Page' },
        { value: 'festival', label: 'Fishermans Festival' },
        { value: 'bocce-dash', label: 'Bocce Tournament' },
        { value: 'coronation', label: "Queen's Court" },
        { value: 'scholarships', label: 'Scholarships' },
        { value: 'donate', label: 'Donate' },
        { value: 'shopping', label: 'Shopping' },
        { value: 'bocce-sign', label: 'Bocce Sign up' },
        { value: 'coronation-tix', label: 'Coronation Ball Tickets' },
        { value: 'login', label: 'Log in' },
        { value: 'signup', label: 'Create Account' }
    ];

    const filteredPages = pageOptions.filter(page =>
        page.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-dashboard">
            {/* Main Dashboard Title */}
            <div className="dashboard-header">
                <h1 className="dashboard-title">Main Dashboard</h1>
            </div>

            {/* Search Web Page Section */}
            <div className="search-section">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search web pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        className="search-input"
                    />
                    
                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="dropdown-menu">
                            {filteredPages.length > 0 ? (
                                filteredPages.map((page) => (
                                    <button
                                        key={page.value}
                                        className="dropdown-item"
                                        onClick={() => {
                                            // This would navigate to the page
                                            console.log(`Navigate to: ${page.label}`);
                                            setShowDropdown(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        {page.label}
                                    </button>
                                ))
                            ) : (
                                <div className="dropdown-item no-results">
                                    No pages found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Dashboard Content - You can add more admin features here */}
            <div className="dashboard-content">
                <div className="admin-cards">
                    <div className="admin-card">
                        <h3>Quick Stats</h3>
                        <p>Total Users: 1,234</p>
                        <p>Active Events: 5</p>
                    </div>
                    <div className="admin-card">
                        <h3>Recent Activity</h3>
                        <p>New registrations: 12</p>
                        <p>Ticket sales: $2,450</p>
                    </div>
                    <div className="admin-card">
                        <h3>System Status</h3>
                        <p>All systems operational</p>
                        <p>Last updated: Today</p>
                    </div>
                    <div className="admin-card ticket-management-card">
                        <div className="card-header"></div>
                            <h3>Ticket Management</h3>
                            <button
                                className="manage-button"
                                onClick={() => setShowTicketModal(true)}
                            >
                                Manage Tickets
                            </button>
                    </div>
                    <div className="ticket-summary">
                        <div className="summary-item">
                            <span className="summary-label">Active Tickets:</span>
                            <span className="summary-value">245</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Checked In:</span>
                            <span className="summary-value">89</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Revoked:</span>
                            <span className="summary-value">12</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Today's Sales:</span>
                            <span className="summary-value">$1,250</span>
                        </div>
                        <div className="recent-tickets">
                            <h4>Recent Ticket Activity</h4>
                            <div className="tickets-list"></div>
                            {[
                                { id: 'TKT-1001', event: 'Coronation Ball', purchaser: 'John Doe', status: 'active' },
                                { id: 'TKT-1002', event: 'Bocce Tournament', purchaser: 'Jane Smith', status: 'checked-in' },
                                { id: 'TKT-1003', event: 'Fishermans Festival', purchaser: 'Bob Wilson', status: 'active' },
                             ].map(ticket => (   
                                <div key={ticket.id} className="recent-ticket-item">
                                    <div className="ticket-info">
                                        <span className="ticket-id">{ticket.id}</span>
                                        <span className="ticket-event">{ticket.event}</span>
                                    </div>
                                    <div className="ticket-details">
                                       <span className="ticket-purchaser">{ticket.purchaser}</span> 
                                       <span className={`ticket-status status-${ticket.status}`}>{ticket.status === 'checked-in' ? 'Checked In' : 'Active'}
                                       </span>
                                    </div>
                                </div>
                            ))}
                        </div> 
                    </div>
                </div>
                <div className="admin-card guest-list-card">
                        <div className="card-header">
                            <h3>Guest List</h3>
                            <button 
                                className="manage-button guest-list-button"
                                onClick={() => {
                                    console.log("Manage Guest List button clicked");
                                    setShowGuestListModal(true);
                                }}
                            >
                                Manage Guest List
                            </button>
                        </div>
                        
                        <div className="guest-summary">
                            <div className="summary-item">
                                <span className="summary-label">Total Guests:</span>
                                <span className="summary-value">85</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Checked In:</span>
                                <span className="summary-value">42</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">With Profile:</span>
                                <span className="summary-value">63</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Avg Tickets:</span>
                                <span className="summary-value">2.8</span>
                            </div>
                        </div>
                        
                        <div className="recent-guests">
                            <h4>Recent Guest Activity</h4>
                            <div className="guests-list">
                                {[
                                    { id: 'GUEST-001', name: 'Alice Johnson', email: 'alice@example.com', tickets: 3, status: 'checked-in' },
                                    { id: 'GUEST-002', name: 'Bob Wilson', email: 'bob@example.com', tickets: 2, status: 'not-checked-in' },
                                    { id: 'GUEST-003', name: 'Carol Davis', email: 'carol@example.com', tickets: 1, status: 'checked-in' },
                                ].map(guest => (   
                                    <div key={guest.id} className="recent-guest-item">
                                        <div className="guest-info">
                                            <span className="guest-name">{guest.name}</span>
                                            <span className="guest-email">{guest.email}</span>
                                        </div>
                                        <div className="guest-details">
                                            <span className="guest-tickets">{guest.tickets} ticket{guest.tickets !== 1 ? 's' : ''}</span> 
                                            <span className={`guest-status status-${guest.status}`}>
                                                {guest.status === 'checked-in' ? 'Checked In' : 'Not Checked In'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> 
                    </div>
            </div>
            {showTicketModal && (
                <div className="modal-overlay" onClick={() => setShowTicketModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Ticket Management</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowTicketModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            
                            
                            <TicketManagement 
                            userRole="admin" 
                            onClose={() => setShowTicketModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
            {showGuestListModal && (
                <div className="modal-overlay" onClick={() => setShowGuestListModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Guest List Management</h2>
                            <button 
                                className="close-button"
                                onClick={() => setShowGuestListModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <GuestList 
                                userRole={userRole} 
                                onClose={() => setShowGuestListModal(false)} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;