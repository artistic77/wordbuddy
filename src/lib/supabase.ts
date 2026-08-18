import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const DEFAULT_SUPABASE_URL = 'https://nsvjrnafqqfcnertmwzz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_6BmHC8iAt8tru7TIt2y--w__FAEH19z';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl && rawUrl !== 'true' && rawUrl.startsWith('http'))
  ? rawUrl
  : DEFAULT_SUPABASE_URL;

const supabaseAnonKey = (rawKey && rawKey !== 'true' && rawKey.length > 10)
  ? rawKey
  : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder-project.supabase.co'
);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

