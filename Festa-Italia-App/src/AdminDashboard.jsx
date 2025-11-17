import React, { useState } from 'react';
import './AdminDashboard.css';

function AdminDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

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
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;