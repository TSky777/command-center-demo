import { C } from '../theme';

const tabs = [
  { id: 'home',     icon: '◎',  label: 'Home' },
  { id: 'charts',   icon: '📈', label: 'Charts' },
  { id: 'market',   icon: '🌐', label: 'Market' },
  { id: 'expenses', icon: '💳', label: 'Expenses' },
  { id: 'ai',       icon: '🤖', label: 'AI Analysis' },
];

export default function TabBar({ active, onSelect }) {
  return (
    <nav className="app-tabbar" style={{
      position: 'sticky', top: 81, zIndex: 40,
      background: 'rgba(5,5,8,.94)', backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${C.border}`, overflowX: 'auto',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', padding: '0 14px', justifyContent: 'center' }}>
        {tabs.map((t) => (
          <button key={t.id} className="tab-btn" onClick={() => onSelect(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '11px 16px', fontSize: 13,
            fontWeight: active === t.id ? 600 : 400,
            color: active === t.id ? C.white : C.muted,
            borderBottom: `2px solid ${active === t.id ? C.accent : 'transparent'}`,
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 13 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
