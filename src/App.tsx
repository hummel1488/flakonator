
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Locations from "./pages/Locations";
import Sales from "./pages/Sales";
import Statistics from "./pages/Statistics";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import DataManagement from "./pages/DataManagement";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute allowedRoles={["admin", "manager", "user"]}><Index /></ProtectedRoute>,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute allowedRoles={["admin", "manager"]}><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/inventory",
    element: <ProtectedRoute allowedRoles={["admin", "manager"]}><Inventory /></ProtectedRoute>,
  },
  {
    path: "/locations",
    element: <ProtectedRoute allowedRoles={["admin", "manager"]}><Locations /></ProtectedRoute>,
  },
  {
    path: "/sales",
    element: <ProtectedRoute allowedRoles={["admin", "manager", "user"]}><Sales /></ProtectedRoute>,
  },
  {
    path: "/statistics",
    element: <ProtectedRoute allowedRoles={["admin", "manager", "user"]}><Statistics /></ProtectedRoute>,
  },
  {
    path: "/user-management",
    element: <ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/data-management",
    element: <ProtectedRoute allowedRoles={["admin", "manager"]}><DataManagement /></ProtectedRoute>,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
