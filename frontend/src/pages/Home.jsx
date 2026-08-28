import { useAuthStore } from '../store/useAuthStore';

export default function Home() {
  const { authUser } = useAuthStore();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <h1 className="text-2xl font-bold">Welcome, {authUser?.name}</h1>
      <p className="text-gray-600">Assigned Role: <span className="font-semibold">{authUser?.role}</span></p>

      {/* Role-based dashboard content */}
      {authUser?.role === 'tnebAdmin' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900">TNEB Admin Control Panel</h3>
          <p className="text-sm text-blue-700">Grid sync status and state telemetry active.</p>
        </div>
      )}

      {authUser?.role === 'windFarmManager' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="font-semibold text-amber-900">Farm Management Console</h3>
          <p className="text-sm text-amber-700">Monitoring generation stats and assigned engineers.</p>
        </div>
      )}

      {authUser?.role === 'Engineer' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
          <h3 className="font-semibold text-emerald-900">Field Engineer Portal</h3>
          <p className="text-sm text-emerald-700">Turbine maintenance logs and sensor updates.</p>
        </div>
      )}
    </div>
  );
}