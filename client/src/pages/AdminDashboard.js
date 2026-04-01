import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { alertAPI, panicAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AlertCard from '../components/AlertCard/AlertCard';
import { getSocket } from '../services/socket';

const statusColors = { Pending: 'danger', 'In Progress': 'warning', Resolved: 'success' };

const AdminDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [panics, setPanics] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');
  const [panicFilter, setPanicFilter] = useState('');
  const [resolveNote, setResolveNote] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [alertRes, panicRes, userRes] = await Promise.all([
        alertAPI.getAlerts({ limit: 100 }),
        panicAPI.getPanicRequests({ limit: 100 }),
        userAPI.getUsers(),
      ]);
      setAlerts(alertRes.data.alerts || []);
      setPanics(panicRes.data.requests || []);
      setUsers(userRes.data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadData();
    const socket = getSocket();
    if (socket) {
      socket.on('newAlert', ({ alert }) => setAlerts(p => [alert, ...p]));
      socket.on('alertDeleted', ({ alertId }) => setAlerts(p => p.filter(a => a._id !== alertId)));
      socket.on('newPanicRequest', ({ panic }) => {
        setPanics(p => [panic, ...p]);
        showToast(`🆘 New panic from ${panic.userId?.name || 'student'}!`, 'danger');
      });
      socket.on('panicUpdated', (updated) => {
        setPanics(p => p.map(r => r._id === updated._id ? updated : r));
      });
      socket.on('panicDeleted', ({ panicId }) => {
        setPanics(p => p.filter(r => r._id !== panicId));
      });
    }
    return () => {
      if (socket) {
        socket.off('newAlert'); socket.off('alertDeleted');
        socket.off('newPanicRequest'); socket.off('panicUpdated');
        socket.off('panicDeleted');
      }
    };
  }, [loadData]);

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Mark this alert as false alarm?')) return;
    try {
      await alertAPI.deleteAlert(id);
      setAlerts(p => p.filter(a => a._id !== id));
      showToast('Alert removed');
    } catch { showToast('Failed to delete alert', 'danger'); }
  };

  const handleUpdatePanic = async (id, status) => {
    try {
      await panicAPI.updatePanicStatus(id, { status, notes: resolveNote[id] || '' });
      setPanics(p => p.map(r => r._id === id ? { ...r, status } : r));
      showToast(`Status updated to ${status}`);
    } catch { showToast('Failed to update', 'danger'); }
  };

  const handleDeletePanic = async (id) => {
    if (!window.confirm('Delete this panic request permanently?')) return;
    try {
      await panicAPI.deletePanic(id);
      setPanics(p => p.filter(r => r._id !== id));
      showToast('Panic request deleted');
    } catch { showToast('Failed to delete panic', 'danger'); }
  };

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    background: activeTab === tab ? '#e94560' : 'white',
    border: `1px solid ${activeTab === tab ? '#e94560' : '#dee2e6'}`,
    borderRadius: 8, color: activeTab === tab ? 'white' : '#495057',
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
  });

  const filteredPanics = panicFilter ? panics.filter(p => p.status === panicFilter) : panics;
  const pendingPanics = panics.filter(p => p.status === 'Pending').length;

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {toast && (
          <div style={{
            position: 'fixed', top: 80, right: 20, zIndex: 9999,
            background: toast.type === 'danger' ? '#dc3545' : '#198754',
            color: 'white', padding: '12px 20px', borderRadius: 10,
            fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            {toast.msg}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 style={{ color: '#1a1a2e', fontWeight: 800 }}>🛡️ Admin Dashboard</h2>
            <p style={{ color: '#6c757d', marginBottom: 0 }}>{user?.name} — Full Control</p>
          </div>
          <Link to="/send-alert" className="btn" style={{
            background: '#e94560', color: 'white',
            borderRadius: 10, fontWeight: 700, padding: '10px 24px',
            boxShadow: '0 4px 12px rgba(233,69,96,0.3)',
          }}>
            📢 Campus Alert
          </Link>
        </div>

        <div className="row g-3 mb-4">
          {[
            { icon: '🚨', val: alerts.filter(a => a.status === 'Active').length, label: 'Active Alerts', color: '#e94560' },
            { icon: '🔴', val: alerts.filter(a => a.severity === 'Critical').length, label: 'Critical', color: '#dc3545' },
            { icon: '🆘', val: pendingPanics, label: 'Pending Panics', color: '#fd7e14' },
            { icon: '👥', val: users.length, label: 'Total Users', color: '#0d6efd' },
            { icon: '✅', val: panics.filter(p => p.status === 'Resolved').length, label: 'Resolved', color: '#198754' },
          ].map(({ icon, val, label, color }) => (
            <div className="col-6 col-xl" key={label}>
              <div style={{
                background: 'white', border: `1px solid ${color}22`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 12, padding: '16px', textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 26 }}>{icon}</div>
                <div style={{ color, fontWeight: 800, fontSize: 24 }}>{val}</div>
                <div style={{ color: '#6c757d', fontSize: 11 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[
            ['alerts', '📢 Alerts'],
            ['panics', `🆘 Panics ${pendingPanics > 0 ? `(${pendingPanics})` : ''}`],
            ['users', '👥 Users'],
          ].map(([key, label]) => (
            <button key={key} style={tabStyle(key)} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" />
          </div>
        ) : (
          <>
            {activeTab === 'alerts' && (
              <div>
                {alerts.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: 48 }}>✅</div>
                    <p style={{ color: '#6c757d' }}>No alerts</p>
                  </div>
                ) : alerts.map(alert => (
                  <AlertCard key={alert._id} alert={alert} isAdmin={true} onDelete={handleDeleteAlert} />
                ))}
              </div>
            )}

            {activeTab === 'panics' && (
              <div>
                <div className="d-flex gap-2 mb-3 flex-wrap">
                  {['', 'Pending', 'In Progress', 'Resolved'].map(s => (
                    <button key={s || 'all'} onClick={() => setPanicFilter(s)} style={{
                      padding: '6px 14px', fontSize: 12, cursor: 'pointer',
                      background: panicFilter === s ? '#e94560' : 'white',
                      border: `1px solid ${panicFilter === s ? '#e94560' : '#dee2e6'}`,
                      borderRadius: 8, color: panicFilter === s ? 'white' : '#495057',
                      fontWeight: 600,
                    }}>
                      {s || 'All'} ({s ? panics.filter(p => p.status === s).length : panics.length})
                    </button>
                  ))}
                </div>

                {filteredPanics.length === 0 ? (
                  <div className="text-center py-5">
                    <p style={{ color: '#6c757d' }}>No panic requests</p>
                  </div>
                ) : filteredPanics.map(panic => (
                  <div key={panic._id} style={{
                    background: 'white',
                    border: `1px solid ${panic.status === 'Pending' ? '#f5c6cb' : '#dee2e6'}`,
                    borderLeft: `4px solid ${panic.status === 'Pending' ? '#dc3545' : panic.status === 'In Progress' ? '#fd7e14' : '#198754'}`,
                    borderRadius: 12, padding: '16px 20px', marginBottom: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span style={{ color: '#1a1a2e', fontWeight: 700 }}>
                            🆘 {panic.userId?.name || 'Unknown Student'}
                          </span>
                          <span className={`badge bg-${statusColors[panic.status]}`}>
                            {panic.status}
                          </span>
                        </div>
                        <p style={{ color: '#495057', margin: '4px 0', fontSize: 14 }}>
                          {panic.description}
                        </p>
                        <div className="d-flex gap-3 flex-wrap">
                          <small style={{ color: '#6c757d' }}>📧 {panic.userId?.email}</small>
                          <small style={{ color: '#6c757d' }}>📱 {panic.userId?.phone || 'N/A'}</small>
                          {panic.latitude && (
                            <a href={`https://maps.google.com/?q=${panic.latitude},${panic.longitude}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ color: '#0d6efd', fontSize: 12 }}>
                              📍 View Location
                            </a>
                          )}
                        </div>
                        <small style={{ color: '#adb5bd' }}>
                          {new Date(panic.createdAt).toLocaleString()}
                        </small>
                      </div>

                      <div className="d-flex flex-column gap-2" style={{ minWidth: 180 }}>
                        {panic.status !== 'Resolved' && (
                          <>
                            <input type="text" placeholder="Add note (optional)"
                              value={resolveNote[panic._id] || ''}
                              onChange={e => setResolveNote(p => ({ ...p, [panic._id]: e.target.value }))}
                              style={{
                                background: '#f8f9fa', border: '1px solid #dee2e6',
                                borderRadius: 8, padding: '6px 10px',
                                color: '#1a1a2e', fontSize: 12,
                              }} />
                            <div className="d-flex gap-2">
                              {panic.status === 'Pending' && (
                                <button onClick={() => handleUpdatePanic(panic._id, 'In Progress')}
                                  className="btn btn-sm btn-warning"
                                  style={{ borderRadius: 6, fontSize: 12, flex: 1 }}>
                                  In Progress
                                </button>
                              )}
                              <button onClick={() => handleUpdatePanic(panic._id, 'Resolved')}
                                className="btn btn-sm btn-success"
                                style={{ borderRadius: 6, fontSize: 12, flex: 1 }}>
                                ✅ Resolve
                              </button>
                            </div>
                          </>
                        )}
                        <button onClick={() => handleDeletePanic(panic._id)}
                          className="btn btn-sm btn-danger"
                          style={{ borderRadius: 6, fontSize: 12, width: '100%' }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div style={{
                background: 'white', borderRadius: 12,
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>
                <table className="table table-hover mb-0">
                  <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <tr>
                      {['Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ color: '#495057', fontSize: 12, fontWeight: 700, padding: '12px 16px' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #e94560, #0f3460)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: 700, fontSize: 13,
                            }}>
                              {u.name?.charAt(0)}
                            </div>
                            <span style={{ color: '#1a1a2e', fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#6c757d', fontSize: 13, padding: '12px 16px' }}>{u.email}</td>
                        <td style={{ color: '#6c757d', fontSize: 13, padding: '12px 16px' }}>{u.phone || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge bg-${u.role === 'admin' ? 'danger' : u.role === 'staff' ? 'warning' : 'primary'}`}
                            style={{ fontSize: 11 }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge bg-${u.isActive ? 'success' : 'secondary'}`} style={{ fontSize: 11 }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {u._id !== user?._id && (
                            <select defaultValue={u.role}
                              onChange={async (e) => {
                                try {
                                  await userAPI.updateRole(u._id, e.target.value);
                                  setUsers(p => p.map(usr => usr._id === u._id ? { ...usr, role: e.target.value } : usr));
                                  showToast('Role updated');
                                } catch { showToast('Failed', 'danger'); }
                              }}
                              style={{
                                background: '#f8f9fa', border: '1px solid #dee2e6',
                                borderRadius: 6, padding: '4px 8px',
                                color: '#495057', fontSize: 12, cursor: 'pointer',
                              }}>
                              {['student', 'staff', 'admin'].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;