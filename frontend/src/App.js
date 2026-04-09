import React from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PhoneOtp from './pages/PhoneOtp';
import { useAuth } from './context/AuthContext';

function TopNav() {
  const { user } = useAuth();
  return (
    <div style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none', fontWeight: 700 }}>
        CallGuard
      </Link>
      <div style={{ flex: 1 }} />
      {user ? (
        <span style={{ fontSize: 12, opacity: 0.8 }}>{user.email || user.phone || user.id}</span>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign up</Link>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <TopNav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/phone" element={<PhoneOtp />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
