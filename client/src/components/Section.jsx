import { C } from '../theme';

export default function Section({ id, icon, title, color, children, collapsed, toggle, delay }) {
  return (
    <div>
      <div onClick={() => toggle(id)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, marginBottom: collapsed[id] ? 0 : 10, marginTop: 24,
        paddingLeft: 1, cursor: 'pointer',
        animation: `fadeUp .3s ease ${delay || 0}s both`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {color && <div style={{ width: 4, height: 20, borderRadius: 2, background: color }} />}
          <span style={{ fontSize: 16, fontWeight: 700, color: C.white, letterSpacing: '-.02em' }}>{icon} {title}</span>
        </div>
        <span style={{
          fontSize: 10, color: C.muted,
          transform: collapsed[id] ? 'rotate(-90deg)' : 'rotate(0)',
          transition: 'transform .2s',
        }}>▼</span>
      </div>
      {!collapsed[id] && children}
    </div>
  );
}
