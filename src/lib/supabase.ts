import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdgyeuwxjlbitkssvgpj.supabase.co';
const supabaseAnonKey = 'sb_publishable_O-vJmtJJdq-o6_sIgCxFxQ_0OsAjEhl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
