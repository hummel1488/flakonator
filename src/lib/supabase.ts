
import { createClient } from '@supabase/supabase-js';

// URL и ключ Supabase из переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Проверка наличия переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Отсутствуют переменные окружения для Supabase. Приложение работает в демо-режиме.');
}

// Получаем текущий URL для настройки авторизации
const getURL = () => {
  let url =
    import.meta.env.VITE_SITE_URL ?? // Проверяем настроенный URL сайта
    import.meta.env.VITE_VERCEL_URL ?? // Автоматически заполняемый Vercel URL
    'http://localhost:5173/'; // Локальная разработка
    
  // Убеждаемся, что URL использует HTTPS в продакшн
  url = url.includes('http') ? url : `https://${url}`;
  
  // Убеждаемся, что URL заканчивается слешем
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  
  console.log('Redirect URL:', url);
  return url;
};

// Создаем клиент Supabase с пустыми значениями, если переменные не определены
// Это позволит приложению запуститься, но функциональность, связанная с Supabase, будет отключена
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
  }
);

// Функция для проверки, настроен ли Supabase
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};
