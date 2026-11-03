import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://dghygagvamygvxudvwtn.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnaHlnYWd2YW15Z3Z4dWR2d3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MzAwNzEsImV4cCI6MjEwOTMwNjA3MX0.CI3OZuecp5LeRzU35GsQ1UB-QPuX5GU4I3GkDtwLyjs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface ConnectionStatus {
  connected: boolean;
  projectUrl: string;
  hasTables: boolean;
  error?: string;
  tableCheckDetails?: string;
}

/**
 * Testa o status da conexão com a instância do Supabase e verifica se as tabelas foram criadas.
 */
export async function checkSupabaseHealth(): Promise<ConnectionStatus> {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        return {
          connected: true,
          projectUrl: SUPABASE_URL,
          hasTables: false,
          tableCheckDetails: 'Conexão ativa com o projeto Supabase! As tabelas relacionais ainda não foram executadas no SQL Editor.'
        };
      }
      return {
        connected: false,
        projectUrl: SUPABASE_URL,
        hasTables: false,
        error: error.message
      };
    }

    return {
      connected: true,
      projectUrl: SUPABASE_URL,
      hasTables: true,
      tableCheckDetails: 'Tabelas encontradas e prontas para sincronização em tempo real!'
    };
  } catch (err: any) {
    return {
      connected: false,
      projectUrl: SUPABASE_URL,
      hasTables: false,
      error: err.message || 'Falha de conexão com o Supabase'
    };
  }
}
