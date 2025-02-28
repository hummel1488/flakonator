
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Statistics from "@/pages/Statistics";
import Sales from "@/pages/Sales";
import Inventory from "@/pages/Inventory";
import Locations from "@/pages/Locations";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          <Route path="/statistics" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Statistics />
            </ProtectedRoute>
          } />
          
          <Route path="/sales" element={
            <ProtectedRoute allowedRoles={["admin", "seller"]}>
              <Sales />
            </ProtectedRoute>
          } />
          
          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Inventory />
            </ProtectedRoute>
          } />
          
          <Route path="/locations" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Locations />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
