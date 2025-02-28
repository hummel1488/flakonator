
import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "seller" | "manager" | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  locationId?: string; // For sellers who are assigned to a specific location
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isSeller: () => boolean;
  isManager: () => boolean;
  assignSellerLocation: (locationId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration purposes
const MOCK_USERS = [
  { id: "1", name: "Администратор", role: "admin" as UserRole, password: "admin" },
  { id: "2", name: "Продавец", role: "seller" as UserRole, password: "seller" },
  { id: "3", name: "Управляющий", role: "manager" as UserRole, password: "manager" },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call
    const foundUser = MOCK_USERS.find(u => 
      u.name.toLowerCase() === username.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("authUser", JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  const isAdmin = () => user?.role === "admin";
  const isSeller = () => user?.role === "seller";
  const isManager = () => user?.role === "manager";

  const assignSellerLocation = (locationId: string) => {
    if (user && user.role === "seller") {
      const updatedUser = { ...user, locationId };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin, 
      isSeller, 
      isManager,
      assignSellerLocation 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
