import React from 'react';

const severityConfig = {
  Critical: { color: '#dc3545', bg: 'rgba(220,53,69,0.08)', icon: '🔴', badge: 'danger' },
  Medium: { color: '#fd7e14', bg: 'rgba(253,126,20,0.08)', icon: '🟠', badge: 'warning' },
  Low: { color: '#198754', bg: 'rgba(25,135,84,0.08)', icon: '🟢', badge: 'success' },
};

const alertTypeIcons = {
  'Fire': '🔥', 'Security Threat': '🛡️', 'Power Outage': '⚡',
  'Medical Emergency': '🏥', 'Campus Hazard': '⚠️',
  'Weather Emergency': '🌩️', 'Other': '📢',
};

const AlertCard = ({ alert, onDelete, isAdmin }) => {
  const config = severityConfig[alert.severity] || severityConfig.Critical;
  const typeIcon = alertTypeIcons[alert.alertType] || '📢';

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${config.color}33`,
      borderLeft: `4px solid ${config.color}`,
      borderRadius: 12, padding: '16px 20px', marginBottom: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = `0 4px 16px ${config.color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: 24 }}>{typeIcon}</span>
          <div>
            <h6 style={{ color: '#1a1a2e', margin: 0, fontWeight: 700 }}>{alert.alertType}</h6>
            <small style={{ color: '#6c757d' }}>📍 {alert.location}</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className={`badge bg-${config.badge}`} style={{ fontSize: 11, fontWeight: 700 }}>
            {config.icon} {alert.severity}
          </span>
          <span className={`badge ${alert.status === 'Active' ? 'bg-danger' : 'bg-secondary'}`}
            style={{ fontSize: 11 }}>
            {alert.status}
          </span>
          {isAdmin && alert.status === 'Active' && (
            <button onClick={() => onDelete(alert._id)} className="btn btn-sm" style={{
              background: 'rgba(220,53,69,0.1)', color: '#dc3545',
              border: '1px solid rgba(220,53,69,0.3)',
              borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600,
            }}>
              🗑️ False Alarm
            </button>
          )}
        </div>
      </div>

      <p style={{ color: '#495057', margin: '12px 0 8px', fontSize: 14, lineHeight: 1.5 }}>
        {alert.description}
      </p>

      <div className="d-flex justify-content-between align-items-center">
        <small style={{ color: '#adb5bd', fontSize: 12 }}>
          👤 {alert.senderId?.name || 'Unknown'} • {alert.senderRole}
        </small>
        <small style={{ color: '#adb5bd', fontSize: 12 }}>
          🕐 {timeAgo(alert.createdAt)}
        </small>
      </div>
    </div>
  );
};

export default AlertCard;