import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_BG = 'rgb(41, 97, 173)';
const FOOTER_BG_DARK = 'rgb(31, 77, 143)';

const Footer = () => {
  return (
    <footer style={{
      background: `linear-gradient(135deg, ${FOOTER_BG_DARK} 0%, ${FOOTER_BG} 100%)`,
      borderTop: '3px solid #e94560',
      boxShadow: '0 -4px 20px rgba(41,97,173,0.3)',
      marginTop: 'auto',
    }}>
      <div className="container-fluid px-4 py-4">
        <div className="row align-items-start">

          {/* Logo + tagline */}
          <div className="col-12 col-md-4 mb-4 mb-md-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span style={{ fontSize: 28 }}>🚨</span>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>
                  CampusAlert
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: 2 }}>
                  EMERGENCY RESPONSE SYSTEM
                </div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, maxWidth: 240, lineHeight: 1.6 }}>
              Keeping campus safe with real-time emergency alerts and panic response.
            </p>
            <div style={{
              marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.1)', borderRadius: 20,
              padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>
                System Online
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2 mb-4 mb-md-0">
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
              Quick Links
            </div>
            {[
              { label: '📊 Dashboard', path: '/student' },
              { label: '📢 Send Alert', path: '/send-alert' },
              { label: '🆘 Panic Button', path: '/panic' },
              { label: '🔐 Login', path: '/login' },
            ].map(({ label, path }) => (
              <div key={path} style={{ marginBottom: 8 }}>
                <Link to={path} style={{
                  color: 'rgba(255,255,255,0.7)', fontSize: 13,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                >
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {/* Emergency contacts */}
          <div className="col-6 col-md-3 mb-4 mb-md-0">
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
              Emergency Contacts
            </div>
            {[
              { label: '🚒 Fire: 101', href: 'tel:101' },
              { label: '🚔 Police: 100', href: 'tel:100' },
              { label: '🚑 Ambulance: 108', href: 'tel:108' },
              { label: '📞 Campus Security: 1800', href: 'tel:1800' },
            ].map(({ label, href }) => (
              <div key={href} style={{ marginBottom: 8 }}>
                <a href={href} style={{
                  color: 'rgba(255,255,255,0.7)', fontSize: 13,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                >
                  {label}
                </a>
              </div>
            ))}
          </div>

          {/* Safety tip */}
          <div className="col-12 col-md-3">
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 8 }}>
              🛡️ Safety Tip
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '14px 16px',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                In any emergency, first ensure your own safety, then alert others using this system.
              </p>
            </div>
            <div style={{
              marginTop: 12, background: 'rgba(233,69,96,0.2)',
              border: '1px solid rgba(233,69,96,0.4)',
              borderRadius: 12, padding: '12px 16px', textAlign: 'center',
            }}>
              <p style={{ color: 'white', fontSize: 13, margin: 0, fontWeight: 600 }}>
                🆘 Real emergency? Call <span style={{ color: '#ff6b6b', fontSize: 18, fontWeight: 900 }}>112</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          marginTop: 24, paddingTop: 16,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} CampusAlert — Emergency Response System. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>
            Built for campus safety 🛡️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;