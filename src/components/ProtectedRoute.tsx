
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = ["admin", "seller", "manager"]
}) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to the login page if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (user.role && requiredRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // If user doesn't have the required role, redirect to unauthorized page or home
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
