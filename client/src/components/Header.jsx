import { C } from '../theme';
import { BRAND } from '../brand';
import Logo from './Logo';
import { fmtTime } from '../utils/formatters';

export default function Header({ dateRange, dateLabel, time, refreshing, onRefresh, user, onSignOut }) {
  return (
    <header className="app-header" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(5,5,8,.9)', backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.border}`, padding: '16px 16px',
    }}>
      <div className="header-inner" style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <Logo size={56} radius={12} />
          <div style={{ textAlign: 'center' }}>
            <div className="header-title" style={{ fontSize: 22, fontWeight: 700, color: C.white, lineHeight: 1.2, letterSpacing: '-.01em' }}>{BRAND.name}</div>
            <div className="header-subtitle" style={{ fontSize: 13, color: C.muted }}>
              {dateRange === 'today' && <><span style={{ color: C.green, marginRight: 4 }}>● LIVE</span></>}
              {dateLabel} · {fmtTime(time)}
            </div>
          </div>
        </div>


        {user && (
          <div style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <button
              onClick={onSignOut}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.muted, fontSize: 11, fontFamily: 'inherit',
                padding: '4px 0', letterSpacing: '.02em',
              }}
            >
              Sign out
            </button>
          </div>
        )}

        <button className="header-refresh" onClick={onRefresh} style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 8, width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.muted, cursor: 'pointer', fontSize: 14,
        }}>
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin .7s linear infinite' : 'none' }}>↻</span>
        </button>
      </div>
    </header>
  );
}
