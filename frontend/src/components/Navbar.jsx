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
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex justify-between items-center">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-sm tracking-tight text-slate-900">
              <span>GridPulse</span>
              <span className="text-slate-400 font-normal">/</span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                SCADA ERP
              </span>
            </div>
          </Link>

          {authUser && isManager && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/manager-dashboard"
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                Turbines & Operations
              </Link>
            </nav>
          )}
        </div>

        {/* Right Section / Auth Details */}
        <div className="flex items-center gap-3">
          {authUser ? (
            <>
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-800 leading-none">{authUser.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-none">{authUser.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}