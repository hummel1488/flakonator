
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, KeyRound, ShieldCheck, Mail, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isSupabaseConfigured } = useAuth();
  const { isMobile } = useIsMobile();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const from = location.state?.from || "/";
  
  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (user) {
      console.log("Пользователь уже вошёл, перенаправление на:", from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Проверка сессии при загрузке страницы
  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured) return;
      
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Текущая сессия:", data.session ? "Активна" : "Отсутствует");
      } catch (error) {
        console.error("Ошибка при проверке сессии:", error);
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    console.log("Отправка формы входа с email:", email);

    try {
      // Дополнительный вывод для отладки
      console.log("isSupabaseConfigured:", isSupabaseConfigured);
      
      const success = await login(email, password);
      if (success) {
        toast.success("Вы успешно вошли в систему");
        console.log("Вход успешен, перенаправление на:", from);
        navigate(from, { replace: true });
      } else {
        console.error("Неудачный вход в систему");
        setErrorMessage("Неверный email или пароль");
        toast.error("Неверный email или пароль");
      }
    } catch (error) {
      console.error("Ошибка входа:", error);
      setErrorMessage(error instanceof Error ? error.message : "Произошла ошибка при входе");
      toast.error("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="text-3xl font-bold">
            FLAK<span className="text-blue-500">ON</span>ATOR
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
          </CardHeader>
          
          {!isSupabaseConfigured && (
            <CardContent>
              <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Деморежим</AlertTitle>
                <AlertDescription>
                  Приложение работает в демонстрационном режиме. Используйте любой логин и пароль для входа.
                  <br />
                  Все данные будут сохранены только в браузере.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
          
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Введите email" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Введите пароль" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-500 ${isMobile ? 'py-3 text-base' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? "Вход..." : "Войти"}
              </Button>
            </form>

            {!isSupabaseConfigured && (
              <div className="mt-6 space-y-2">
                <p className="text-sm text-center text-gray-500">Для полной функциональности приложения требуется настройка Supabase.</p>
                <p className="text-sm text-center text-gray-500">В Vercel добавьте переменные окружения:</p>
                <div className="space-y-2 text-sm">
                  <div className="p-2 border rounded-md bg-gray-50">
                    <code>VITE_SUPABASE_URL=ваш_supabase_url</code>
                  </div>
                  <div className="p-2 border rounded-md bg-gray-50">
                    <code>VITE_SUPABASE_ANON_KEY=ваш_публичный_ключ</code>
                  </div>
                  <div className="p-2 border rounded-md bg-gray-50">
                    <code>VITE_SITE_URL=https://ваш_vercel_url</code>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
