import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ALERT_TYPES = ['Fire', 'Security Threat', 'Power Outage', 'Medical Emergency', 'Campus Hazard', 'Weather Emergency', 'Other'];
const SEVERITIES = [
  { value: 'Low', color: '#198754', icon: '🟢', desc: 'Minor issue' },
  { value: 'Medium', color: '#fd7e14', icon: '🟠', desc: 'Caution required' },
  { value: 'Critical', color: '#dc3545', icon: '🔴', desc: 'Immediate danger' },
];
const alertTypeIcons = {
  'Fire': '🔥', 'Security Threat': '🛡️', 'Power Outage': '⚡',
  'Medical Emergency': '🏥', 'Campus Hazard': '⚠️',
  'Weather Emergency': '🌩️', 'Other': '📢',
};

const SendAlert = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ alertType: 'Fire', location: '', description: '', severity: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location.trim() || !form.description.trim()) {
      return setError('Location and description are required');
    }
    setLoading(true);
    setError('');
    try {
      await alertAPI.createAlert(form);
      setSuccess(true);
      setTimeout(() => {
        navigate(user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/student');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#f8f9fa',
    border: '1px solid #dee2e6', borderRadius: 10,
    padding: '12px 16px', color: '#1a1a2e', fontSize: 15, outline: 'none',
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f0f2f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="text-center">
          <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
          <h3 style={{ color: '#1a1a2e', fontWeight: 800 }}>Alert Sent!</h3>
          <p style={{ color: '#6c757d' }}>All campus users are being notified.</p>
          <p style={{ color: '#adb5bd', fontSize: 13 }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <div className="text-center mb-4">
          <div style={{ fontSize: 52, marginBottom: 8 }}>📢</div>
          <h2 style={{ color: '#1a1a2e', fontWeight: 800 }}>Send Campus Alert</h2>
          <p style={{ color: '#6c757d' }}>This will notify all campus users immediately</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 20, padding: '32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef',
        }}>
          {error && (
            <div className="alert alert-danger py-2 mb-3" style={{ borderRadius: 10, fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Alert Type */}
            <div className="mb-4">
              <label style={{ color: '#495057', fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'block' }}>
                Alert Type
              </label>
              <div className="d-flex flex-wrap gap-2">
                {ALERT_TYPES.map(type => (
                  <button key={type} type="button"
                    onClick={() => setForm(f => ({ ...f, alertType: type }))}
                    style={{
                      padding: '8px 16px',
                      background: form.alertType === type ? 'rgba(233,69,96,0.1)' : '#f8f9fa',
                      border: `1px solid ${form.alertType === type ? '#e94560' : '#dee2e6'}`,
                      borderRadius: 20, color: form.alertType === type ? '#e94560' : '#495057',
                      cursor: 'pointer', fontSize: 13,
                      fontWeight: form.alertType === type ? 700 : 400,
                    }}>
                    {alertTypeIcons[type]} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="mb-4">
              <label style={{ color: '#495057', fontSize: 13, fontWeight: 600, marginBottom: 10, display: 'block' }}>
                Severity Level
              </label>
              <div className="d-flex gap-3">
                {SEVERITIES.map(({ value, color, icon, desc }) => (
                  <div key={value} onClick={() => setForm(f => ({ ...f, severity: value }))}
                    style={{
                      flex: 1, padding: '12px',
                      background: form.severity === value ? `${color}11` : '#f8f9fa',
                      border: `2px solid ${form.severity === value ? color : '#dee2e6'}`,
                      borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    }}>
                    <div style={{ fontSize: 24 }}>{icon}</div>
                    <div style={{ color: form.severity === value ? color : '#495057', fontWeight: 700, fontSize: 14 }}>
                      {value}
                    </div>
                    <div style={{ color: '#adb5bd', fontSize: 11, marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mb-3">
              <label style={{ color: '#495057', fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                📍 Location
              </label>
              <input type="text" required value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g., Block A, Lab Building, Main Gate..."
                style={inputStyle} />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label style={{ color: '#495057', fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                📋 Description
              </label>
              <textarea required rows={4} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the emergency situation in detail..."
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Buttons */}
            <div className="d-flex gap-3">
              <button type="button" onClick={() => navigate(-1)} style={{
                flex: 1, background: '#f8f9fa',
                border: '1px solid #dee2e6', borderRadius: 10,
                padding: 14, color: '#495057', fontWeight: 600, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} style={{
                flex: 2,
                background: form.severity === 'Critical'
                  ? 'linear-gradient(135deg, #dc3545, #8b0000)'
                  : form.severity === 'Medium'
                  ? 'linear-gradient(135deg, #fd7e14, #a0490d)'
                  : 'linear-gradient(135deg, #198754, #0d4e31)',
                border: 'none', borderRadius: 10, padding: 14,
                color: 'white', fontSize: 16, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                {loading ? '⌛ Sending...' : `🚨 Send ${form.severity} Alert`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendAlert;