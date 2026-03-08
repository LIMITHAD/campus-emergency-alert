import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_BG = 'rgb(41, 97, 173)';
const NAV_BG_DARK = 'rgb(31, 77, 143)';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'staff') return '/staff';
    return '/student';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: `linear-gradient(135deg, ${NAV_BG} 0%, ${NAV_BG_DARK} 100%)`,
      boxShadow: '0 4px 20px rgba(41,97,173,0.4)',
      borderBottom: '3px solid #e94560',
      position: 'sticky', top: 0, zIndex: 1000,
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center justify-content-between py-2">

          {/* Brand */}
          <Link to={getDashboardPath()} style={{ textDecoration: 'none' }}
            className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 28 }}>🚨</span>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>
                CampusAlert
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: 2 }}>
                EMERGENCY SYSTEM
              </div>
            </div>
          </Link>

          {/* Desktop Nav links */}
          {user && (
            <div className="d-none d-md-flex align-items-center gap-1">
              <Link to={getDashboardPath()} style={{
                textDecoration: 'none', padding: '8px 16px',
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: isActive(getDashboardPath()) ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                border: isActive(getDashboardPath()) ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = isActive(getDashboardPath()) ? 'rgba(255,255,255,0.2)' : 'transparent'}
              >
                📊 Dashboard
              </Link>

              <Link to="/send-alert" style={{
                textDecoration: 'none', padding: '8px 16px',
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: isActive('/send-alert') ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                border: isActive('/send-alert') ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = isActive('/send-alert') ? 'rgba(255,255,255,0.2)' : 'transparent'}
              >
                📢 Send Alert
              </Link>

              {user.role === 'student' && (
                <Link to="/panic" style={{
                  textDecoration: 'none', padding: '8px 16px',
                  borderRadius: 8, fontSize: 14, fontWeight: 700,
                  background: 'rgba(233,69,96,0.3)', color: 'white',
                  border: '1px solid rgba(233,69,96,0.5)',
                  animation: 'panic-pulse 2s ease-in-out infinite',
                }}>
                  🆘 PANIC
                </Link>
              )}
            </div>
          )}

          {/* User info + logout */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 15,
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="d-none d-md-block">
                    <div style={{ color: 'white', fontWeight: 600, fontSize: 13, lineHeight: 1.1 }}>
                      {user.name?.split(' ')[0]}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: user.role === 'admin' ? '#e94560' : user.role === 'staff' ? '#fd7e14' : '#198754',
                      color: 'white', textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button onClick={handleLogout} style={{
                  background: 'rgba(255,255,255,0.15)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                  padding: '7px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" style={{
                  textDecoration: 'none', color: 'white',
                  border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8,
                  padding: '7px 16px', fontWeight: 600, fontSize: 13,
                }}>Login</Link>
                <Link to="/register" style={{
                  textDecoration: 'none',
                  background: '#e94560', color: 'white', border: 'none',
                  borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13,
                  boxShadow: '0 2px 8px rgba(233,69,96,0.4)',
                }}>Register</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {user && (
          <div className="d-flex d-md-none gap-2 pb-2 overflow-auto">
            <Link to={getDashboardPath()} style={{
              textDecoration: 'none', whiteSpace: 'nowrap',
              padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: isActive(getDashboardPath()) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
              color: 'white',
            }}>📊 Dashboard</Link>

            <Link to="/send-alert" style={{
              textDecoration: 'none', whiteSpace: 'nowrap',
              padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: isActive('/send-alert') ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
              color: 'white',
            }}>📢 Send Alert</Link>

            {user.role === 'student' && (
              <Link to="/panic" style={{
                textDecoration: 'none', whiteSpace: 'nowrap',
                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: 'rgba(233,69,96,0.3)', color: 'white',
                border: '1px solid rgba(233,69,96,0.5)',
              }}>🆘 PANIC</Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes panic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(233,69,96,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(233,69,96,0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;