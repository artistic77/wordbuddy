import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const DEFAULT_SUPABASE_URL = 'https://ruxnxyraqmmutqiglrye.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_vK3YHIbxdqkmUf8fKw_-ZQ_wuQcmqUY';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const sanitizeSupabaseUrl = (url?: string): string => {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

// Ignore deprecated/inactive projects that might still be stored in host env vars
const isKnownDeadUrl = (url?: string): boolean => {
  return Boolean(url && url.includes('nsvjrnafqqfcnertmwzz'));
};

const isKnownDeadKey = (key?: string): boolean => {
  return Boolean(key && key.includes('6BmHC8iAt8tru7TIt2y'));
};

const supabaseUrl = (rawUrl && rawUrl !== 'true' && rawUrl.startsWith('http') && !isKnownDeadUrl(rawUrl))
  ? sanitizeSupabaseUrl(rawUrl)
  : sanitizeSupabaseUrl(DEFAULT_SUPABASE_URL);

const supabaseAnonKey = (rawKey && rawKey !== 'true' && rawKey.length > 10 && !isKnownDeadKey(rawKey))
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
