import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertAPI, panicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AlertCard from '../components/AlertCard/AlertCard';
import SOSButton from '../components/SOSButton/SOSButton';
import { getSocket } from '../services/socket';

const StatCard = ({ icon, value, label, color, bg }) => (
  <div style={{
    background: 'white',
    border: `1px solid ${color}33`,
    borderLeft: `4px solid ${color}`,
    borderRadius: 12, padding: '20px',
    textAlign: 'center', flex: 1, minWidth: 120,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }}>
    <div style={{ fontSize: 32, marginBottom: 4 }}>{icon}</div>
    <div style={{ color, fontWeight: 800, fontSize: 28 }}>{value}</div>
    <div style={{ color: '#6c757d', fontSize: 12 }}>{label}</div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [myPanics, setMyPanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    loadData();
    const socket = getSocket();
    if (socket) {
      socket.on('newAlert', ({ alert }) => setAlerts(prev => [alert, ...prev]));
      socket.on('alertDeleted', ({ alertId }) => setAlerts(prev => prev.filter(a => a._id !== alertId)));
      socket.on('panicStatusUpdate', (data) => {
        setMyPanics(prev => prev.map(p =>
          p._id === data.panicId ? { ...p, status: data.status } : p
        ));
      });
    }
    return () => {
      if (socket) {
        socket.off('newAlert');
        socket.off('alertDeleted');
        socket.off('panicStatusUpdate');
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const [alertRes, panicRes] = await Promise.all([
        alertAPI.getAlerts({ limit: 50 }),
        panicAPI.getMyPanics(),
      ]);
      setAlerts(alertRes.data.alerts || []);
      setMyPanics(panicRes.data.requests || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'Critical' && a.status === 'Active').length;
  const activeCount = alerts.filter(a => a.status === 'Active').length;
  const pendingPanic = myPanics.filter(p => p.status !== 'Resolved').length;

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    background: activeTab === tab ? '#e94560' : 'white',
    border: `1px solid ${activeTab === tab ? '#e94560' : '#dee2e6'}`,
    borderRadius: 8, color: activeTab === tab ? 'white' : '#495057',
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
  });

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h2 style={{ color: '#1a1a2e', fontWeight: 800, marginBottom: 4 }}>
              Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p style={{ color: '#6c757d', marginBottom: 0 }}>
              Campus Emergency Alert System
            </p>
          </div>
          <SOSButton />
        </div>

        {/* Stats */}
        <div className="d-flex gap-3 flex-wrap mb-4">
          <StatCard icon="🚨" value={activeCount} label="Active Alerts" color="#e94560" />
          <StatCard icon="🔴" value={criticalCount} label="Critical" color="#dc3545" />
          <StatCard icon="🆘" value={pendingPanic} label="My Open Panics" color="#fd7e14" />
          <StatCard icon="📋" value={alerts.length} label="Total Alerts" color="#0d6efd" />
        </div>

        {/* Quick Actions */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <Link to="/send-alert" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', border: '1px solid #dee2e6',
                borderRadius: 12, padding: '20px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#e94560';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(233,69,96,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📢</div>
                <div style={{ color: '#1a1a2e', fontWeight: 700, fontSize: 14 }}>Send Alert</div>
              </div>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link to="/panic" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', border: '1px solid #f5c6cb',
                borderRadius: 12, padding: '20px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(220,53,69,0.1)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(220,53,69,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(220,53,69,0.1)';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🆘</div>
                <div style={{ color: '#dc3545', fontWeight: 700, fontSize: 14 }}>Panic Button</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          {[['alerts', '📢 Alerts'], ['panics', '🆘 My Panics']].map(([key, label]) => (
            <button key={key} style={tabStyle(key)} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" />
            <p style={{ color: '#6c757d', marginTop: 12 }}>Loading...</p>
          </div>
        ) : activeTab === 'alerts' ? (
          <div>
            {alerts.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p style={{ color: '#6c757d' }}>No active alerts. Campus is safe!</p>
              </div>
            ) : (
              alerts.map(alert => <AlertCard key={alert._id} alert={alert} />)
            )}
          </div>
        ) : (
          <div>
            {myPanics.length === 0 ? (
              <div className="text-center py-5">
                <p style={{ color: '#6c757d' }}>No panic requests submitted.</p>
              </div>
            ) : myPanics.map(panic => (
              <div key={panic._id} style={{
                background: 'white', border: '1px solid #dee2e6',
                borderRadius: 12, padding: 16, marginBottom: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div className="d-flex justify-content-between">
                  <span style={{ color: '#1a1a2e', fontWeight: 600 }}>{panic.description}</span>
                  <span className={`badge bg-${panic.status === 'Resolved' ? 'success' : panic.status === 'In Progress' ? 'warning' : 'danger'}`}>
                    {panic.status}
                  </span>
                </div>
                <small style={{ color: '#adb5bd' }}>
                  {new Date(panic.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;