
import { createClient } from '@supabase/supabase-js';

// Эти переменные должны быть настроены в Vercel в разделе Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Отсутствуют переменные окружения для Supabase');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
