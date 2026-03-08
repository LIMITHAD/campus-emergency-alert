import React, { useEffect, useState } from 'react';
import { useAlertContext } from '../../context/AlertContext';

const severityConfig = {
  Critical: { bg1: '#8b0000', bg2: '#3d0000', pulse: '#dc3545', label: 'CRITICAL' },
  Medium:   { bg1: '#7a4f00', bg2: '#3d2700', pulse: '#fd7e14', label: 'MEDIUM' },
  Low:      { bg1: '#1a5276', bg2: '#0a2840', pulse: '#0d6efd', label: 'LOW' },
};

const EmergencyOverlay = () => {
  const { activeEmergency, dismissEmergency } = useAlertContext();
  const [acknowledged, setAcknowledged] = useState(false);
  const [flash, setFlash] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeEmergency) return;
    setAcknowledged(false);
    setFlash(true);
    setElapsed(0);

    // Flash effect
    const flashInterval = setInterval(() => setFlash(f => !f), 500);
    // Elapsed timer
    const elapsedInterval = setInterval(() => setElapsed(e => e + 1), 1000);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      clearInterval(flashInterval);
      clearInterval(elapsedInterval);
      document.body.style.overflow = '';
    };
  }, [activeEmergency]);

  if (!activeEmergency) return null;

  const cfg = severityConfig[activeEmergency.severity] || severityConfig.Critical;

  const handleAcknowledge = () => {
    setAcknowledged(true);
    dismissEmergency();
  };

  const formatElapsed = (s) => {
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ${s % 60}s ago`;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 999999,
      background: flash
        ? `linear-gradient(135deg, ${cfg.bg1}, ${cfg.bg2})`
        : `linear-gradient(135deg, #111, #000)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s',
      padding: '20px',
      overflow: 'hidden',
    }}>

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${cfg.pulse}22 0%, transparent 70%)`,
        animation: 'glow-pulse 1s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Top severity banner */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: cfg.pulse,
        padding: '10px',
        textAlign: 'center',
        fontWeight: 900, fontSize: 14, letterSpacing: 4,
        color: 'white', textTransform: 'uppercase',
        animation: 'banner-flash 1s ease-in-out infinite',
      }}>
        ⚠️ {cfg.label} SEVERITY EMERGENCY ALERT ⚠️
      </div>

      {/* Main icon */}
      <div style={{
        width: 130, height: 130, borderRadius: '50%',
        border: `6px solid ${cfg.pulse}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, marginTop: 40,
        animation: 'ring-pulse 1s ease-out infinite',
        background: 'rgba(0,0,0,0.3)',
        boxShadow: `0 0 40px ${cfg.pulse}88`,
      }}>
        <span style={{ fontSize: 64 }}>🚨</span>
      </div>

      {/* Title */}
      <h1 style={{
        color: 'white',
        fontSize: 'clamp(24px, 5vw, 48px)',
        fontWeight: 900, textAlign: 'center',
        textTransform: 'uppercase', letterSpacing: 4,
        marginBottom: 4,
        textShadow: `0 0 30px ${cfg.pulse}, 0 0 60px ${cfg.pulse}88`,
      }}>
        🚨 EMERGENCY ALERT 🚨
      </h1>

      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontSize: 13 }}>
        Triggered {formatElapsed(elapsed)} · All users notified
      </p>

      {/* Alert info card */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        border: `2px solid ${cfg.pulse}`,
        borderRadius: 20, padding: '24px 36px',
        maxWidth: 560, width: '100%',
        boxShadow: `0 0 40px ${cfg.pulse}44`,
      }}>
        <div className="text-center mb-3">
          <span style={{
            background: cfg.pulse, color: 'white',
            padding: '5px 20px', borderRadius: 20,
            fontWeight: 800, fontSize: 13, letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            {activeEmergency.severity} SEVERITY
          </span>
        </div>

        {[
          ['🔥 Type', activeEmergency.alertType],
          ['📍 Location', activeEmergency.location],
          ['📋 Description', activeEmergency.description],
          ['👤 Reported by', activeEmergency.senderId?.name || 'Unknown'],
        ].map(([label, value]) => (
          <div key={label} style={{
            display: 'flex', gap: 16,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 0', alignItems: 'flex-start',
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 13,
              fontWeight: 700, minWidth: 120, flexShrink: 0,
            }}>{label}</span>
            <span style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Acknowledge button */}
      {!acknowledged ? (
        <button onClick={handleAcknowledge} style={{
          marginTop: 28,
          padding: '16px 56px',
          fontSize: 18, fontWeight: 800,
          background: 'white', color: cfg.bg1,
          border: 'none', borderRadius: 50,
          cursor: 'pointer',
          boxShadow: `0 0 40px ${cfg.pulse}, 0 8px 32px rgba(0,0,0,0.4)`,
          textTransform: 'uppercase', letterSpacing: 3,
          animation: 'btn-pulse 1.5s ease-in-out infinite',
          transition: 'transform 0.1s',
        }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          ✅ I ACKNOWLEDGE THIS ALERT
        </button>
      ) : (
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>✅</div>
          <p style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>
            Acknowledged. Please follow safety procedures!
          </p>
        </div>
      )}

      <p style={{ color: 'rgba(255,255,255,0.35)', marginTop: 16, fontSize: 12, textAlign: 'center' }}>
        🔊 Alarm will continue until you acknowledge · In real emergency call <strong style={{ color: 'white' }}>112</strong>
      </p>

      <style>{`
        @keyframes ring-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${cfg.pulse}88; }
          70% { transform: scale(1.02); box-shadow: 0 0 0 25px ${cfg.pulse}00; }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 ${cfg.pulse}00; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes banner-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes btn-pulse {
          0%, 100% { box-shadow: 0 0 40px ${cfg.pulse}, 0 8px 32px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 60px ${cfg.pulse}, 0 8px 48px rgba(0,0,0,0.5); }
        }
      `}</style>
    </div>
  );
};

export default EmergencyOverlay;