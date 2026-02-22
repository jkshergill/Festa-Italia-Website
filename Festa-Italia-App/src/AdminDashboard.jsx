import { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";
import './AdminDashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [signups, setSignups] = useState([]);
  const [booths, setBooths] = useState([]);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch booths
      const { data: boothData } = await supabase.from('booths').select('id, name');
      setBooths(boothData || []);

      // 2. Fetch profiles
      const { data: profileData } = await supabase.from('profiles').select('id, first_name, last_name');
      setProfiles(profileData || []);

      // 3. Fetch signups
      const { data: signupData } = await supabase.from('volunteer_signups').select('id, confirm, booth_id, user_id');
      if (signupData) {
        // Merge booth & profile info
        const merged = signupData.map(s => ({
          ...s,
          booth: boothData.find(b => b.id === s.booth_id) || null,
          profile: profileData.find(p => p.id === s.user_id) || null
        }));
        setSignups(merged);
      }
    }

    loadData();
  }, []);

  // Search logic
  const searchLower = query.toLowerCase();

  const activeBooths = booths.filter(b =>
    b.name.toLowerCase().includes(searchLower) ||
    signups.some(s => s.booth?.id === b.id && s.profile && `${s.profile.first_name} ${s.profile.last_name}`.toLowerCase().includes(searchLower))
  );

  const requestingVolunteers = signups.filter(s => !s.booth && s.profile)
    .filter(s => `${s.profile.first_name} ${s.profile.last_name}`.toLowerCase().includes(searchLower));

  const getVolunteersForBooth = (boothId) =>
    signups.filter(s => s.booth?.id === boothId);

  const assignToBooth = async (signupId, boothId) => {
    const { error } = await supabase.from('volunteer_signups')
      .update({ booth_id: boothId }).eq('id', signupId);
    if (!error) {
      setSignups(prev =>
        prev.map(s => s.id === signupId ? { ...s, booth: booths.find(b => b.id === boothId) } : s)
      );
    }
  };

  const toggleConfirm = async (signupId, current) => {
    const { error } = await supabase.from('volunteer_signups')
      .update({ confirm: !current }).eq('id', signupId);
    if (!error) {
      setSignups(prev =>
        prev.map(s => s.id === signupId ? { ...s, confirm: !current } : s)
      );
    }
  };

  const unassign = async (signupId) => {
    const { error } = await supabase.from('volunteer_signups')
      .update({ booth_id: null }).eq('id', signupId);
    if (!error) {
      setSignups(prev =>
        prev.map(s => s.id === signupId ? { ...s, booth: null } : s)
      );
    }
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

      {/* Requesting Volunteers */}
      <div className="admin-list">
        <h4>Requesting Volunteers</h4>
        {requestingVolunteers.length === 0 && <div className="muted">No volunteers requesting assignment.</div>}
        {requestingVolunteers.map(s => (
          <div key={s.id} className="admin-item">
            <div className="name">{s.profile.first_name} {s.profile.last_name}</div>
            <div className="actions">
              <select
                style={{ padding: '0.4rem 0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                onChange={(e) => {
                  if (e.target.value) {
                    assignToBooth(s.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
              >
                <option value="">Assign to booth...</option>
                {booths.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Booths with Volunteers */}
      {activeBooths.map((b, idx) => {
        const volunteersForBooth = getVolunteersForBooth(b.id);
        return (
          <div key={idx} className="list" style={{ marginTop: idx === 0 ? '1.5rem' : '1rem' }}>
            <h4>{b.name}</h4>
            {volunteersForBooth.length === 0 && <div className="muted">No volunteers.</div>}
            {volunteersForBooth.map(s => (
              <div key={s.id} className="admin-item">
                <div className="name">
                  {s.profile.first_name} {s.profile.last_name} {s.confirm && <span style={{ color: '#007bff', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Confirmed</span>}
                </div>
                <div className="actions">
                  <button className="remove-btn" onClick={() => unassign(s.id)}>✕</button>
                  <button style={{ marginLeft: '0.5rem' }} onClick={() => toggleConfirm(s.id, s.confirm)}>
                    {s.confirm ? 'Unconfirm' : 'Confirm'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  );
}

function ConfirmBocceTeams() {
    const [teams, setTeams] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch teams from Supabase
    useEffect(() => {
        const fetchTeams = async () => {
            const { data, error } = await supabase
                .from('bocce_teams')
                .select('id, team_name, player1, player2, player3, player4, sponsor_name, confirm');
            if (error) console.error('Error fetching teams:', error);
            else setTeams(data);
            setLoading(false);
        };
        fetchTeams();
    }, []);

    // Toggle confirmation for a team
    const toggleConfirm = async (teamId) => {
        setTeams(prev =>
            prev.map(team =>
                team.id === teamId ? { ...team, confirm: !team.confirm } : team
            )
        );

        // Optional: persist to Supabase
        await supabase
            .from('bocce_teams')
            .update({ confirm: !teams.find(t => t.id === teamId)?.confirm })
            .eq('id', teamId);
    };

    // Search/filter logic like volunteers
    const searchLower = query.toLowerCase();
    const filteredTeams = teams.filter(team =>
        team.team_name.toLowerCase().includes(searchLower) ||
        (team.sponsor_name && team.sponsor_name.toLowerCase().includes(searchLower)) ||
        [team.player1, team.player2, team.player3, team.player4]
            .some(p => p && p.toLowerCase().includes(searchLower))
    );

    // Generate PDF of confirmed teams
    const generatePDF = () => {
        const doc = new jsPDF();

        const headers = [['Team Name', 'Sponsor', 'Player 1', 'Player 2', 'Player 3', 'Player 4']];
        const rows = teams
          .filter(team => team.confirm)
            .map(team => [
                team.team_name,
                team.sponsor_name || '',
                team.player1 || '',
                team.player2 || '',
                team.player3 || '',
                team.player4 || ''
            ]);

        if (!rows.length) {
            alert('No confirmed teams to export!');
            return;
        }

        doc.text('Confirmed Bocce Teams', 14, 15);

        autoTable(doc, {
            startY: 20,
            head: headers,
            body: rows,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });

        doc.save('confirmed_bocce_teams.pdf');

    };

    if (loading) return <div>Loading teams...</div>;
    if (!filteredTeams.length)
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>No teams found.</div>;

    return (
        <div className="section-content">
            <input
                className="search-input"
                type="text"
                placeholder="Search team, sponsor, or player..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: '100%', marginBottom: '1.5rem', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />

            {filteredTeams.map(team => (
                <div key={team.id} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>{team.team_name}</strong> 
                            {team.sponsor_name && <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>Sponsor: {team.sponsor_name}</span>}
                        </div>
                        <button
                            onClick={() => toggleConfirm(team.id)}
                            style={{
                                backgroundColor: team.confirm ? 'green' : '#007bff',
                                color: '#fff',
                                border: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {team.confirm ? 'Confirmed' : 'Confirm'}
                        </button>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        Players: {[team.player1, team.player2, team.player3, team.player4].filter(p => p).join(', ')}
                    </div>
                </div>
            ))}

            {/* PDF Export Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                    onClick={generatePDF}
                    style={{
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Export Confirmed Teams to PDF
                </button>
            </div>
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
                        className={`sidebar-btn ${activeSection === 'confirm-bocce-teams' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('confirm-bocce-teams')}
                        title="Review and confirm bocce team registrations"
                    >
                        Confirm Bocce
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
                        {activeSection === 'confirm-bocce-teams' && 'Confirm Bocce Teams'}
                        {activeSection === 'confirm-coronation-tickets' && 'Confirm Coronation Tickets'}
                        {activeSection === 'edit-page' && 'Edit Page'}
                        {activeSection === 'add-admin' && 'Add Admin'}
                    </h1>
                </div>

                {/* Main Section */}
                {activeSection === 'main' && <MainDashboard />}

                {/* Confirm Volunteers Section */}
                {activeSection === 'confirm-volunteers' && <ConfirmVolunteers pageOptions={pageOptions} />}

                {/* Confirm Bocce Team Section */}
                {activeSection == 'confirm-bocce-teams' && <ConfirmBocceTeams pageOptions={pageOptions} />}

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