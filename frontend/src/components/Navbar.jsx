import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const { authUser, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">WindFarm ERP</h1>
      {authUser && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {authUser.name} (<strong>{authUser.role}</strong>)
          </span>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}