
import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "seller" | "manager" | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  locationId?: string; // For sellers who are assigned to a specific location
  password?: string; // Only used internally, not exposed to components
}

interface AuthContextType {
  user: User | null;
  users: User[]; // Added to expose all users
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isSeller: () => boolean;
  isManager: () => boolean;
  assignSellerLocation: (locationId: string) => void;
  createUser: (name: string, password: string, role: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration purposes
const INITIAL_MOCK_USERS = [
  { id: "1", name: "Администратор", role: "admin" as UserRole, password: "admin" },
  { id: "2", name: "Продавец", role: "seller" as UserRole, password: "seller" },
  { id: "3", name: "Управляющий", role: "manager" as UserRole, password: "manager" },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Check for existing session and users on load
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

    // Load or initialize users
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error("Failed to parse stored users:", e);
        localStorage.setItem("users", JSON.stringify(INITIAL_MOCK_USERS));
        setUsers(INITIAL_MOCK_USERS);
      }
    } else {
      localStorage.setItem("users", JSON.stringify(INITIAL_MOCK_USERS));
      setUsers(INITIAL_MOCK_USERS);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Find user in our users array
    const foundUser = users.find(u => 
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
      
      // Also update in the users array
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, locationId } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }
  };

  const createUser = async (name: string, password: string, role: UserRole): Promise<boolean> => {
    // Check if a user with this name already exists
    if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      return false;
    }

    // Create a new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      name,
      role,
      password
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      login, 
      logout, 
      isAdmin, 
      isSeller, 
      isManager,
      assignSellerLocation,
      createUser
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
