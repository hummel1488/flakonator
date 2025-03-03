
import { createClient } from '@supabase/supabase-js';

// URL и ключ Supabase из переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Проверка наличия переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Отсутствуют переменные окружения для Supabase');
}

// Создаем клиент Supabase с пустыми значениями, если переменные не определены
// Это позволит приложению запуститься, но функциональность, связанная с Supabase, будет отключена
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
