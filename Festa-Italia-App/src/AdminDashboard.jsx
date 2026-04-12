import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import './AdminDashboard.css';
import AdminFoods from './adminEditMenu';
import DonorManager from './DonorManager';
import EditPageComponent from './EditPage';
import QueensEditor from './QueensEditor';
import { supabase } from "./supabaseClient";
import TokenEditor from './TokenEditor';

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
    const [newBoothName, setNewBoothName] = useState('');
    const [boothMessage, setBoothMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      // 1. Fetch booths
            const { data: boothData } = await supabase
                .from('booths')
                .select('id, name')
                .order('name', { ascending: true });
            setBooths(boothData || []);

      // 2. Fetch profiles
      const { data: profileData } = await supabase.from('profiles').select('id, first_name, last_name');
      setProfiles(profileData || []);

      // 3. Fetch signups
            const { data: signupData } = await supabase
                .from('volunteer_signups')
                .select('id, confirm, booth_id, user_id, day, timeframe');
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

    const prettyDay = (day) => {
        if (!day) return 'Day TBD';
        const lower = String(day).toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    const prettyTimeframe = (value) => {
        if (!value) return 'Timeframe TBD';
        const lower = String(value).toLowerCase();
        if (lower === 'morning') return 'Morning';
        if (lower === 'evening') return 'Evening';
        if (lower === 'night') return 'Night';
        return value;
    };

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

    const createBooth = async () => {
        const trimmed = newBoothName.trim();
        if (!trimmed) {
            setBoothMessage('Enter a booth name first.');
            return;
        }

        const alreadyExists = booths.some(b => b.name.toLowerCase() === trimmed.toLowerCase());
        if (alreadyExists) {
            setBoothMessage('A booth with that name already exists.');
            return;
        }

        const { data, error } = await supabase
            .from('booths')
            .insert({ name: trimmed })
            .select('id, name')
            .single();

        if (error) {
            setBoothMessage(error.message);
            return;
        }

        setBooths(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewBoothName('');
        setBoothMessage(`Created booth: ${data.name}`);
    };

    const deleteBooth = async (boothId) => {
        const booth = booths.find(b => b.id === boothId);
        if (!booth) return;

        const confirmed = window.confirm(`Delete booth "${booth.name}"? This will unassign volunteers from this booth.`);
        if (!confirmed) return;

        const { error: unassignError } = await supabase
            .from('volunteer_signups')
            .update({ booth_id: null })
            .eq('booth_id', boothId);

        if (unassignError) {
            setBoothMessage(unassignError.message);
            return;
        }

        const { error } = await supabase
            .from('booths')
            .delete()
            .eq('id', boothId);

        if (error) {
            setBoothMessage(error.message);
            return;
        }

        setBooths(prev => prev.filter(b => b.id !== boothId));
        setSignups(prev => prev.map(s => (s.booth?.id === boothId ? { ...s, booth: null, booth_id: null } : s)));
        setBoothMessage(`Deleted booth: ${booth.name}`);
    };

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

            <div className="list" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <h4>Booth Management</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="New booth name"
                        value={newBoothName}
                        onChange={(e) => setNewBoothName(e.target.value)}
                        style={{ maxWidth: '360px' }}
                    />
                    <button className="add-btn" onClick={createBooth}>Create Booth</button>
                </div>

                <div style={{ display: 'grid', gap: '0.4rem' }}>
                    {booths.map((b) => (
                        <div key={b.id} className="admin-item" style={{ borderBottom: 'none', padding: '0.35rem 0' }}>
                            <div className="name">{b.name}</div>
                            <div className="actions">
                                <button className="remove-btn" onClick={() => deleteBooth(b.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
                {boothMessage && <div className="muted">{boothMessage}</div>}
            </div>

      {/* Requesting Volunteers */}
      <div className="admin-list">
        <h4>Requesting Volunteers</h4>
        {requestingVolunteers.length === 0 && <div className="muted">No volunteers requesting assignment.</div>}
        {requestingVolunteers.map(s => (
          <div key={s.id} className="admin-item">
                        <div className="name">
                            <div>{s.profile.first_name} {s.profile.last_name}</div>
                            <div className="muted" style={{ padding: 0 }}>
                                {prettyDay(s.day)} • {prettyTimeframe(s.timeframe)}
                            </div>
                        </div>
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
                                    <div>
                                        {s.profile.first_name} {s.profile.last_name} {s.confirm && <span style={{ color: '#007bff', marginLeft: '0.5rem', fontSize: '0.9rem' }}>Confirmed</span>}
                                    </div>
                                    <div className="muted" style={{ padding: 0 }}>
                                        {prettyDay(s.day)} • {prettyTimeframe(s.timeframe)}
                                    </div>
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
    const [eventName, setEventName] = useState('');
    const [newEventName, setNewEventName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Load current event name from settings table
    useEffect(() => {
        const loadEventName = async () => {
            try {
                const { data, error } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'current_event')
                    .single();

                if (error) throw error;
                setEventName(data.value);
                setNewEventName(data.value);
            } catch (err) {
                console.error('Error loading event name:', err);
                setMessage({ type: 'error', text: 'Failed to load current event name.' });
            } finally {
                setLoading(false);
            }
        };
        loadEventName();
    }, []);

    // Save new event name to settings
    const handleSaveEventName = async () => {
        const trimmed = newEventName.trim();
        if (!trimmed) {
            setMessage({ type: 'error', text: 'Event name cannot be empty.' });
            return;
        }
        if (trimmed === eventName) {
            setMessage({ type: 'info', text: 'No changes to save.' });
            return;
        }

        // Extract year from new name and check for duplicates in orders
        const yearMatch = trimmed.match(/\d{4}/);
        if (yearMatch) {
            const year = yearMatch[0];
            const { data: existingOrders } = await supabase
                .from('orders')
                .select('id')
                .ilike('event', `%${year}%`)
                .neq('event', eventName)
                .limit(1);

            if (existingOrders && existingOrders.length > 0) {
                const proceed = window.confirm(
                    `There are already orders for a different event in ${year}. Are you sure you want to continue?`
                );
                if (!proceed) return;
            }
        }

        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase
                .from('settings')
                .update({ value: trimmed })
                .eq('key', 'current_event');

            if (error) throw error;
            setEventName(trimmed);
            setMessage({ type: 'success', text: 'Event name updated successfully! All new orders will use this name.' });
        } catch (err) {
            console.error('Error saving event name:', err);
            setMessage({ type: 'error', text: 'Failed to save event name: ' + err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="section-content">
                <p>Loading event settings...</p>
            </div>
        );
    }

    return (
        <div className="section-content">
            <h3>Event Name Management</h3>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
                Change the event name used for new Coronation Ball ticket orders.
                Current event: <strong>{eventName}</strong>
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    placeholder="Enter new event name"
                    style={{
                        padding: '0.6rem 0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        minWidth: '300px',
                        height: '40px',
                        boxSizing: 'border-box'
                    }}
                    disabled={saving}
                />
                <button
                    onClick={handleSaveEventName}
                    disabled={saving}
                    className="save-btn"
                    style={{ whiteSpace: 'nowrap', height: '40px', boxSizing: 'border-box', marginTop: 0, padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}
                >
                    {saving ? 'Saving...' : 'Save Event Name'}
                </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
                Existing orders will keep their original event name. Only new purchases will use the updated name.
            </p>

            {message && (
                <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    marginTop: '0.5rem',
                    backgroundColor: message.type === 'success' ? '#e8f5e9' : message.type === 'error' ? '#ffebee' : '#e3f2fd',
                    color: message.type === 'success' ? '#2e7d32' : message.type === 'error' ? '#c62828' : '#1565c0',
                    border: `1px solid ${message.type === 'success' ? '#a5d6a7' : message.type === 'error' ? '#ef9a9a' : '#90caf9'}`
                }}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

function AddAdmin() {
    const [query, setQuery] = useState('');

    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);

    const [pendingDemotions, setPendingDemotions] = useState([]);
    const [pendingPromotions, setPendingPromotions] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfiles = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching profiles:', error);
                return;
            }

            const adminRecords = [];
            const userRecords = [];

            data.forEach((p) => {
                const display = {
                    id: p.id,
                    name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
                    email: p.email || '',
                    role: p.role || 'user',
                };

                if (p.role === 'admin') {
                    adminRecords.push(display);
                } else {
                    userRecords.push(display);
                }
            });

            const sortByName = (a, b) => a.name.localeCompare(b.name);
            setAdmins(adminRecords.sort(sortByName));
            setUsers(userRecords.sort(sortByName));
        };

            loadProfiles();
        }, []);

        const filteredAdmins = admins.filter(a =>
            (`${a.name} ${a.email}`).toLowerCase().includes(query.toLowerCase())
        );
        const filteredUsers = users.filter(u =>
            (`${u.name} ${u.email}`).toLowerCase().includes(query.toLowerCase())
        );

    const demoteAdmin = (id) => {
        const admin = admins.find(a => a.id === id);
        if (!admin || pendingDemotions.some(d => d.id === id)) return;
        setPendingDemotions(prev => [...prev, admin]);
    };

    const promoteUser = (id) => {
        const user = users.find(u => u.id === id);
        if (!user || pendingPromotions.some(p => p.id === id)) return;
        setPendingPromotions(prev => [...prev, user]);
    };

    const cancelDemotion = (id) => setPendingDemotions(prev => prev.filter(d => d.id !== id));
    const cancelPromotion = (id) => setPendingPromotions(prev => prev.filter(p => p.id !== id));

    const saveChanges = async () => {
        setSaving(true);
        const errors = [];

        // Apply demotions
        for (const admin of pendingDemotions) {
            const { error } = await supabase.rpc('set_user_role', {
                target_user_id: admin.id,
                new_role: 'user'  // swap this for whatever your base role is
            });
            if (error) {
                console.error('Demotion error for', admin.id, ':', error);
                errors.push(admin.name);
            }
        }

        // Apply promotions
        for (const user of pendingPromotions) {
            const { error } = await supabase.rpc('set_user_role', {
                target_user_id: user.id,
                new_role: 'admin'
            });
            if (error) {
                console.error('Promotion error for', user.id, ':', error);
                errors.push(user.name);
            }
        }

        setSaving(false);

        if (errors.length > 0) {
            alert(`Some changes failed for: ${errors.join(', ')}. Please try again.`);
            return;
        }

        // Update local state only on full success
        const demotedIds = new Set(pendingDemotions.map(d => d.id));
        const promotedIds = new Set(pendingPromotions.map(p => p.id));

        setAdmins(prev => [
            ...prev.filter(a => !demotedIds.has(a.id)),
            ...pendingPromotions.map(u => ({ ...u, role: 'admin' }))
        ].sort((a, b) => a.name.localeCompare(b.name)));

        setUsers(prev => [
            ...prev.filter(u => !promotedIds.has(u.id)),
            ...pendingDemotions.map(a => ({ ...a, role: 'user' }))
        ].sort((a, b) => a.name.localeCompare(b.name)));

        setPendingDemotions([]);
        setPendingPromotions([]);

        alert('Role changes saved successfully!');
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
                        <div className="name">{admin.name} ({admin.email})</div>
                        <div className="actions">
                            <button
                                className="remove-btn"
                                onClick={() => demoteAdmin(admin.id)}
                                disabled={pendingDemotions.some(d => d.id === admin.id)}
                                aria-label={`Demote ${admin.name}`}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-list" style={{ marginTop: '1.5rem' }}>
                <h4>Other Users</h4>
                {filteredUsers.length === 0 && <div className="muted">No users match your search.</div>}
                {filteredUsers.map(user => (
                    <div key={user.id} className="admin-item">
                        <div className="name">{user.name} ({user.email})</div>
                        <div className="actions">
                            <button
                                className="add-btn"
                                onClick={() => promoteUser(user.id)}
                                disabled={pendingPromotions.some(p => p.id === user.id)}
                            >
                                Promote
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {pendingDemotions.length > 0 && (
                <div className="admin-list" style={{ marginTop: '1.5rem', border: '2px solid #ff6b6b' }}>
                    <h4>Admins Being Demoted</h4>
                    {pendingDemotions.map(admin => (
                        <div key={admin.id} className="admin-item">
                            <div className="name">{admin.name} ({admin.email})</div>
                            <div className="actions">
                                <button className="cancel-btn" onClick={() => cancelDemotion(admin.id)}>Cancel</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pendingPromotions.length > 0 && (
                <div className="admin-list" style={{ marginTop: '1.5rem', border: '2px solid #51cf66' }}>
                    <h4>Users Being Promoted</h4>
                    {pendingPromotions.map(user => (
                        <div key={user.id} className="admin-item">
                            <div className="name">{user.name} ({user.email})</div>
                            <div className="actions">
                                <button className="cancel-btn" onClick={() => cancelPromotion(user.id)}>Cancel</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(pendingDemotions.length > 0 || pendingPromotions.length > 0) && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button className="save-btn" onClick={saveChanges} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Role Changes'}
                    </button>
                </div>
            )}
        </div>
    );
}

// Toggle Page Section
function TogglePage({ pageOptions = [], pageStates = {}, togglePage, saveChanges }) {
    if (!pageOptions || pageOptions.length === 0) {
        return <div className="section-content"><div className="muted">No pages available.</div></div>;
    }
    // filter out the Home (it shouldnt be toggleable)
    const visibleOptions = pageOptions.filter(p => p.value !== 'home');

    return (
        <div className="section-content">
            <div className="admin-list">
                <h4>Page Visibility</h4>
                {visibleOptions.map((page) => (
                    <div key={page.label} className="admin-item">
                        <div className="name">{page.label}</div>
                        <div className="actions">
                            <button
                                className={pageStates[page.label] ? 'toggle-on-btn' : 'toggle-off-btn'}
                                onClick={() => togglePage(page.label)}
                            >
                                {pageStates[page.label] ? 'Visible' : 'Hidden'}
                            </button>
                        </div>
                    </div>
                ))}
                <button className="save-btn" onClick={saveChanges}>
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function AdminDashboard() {
    // sidebar active section state
    const [activeSection, setActiveSection] = useState('main');

    // pages fetched from database for dropdowns (replaces static pageOptions const)
    const [pageOptions, setPageOptions] = useState([]);
    const [pageStates, setPageStates] = useState({}); // visibility mapping

    // load page names once on mount
    useEffect(() => {
        const loadPages = async () => {
            try {
                const { data, error } = await supabase
                    .from('page_status')
                    .select('name, visible');
                if (error) throw error;
                // build dropdown options and visibility map
                const opts = data.map(p => ({
                    value: p.name.toLowerCase().replace(/\s+/g, '-'),
                    label: p.name
                }));
                const states = data.reduce((acc, p) => {
                    acc[p.name] = p.visible;
                    return acc;
                }, {});
                setPageOptions(opts);
                setPageStates(states);
            } catch (err) {
                console.error('Error loading page options:', err);
                setPageOptions([]);
                setPageStates({});
            }
        };
        loadPages();
    }, []);

    // toggle a single page's visibility in local state
    const togglePage = (pageName) => {
        setPageStates(prev => ({
            ...prev,
            [pageName]: !prev[pageName]
        }));
    };

    // persist current state values back to database
    const savePageStates = async () => {
        try {
            const updates = Object.entries(pageStates).map(([name, isVisible]) => ({
                name,
                visible: isVisible
            }));
            for (const update of updates) {
                await supabase
                    .from('page_status')
                    .update({ visible: update.visible })
                    .eq('name', update.name);
            }
            alert('Page visibility settings saved!');
        } catch (err) {
            console.error('Error saving page states:', err);
            alert('Failed to save page visibility');
        }
    };

    // Handler for sidebar buttons
    const handleSidebarClick = (action) => {
        setActiveSection(action);
        console.log(`Admin section: ${action}`);
    };

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
                    <button
                        className={`sidebar-btn ${activeSection === 'toggle-page' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('toggle-page')}
                        title="Turn on/off pages"
                    >
                        Toggle Page
                    </button>
                    <button
                        className={`sidebar-btn ${activeSection === 'admin-foods' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('admin-foods')}
                        title="Food Menu Editor"
                    >
                        Admin Tool - Food Editor
                    </button>
                    <button
                        className={`sidebar-btn ${activeSection === 'token-editor' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('token-editor')}
                        title="Token Editor"
                    >
                        Token Editor
                    </button>
                    <button
                        className={`sidebar-btn ${activeSection === 'queens-editor' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('queens-editor')}
                        title="Queens Editor"
                    >
                        Queens Editor
                    </button>
                    <button
                    className={`sidebar-btn ${activeSection === 'manage-donors' ? 'active' : ''}`}
                    onClick={() => handleSidebarClick('manage-donors')}
                    title="Add, edit, and delete sponsors/private donors"
                    >
                        Manage Donors
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
                        {activeSection === 'toggle-page' && 'Toggle Page'}
                        {activeSection === 'admin-foods' && 'Admin Tool - Food Editor'}
                        {activeSection === 'token-editor' && 'Token Editor'}
                        {activeSection === 'queens-editor' && 'Queens Editor'}
                        {activeSection === 'manage-donors' && 'Manage Donors'}
                    </h1>
                </div>

                {/* Main Section */}
                {activeSection === 'main' && <MainDashboard />}

                {/* Confirm Volunteers Section */}
                {activeSection === 'confirm-volunteers' && <ConfirmVolunteers pageOptions={pageOptions} />}

                {/* Confirm Bocce Team Section */}
                {activeSection === 'confirm-bocce-teams' && <ConfirmBocceTeams pageOptions={pageOptions} />}

                {/* Confirm Coronation Tickets Section */}
                {activeSection === 'confirm-coronation-tickets' && <ConfirmCoronationTickets />}

                {/* Edit Page Section */}
                {activeSection === 'edit-page' && <EditPageComponent />}

                {/* Add Admin Section */}
                {activeSection === 'add-admin' && <AddAdmin />}
                {activeSection === 'toggle-page' && (
                    <TogglePage
                        pageOptions={pageOptions}
                        pageStates={pageStates}
                        togglePage={togglePage}
                        saveChanges={savePageStates}
                    />
                )}

                {/* Admin Tool Pages */}
                {activeSection === 'admin-foods' && <div className="section-content"><AdminFoods /></div>}
                {activeSection === 'token-editor' && <div className="section-content"><TokenEditor /></div>}
                {activeSection === 'queens-editor' && <div className="section-content"><QueensEditor /></div>}
                {activeSection === 'manage-donors' && <DonorManager />}
            </main>
        </div>
    );
}

export default AdminDashboard;