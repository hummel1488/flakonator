
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

export type UserRole = "admin" | "seller" | "manager" | null;

interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  locationId?: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isSeller: () => boolean;
  isManager: () => boolean;
  assignSellerLocation: (locationId: string) => void;
  session: Session | null;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Проверка, настроен ли Supabase
const isSupabaseEnabled = isSupabaseConfigured();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверяем наличие пользователя в localStorage в демо-режиме
  useEffect(() => {
    if (!isSupabaseEnabled) {
      const savedUser = localStorage.getItem('demoUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  // Загрузка пользовательской сессии при инициализации
  useEffect(() => {
    // Если Supabase не настроен, пропускаем проверку сессии
    if (!isSupabaseEnabled) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Загрузка профиля пользователя из Supabase
  const loadUserProfile = async (supabaseUser: User) => {
    // Если Supabase не настроен, пропускаем загрузку профиля
    if (!isSupabaseEnabled) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error) {
        console.error("Ошибка загрузки профиля:", error);
        return;
      }

      if (data) {
        setUser({
          id: supabaseUser.id,
          name: data.name || supabaseUser.email?.split('@')[0] || 'Пользователь',
          role: data.role as UserRole,
          locationId: data.location_id,
          email: supabaseUser.email
        });
      }
    } catch (err) {
      console.error("Непредвиденная ошибка при загрузке профиля:", err);
    }
  };

  // Аутентификация пользователя
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Если Supabase не настроен, возвращаем успешный вход с тестовыми данными
      if (!isSupabaseEnabled) {
        const demoUser = {
          id: "test-user-id",
          name: email.split('@')[0] || "Тестовый пользователь",
          role: "admin" as UserRole,
          email: email
        };
        
        setUser(demoUser);
        // Сохраняем пользователя в localStorage для демо-режима
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        return true;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Ошибка входа:", error.message);
        toast.error("Ошибка входа: " + error.message);
        return false;
      }

      return !!data.session;
    } catch (err) {
      console.error("Непредвиденная ошибка при входе:", err);
      toast.error("Непредвиденная ошибка при входе");
      return false;
    }
  };

  // Выход из системы
  const logout = async () => {
    if (isSupabaseEnabled) {
      await supabase.auth.signOut();
    } else {
      // Очищаем данные пользователя в демо-режиме
      localStorage.removeItem('demoUser');
    }
    setUser(null);
    setSession(null);
    toast.success("Вы вышли из системы");
  };

  const isAdmin = () => user?.role === "admin";
  const isSeller = () => user?.role === "seller";
  const isManager = () => user?.role === "manager";

  // Назначение продавцу точки продаж
  const assignSellerLocation = async (locationId: string) => {
    if (!user || user.role !== "seller") return;
    
    // В демо-режиме просто обновляем локально
    if (!isSupabaseEnabled) {
      const updatedUser = {...user, locationId};
      setUser(updatedUser);
      localStorage.setItem('demoUser', JSON.stringify(updatedUser));
      toast.success("Локация назначена продавцу");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ location_id: locationId })
        .eq("id", user.id);

      if (error) {
        console.error("Ошибка при назначении локации:", error);
        toast.error("Ошибка при назначении локации");
        return;
      }

      setUser({ ...user, locationId });
      toast.success("Локация назначена продавцу");
    } catch (err) {
      console.error("Непредвиденная ошибка при назначении локации:", err);
      toast.error("Непредвиденная ошибка при назначении локации");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin, 
      isSeller, 
      isManager,
      assignSellerLocation,
      session,
      isSupabaseConfigured: isSupabaseEnabled
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
};
