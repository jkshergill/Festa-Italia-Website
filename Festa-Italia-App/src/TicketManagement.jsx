import React, { useState, useEffect } from 'react';
import './TicketManagement.css';

const TicketManagement = ({ userRole, onClose }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const itemsPerPage = 10;

    useEffect(() => {
        fetchTickets();
    }, [currentPage, filterStatus]);

    const fetchTickets = async () => {

        try {
            setLoading(true);
            // Mock Api call
            setTimeout(() => {
                const mockTickets = Array.from({ length: 50 }, (_, i) => ({
                    id: `TKT-${1000 + i}`,
                    event: i % 3 === 0 ? 'Coronation Ball' : i % 3 === 1 ? 'Bocce Tournament' : 'Fishermans Festival',
                    issued_at: new Date(Date.now() - i * 86400000).toISOString(),
                    revoked_at: i % 10 === 0 ? new Date().toISOString() : null,
                    checked_in_at: i % 5 === 0 ? new Date().toISOString() : null,
                    holder_name: `Attendee ${i + 1}`,
                    holder_email: `attendee${i + 1}@example.com`,
                    purchaser_name: `Customer ${i + 1}`,
                    purchaser_email: `customer${i + 1}@example.com`
                }));
                
                // Apply filters
                let filtered = mockTickets;
                if (filterStatus === 'active') {
                    filtered = mockTickets.filter(t => !t.revoked_at && !t.checked_in_at);
                } else if (filterStatus === 'revoked') {
                    filtered = mockTickets.filter(t => t.revoked_at);
                } else if (filterStatus === 'checked_in') {
                    filtered = mockTickets.filter(t => t.checked_in_at && !t.revoked_at);
                }
                
                // Apply search
                if (searchTerm) {
                    filtered = filtered.filter(t => 
                        t.holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.holder_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.id.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                
                // Apply pagination
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
                
                setTickets(paginated);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setLoading(false);
        }
    };

    const getStatus = (ticket) => {
        if (ticket.revoked_at) return 'Revoked';
        if (ticket.checked_in_at) return 'Checked In';
        return 'Active';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchTickets();
    };

    const handleCheckIn = (ticketId) => {
        console.log('Check in ticket:', ticketId);
        // check-in logic
    };

    const handleRevoke = (ticketId) => {
        console.log('Revoke ticket:', ticketId);
        // revoke logic
    };

    if (userRole !== 'admin') {
        return (
            <div className="access-denied">
                <h3>Access Denied</h3>
                <p>Admin privileges required.</p>
            </div>
        );
    }

    return (
        <div className="ticket-management-modal">
            <div className="modal-controls">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">
                        Search
                    </button>
                </form>
                
                <div className="filter-controls">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="checked_in">Checked In</option>
                        <option value="revoked">Revoked</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading tickets...</div>
            ) : (
                <>
                    <div className="tickets-table">
                        <div className="table-header">
                            <div className="header-cell">Ticket ID</div>
                            <div className="header-cell">Event</div>
                            <div className="header-cell">Holder</div>
                            <div className="header-cell">Status</div>
                            <div className="header-cell">Actions</div>
                        </div>
                        
                        <div className="table-body">
                            {tickets.length === 0 ? (
                                <div className="no-tickets">No tickets found</div>
                            ) : (
                                tickets.map(ticket => (
                                    <div key={ticket.id} className="table-row">
                                        <div className="cell ticket-id">{ticket.id}</div>
                                        <div className="cell event">{ticket.event}</div>
                                        <div className="cell holder">
                                            <div>{ticket.holder_name}</div>
                                            <div className="email">{ticket.holder_email}</div>
                                        </div>
                                        <div className="cell">
                                            <span className={`status-badge ${getStatus(ticket).toLowerCase().replace(' ', '-')}`}>
                                                {getStatus(ticket)}
                                            </span>
                                        </div>
                                        <div className="cell actions">
                                            {getStatus(ticket) === 'Active' && (
                                                <>
                                                    <button 
                                                        className="action-btn checkin-btn"
                                                        onClick={() => handleCheckIn(ticket.id)}
                                                    >
                                                        Check In
                                                    </button>
                                                    <button 
                                                        className="action-btn revoke-btn"
                                                        onClick={() => handleRevoke(ticket.id)}
                                                    >
                                                        Revoke
                                                    </button>
                                                </>
                                            )}
                                            <button className="action-btn view-btn">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    <div className="pagination-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Previous
                        </button>
                        <span className="page-info">Page {currentPage}</span>
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                    
                    <div className="modal-footer">
                        <button onClick={onClose} className="close-modal-btn">
                            Close
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TicketManagement;