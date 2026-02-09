import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './AdminDashboard.css';

function AdminDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const [session, setSession] = useState(null);
    // State for ticket sales data.
    const [ticketSales, setTicketSales] = useState([]);
    // State for loading status of ticket sales data.
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        fetchTicketSales();
    }, []);

    const fetchTicketSales = async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select('id, holder_name, holder_email, checked_in_at')
            .order('holder_name', { ascending: true });

        if (error) {
            console.error('Error fetching ticket sales:', error);
        } else {
            setTicketSales(data);
        }

        setLoading(false);

    };

    if (loading) {
        return <div className="admin-dashboard">Loading ticket sales data...</div>;
    }

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
                <div className="ticket-sales-section">
                    <h2>Ticket Sales</h2>
                    {ticketSales.length > 0 ? (
                        <table className="ticket-table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>  
                                    <th>Holder Name</th>
                                    <th>Holder Email</th>
                                    <th>Checked In At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ticketSales.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.id}</td>
                                        <td>{ticket.holder_name}</td>
                                        <td>{ticket.holder_email}</td>
                                        <td>
                                            {ticket.checked_in_at ? ( <span className="checkmark">✓ Checked In</span>
                                            ) : (
                                                <button className="check-in-button" onClick={async() => {

                                                    const { data, error } = await supabase
                                                        .from('tickets')
                                                        .update({ checked_in_at: new Date().toISOString() })
                                                        .eq('id', ticket.id)
                                                        .select('checked_in_at')
                                                        .single();

                                                    if (error) {
                                                        console.error('Error checking in ticket:', error);
                                                        alert('Failed to check in ticket. Please try again.');
                                                    } else {
                                                        // Update the local state to reflect the change
                                                        setTicketSales((prevSales) =>
                                                            prevSales.map((t) =>
                                                                t.id === ticket.id ? { ...t, checked_in_at: data.checked_in_at } : t
                                                            )
                                                        );
                                                    }
                                                }}>Check In</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No ticket sales data available.</p>
                    )}
                </div>  
            </div>
        </div>
    );
}

export default AdminDashboard;