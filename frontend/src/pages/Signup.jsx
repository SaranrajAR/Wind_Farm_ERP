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
    signup(formData, navigate); // Navigates to /login after successful creation
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            required
            className="w-full mt-1 p-2 border rounded-md"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="w-full mt-1 p-2 border rounded-md"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            className="w-full mt-1 p-2 border rounded-md"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select
            className="w-full mt-1 p-2 border rounded-md"
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
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSigningUp ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account? <Link to="/login" className="text-blue-600 underline">Log in</Link>
      </p>
    </div>
  );
}