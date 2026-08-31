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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurbineId, setEditingTurbineId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTurbineId, setDeletingTurbineId] = useState(null);

  // Toast Notification State: { id, type: 'loading' | 'success' | 'error', message }
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

  // Modal Handlers
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

  // Form Submit Handler (Create & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const toastId = `mutation-${Date.now()}`;
    const actionLabel = editingTurbineId ? 'Updating turbine details' : 'Registering new turbine';
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
          ? `Turbine ${payload.turbineCode} updated successfully!` 
          : `Turbine ${payload.turbineCode} deployed to grid!`
      );
    } else {
      const errMsg = res.message || 'Operation failed. Please try again.';
      setFormError(errMsg);
      showToast(toastId, 'error', errMsg);
    }
  };

  // Delete Action Handler
  const handleDelete = async (turbine) => {
    if (window.confirm(`Delete turbine unit ${turbine.turbineCode}? This cannot be undone.`)) {
      const toastId = `delete-${turbine._id}`;
      setDeletingTurbineId(turbine._id);
      showToast(toastId, 'loading', `Decommissioning ${turbine.turbineCode}...`, false);

      const res = await deleteTurbine(turbine._id);
      setDeletingTurbineId(null);

      if (res.success) {
        showToast(toastId, 'success', `Turbine ${turbine.turbineCode} removed from farm.`);
      } else {
        showToast(toastId, 'error', res.message || 'Failed to delete turbine.');
      }
    }
  };

  // Initial Full Screen High-Tech Loading View
  if (isLoading && turbines.length === 0) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none -bottom-10" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated SVG Turbine Loader */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-500/40 animate-[spin_6s_linear_infinite]" />
            <svg
              className="w-16 h-16 text-cyan-400 animate-[spin_1.8s_linear_infinite]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="2.5" />
              <path d="M12 2C12 2 13.5 6 12 12C10.5 6 12 2 12 2Z" />
              <path d="M20.66 17C20.66 17 16.5 16.5 12 12C16.5 7.5 20.66 17 20.66 17Z" />
              <path d="M3.34 17C3.34 17 7.5 16.5 12 12C7.5 7.5 3.34 17 3.34 17Z" />
            </svg>
          </div>

          <div className="text-center mt-6 space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-wider uppercase">
              Connecting Wind Farm SCADA
            </h3>
            <p className="text-xs text-cyan-400/80 font-mono tracking-widest uppercase animate-pulse">
              Syncing Telemetry & Turbine Grid...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Connection Failure State
  if (error && turbines.length === 0) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-red-500/30 text-red-400 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="font-semibold text-lg text-white mb-1">SCADA Connection Lost</p>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button 
            onClick={fetchTurbines}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition shadow-lg shadow-red-600/30"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const isFarmActive = farmDetails?.status?.toUpperCase() === 'ACTIVE';
  const activeTurbinesCount = turbines.filter(
    (t) => t.status?.toUpperCase() === 'ACTIVE' || t.status?.toUpperCase() === 'OPERATIONAL'
  ).length;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      
      {/* Toast Notification Container (Fixed Top Right) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none max-w-md w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 ${
              toast.type === 'loading'
                ? 'bg-slate-900/90 border-cyan-500/40 text-cyan-300'
                : toast.type === 'success'
                ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/90 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'loading' && (
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {toast.type === 'success' && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <span className="text-xs font-semibold text-slate-200 tracking-wide">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        
        {/* Wind Farm Profile Header Card */}
        {farmDetails && (
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                      isFarmActive
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    ● {farmDetails.status || 'ACTIVE'}
                  </span>
                  
                  {farmDetails.district && (
                    <span className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700 font-medium">
                      {farmDetails.district}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  {farmDetails.farmName}
                </h1>

                <p className="text-slate-400 text-sm flex items-start sm:items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{farmDetails.address || 'Location Address Not Set'}</span>
                </p>
              </div>

              {/* Grid Connection Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/70 border border-slate-800/90 p-4 rounded-xl w-full lg:w-auto shrink-0">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Coordinates</p>
                  <p className="text-sm font-mono text-slate-200">
                    {farmDetails.location?.coordinates && farmDetails.location.coordinates.length === 2
                      ? `${farmDetails.location.coordinates[1]}°, ${farmDetails.location.coordinates[0]}°`
                      : '77.53°, 8.25°'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Substation</p>
                  <p className="text-sm font-medium text-slate-200">
                    {farmDetails.substationName || 'Kayathar 230kV SS'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Feeder Code</p>
                  <p className="text-sm font-mono text-cyan-400 font-bold">
                    {farmDetails.feederCode || 'FDR-33KV-01'}
                  </p>
                </div>
              </div>
            </div>

            {/* Farm Stat Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Total Capacity</p>
                <p className="text-2xl font-black text-cyan-400 mt-1">
                  {farmDetails.totalCapacity ?? '45.5'} <span className="text-xs font-normal text-slate-400">MW</span>
                </p>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Total Turbines</p>
                <p className="text-2xl font-black text-white mt-1">{turbines.length}</p>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Active Units</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{activeTurbinesCount}</p>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Commission Date</p>
                <p className="text-sm font-medium text-slate-200 mt-2">
                  {farmDetails.createdAt ? new Date(farmDetails.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Aug 30, 2026'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Turbines Grid Header & Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Turbine Units
              <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">
                {turbines.length}
              </span>
            </h2>

            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-sm transition shadow-lg shadow-cyan-600/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Turbine
            </button>
          </div>

          {/* Turbines Grid View */}
          {turbines.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              <p className="text-base font-medium">No turbines found in this wind farm.</p>
              <p className="text-xs text-slate-500 mt-1">Click "Add New Turbine" above to register your first unit.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {turbines.map((turbine) => {
                const isUnitActive =
                  turbine.status?.toUpperCase() === 'ACTIVE' || turbine.status?.toUpperCase() === 'OPERATIONAL';

                return (
                  <div 
                    key={turbine._id} 
                    className="bg-slate-900 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-base text-white">
                            {turbine.turbineCode || 'Turbine'}
                          </h3>
                          <p className="text-xs text-slate-400">{turbine.model || 'Standard'}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                          isUnitActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {turbine.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/60 mb-3">
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block font-semibold">Rated Cap.</span>
                          <span className="text-sm font-bold text-slate-200">
                            {turbine.capacity ? `${turbine.capacity} kW` : '1500 kW'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-500 block font-semibold">Health</span>
                          <span className={`text-sm font-bold ${isUnitActive ? 'text-teal-400' : 'text-amber-400'}`}>
                            {isUnitActive ? '98.5%' : 'Alert'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2.5 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="truncate">
                          {turbine.assignedEngineerId?.name || 'Unassigned'}
                        </span>
                        {turbine.assignedEngineerId?.email && (
                          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[100px]">
                            {turbine.assignedEngineerId.email}
                          </span>
                        )}
                      </div>

                      {/* Edit / Delete Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(turbine)}
                          className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold transition border border-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          disabled={deletingTurbineId === turbine._id}
                          onClick={() => handleDelete(turbine)}
                          className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold transition border border-rose-500/30 disabled:opacity-50 flex items-center justify-center min-w-[58px]"
                        >
                          {deletingTurbineId === turbine._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Turbine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingTurbineId ? 'Edit Turbine Details' : 'Add New Turbine'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Turbine Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WTG-MUP-01"
                  value={formData.turbineCode}
                  onChange={(e) => setFormData({ ...formData, turbineCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suzlon S120, Vestas V110"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Capacity (kW)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="FAULT">FAULT</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Assigned Engineer ID <span className="text-slate-500 lowercase">(optional MongoDB ID)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 64dcba8e3a2b5e0012345678"
                  value={formData.assignedEngineerId}
                  onChange={(e) => setFormData({ ...formData, assignedEngineerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isSubmitting ? 'Processing...' : editingTurbineId ? 'Update Turbine' : 'Create Turbine'}</span>
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
