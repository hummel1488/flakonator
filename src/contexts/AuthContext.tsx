import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "seller" | "manager" | "user" | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  locationId?: string; // For sellers who are assigned to a specific location
  password?: string; // Only for internal use, not exposed to components
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isSeller: () => boolean;
  isManager: () => boolean;
  isUser: () => boolean;
  assignSellerLocation: (locationId: string) => void;
  MOCK_USERS: User[]; // Expose users for admin management
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial mock users
const INITIAL_MOCK_USERS: User[] = [
  { id: "1", name: "Администратор", role: "admin" as UserRole, password: "admin" },
  { id: "2", name: "Продавец", role: "seller" as UserRole, password: "seller" },
  { id: "3", name: "Управляющий", role: "manager" as UserRole, password: "manager" },
];

const STORAGE_KEY = "authUsers";
const USER_STORAGE_KEY = "authUser";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [MOCK_USERS, setMockUsers] = useState<User[]>(INITIAL_MOCK_USERS);
  const [initialized, setInitialized] = useState(false);

  // Load saved users and current user on initial render
  useEffect(() => {
    // Load saved users
    const savedUsers = localStorage.getItem(STORAGE_KEY);
    if (savedUsers) {
      try {
        setMockUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error("Failed to parse saved users:", e);
      }
    }

    // Load current user
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Restored user from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    
    setInitialized(true);
  }, []);

  // Save users whenever they change
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USERS));
    }
  }, [MOCK_USERS, initialized]);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log("Attempting login:", username);
    
    // Find user in our mock database
    const foundUser = MOCK_USERS.find(u => 
      u.name.toLowerCase() === username.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      // Create a new object without the password for security
      const { password: _, ...userWithoutPassword } = foundUser;
      console.log("Login successful, user:", userWithoutPassword);
      setUser(userWithoutPassword);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
      return true;
    }
    
    console.log("Login failed");
    return false;
  };

  const logout = () => {
    console.log("Logging out user");
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const isAdmin = () => user?.role === "admin";
  const isSeller = () => user?.role === "seller";
  const isManager = () => user?.role === "manager";
  const isUser = () => user?.role === "user";

  const assignSellerLocation = (locationId: string) => {
    if (user && user.role === "seller") {
      const updatedUser = { ...user, locationId };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      // Also update in MOCK_USERS
      const updatedUsers = MOCK_USERS.map(u => 
        u.id === user.id ? { ...u, locationId } : u
      );
      setMockUsers(updatedUsers);
    }
  };

  const addUser = (newUser: User) => {
    setMockUsers(prev => [...prev, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = MOCK_USERS.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    setMockUsers(updatedUsers);

    // Update current user if it's the same user
    if (user && user.id === updatedUser.id) {
      const { password, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
    }
  };

  const deleteUser = (userId: string) => {
    // Cannot delete current user
    if (user && user.id === userId) {
      return;
    }
    
    const updatedUsers = MOCK_USERS.filter(u => u.id !== userId);
    setMockUsers(updatedUsers);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin, 
      isSeller, 
      isManager,
      isUser,
      assignSellerLocation,
      MOCK_USERS,
      addUser,
      updateUser,
      deleteUser
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
