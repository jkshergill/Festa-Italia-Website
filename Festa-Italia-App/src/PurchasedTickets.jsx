import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function PurchasedTickets({ eventId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          tickets (
            id,
            ticket_type,
            qr_token
          )
        `)
        .eq("user_id", user.id)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setOrders(data);
      }

      setLoading(false);
    };

    fetchTickets();
  }, [eventId]);

  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!orders.length) return <p>No tickets found for this event.</p>;

  // calculate ticket counts
  const totalTickets = orders.reduce(
    (sum, order) => sum + (order.tickets ? order.tickets.length : 0),
    0
  );

  return (
    <div className="tickets-container">
      {/* overall summary */}
      <div className="tickets-summary">
        <p>
          You have purchased <strong>{totalTickets}</strong> ticket{totalTickets !== 1 ? 's' : ''} for this event.
        </p>
      </div>

      {orders.map(order => (
        <div key={order.id} className="order-card">
          <h3>
            Order #{order.id.slice(0, 8)} ({order.tickets.length} ticket{order.tickets.length !== 1 ? 's' : ''})
          </h3>
          <p>
            Purchased on{' '}
            {new Date(order.created_at).toLocaleDateString()}
          </p>

          <div className="tickets-list">
            {order.tickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <p><strong>Type:</strong> {ticket.ticket_type}</p>

                <img
                  src={ticket.qr_token}
                  alt="Ticket QR Code"
                  width={120}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
