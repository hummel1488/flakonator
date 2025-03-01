
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Index from './pages/Index';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Statistics from './pages/Statistics';
import Clients from './pages/Clients';
import Locations from './pages/Locations';
import UserManagement from './pages/UserManagement';
import Training from './pages/Training';
import Marketing from './pages/Marketing';
import DataManagement from './pages/DataManagement';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "seller"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "seller"]}>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "seller"]}>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Locations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "seller"]}>
                <Training />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <Marketing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DataManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
