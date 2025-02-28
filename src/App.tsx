
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Clients from "./pages/Clients";
import Locations from "./pages/Locations";
import Marketing from "./pages/Marketing";
import Training from "./pages/Training";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import UserManagement from "./pages/UserManagement";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <Index />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute requiredRoles={["admin", "manager"]}>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <Inventory />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <Sales />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <Clients />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/locations"
              element={
                <ProtectedRoute requiredRoles={["admin", "manager"]}>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <Locations />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketing"
              element={
                <ProtectedRoute requiredRoles={["admin", "manager"]}>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <Marketing />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/training"
              element={
                <ProtectedRoute>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <Training />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute requiredRoles={["admin", "manager"]}>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <Statistics />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <>
                    <Navigation />
                    <div className="pl-64 pt-4">
                      <UserManagement />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
