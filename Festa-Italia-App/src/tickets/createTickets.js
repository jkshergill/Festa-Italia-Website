import { supabase } from '../supabaseClient';

/**
 * Create multiple tickets for a given event.
 * @param {Object} params
 * @param {string} params.event - Event name, e.g., 'coronation_ball_2026'
 * @param {Array} params.assignments - [{ holder_name, holder_email?, holder_profile_id? }]
 */
export async function createTickets({ event, assignments }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('You must be signed in to create tickets.');

  const rows = assignments.map(a => ({
    event,
    purchaser_profile_id: user.id,
    holder_name: a.holder_name,
    holder_email: a.holder_email ?? null,
    holder_profile_id: a.holder_profile_id ?? null,
  }));

  const { data, error } = await supabase.from('tickets').insert(rows).select('*');
  if (error) throw error;
  return data;
}
