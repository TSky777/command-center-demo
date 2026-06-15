import { useState } from 'react';
import { C } from '../theme';
import { BRAND } from '../brand';
import { demoLogin } from '../utils/api';
import Logo from './Logo';

export default function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        {error && (
          <div style={{ background: C.redSoft, border: `1px solid ${C.red}33`, borderRadius: 10, padding: '12px 16px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: C.red, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}
        <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.5 }}>
          This is a live demo with sample data. No account or sign-in required.
        </p>
      </div>
    </div>
  );
}
