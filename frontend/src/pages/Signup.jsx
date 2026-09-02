import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Engineer'
  });
  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData, navigate);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm bg-white p-8 border border-slate-200 rounded-lg shadow-sm">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900">Create operator account</h1>
          <p className="text-xs text-slate-500 mt-1">Select your access role for system permissions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@organization.com"
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

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Operational Role</label>
            <select
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Engineer">Engineer</option>
              <option value="windFarmManager">Wind Farm Manager</option>
              <option value="tnebAdmin">TNEB Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-sm disabled:opacity-50"
          >
            {isSigningUp ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-slate-900 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}