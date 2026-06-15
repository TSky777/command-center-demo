import { C } from '../theme';

export default function AttributionTable({ data = [] }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 12 }}>No attribution data yet.</div>;
  }

  const totals = {
    spend: data.reduce((s, r) => s + (r.spend || 0), 0),
    cv: data.reduce((s, r) => s + (r.cv || 0), 0),
    clicks: data.reduce((s, r) => s + (r.clicks || 0), 0),
    impressions: data.reduce((s, r) => s + (r.impressions || 0), 0),
  };
  totals.roas = totals.spend > 0 ? (totals.cv / totals.spend).toFixed(2) : '—';
  totals.ctr = totals.impressions > 0 ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%` : '—';
  totals.cpm = totals.impressions > 0 ? `$${((totals.spend / totals.impressions) * 1000).toFixed(2)}` : '—';

  const headers = ['Source', 'Spend', 'CV', 'ROAS', 'Clicks', 'Impr', 'CTR', 'CPM'];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 540, borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {headers.map((h) => (
              <th key={h} style={{ padding: '8px 6px', textAlign: h === 'Source' ? 'left' : 'right', fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.source} style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: '8px 6px', fontWeight: 600, color: C.text }}>{r.icon} {r.source}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: C.muted, fontFamily: 'monospace' }}>{r.spend ? `$${r.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: C.muted, fontFamily: 'monospace' }}>{r.cv ? `$${r.cv.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: r.roas ? (r.roas >= 3 ? C.green : C.text) : C.dim }}>{r.roas || '—'}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: C.muted }}>{r.clicks?.toLocaleString() ?? '—'}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: C.muted }}>{r.impressions?.toLocaleString() ?? '—'}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: C.muted }}>{r.ctr || '—'}</td>
              <td style={{ padding: '8px 6px', textAlign: 'right', color: C.muted }}>{r.cpm || '—'}</td>
            </tr>
          ))}
          <tr style={{ background: 'rgba(99,91,255,.03)' }}>
            <td style={{ padding: '8px 6px', fontWeight: 700, color: C.white }}>Total</td>
            <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, color: C.white, fontFamily: 'monospace' }}>${totals.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, color: C.white, fontFamily: 'monospace' }}>${totals.cv.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, color: C.green }}>{totals.roas}</td>
            <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: C.text }}>{totals.clicks.toLocaleString()}</td>
            <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: C.text }}>{totals.impressions.toLocaleString()}</td>
            <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: C.text }}>{totals.ctr}</td>
            <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: C.text }}>{totals.cpm}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
