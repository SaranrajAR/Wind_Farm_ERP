import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isManager = authUser?.role === 'windFarmManager';

  return (
    <nav className="w-full bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 py-3.5 transition-all">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        
        {/* Brand Logo / Home Button */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-white hover:opacity-90 transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/60 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            WindFarm <span className="text-cyan-400">ERP</span>
          </span>
        </Link>

        {/* Right Section / Auth Details */}
        {authUser ? (
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Dashboard Link (Managers Only) */}
            {isManager && (
              <Link
                to="/manager-dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
            )}

            {/* User Profile Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-medium text-slate-300">{authUser.name}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                {authUser.role}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold rounded-lg transition duration-150"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition"
            >
              Sign Up
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
}