import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg font-semibold text-gray-600">Loading auth state...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Navbar />
        <main className="max-w-4xl mx-auto mt-6 p-4">
          <Routes>
            <Route 
              path="/" 
              element={authUser ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!authUser ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!authUser ? <Signup /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}