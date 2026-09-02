import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';

const DISTRICTS = [
  'Kanyakumari',
  'Tirunelveli',
  'Coimbatore',
  'Tiruppur',
  'Dindigul',
  'Theni',
  'Tuticorin',
  'Other'
];

export default function AdminWindFarmManager() {
  const { farms, users, loading, error, fetchFarms, fetchUsers, createFarm, updateFarm } =
    useAdminStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarmId, setEditingFarmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    longitude: '',
    latitude: '',
    address: '',
    district: 'Kanyakumari',
    totalCapacity: '',
    status: 'ACTIVE',
    substationName: '',
    feederCode: '',
    managerId: '',
    engineerIds: []
  });

  useEffect(() => {
    fetchFarms();
    fetchUsers();
  }, [fetchFarms, fetchUsers]);

  const managers = users.filter((u) => u.role === 'windFarmManager');
  const engineers = users.filter((u) => u.role === 'Engineer');

  const openCreateModal = () => {
    setEditingFarmId(null);
    setFormData({
      name: '',
      longitude: '',
      latitude: '',
      address: '',
      district: 'Kanyakumari',
      totalCapacity: '',
      status: 'ACTIVE',
      substationName: '',
      feederCode: '',
      managerId: '',
      engineerIds: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (farm) => {
    setEditingFarmId(farm._id);
    setFormData({
      name: farm.name,
      longitude: farm.location?.coordinates?.[0] || '',
      latitude: farm.location?.coordinates?.[1] || '',
      address: farm.address,
      district: farm.district,
      totalCapacity: farm.totalCapacity,
      status: farm.status,
      substationName: farm.substationName || '',
      feederCode: farm.feederCode || '',
      managerId: farm.manager?._id || '',
      engineerIds: farm.engineers?.map((e) => e._id) || []
    });
    setIsModalOpen(true);
  };

  const handleEngineerToggle = (engId) => {
    setFormData((prev) => {
      const exists = prev.engineerIds.includes(engId);
      return {
        ...prev,
        engineerIds: exists
          ? prev.engineerIds.filter((id) => id !== engId)
          : [...prev.engineerIds, engId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (editingFarmId) {
      res = await updateFarm(editingFarmId, formData);
    } else {
      res = await createFarm(formData);
    }
    if (res.success) {
      setIsModalOpen(false);
    }
  };

  // Helper check if selected manager is assigned to another farm
  const selectedManagerObj = managers.find((m) => m._id === formData.managerId);
  const isManagerConflict =
    selectedManagerObj?.windFarmId &&
    selectedManagerObj.windFarmId._id !== editingFarmId;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Wind Farm Management Dashboard</h2>
        <button
          onClick={openCreateModal}
          style={{ padding: '0.6rem 1.2rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Add New Wind Farm
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading data...</p>}

      {/* Farm Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {farms.map((farm) => (
          <div key={farm._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{farm.name}</h3>
              <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: farm.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2' }}>
                {farm.status}
              </span>
            </div>
            <p style={{ margin: '4px 0', color: '#64748b' }}>📍 {farm.district} ({farm.address})</p>
            <p style={{ margin: '4px 0' }}>⚡ <strong>Capacity:</strong> {farm.totalCapacity} MW</p>
            <p style={{ margin: '4px 0' }}>🏢 <strong>Substation:</strong> {farm.substationName} ({farm.feederCode})</p>
            
            <div style={{ margin: '10px 0', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              <strong>Manager:</strong> {farm.manager ? `${farm.manager.name} (${farm.manager.email})` : <span style={{ color: '#94a3b8' }}>Unassigned</span>}
            </div>

            <div>
              <strong>Engineers ({farm.engineers?.length || 0}):</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {farm.engineers && farm.engineers.length > 0 ? (
                  farm.engineers.map((eng) => (
                    <span key={eng._id} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {eng.name}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No engineers assigned</span>
                )}
              </div>
            </div>

            <button
              onClick={() => openEditModal(farm)}
              style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
            >
              Edit Farm & Staff
            </button>
          </div>
        ))}
      </div>

      {/* Modal for Create / Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h3>{editingFarmId ? 'Edit Wind Farm' : 'Create Wind Farm'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '0.8rem' }}>
                <label>Farm Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label>Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  <label>District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Capacity (MW)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.totalCapacity}
                    onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Manager Assignment */}
              <div style={{ marginBottom: '0.8rem' }}>
                <label>Assign Manager (1 Max)</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="">-- No Manager Assigned --</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} {m.windFarmId ? `(Assigned: ${m.windFarmId.name})` : '(Available)'}
                    </option>
                  ))}
                </select>

                {/* Manager Conflict Warning */}
                {isManagerConflict && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '6px 10px', marginTop: '6px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    ⚠️ Warning: <strong>{selectedManagerObj.name}</strong> is already assigned to <strong>{selectedManagerObj.windFarmId.name}</strong>. Saving will reassign them to this farm.
                  </div>
                )}
              </div>

              {/* Engineer Multi-Select Assignment */}
              <div style={{ marginBottom: '0.8rem' }}>
                <label>Assign Engineers</label>
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
                  {engineers.map((eng) => {
                    const isChecked = formData.engineerIds.includes(eng._id);
                    const isAssignedElsewhere = eng.windFarmId && eng.windFarmId._id !== editingFarmId;

                    return (
                      <div key={eng._id} style={{ marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleEngineerToggle(eng._id)}
                          />{' '}
                          {eng.name}
                          {isAssignedElsewhere && (
                            <span style={{ color: '#d97706', fontSize: '0.75rem', marginLeft: '6px' }}>
                              (Assigned to {eng.windFarmId.name})
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.2rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {loading ? 'Saving...' : 'Save Wind Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}