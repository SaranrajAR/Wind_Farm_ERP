import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManagerDashboard from './pages/ManagerDashboard'; // Adjust path if needed
import AdminWindFarmManager from './pages/AdminWindFarmManager';// Adjust path if needed

export default function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          Authenticating session...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
              fontSize: '13px',
              borderRadius: '8px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#059669',
                secondary: '#ecfdf5',
              },
            },
            error: {
              iconTheme: {
                primary: '#e11d48',
                secondary: '#fff1f2',
              },
            },
          }}
        />

        <Navbar />

        <main className="w-full flex-1">
          <Routes>
            {/* PUBLIC ONLY ROUTES */}
            <Route
              path="/login"
              element={!authUser ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/signup"
              element={!authUser ? <Signup /> : <Navigate to="/" replace />}
            />

            {/* ADMIN ONLY ROUTE */}
            <Route
              path="/admin/"
              element={
                !authUser ? (
                  <Navigate to="/login" replace />
                ) : authUser.role === 'tnebAdmin' ? (
                  <AdminWindFarmManager />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* MANAGER ONLY ROUTE */}
            <Route
              path="/manager-dashboard"
              element={
                !authUser ? (
                  <Navigate to="/login" replace />
                ) : authUser.role === 'windFarmManager' ? (
                  <ManagerDashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* AUTHENTICATED GENERAL ROUTE */}
            <Route
              path="/"
              element={authUser ? <Home /> : <Navigate to="/login" replace />}
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}