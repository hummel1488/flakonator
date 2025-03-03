
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка пользовательской сессии при инициализации
  useEffect(() => {
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
  };

  // Аутентификация пользователя
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Ошибка входа:", error.message);
        return false;
      }

      return !!data.session;
    } catch (err) {
      console.error("Непредвиденная ошибка при входе:", err);
      return false;
    }
  };

  // Выход из системы
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = () => user?.role === "admin";
  const isSeller = () => user?.role === "seller";
  const isManager = () => user?.role === "manager";

  // Назначение продавцу точки продаж
  const assignSellerLocation = async (locationId: string) => {
    if (!user || user.role !== "seller") return;

    const { error } = await supabase
      .from("user_profiles")
      .update({ location_id: locationId })
      .eq("id", user.id);

    if (error) {
      console.error("Ошибка при назначении локации:", error);
      return;
    }

    setUser({ ...user, locationId });
  };

  if (loading) {
    return <div>Загрузка...</div>;
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
      session
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
