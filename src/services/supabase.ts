import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  URL: 'radiant_supabase_url',
  KEY: 'radiant_supabase_key',
};

export const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_KEYS.URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.KEY) || '';

  const url = (envUrl && !envUrl.includes('sua-url-do-projeto')) ? envUrl : localUrl;
  const key = (envKey && !envKey.includes('sua-chave-anon')) ? envKey : localKey;

  return { url: url.trim(), key: key.trim() };
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (url) localStorage.setItem(STORAGE_KEYS.URL, url.trim());
  else localStorage.removeItem(STORAGE_KEYS.URL);

  if (key) localStorage.setItem(STORAGE_KEYS.KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEYS.KEY);

  // Recarrega o cliente
  reinitSupabaseClient();
};

let currentSupabase: SupabaseClient | null = null;

const reinitSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseCredentials();
  if (url && key && url.startsWith('https://')) {
    try {
      currentSupabase = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return currentSupabase;
    } catch {
      currentSupabase = null;
      return null;
    }
  }
  currentSupabase = null;
  return null;
};

// Inicialização inicial
reinitSupabaseClient();

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('https://'));
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!currentSupabase) {
    reinitSupabaseClient();
  }
  return currentSupabase;
};

export const supabase = getSupabaseClient();
