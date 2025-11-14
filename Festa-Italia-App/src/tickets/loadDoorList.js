import { supabase } from '../supabaseClient';

/**
 * Load all ticket holders for a specific event (door staff view).
 */
export async function loadDoorList(event) {
  const { data, error } = await supabase
    .from('v_event_guestlist')
    .select('*')
    .eq('event', event)
    .order('holder_name', { ascending: true });

  if (error) throw error;
  return data;
}
