import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qdgyeuwxjlbitkssvgpj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error(
    '[GolfBuddy] Missing VITE_SUPABASE_ANON_KEY. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'Find the anon key in Supabase Dashboard → Settings → API → Project API keys.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
