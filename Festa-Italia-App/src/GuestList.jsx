import React, { useState, useEffect } from 'react';
import './GuestList.css';

const GuestList = ({ userRole, onClose }) => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [totalGuests, setTotalGuests] = useState(0);
    const itemsPerPage = 10;

    // Fetch guests when component mounts or filters change
    useEffect(() => {
        fetchGuests();
    }, [currentPage, filterStatus, searchTerm]);

    const fetchGuests = async () => {

        try {
            setLoading(true);
            
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Mock guest data (grouped by email)
            const mockTickets = Array.from({ length: 150 }, (_, i) => {
                const guestNum = Math.floor(i / 3) + 1; // Group tickets by guest
                const isCheckedIn = guestNum % 4 === 0;
                const isRevoked = guestNum % 10 === 0;
                
                return {
                    id: `TKT-${1000 + i}`,
                    guest_id: `GUEST-${guestNum}`,
                    guest_name: `Guest ${guestNum}`,
                    guest_email: `guest${guestNum}@example.com`,
                    holder_name: `Guest ${guestNum}`,
                    holder_email: `guest${guestNum}@example.com`,
                    event: i % 3 === 0 ? 'Coronation Ball' : i % 3 === 1 ? 'Bocce Tournament' : 'Fishermans Festival',
                    issued_at: new Date(Date.now() - guestNum * 86400000).toISOString(),
                    revoked_at: isRevoked && guestNum === Math.floor(i / 3) + 1 ? new Date().toISOString() : null,
                    checked_in_at: isCheckedIn && guestNum === Math.floor(i / 3) + 1 ? new Date().toISOString() : null,
                    profile_exists: guestNum % 2 === 0
                };
            });
            
            // Group tickets by guest (email)
            const guestMap = new Map();
            
            mockTickets.forEach(ticket => {
                if (ticket.revoked_at) return; // Skip revoked tickets
                
                const guestKey = ticket.guest_email.toLowerCase();
                
                if (!guestMap.has(guestKey)) {
                    guestMap.set(guestKey, {
                        id: ticket.guest_id,
                        name: ticket.guest_name,
                        email: ticket.guest_email,
                        holder_name: ticket.holder_name,
                        holder_email: ticket.holder_email,
                        profile_exists: ticket.profile_exists,
                        ticket_count: 0,
                        checked_in: false,
                        latest_issued: null,
                        tickets: []
                    });
                }
                
                const guest = guestMap.get(guestKey);
                guest.ticket_count++;
                guest.tickets.push(ticket);
                
                // Update latest issued date
                if (!guest.latest_issued || new Date(ticket.issued_at) > new Date(guest.latest_issued)) {
                    guest.latest_issued = ticket.issued_at;
                }
                
                // Update checked-in status
                if (ticket.checked_in_at) {
                    guest.checked_in = true;
                }
            });
            
            // Convert map to array
            let guestList = Array.from(guestMap.values());
            
            // Apply status filter
            if (filterStatus === 'checked_in') {
                guestList = guestList.filter(guest => guest.checked_in);
            } else if (filterStatus === 'not_checked_in') {
                guestList = guestList.filter(guest => !guest.checked_in);
            }
            
            // Apply search
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                guestList = guestList.filter(guest => 
                    guest.name.toLowerCase().includes(term) ||
                    guest.email.toLowerCase().includes(term) ||
                    guest.holder_name.toLowerCase().includes(term) ||
                    guest.holder_email.toLowerCase().includes(term)
                );
            }
            
            // Sort by name
            guestList.sort((a, b) => a.name.localeCompare(b.name));
            
            // Update total count
            setTotalGuests(guestList.length);
            
            // Apply pagination
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginated = guestList.slice(startIndex, startIndex + itemsPerPage);
            
            setGuests(paginated);
            setLoading(false);
            
        } catch (error) {
            console.error('Error fetching guests:', error);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page when searching
        fetchGuests();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleCheckIn = (guestEmail) => {
        // Update local state to reflect check-in
        setGuests(prevGuests => 
            prevGuests.map(guest => 
                guest.email === guestEmail 
                    ? { ...guest, checked_in: true }
                    : guest
            )
        );
        console.log(`Checked in guest: ${guestEmail}`);
        alert(`Guest ${guestEmail} has been checked in!`);
    };

    const handleViewDetails = (guest) => {
        console.log(`View details for guest: ${guest.name}`);
        alert(`Guest Details:\n\nName: ${guest.name}\nEmail: ${guest.email}\nTickets: ${guest.ticket_count}\nStatus: ${guest.checked_in ? 'Checked In' : 'Not Checked In'}\nProfile: ${guest.profile_exists ? 'Yes' : 'No'}`);
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalGuests / itemsPerPage);

    

    return (
        <div className="guest-list-modal">
            <div className="modal-header">
                <h2>Guest List Management</h2>
                <div className="header-info">
                    <span className="total-guests">{totalGuests} guest{totalGuests !== 1 ? 's' : ''} total</span>
                </div>
            </div>

            <div className="modal-controls">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search by guest name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">
                        Search
                    </button>
                    {searchTerm && (
                        <button 
                            type="button" 
                            onClick={handleClearSearch}
                            className="clear-btn"
                        >
                            Clear
                        </button>
                    )}
                </form>
                
                <div className="filter-controls">
                    <select 
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="all">All Guests</option>
                        <option value="checked_in">Checked In</option>
                        <option value="not_checked_in">Not Checked In</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading guest list...</p>
                </div>
            ) : (
                <>
                    <div className="guests-table-container">
                        <div className="guests-table">
                            <div className="table-header">
                                <div className="header-cell">Guest Name</div>
                                <div className="header-cell">Email</div>
                                <div className="header-cell">Tickets</div>
                                <div className="header-cell">Latest Ticket</div>
                                <div className="header-cell">Status</div>
                                <div className="header-cell">Actions</div>
                            </div>
                            
                            <div className="table-body">
                                {guests.length === 0 ? (
                                    <div className="no-guests">
                                        <p>No guests found{searchTerm ? ` for "${searchTerm}"` : ''}</p>
                                        {searchTerm && (
                                            <button 
                                                onClick={handleClearSearch}
                                                className="clear-search-btn"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    guests.map(guest => (
                                        <div key={guest.id} className="table-row">
                                            <div className="cell guest-name">
                                                <div className="name">{guest.name}</div>
                                                {guest.profile_exists && (
                                                    <span className="profile-badge">Profile</span>
                                                )}
                                            </div>
                                            <div className="cell guest-email">
                                                <div>{guest.email}</div>
                                            </div>
                                            <div className="cell ticket-count">
                                                <span className="count-badge">{guest.ticket_count}</span>
                                            </div>
                                            <div className="cell latest-ticket">
                                                {formatDate(guest.latest_issued)}
                                            </div>
                                            <div className="cell status">
                                                <span className={`status-badge ${guest.checked_in ? 'checked-in' : 'not-checked-in'}`}>
                                                    {guest.checked_in ? 'Checked In' : 'Not Checked In'}
                                                </span>
                                            </div>
                                            <div className="cell actions">
                                                {!guest.checked_in && (
                                                    <button 
                                                        className="action-btn checkin-btn"
                                                        onClick={() => handleCheckIn(guest.email)}
                                                        title="Check in guest"
                                                    >
                                                        Check In
                                                    </button>
                                                )}
                                                <button 
                                                    className="action-btn view-btn"
                                                    onClick={() => handleViewDetails(guest)}
                                                    title="View guest details"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {guests.length > 0 && totalPages > 1 && (
                        <div className="pagination-controls">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn prev-btn"
                            >
                                Previous
                            </button>
                            
                            <div className="page-numbers">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`pagination-btn page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="pagination-btn next-btn"
                            >
                                Next
                            </button>
                            
                            <div className="page-info">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>
                    )}
                    
                    <div className="modal-footer">
                        <div className="footer-info">
                            Showing {guests.length} of {totalGuests} guests
                        </div>
                        <button onClick={onClose} className="close-modal-btn">
                            Close
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GuestList;