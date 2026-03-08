import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SOSButton = ({ size = 'normal' }) => {
  const [pressed, setPressed] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
      navigate('/panic');
    }, 200);
  };

  const isLarge = size === 'large';

  return (
    <div className="d-flex flex-column align-items-center">
      <button onClick={handleClick} style={{
        width: isLarge ? 160 : 80,
        height: isLarge ? 160 : 80,
        borderRadius: '50%',
        background: pressed
          ? 'radial-gradient(circle, #7a0000, #dc3545)'
          : 'radial-gradient(circle, #ff4444, #dc3545)',
        border: `${isLarge ? 6 : 3}px solid rgba(255,68,68,0.5)`,
        color: 'white',
        fontSize: isLarge ? 52 : 28,
        fontWeight: 900,
        cursor: 'pointer',
        boxShadow: `0 0 ${isLarge ? 40 : 20}px rgba(220,53,69,0.6)`,
        animation: 'sos-pulse 2s ease-in-out infinite',
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s',
      }}
        title="Press for emergency help"
      >
        🆘
      </button>
      <div style={{
        marginTop: isLarge ? 16 : 8,
        color: '#dc3545', fontWeight: 700,
        fontSize: isLarge ? 16 : 12,
        letterSpacing: 2, textTransform: 'uppercase',
        animation: 'sos-text-flash 2s ease-in-out infinite',
      }}>
        {isLarge ? 'PRESS FOR HELP' : 'SOS'}
      </div>
      <style>{`
        @keyframes sos-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(220,53,69,0.6); }
          50% { box-shadow: 0 0 40px rgba(220,53,69,0.9); }
        }
        @keyframes sos-text-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SOSButton;