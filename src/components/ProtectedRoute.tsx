
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ["admin", "seller", "manager"]
}) => {
  const { user } = useAuth();
  const location = useLocation();

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log("ProtectedRoute check:", {
      user,
      allowedRoles,
      isAuthenticated: !!user,
      hasPermission: user?.role && allowedRoles.includes(user.role)
    });
  }, [user, allowedRoles]);

  // Проверка авторизации
  if (!user) {
    console.log("Redirecting to login - no user");
    // Redirect to the login page if not logged in
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user has the required role
  if (user.role && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  console.log("Redirecting to unauthorized - no permission");
  // If user doesn't have the required role, redirect to unauthorized page
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
