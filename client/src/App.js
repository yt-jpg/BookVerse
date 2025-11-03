import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import SupremeLogin from './components/Auth/SupremeLogin';
import DatabaseConfig from './components/DatabaseConfig/DatabaseConfig';
import SetupWizard from './components/Setup/SetupWizard';
import UserDashboard from './components/User/UserDashboard';

import AdminDashboard from './components/Admin/AdminDashboard';
import SupremeDashboard from './components/Admin/SupremeDashboard';
import InteractiveBackground from './components/InteractiveBackground/InteractiveBackground';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <InteractiveBackground />
              <Routes>
                <Route path="/setup" element={<SetupWizard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/supreme-login" element={<SupremeLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/database-config" element={<DatabaseConfig />} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/supreme-dashboard" element={<SupremeRoute><SupremeDashboard /></SupremeRoute>} />
                <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

function SupremeRoute({ children }) {
  const { user } = useAuth();
  return user && user.isSupreme ? children : <Navigate to="/supreme-login" />;
}



export default App;
