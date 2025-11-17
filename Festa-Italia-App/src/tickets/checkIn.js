import { supabase } from '../supabaseClient';

/**
 * Mark a ticket as checked in (admin only).
 */
export async function checkIn(ticketId) {
  const { error } = await supabase.rpc('admin_check_in_ticket', { p_ticket_id: ticketId });
  if (error) throw error;
  return true;
}
