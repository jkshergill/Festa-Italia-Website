import React, { useState, useEffect } from 'react';
import './GuestList.css';
import { supabase } from './supabaseClient';

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

            const { data: tickets, error } = await supabase
                .from('tickets')
                .select('*');
            if (error) throw error;
            
            console.log('Fetched tickets:', tickets);
            // Group tickets by guest (email)
            const guestMap = new Map();

            tickets.forEach(ticket => {
                if (ticket.revoked_at) return; // Skip revoked tickets
                
                const guestKey = ticket.holder_profile_id;
                
                if (!guestMap.has(guestKey)) {
                    guestMap.set(guestKey, {
                        id: guestKey,
                        name: ticket.holder_name,
                        email: ticket.holder_email,
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
            //if (searchTerm.trim()) {
            //    const term = searchTerm.toLowerCase();
            //    guestList = guestList.filter(guest => 
            //        guest.name.toLowerCase().includes(term) ||
            //        guest.email.toLowerCase().includes(term) ||
            //        guest.holder_name.toLowerCase().includes(term) ||
            //        guest.holder_email.toLowerCase().includes(term)
            //    );
            //}

            setGuests(guestList.slice(0, itemsPerPage));
            setTotalGuests(guestList.length);
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

    const handleCheckIn = async (guestEmail) => {
        // Update local state to reflect check-in
        setGuests(prevGuests => 
            prevGuests.map(guest => 
                guest.id === guestEmail 
                    ? { ...guest, checked_in: true }
                    : guest
            )
        );

        try {
            // Update the database to mark the guest as checked in.
            const { data, error } = await supabase
                .from('tickets')
                .update({ checked_in_at: new Date().toISOString() })
                .eq('holder_profile_id', guestEmail)
                .is('checked_in_at', null);

            if (error) throw error;
            console.log('Checked in guest:', guestEmail, data);
            alert(`Guest ${guestEmail} has been checked in!`);
        } catch (error) {
            console.error('Error checking in guest:', error);
            alert('Failed to check in guest. Please try again.');

            setGuests(prevGuests => 
                prevGuests.map(guest => 
                    guest.email === guestEmail ? { ...guest, checked_in: false } : guest
                )
            );
        }

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
                                                        onClick={() => handleCheckIn(guest.id)}
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