import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900">Sign in to console</h1>
          <p className="text-xs text-slate-500 mt-1">Enter your organization credentials to access SCADA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@gridpulse.io"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-sm disabled:opacity-50"
          >
            {isLoggingIn ? 'Verifying...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link to="/signup" className="text-slate-900 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}