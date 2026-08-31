import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManagerDashboard from './pages/ManagerDashboard';

export default function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-lg font-semibold text-slate-400">Loading auth state...</p>
      </div>
    );
  }

  return (
    <Router>
      {/* 1. Full-screen dark container to eliminate white side borders */}
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #1e293b'
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#0f172a',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#0f172a',
              },
            },
          }}
        />

        <Navbar />

        {/* 2. Full-width main container without restrictive max-w-4xl constraint */}
        <main className="w-full flex-1">
          <Routes>
            <Route 
              path="/manager-dashboard" 
              element={authUser ? <ManagerDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={authUser ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!authUser ? <Login /> : <Navigate to="/manager-dashboard" />} 
            />
            <Route 
              path="/signup" 
              element={!authUser ? <Signup /> : <Navigate to="/manager-dashboard" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}