import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getDashboard = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'staff') return '/staff';
    return '/student';
  };

  useEffect(() => {
    if (user) navigate(getDashboard(user.role));
    const token = searchParams.get('token');
    const isNewUser = searchParams.get('newUser');
    if (token) handleGoogleToken(token, isNewUser);
    if (searchParams.get('error') === 'google_failed') {
      setError('Google login failed. Please try again.');
    }
  }, [user]);

  const handleGoogleToken = async (token, isNewUser) => {
    try {
      setGoogleLoading(true);
      localStorage.setItem('token', token);
      const res = await authAPI.getMe();
      login(token, res.data.user);
      if (isNewUser === 'true') {
        navigate('/complete-profile');
      } else {
        navigate(getDashboard(res.data.user.role));
      }
    } catch {
      setError('Google authentication failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      navigate(getDashboard(res.data.user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${process.env.REACT_APP_API_URL.replace('/api', '')}/api/auth/google`;
  };

  const inputStyle = {
    width: '100%', background: '#f8f9fa',
    border: '1px solid #dee2e6', borderRadius: 10,
    padding: '12px 16px', color: '#1a1a2e', fontSize: 15, outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f2f5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div className="text-center mb-4">
          <div style={{ fontSize: 64, marginBottom: 8 }}>🚨</div>
          <h2 style={{ color: '#1a1a2e', fontWeight: 800, marginBottom: 4 }}>CampusAlert</h2>
          <p style={{ color: '#6c757d', fontSize: 14 }}>Emergency Response System</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef',
        }}>
          <h4 style={{ color: '#1a1a2e', marginBottom: 24, fontWeight: 700 }}>Welcome back</h4>

          {error && (
            <div className="alert alert-danger py-2 mb-3" style={{ borderRadius: 10, fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label style={{ color: '#495057', fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Email address
              </label>
              <input type="email" value={form.email} required
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@university.edu" style={inputStyle} />
            </div>

            <div className="mb-4">
              <label style={{ color: '#495057', fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Password
              </label>
              <input type="password" value={form.password} required
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: 'linear-gradient(135deg, #e94560, #c0392b)',
              border: 'none', borderRadius: 10, padding: '14px',
              color: 'white', fontSize: 16, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginBottom: 16,
              boxShadow: '0 4px 12px rgba(233,69,96,0.3)',
            }}>
              {loading ? '⌛ Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          <div className="d-flex align-items-center gap-3 mb-3">
            <hr style={{ flex: 1, borderColor: '#dee2e6' }} />
            <span style={{ color: '#adb5bd', fontSize: 13 }}>or</span>
            <hr style={{ flex: 1, borderColor: '#dee2e6' }} />
          </div>

          <button onClick={handleGoogleLogin} disabled={googleLoading} style={{
            width: '100%', background: 'white',
            border: '1px solid #dee2e6', borderRadius: 10,
            padding: '12px', color: '#495057', fontSize: 15, fontWeight: 600,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            {googleLoading ? '⌛ Connecting...' : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p style={{ color: '#6c757d', textAlign: 'center', marginTop: 20, fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#e94560', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;