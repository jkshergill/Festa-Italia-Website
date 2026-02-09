import { useState } from 'react';
import './AdminDashboard.css';

// Reusable PageDropdown component
function PageDropdown({ pageOptions = [], onSelect }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);

    const filtered = pageOptions.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="search-section">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search web pages..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    className="search-input"
                />

                {open && (
                    <div className="dropdown-menu">
                        {filtered.length > 0 ? (
                            filtered.map((page) => (
                                <button
                                    key={page.value}
                                    className="dropdown-item"
                                    onClick={() => {
                                        setOpen(false);
                                        setQuery('');
                                        if (onSelect) onSelect(page);
                                    }}
                                >
                                    {page.label}
                                </button>
                            ))
                        ) : (
                            <div className="dropdown-item no-results">No pages found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Main Dashboard Section
function MainDashboard() {
    return (
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
    );
}

// i am very sorry jack :(

/*{showTicketModal && (
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
)}*/

// Confirm Volunteers Section
function ConfirmVolunteers() {
    const [query, setQuery] = useState('');

    // Booths list from volunteer.jsx
    const booths = [
        'Pasta/Arancini',
        'Steak/Sausage Sandwiches',
        'Coffee',
        'Beer and Wine',
        'Merchandice',
        'Pizza',
        'Ice Cream',
        'Canoli',
        'Calamri',
        'Tokens'
    ];

    // Placeholder volunteer data
    const [volunteers, setVolunteers] = useState([
        { id: 1, name: 'Giulia Rossi', booth: 'Pasta/Arancini', confirmed: false },
        { id: 2, name: 'Luca Verdi', booth: 'Coffee', confirmed: true },
        { id: 3, name: 'Carla Moretti', booth: null, confirmed: false },
        { id: 4, name: 'Marco Bianchi', booth: 'Pizza', confirmed: false },
        { id: 5, name: 'Anna Ferri', booth: 'Pasta/Arancini', confirmed: false },
        { id: 6, name: 'Sofia Gallo', booth: 'Beer and Wine', confirmed: true }
    ]);

    // Filter volunteers and booths by search query (search both booth name and person name)
    const searchLower = query.toLowerCase();
    const activeBooths = booths.filter(booth =>
        booth.toLowerCase().includes(searchLower) ||
        volunteers.some(v => v.booth === booth && v.name.toLowerCase().includes(searchLower))
    );

    const requestingVolunteers = volunteers
        .filter(v => v.booth === null)
        .filter(v => v.name.toLowerCase().includes(searchLower));

    const getVolunteersForBooth = (booth) => {
        return volunteers
            .filter(v => v.booth === booth)
            .filter(v => v.name.toLowerCase().includes(searchLower));
    };

    const assignToBooth = (id, booth) => {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, booth } : v));
    };

    const unassign = (id) => {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, booth: null } : v));
    };

    const toggleConfirm = (id) => {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, confirmed: !v.confirmed } : v));
    };

    return (
        <div className="section-content">
            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search booth name or volunteer name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Requesting Volunteers Section */}
            <div className="admin-list">
                <h4>Requesting Volunteers</h4>
                {requestingVolunteers.length === 0 && <div className="muted">No volunteers requesting assignment.</div>}
                {requestingVolunteers.map(v => (
                    <div key={v.id} className="admin-item">
                        <div className="name">{v.name}</div>
                        <div className="actions">
                            <select
                                style={{
                                    padding: '0.4rem 0.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem'
                                }}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        assignToBooth(v.id, e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="">Assign to booth...</option>
                                {booths.map((b, i) => (
                                    <option key={i} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booths with Volunteers */}
            {activeBooths.length === 0 && !requestingVolunteers.length && (
                <div className="muted" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    No results found for your search.
                </div>
            )}
            {activeBooths.map((booth, idx) => {
                const volunteersForBooth = getVolunteersForBooth(booth);
                return (
                    <div key={idx} className="list" style={{ marginTop: idx === 0 ? '1.5rem' : '1rem' }}>
                        <h4>{booth}</h4>
                        {volunteersForBooth.length === 0 && <div className="muted">No volunteers.</div>}
                        {volunteersForBooth.map(v => (
                            <div key={v.id} className="admin-item">
                                <div className="name">
                                    {v.name} {v.confirmed && <span style={{color:'#007bff', marginLeft:'0.5rem', fontSize:'0.9rem'}}>Confirmed</span>}
                                </div>
                                <div className="actions">
                                    <button className="remove-btn" onClick={() => unassign(v.id)} aria-label={`Unassign ${v.name}`}>✕</button>
                                    <button style={{marginLeft:'0.5rem'}} className="add-btn" onClick={() => toggleConfirm(v.id)}>
                                        {v.confirmed ? 'Unconfirm' : 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

// Confirm Coronation Tickets Section
function ConfirmCoronationTickets() {
    return (
        <div className="section-content">
            <p>Coronation ticket confirmation panel coming soon...</p>
        </div>
    );
}

// Edit Page Section
function EditPage({ pageOptions }) {
    const [selectedPage, setSelectedPage] = useState(null);

    const handleSelect = (page) => {
        setSelectedPage(page);
        console.log('Edit page selection:', page);
    };

    return (
        <div className="section-content">
            <PageDropdown pageOptions={pageOptions} onSelect={handleSelect} />

            {selectedPage && (
                <div style={{ marginTop: '1rem' }}>
                    <strong>Selected page to edit:</strong> {selectedPage.label}
                    <div style={{ marginTop: '0.5rem' }}>
                        <button
                            className="sidebar-btn"
                            onClick={() => console.log('Open editor for', selectedPage)}
                        >
                            Edit this page (inline)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add Admin Section
function AddAdmin() {
    const [query, setQuery] = useState('');

    // Placeholder data — replace with real API data when ready
    const [admins, setAdmins] = useState([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' }
    ]);

    const [users, setUsers] = useState([
        { id: 11, name: 'John Schmidt' },
        { id: 12, name: 'Jacob Schmidt' },
        { id: 13, name: 'Jingleheimer Schmidt' }
    ]);

    const filteredAdmins = admins.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));

    const removeAdmin = (id) => {
        const removed = admins.find(a => a.id === id);
        setAdmins(prev => prev.filter(a => a.id !== id));
        if (removed) setUsers(prev => [removed, ...prev]);
    };

    const addAdmin = (id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        setUsers(prev => prev.filter(u => u.id !== id));
        setAdmins(prev => [user, ...prev]);
    };

    return (
        <div className="section-content">
            <div style={{ marginBottom: '1rem' }}>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search users or admins..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="admin-list">
                <h4>Current Admins</h4>
                {filteredAdmins.length === 0 && <div className="muted">No admins match your search.</div>}
                {filteredAdmins.map(admin => (
                    <div key={admin.id} className="admin-item">
                        <div className="name">{admin.name}</div>
                        <div className="actions">
                            <button className="remove-btn" onClick={() => removeAdmin(admin.id)} aria-label={`Remove ${admin.name}`}>✕</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-list" style={{ marginTop: '1.5rem' }}>
                <h4>Other Users</h4>
                {filteredUsers.length === 0 && <div className="muted">No users match your search.</div>}
                {filteredUsers.map(user => (
                    <div key={user.id} className="admin-item">
                        <div className="name">{user.name}</div>
                        <div className="actions">
                            <button className="add-btn" onClick={() => addAdmin(user.id)}>Add Admin</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdminDashboard() {
    // sidebar active section state
    const [activeSection, setActiveSection] = useState('main');

    // Handler for sidebar buttons
    const handleSidebarClick = (action) => {
        setActiveSection(action);
        console.log(`Admin section: ${action}`);
    };

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

    return (
        <div className="admin-dashboard">
            {/* Left Sidebar with Admin Actions */}
            <aside className="admin-sidebar">
                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-btn ${activeSection === 'main' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('main')}
                        title="Main dashboard"
                    >
                    Main
                    </button>
                    <button
                        className={`sidebar-btn ${activeSection === 'confirm-volunteers' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('confirm-volunteers')}
                        title="Review and confirm volunteer registrations"
                    >
                        Confirm Volunteers
                    </button>
                    <button
                        className={`sidebar-btn ${activeSection === 'confirm-coronation-tickets' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('confirm-coronation-tickets')}
                        title="Review and confirm coronation ticket orders"
                    >
                        Confirm Coronation Ticket
                    </button>
                    <button
                        className={`sidebar-btn ${activeSection === 'edit-page' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('edit-page')}
                        title="Edit website pages and content"
                    >
                        Edit Page
                    </button>
                    <button
                        className={`sidebar-btn ${activeSection === 'add-admin' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('add-admin')}
                        title="Add a new administrator"
                    >
                        Add Admin
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {/* Main Dashboard Title */}
                <div className="dashboard-header">
                    <h1 className="dashboard-title">
                        {activeSection === 'main' && 'Main Dashboard'}
                        {activeSection === 'confirm-volunteers' && 'Confirm Volunteers'}
                        {activeSection === 'confirm-coronation-tickets' && 'Confirm Coronation Tickets'}
                        {activeSection === 'edit-page' && 'Edit Page'}
                        {activeSection === 'add-admin' && 'Add Admin'}
                    </h1>
                </div>

                {/* Main Section */}
                {activeSection === 'main' && <MainDashboard />}

                {/* Confirm Volunteers Section */}
                {activeSection === 'confirm-volunteers' && <ConfirmVolunteers pageOptions={pageOptions} />}

                {/* Confirm Coronation Tickets Section */}
                {activeSection === 'confirm-coronation-tickets' && <ConfirmCoronationTickets />}

                {/* Edit Page Section */}
                {activeSection === 'edit-page' && <EditPage pageOptions={pageOptions} />}

                {/* Add Admin Section */}
                {activeSection === 'add-admin' && <AddAdmin />}
            </main>
        </div>
    );
}

export default AdminDashboard;