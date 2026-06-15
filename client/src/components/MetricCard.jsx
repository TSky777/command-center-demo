import { useMemo } from 'react';
import { C } from '../theme';

function Spark({ positive = true, w = 56, h = 18, color, seed = 0 }) {
  const pts = useMemo(() => {
    // Deterministic pseudo-random so sparklines are stable across renders.
    const rand = (i) => {
      const x = Math.sin((seed + 1) * 9301 + i * 49297) * 233280;
      return x - Math.floor(x);
    };
    const d = Array.from({ length: 9 }, (_, i) => {
      const t = positive ? i * 0.5 : (8 - i) * 0.4;
      return t + rand(i) * 3;
    });
    const mn = Math.min(...d), mx = Math.max(...d), r = mx - mn || 1;
    return d.map((v, i) => `${(i / 8) * w},${h - 2 - ((v - mn) / r) * (h - 4)}`).join(' ');
  }, [positive, w, h, seed]);
  return (
    <svg width={w} height={h} style={{ display: 'block', flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color || (positive ? C.green : C.red)}
        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".45" />
    </svg>
  );
}

function Badge({ value, invert, small }) {
  let pos = value >= 0;
  if (invert) pos = !pos;
  return (
    <span className="metric-badge" style={{
      fontSize: small ? 10 : 11, fontWeight: 600,
      color: pos ? C.green : C.red,
      background: pos ? C.greenSoft : C.redSoft,
      padding: small ? '1px 4px' : '1.5px 6px',
      borderRadius: 20, whiteSpace: 'nowrap',
    }}>
      {value >= 0 ? '↑' : '↓'} {Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%
    </span>
  );
}

export default function MetricCard({ label, value, change, highlight, invertColor, sparkColor, delay = 0 }) {
  const pos = invertColor ? (change || 0) <= 0 : (change || 0) >= 0;
  return (
    <div style={{
      background: highlight ? `linear-gradient(160deg,${C.card},rgba(99,91,255,.04))` : C.card,
      border: `1px solid ${highlight ? 'rgba(99,91,255,.2)' : C.border}`,
      borderRadius: 11, padding: '14px 15px',
      display: 'flex', flexDirection: 'column', gap: 6,
      animation: `fadeUp .35s ease ${delay}s both`,
      position: 'relative', overflow: 'hidden',
    }}>
      {highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.accent},#a78bfa)` }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
        <span className="metric-label" style={{ fontSize: 11.5, fontWeight: 500, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {change !== undefined && change !== null && <Badge value={change} invert={invertColor} small />}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
        <span className="metric-value" style={{ fontSize: 22, fontWeight: 700, color: C.white, fontFamily: "'Outfit',sans-serif", letterSpacing: '-.02em' }}>{value}</span>
        {change !== undefined && change !== null && <Spark positive={pos} color={sparkColor} seed={delay * 100 + (label ? label.length : 0)} />}
      </div>
    </div>
  );
}

export function Grid({ children }) {
  return <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 7 }}>{children}</div>;
}
