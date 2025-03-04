
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthProvider";
import { useEffect } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ["admin", "seller", "manager"]
}) => {
  const { user, session } = useAuth();
  const location = useLocation();

  // Добавляем логирование для отладки
  useEffect(() => {
    console.log("ProtectedRoute check:", {
      user,
      session: session ? "Активна" : "Отсутствует",
      currentPath: location.pathname,
      allowedRoles,
      isAuthenticated: !!user,
      hasPermission: user ? allowedRoles.includes(user.role || "admin") : false
    });
  }, [user, session, allowedRoles, location]);

  // Проверка авторизации
  if (!user) {
    console.log("Перенаправление на страницу входа - пользователь не авторизован");
    toast.error("Необходимо войти в систему");
    // Redirect to the login page if not logged in
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Для демо-режима (если id пользователя начинается с "demo-") всегда разрешаем доступ
  if (user.id.startsWith("demo-")) {
    return <>{children}</>;
  }

  // Check if user has the required role
  if (user.role && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  console.log("Перенаправление на страницу unauthorized - нет прав доступа");
  toast.error("У вас нет прав доступа к этой странице");
  // If user doesn't have the required role, redirect to unauthorized page
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
