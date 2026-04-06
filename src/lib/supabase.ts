import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mertjlxtogimsrjttqrf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcnRqbHh0b2dpbXNyanR0cXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MDM0ODcsImV4cCI6MjA2ODM3OTQ4N30.sNzXMu_q645mlSi7nPQmEwV_vLyuUvKRBrx42xfs-7k';

if (!supabaseAnonKey) {
  console.error(
    '[GolfBuddy] Missing VITE_SUPABASE_ANON_KEY. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'Find the anon key in Supabase Dashboard → Settings → API → Project API keys.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
