// src/supabaseClient.js
// Centralized Supabase client: import { supabase } from './supabaseClient' anywhere you need it
import { createClient } from '@supabase/supabase-js';

// These come from the .env file
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
