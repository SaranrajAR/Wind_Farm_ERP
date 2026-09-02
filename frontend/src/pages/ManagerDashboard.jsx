import React, { useEffect, useState, useRef } from 'react';
import useManagerStore from '../store/useManagerStore';

const INITIAL_FORM_STATE = {
  turbineCode: '',
  model: '',
  capacity: '',
  status: 'ACTIVE',
  assignedEngineerId: ''
};

const ManagerDashboard = () => {
  const { 
    turbines, 
    farmDetails, 
    isLoading, 
    error, 
    fetchTurbines, 
    addTurbine, 
    updateTurbine, 
    deleteTurbine 
  } = useManagerStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurbineId, setEditingTurbineId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTurbineId, setDeletingTurbineId] = useState(null);

  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});

  const showToast = (id, type, message, autoDismiss = true) => {
    setToasts((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (exists) {
        return prev.map((t) => (t.id === id ? { id, type, message } : t));
      }
      return [...prev, { id, type, message }];
    });

    if (autoDismiss) {
      if (toastTimers.current[id]) clearTimeout(toastTimers.current[id]);
      toastTimers.current[id] = setTimeout(() => {
        removeToast(id);
      }, 4000);
    }
  };

  const removeToast = (id) => {
    if (toastTimers.current[id]) clearTimeout(toastTimers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchTurbines();
  }, [fetchTurbines]);

  const handleOpenModal = (turbine = null) => {
    setFormError('');
    if (turbine) {
      setEditingTurbineId(turbine._id);
      setFormData({
        turbineCode: turbine.turbineCode || '',
        model: turbine.model || '',
        capacity: turbine.capacity || '',
        status: turbine.status || 'ACTIVE',
        assignedEngineerId: turbine.assignedEngineerId?._id || turbine.assignedEngineerId || ''
      });
    } else {
      setEditingTurbineId(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTurbineId(null);
    setFormData(INITIAL_FORM_STATE);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const toastId = `mutation-${Date.now()}`;
    const actionLabel = editingTurbineId ? 'Updating turbine' : 'Registering turbine';
    showToast(toastId, 'loading', `${actionLabel}...`, false);

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      assignedEngineerId: formData.assignedEngineerId.trim() === '' ? null : formData.assignedEngineerId
    };

    let res;
    if (editingTurbineId) {
      res = await updateTurbine(editingTurbineId, payload);
    } else {
      res = await addTurbine(payload);
    }

    setIsSubmitting(false);

    if (res.success) {
      handleCloseModal();
      showToast(
        toastId, 
        'success', 
        editingTurbineId 
          ? `Turbine ${payload.turbineCode} updated.` 
          : `Turbine ${payload.turbineCode} registered.`
      );
    } else {
      const errMsg = res.message || 'Operation failed. Please verify form values.';
      setFormError(errMsg);
      showToast(toastId, 'error', errMsg);
    }
  };

  const handleDelete = async (turbine) => {
    if (window.confirm(`Are you sure you want to decommission unit ${turbine.turbineCode}?`)) {
      const toastId = `delete-${turbine._id}`;
      setDeletingTurbineId(turbine._id);
      showToast(toastId, 'loading', `Decommissioning ${turbine.turbineCode}...`, false);

      const res = await deleteTurbine(turbine._id);
      setDeletingTurbineId(null);

      if (res.success) {
        showToast(toastId, 'success', `Turbine ${turbine.turbineCode} removed.`);
      } else {
        showToast(toastId, 'error', res.message || 'Failed to remove turbine.');
      }
    }
  };

  // Status Badge Component
  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === 'ACTIVE' || s === 'OPERATIONAL') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    }
    if (s === 'MAINTENANCE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Maintenance
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        {status || 'Offline'}
      </span>
    );
  };

  if (isLoading && turbines.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Syncing SCADA Telemetry...</p>
      </div>
    );
  }

  if (error && turbines.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-rose-200 rounded-lg text-center shadow-sm">
        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Telemetrics Disconnected</h3>
        <p className="text-xs text-slate-500 mb-4">{error}</p>
        <button
          onClick={fetchTurbines}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const activeCount = turbines.filter(t => ['ACTIVE', 'OPERATIONAL'].includes(t.status?.toUpperCase())).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3 bg-white border rounded-lg shadow-md text-xs font-medium ${
              toast.type === 'error' ? 'border-rose-200 text-rose-800' : 'border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'loading' && <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />}
              {toast.type === 'success' && <span className="text-emerald-600 font-bold">✓</span>}
              {toast.type === 'error' && <span className="text-rose-600 font-bold">✕</span>}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600">×</button>
          </div>
        ))}
      </div>

      {/* Header & Meta Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {farmDetails?.farmName || 'Wind Farm Operations'}
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                {farmDetails?.district || 'Sector Overview'}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>{farmDetails?.address || 'Location information configured via SCADA'}</span>
              <span>•</span>
              <span className="font-mono text-slate-600">SS: {farmDetails?.substationName || '230kV SS'}</span>
              <span>•</span>
              <span className="font-mono text-slate-600">Feeder: {farmDetails?.feederCode || 'FDR-01'}</span>
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition shadow-sm self-start md:self-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add Turbine Unit
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Units</span>
            <p className="text-xl font-semibold text-slate-900 mt-0.5">{turbines.length}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Active Operational</span>
            <p className="text-xl font-semibold text-emerald-600 mt-0.5">{activeCount}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Farm Capacity</span>
            <p className="text-xl font-semibold text-slate-900 mt-0.5">
              {farmDetails?.totalCapacity ?? '45.5'} <span className="text-xs font-normal text-slate-500">MW</span>
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Commissioned</span>
            <p className="text-sm font-medium text-slate-700 mt-1">
              {farmDetails?.createdAt ? new Date(farmDetails.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Current Period'}
            </p>
          </div>
        </div>
      </div>

      {/* Turbines Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-900">Turbine Inventory</h2>
          <span className="text-xs text-slate-500 font-mono">{turbines.length} registered</span>
        </div>

        {turbines.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-slate-900">No turbines registered</p>
            <p className="text-xs text-slate-500 mt-1">Add your first unit using the registration button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Unit Code</th>
                  <th className="py-3 px-5">Model</th>
                  <th className="py-3 px-5">Capacity</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Assigned Engineer</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {turbines.map((turbine) => (
                  <tr key={turbine._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 font-mono">
                      {turbine.turbineCode}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {turbine.model || 'Standard'}
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      {turbine.capacity ? `${turbine.capacity} kW` : '1500 kW'}
                    </td>
                    <td className="py-3.5 px-5">
                      {getStatusBadge(turbine.status)}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {turbine.assignedEngineerId?.name ? (
                        <div>
                          <div className="font-medium text-slate-900">{turbine.assignedEngineerId.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{turbine.assignedEngineerId.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(turbine)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          disabled={deletingTurbineId === turbine._id}
                          onClick={() => handleDelete(turbine)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition disabled:opacity-50"
                        >
                          {deletingTurbineId === turbine._id ? 'Removing...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTurbineId ? 'Edit Turbine Details' : 'Register New Turbine'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Turbine Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WTG-MUP-01"
                  value={formData.turbineCode}
                  onChange={(e) => setFormData({ ...formData, turbineCode: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Model Spec</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suzlon S120, Vestas V110"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Capacity (kW)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="FAULT">FAULT</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Engineer ID <span className="text-slate-400 font-normal">(Optional MongoDB ObjectId)</span>
                </label>
                <input
                  type="text"
                  placeholder="64dcba8e3a2b5e0012345678"
                  value={formData.assignedEngineerId}
                  onChange={(e) => setFormData({ ...formData, assignedEngineerId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingTurbineId ? 'Save Changes' : 'Create Turbine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerDashboard;