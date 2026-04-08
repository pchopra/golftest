import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qdgyeuwxjlbitkssvgpj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ3lldXd4amxiaXRrc3N2Z3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTY3ODUsImV4cCI6MjA4OTY5Mjc4NX0.ucykmBJXJvcBEFnMbD-Y85wb_sfriYIUhdc3mB2kQtg';

if (!supabaseAnonKey) {
  console.error(
    '[GolfBuddy] Missing VITE_SUPABASE_ANON_KEY. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'Find the anon key in Supabase Dashboard → Settings → API → Project API keys.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
