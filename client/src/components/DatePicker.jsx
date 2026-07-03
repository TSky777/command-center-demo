import { C } from '../theme';

const ranges = [
  { id: 'today', l: 'Today' },
  { id: 'yesterday', l: 'Yesterday' },
  { id: '7d', l: '7D' },
  { id: '14d', l: '14D' },
  { id: '30d', l: '30D' },
  { id: '1yr', l: '1YR' },
  { id: 'all', l: 'All Data' },
  { id: 'custom', l: 'Custom' },
];

export default function DatePicker({ selected, onSelect, custom, onCustom, onApply }) {
  return (
    <div className="date-picker" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
      {ranges.map((p) => (
        <button key={p.id} className="date-btn" onClick={() => onSelect(p.id)} style={{
          background: selected === p.id ? C.accent : C.surface,
          border: `1px solid ${selected === p.id ? C.accent : C.border}`,
          borderRadius: 8, padding: '6px 14px', fontSize: 12.5, fontWeight: 600,
          color: selected === p.id ? '#fff' : C.muted, cursor: 'pointer', fontFamily: 'inherit',
        }}>{p.l}</button>
      ))}
      {selected === 'custom' && (
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <input type="date" className="date-input" value={custom.s}
            onChange={(e) => onCustom({ ...custom, s: e.target.value })}
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: '5px 10px', fontSize: 12.5, color: C.text, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' }} />
          <span style={{ color: C.dim, fontSize: 12 }}>→</span>
          <input type="date" className="date-input" value={custom.e}
            onChange={(e) => onCustom({ ...custom, e: e.target.value })}
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: '5px 10px', fontSize: 12.5, color: C.text, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' }} />
          <button onClick={() => { if (onApply) onApply(); }} style={{
            background: '#22c55e', border: 'none', borderRadius: 7, padding: '6px 18px',
            fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}>Go</button>
        </div>
      )}
    </div>
  );
}
