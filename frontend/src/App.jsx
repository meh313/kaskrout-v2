import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Management from './pages/Management/Management';
import Prices from './pages/Prices/Prices';
import Reports from './pages/Reports/Reports';
import './App.css';

// Component to handle authenticated routes
const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginRedirect />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="management" element={<Management />} />
        <Route path="prices" element={<Prices />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
};

// Component to redirect logged-in users away from login page
const LoginRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthenticatedApp />
      </Router>
    </AuthProvider>
  );
}

export default App;