import { supabase } from '../supabaseClient';

/**
 * Update holder name or email for a specific ticket.
 * (Allowed until ticket is checked in or revoked.)
 */
export async function updateHolder(ticketId, { holder_name, holder_email }) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ holder_name, holder_email })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
