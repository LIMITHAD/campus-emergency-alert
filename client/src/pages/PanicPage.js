import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { panicAPI } from '../services/api';

const PANIC_TYPES = [
  { value: 'Harassment', icon: '😟', desc: 'Verbal/physical harassment' },
  { value: 'Medical Emergency', icon: '🏥', desc: 'Injury or medical crisis' },
  { value: 'Personal Danger', icon: '⚠️', desc: 'Feeling unsafe or threatened' },
  { value: 'Stalking/Following', icon: '👁️', desc: 'Someone following you' },
  { value: 'Other', icon: '🆘', desc: 'Other emergency' },
];

const PanicPage = () => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setLocError('Location unavailable — GPS will not be included')
      );
    } else {
      setLocError('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    if (step !== 3) return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); handleSend(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const handleSend = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await panicAPI.sendPanic({
        description: `${selected}: ${description}`,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setStep(4);
    }
  };

  if (step === 4) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f0f2f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: '40px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef', maxWidth: 420, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#1a1a2e', fontWeight: 800, marginBottom: 8 }}>Help Is Coming!</h2>
          <p style={{ color: '#6c757d', marginBottom: 8 }}>
            Your panic request has been sent to campus security and admins.
          </p>
          {location && (
            <p style={{ color: '#198754', fontSize: 14 }}>
              📍 Your location has been shared with responders
            </p>
          )}
          <div style={{
            background: 'rgba(25,135,84,0.08)', border: '1px solid rgba(25,135,84,0.2)',
            borderRadius: 12, padding: '16px 20px', marginTop: 16, marginBottom: 24,
          }}>
            <p style={{ color: '#495057', margin: 0, fontSize: 14 }}>
              💡 <strong>Stay calm.</strong> Move to a safe location if possible.
              Keep your phone with you.
            </p>
          </div>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <a href="tel:911" className="btn btn-danger"
              style={{ borderRadius: 10, fontWeight: 700, padding: '10px 24px' }}>
              📞 Call 911
            </a>
            <button onClick={() => navigate('/student')} className="btn" style={{
              background: '#f8f9fa', border: '1px solid #dee2e6',
              borderRadius: 10, color: '#495057', fontWeight: 600, padding: '10px 24px',
            }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3 — countdown keeps red background for urgency
  if (step === 3) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8b0000, #dc3545)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🆘</div>
          <h2 style={{ color: 'white', fontWeight: 900, marginBottom: 8 }}>⚠️ SENDING ALERT</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>
            Sending in <span style={{ fontSize: 48, fontWeight: 900, display: 'block' }}>{countdown}</span> seconds
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.2)', borderRadius: 12,
            padding: '16px 20px', marginBottom: 24,
          }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: 14 }}>
              <strong>{selected}</strong> — {description || 'No additional details'}
            </p>
          </div>
          <button onClick={() => { setStep(2); setCountdown(5); }} style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.6)',
            borderRadius: 12, padding: '14px 40px',
            color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 16,
          }}>✕ CANCEL</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>

        <div className="text-center mb-4">
          <div style={{ fontSize: 56 }}>🆘</div>
          <h2 style={{ color: '#1a1a2e', fontWeight: 900 }}>
            {step === 1 ? 'What is happening?' : 'Add more details'}
          </h2>
          {locError && (
            <small style={{ color: '#fd7e14' }}>⚠️ {locError}</small>
          )}
          {location && !locError && (
            <small style={{ color: '#198754' }}>📍 Location captured</small>
          )}
        </div>

        {/* Step 1 — Select type */}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {PANIC_TYPES.map(({ value, icon, desc }) => (
              <button key={value}
                onClick={() => { setSelected(value); setStep(2); }}
                style={{
                  background: 'white', border: '1px solid #dee2e6',
                  borderRadius: 12, padding: '16px 20px', color: '#1a1a2e',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: 16, textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#e94560';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(233,69,96,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                <span style={{ fontSize: 32, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e' }}>{value}</div>
                  <div style={{ color: '#6c757d', fontSize: 13 }}>{desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#adb5bd' }}>→</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Add description */}
        {step === 2 && (
          <div style={{
            background: 'white', borderRadius: 20, padding: '28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e9ecef',
          }}>
            <div style={{
              background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)',
              borderRadius: 12, padding: '14px 16px', marginBottom: 20,
            }}>
              <p style={{ color: '#6c757d', fontSize: 13, margin: '0 0 4px' }}>Selected emergency:</p>
              <p style={{ color: '#e94560', fontWeight: 700, fontSize: 18, margin: 0 }}>{selected}</p>
            </div>

            <textarea rows={4} value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe what is happening (optional)..."
              style={{
                width: '100%', background: '#f8f9fa',
                border: '1px solid #dee2e6', borderRadius: 12,
                padding: '14px 16px', color: '#1a1a2e',
                fontSize: 15, outline: 'none', resize: 'vertical', marginBottom: 20,
              }} />

            <div className="d-flex gap-3">
              <button onClick={() => setStep(1)} style={{
                flex: 1, background: '#f8f9fa', border: '1px solid #dee2e6',
                borderRadius: 12, padding: '14px', color: '#495057',
                fontWeight: 600, cursor: 'pointer', fontSize: 15,
              }}>← Back</button>
              <button onClick={() => { setCountdown(5); setStep(3); }} style={{
                flex: 2, background: 'linear-gradient(135deg, #dc3545, #8b0000)',
                border: 'none', borderRadius: 12, padding: '14px',
                color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: 17,
                boxShadow: '0 4px 12px rgba(220,53,69,0.4)',
              }}>🆘 SEND PANIC ALERT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanicPage;