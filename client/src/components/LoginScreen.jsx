import { useState } from 'react';
import { C } from '../theme';
import { BRAND } from '../brand';
import { demoLogin, login } from '../utils/api';
import Logo from './Logo';

const IS_STATIC = import.meta.env.VITE_DEMO_STATIC === '1';

export default function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleEnter() {
    setLoading(true);
    setError('');
    try {
      const user = await demoLogin();
      onLogin(user);
    } catch (err) {
      setError('Could not start the demo. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: '11px 14px', fontSize: 14, color: C.white, fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit','DM Sans',-apple-system,sans-serif", padding: 24,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
        <div style={{ marginBottom: 20 }}><Logo size={88} radius={18} /></div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.white, letterSpacing: '-.02em', marginBottom: 6, textAlign: 'center' }}>
          {BRAND.name}
        </h1>
        <p style={{ fontSize: 14, color: C.muted, textAlign: 'center' }}>{BRAND.tagline}</p>
      </div>

      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: '36px 32px', width: '100%', maxWidth: 360,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>
        {IS_STATIC ? (
          <>
            <button
              onClick={handleEnter}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: C.accent, color: '#fff', border: 'none', borderRadius: 8,
                padding: '13px 24px', fontSize: 15, fontWeight: 600,
                fontFamily: "'Outfit','DM Sans',-apple-system,sans-serif",
                cursor: loading ? 'wait' : 'pointer', width: 280, opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Loading…' : 'Enter Demo'}
            </button>
            <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.5 }}>
              This is a live demo with sample data. No account or sign-in required.
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={loading || !username || !password}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: C.accent, color: '#fff', border: 'none', borderRadius: 8,
                  padding: '13px 24px', fontSize: 15, fontWeight: 600,
                  fontFamily: "'Outfit','DM Sans',-apple-system,sans-serif",
                  cursor: loading ? 'wait' : 'pointer', opacity: loading || !username || !password ? 0.6 : 1,
                }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11, color: C.muted }}>or</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <a
              href="/CommandCenter/demo/"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: C.surface, color: C.white, border: `1px solid ${C.accent}`,
                borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600,
                fontFamily: "'Outfit','DM Sans',-apple-system,sans-serif",
                textDecoration: 'none', width: '100%', boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: 16 }}>▶</span> View Demo
            </a>
          </>
        )}
        {error && (
          <div style={{ background: C.redSoft, border: `1px solid ${C.red}33`, borderRadius: 10, padding: '12px 16px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: C.red, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
