import { useState } from 'react';
import { C } from '../theme';
import { useKPIs } from '../hooks/useKPIs';

// ── Industry benchmark data ────────────────────────────────────────────────────
const VERTICALS = {
  coffee: {
    label: 'Coffee & Tea',
    icon: '☕',
    benchmarks: [
      { metric: 'Avg Order Value',      low: 35,   high: 55,   unit: '$',  kpiKey: 'aov',       kpiSrc: 'store' },
      { metric: 'Blended ROAS',         low: 2.5,  high: 4.0,  unit: 'x',  kpiKey: 'roas',      kpiSrc: 'store' },
      { metric: 'Net Margin',           low: 15,   high: 25,   unit: '%',  kpiKey: 'netMargin', kpiSrc: 'store' },
      { metric: 'New Customer Revenue', low: 45,   high: 60,   unit: '%',  kpiKey: 'newPct',    kpiSrc: 'customers' },
      { metric: 'Repeat Purchase Rate', low: 35,   high: 50,   unit: '%',  kpiKey: null,        kpiSrc: null },
    ],
  },
  supplements: {
    label: 'Supplements & Health',
    icon: '💊',
    benchmarks: [
      { metric: 'Avg Order Value',      low: 60,   high: 90,   unit: '$',  kpiKey: 'aov',       kpiSrc: 'store' },
      { metric: 'Blended ROAS',         low: 2.0,  high: 3.5,  unit: 'x',  kpiKey: 'roas',      kpiSrc: 'store' },
      { metric: 'Net Margin',           low: 30,   high: 50,   unit: '%',  kpiKey: 'netMargin', kpiSrc: 'store' },
      { metric: 'New Customer Revenue', low: 55,   high: 70,   unit: '%',  kpiKey: 'newPct',    kpiSrc: 'customers' },
      { metric: 'Repeat Purchase Rate', low: 30,   high: 45,   unit: '%',  kpiKey: null,        kpiSrc: null },
    ],
  },
  fashion: {
    label: 'Fashion & Apparel',
    icon: '👗',
    benchmarks: [
      { metric: 'Avg Order Value',      low: 80,   high: 140,  unit: '$',  kpiKey: 'aov',       kpiSrc: 'store' },
      { metric: 'Blended ROAS',         low: 3.5,  high: 5.5,  unit: 'x',  kpiKey: 'roas',      kpiSrc: 'store' },
      { metric: 'Net Margin',           low: 10,   high: 20,   unit: '%',  kpiKey: 'netMargin', kpiSrc: 'store' },
      { metric: 'New Customer Revenue', low: 60,   high: 75,   unit: '%',  kpiKey: 'newPct',    kpiSrc: 'customers' },
      { metric: 'Repeat Purchase Rate', low: 20,   high: 30,   unit: '%',  kpiKey: null,        kpiSrc: null },
    ],
  },
  beauty: {
    label: 'Beauty & Skincare',
    icon: '💄',
    benchmarks: [
      { metric: 'Avg Order Value',      low: 55,   high: 85,   unit: '$',  kpiKey: 'aov',       kpiSrc: 'store' },
      { metric: 'Blended ROAS',         low: 3.0,  high: 5.0,  unit: 'x',  kpiKey: 'roas',      kpiSrc: 'store' },
      { metric: 'Net Margin',           low: 40,   high: 60,   unit: '%',  kpiKey: 'netMargin', kpiSrc: 'store' },
      { metric: 'New Customer Revenue', low: 50,   high: 65,   unit: '%',  kpiKey: 'newPct',    kpiSrc: 'customers' },
      { metric: 'Repeat Purchase Rate', low: 30,   high: 40,   unit: '%',  kpiKey: null,        kpiSrc: null },
    ],
  },
  pets: {
    label: 'Pet Supplies',
    icon: '🐾',
    benchmarks: [
      { metric: 'Avg Order Value',      low: 50,   high: 80,   unit: '$',  kpiKey: 'aov',       kpiSrc: 'store' },
      { metric: 'Blended ROAS',         low: 2.5,  high: 4.5,  unit: 'x',  kpiKey: 'roas',      kpiSrc: 'store' },
      { metric: 'Net Margin',           low: 20,   high: 30,   unit: '%',  kpiKey: 'netMargin', kpiSrc: 'store' },
      { metric: 'New Customer Revenue', low: 40,   high: 55,   unit: '%',  kpiKey: 'newPct',    kpiSrc: 'customers' },
      { metric: 'Repeat Purchase Rate', low: 45,   high: 60,   unit: '%',  kpiKey: null,        kpiSrc: null },
    ],
  },
  home: {
    label: 'Home & Living',
    icon: '🏠',
    benchmarks: [
      { metric: 'Avg Order Value',      low: 70,   high: 120,  unit: '$',  kpiKey: 'aov',       kpiSrc: 'store' },
      { metric: 'Blended ROAS',         low: 2.5,  high: 4.0,  unit: 'x',  kpiKey: 'roas',      kpiSrc: 'store' },
      { metric: 'Net Margin',           low: 15,   high: 25,   unit: '%',  kpiKey: 'netMargin', kpiSrc: 'store' },
      { metric: 'New Customer Revenue', low: 60,   high: 70,   unit: '%',  kpiKey: 'newPct',    kpiSrc: 'customers' },
      { metric: 'Repeat Purchase Rate', low: 18,   high: 28,   unit: '%',  kpiKey: null,        kpiSrc: null },
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getClientValue(kpiData, kpiKey, kpiSrc, unit) {
  if (!kpiData || !kpiKey || !kpiSrc) return null;
  const src = kpiData[kpiSrc];
  if (!src || src[kpiKey] === undefined) return null;
  return src[kpiKey]?.value ?? null;
}

function scorePosition(val, low, high) {
  if (val === null) return null;
  if (val < low)  return 'below';
  if (val > high) return 'above';
  return 'within';
}

const SCORE_COLOR = { above: C.green, within: C.accent, below: C.amber };
const SCORE_LABEL = { above: 'Above avg', within: 'On target', below: 'Below avg' };

function buildTrendsUrl(terms, geo) {
  const compItems = terms
    .filter(Boolean)
    .slice(0, 4)
    .map(t => ({ keyword: t, geo: geo || 'US', time: 'today 12-m' }));
  if (compItems.length === 0) return null;
  const req = encodeURIComponent(JSON.stringify({ comparisonItem: compItems, category: 0, property: '' }));
  return `https://trends.google.com/trends/embed/explore/TIMESERIES?req=${req}&tz=300&ss=1`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '18px 20px',
      marginBottom: 14, animation: 'fadeUp .35s ease both',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function BenchmarkRow({ b, clientVal, unit }) {
  const pos = scorePosition(clientVal, b.low, b.high);

  const fmt = (v) => {
    if (v === null) return '—';
    if (unit === '$') return `$${Number(v).toFixed(unit === '$' ? 0 : 1)}`;
    return `${Number(v).toFixed(1)}${unit}`;
  };

  // Bar: 0% = 0, 100% = high * 1.4
  const max = b.high * 1.4;
  const lowPct  = (b.low  / max) * 100;
  const highPct = (b.high / max) * 100;
  const valPct  = clientVal !== null ? Math.min((clientVal / max) * 100, 100) : null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: C.text }}>{b.metric}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: C.muted }}>
            Industry: {unit === '$' ? `$${b.low}–$${b.high}` : `${b.low}–${b.high}${unit}`}
          </span>
          {clientVal !== null && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
              background: SCORE_COLOR[pos] + '18', color: SCORE_COLOR[pos],
              border: `1px solid ${SCORE_COLOR[pos]}30`,
            }}>
              {SCORE_LABEL[pos]}
            </span>
          )}
        </div>
      </div>

      {/* Bar track */}
      <div style={{ position: 'relative', height: 8, background: C.surface, borderRadius: 4 }}>
        {/* Industry range highlight */}
        <div style={{
          position: 'absolute', left: `${lowPct}%`, width: `${highPct - lowPct}%`,
          height: '100%', background: C.accent, opacity: 0.2, borderRadius: 4,
        }} />
        {/* Client value dot */}
        {valPct !== null && (
          <div style={{
            position: 'absolute', left: `${valPct}%`, top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12, height: 12, borderRadius: '50%',
            background: SCORE_COLOR[pos], border: `2px solid ${C.card}`,
            zIndex: 2,
          }} />
        )}
      </div>

      {clientVal !== null && (
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
          Your value: <span style={{ color: SCORE_COLOR[pos], fontWeight: 600 }}>{fmt(clientVal)}</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MarketIntelligence({ dateRange, custom }) {
  const [vertical, setVertical] = useState('coffee');
  const [brand, setBrand]       = useState('');
  const [rivals, setRivals]     = useState(['', '', '']);
  const [geo, setGeo]           = useState('US');
  const [applied, setApplied]   = useState(null);

  const start = dateRange === 'custom' ? custom.s : undefined;
  const end   = dateRange === 'custom' ? custom.e : undefined;
  const { data: kpiData } = useKPIs(dateRange, start, end);

  const vert = VERTICALS[vertical];

  const allTerms = [brand, ...rivals].filter(Boolean);
  const trendsUrl = applied ? buildTrendsUrl(allTerms, geo) : null;

  const handleApply = () => setApplied({ brand, rivals, geo });

  const updateRival = (i, v) => setRivals(r => { const n = [...r]; n[i] = v; return n; });

  return (
    <div>
      {/* ── Vertical selector ── */}
      <Section title="Industry Vertical">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(VERTICALS).map(([key, v]) => (
            <button
              key={key}
              onClick={() => setVertical(key)}
              style={{
                background: vertical === key ? C.accentSoft : C.surface,
                border: `1px solid ${vertical === key ? C.accent : C.border}`,
                color: vertical === key ? C.accent : C.text,
                borderRadius: 8, padding: '7px 14px', fontSize: 12,
                fontWeight: vertical === key ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{v.icon}</span>{v.label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Competitor setup ── */}
      <Section title="Competitor Tracker">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Your brand</div>
            <input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="e.g. Melofarm Coffee"
              style={{
                width: '100%', background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '8px 11px', color: C.white, fontSize: 13,
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
          {rivals.map((r, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Competitor {i + 1}</div>
              <input
                value={r}
                onChange={e => updateRival(i, e.target.value)}
                placeholder={['e.g. Starbucks', 'e.g. Death Wish', 'e.g. Black Rifle'][i]}
                style={{
                  width: '100%', background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '8px 11px', color: C.white, fontSize: 13,
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 5 }}>Market (country)</div>
            <select
              value={geo}
              onChange={e => setGeo(e.target.value)}
              style={{
                width: '100%', background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '8px 11px', color: C.white, fontSize: 13,
                fontFamily: 'inherit', outline: 'none',
              }}
            >
              {[['US','United States'],['GB','United Kingdom'],['CA','Canada'],['AU','Australia'],
                ['DE','Germany'],['FR','France'],['MX','Mexico'],['BR','Brazil'],['IN','India']].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={!brand && rivals.every(r => !r)}
          style={{
            background: C.accent, color: '#fff', border: 'none', borderRadius: 8,
            padding: '9px 22px', fontSize: 13, fontWeight: 600,
            cursor: brand || rivals.some(r => r) ? 'pointer' : 'not-allowed',
            opacity: brand || rivals.some(r => r) ? 1 : 0.4,
            fontFamily: 'inherit',
          }}
        >
          Load Trends →
        </button>
      </Section>

      {/* ── Google Trends ── */}
      {trendsUrl ? (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
          overflow: 'hidden', marginBottom: 14, animation: 'fadeUp .35s ease both',
        }}>
          <div style={{ padding: '16px 20px 0', fontSize: 13, fontWeight: 700, color: C.white }}>
            Search Interest Over Time
          </div>
          <div style={{ padding: '8px 20px 10px', fontSize: 11, color: C.muted }}>
            Google Trends · last 12 months · {geo} market · Relative search interest (100 = peak)
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            <iframe
              src={trendsUrl}
              width="100%"
              height="360"
              style={{ border: 'none', borderRadius: 8, display: 'block' }}
              title="Google Trends comparison"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : (
        <div style={{
          background: C.card, border: `1px dashed ${C.border}`, borderRadius: 14,
          padding: '36px 20px', marginBottom: 14, textAlign: 'center',
          animation: 'fadeUp .35s ease both',
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Enter your brand and at least one competitor, then click <strong style={{ color: C.text }}>Load Trends</strong> to see Google search interest comparison.
          </div>
        </div>
      )}

      {/* ── Meta Ad Library links ── */}
      {applied && allTerms.length > 0 && (
        <Section title="Meta Ad Library">
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.7 }}>
            See every active Facebook & Instagram ad your competitors are running — for free.
            More active ads = more ad spend = a signal of growth investment.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allTerms.map((term, i) => (
              <a
                key={i}
                href={`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${geo}&q=${encodeURIComponent(term)}&search_type=keyword_unordered`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '7px 14px', fontSize: 12, color: C.text,
                  textDecoration: 'none', fontWeight: i === 0 ? 600 : 400,
                  transition: 'border-color .15s',
                }}
              >
                {i === 0 ? '🔵' : '🔍'} {term}
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* ── Industry benchmarks ── */}
      <Section title={`${vert.icon} ${vert.label} — Industry Benchmarks`}>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 16, lineHeight: 1.7 }}>
          Compare your store's KPIs against industry averages for {vert.label.toLowerCase()} e-commerce.
          The purple band = industry range. The dot = your current value.
          {!kpiData && ' (Log in to see your values plotted on the bar.)'}
        </p>
        {vert.benchmarks.map((b) => {
          const cv = getClientValue(kpiData, b.kpiKey, b.kpiSrc, b.unit);
          return <BenchmarkRow key={b.metric} b={b} clientVal={cv} unit={b.unit} />;
        })}

        <div style={{
          marginTop: 8, padding: '10px 14px', background: C.surface,
          borderRadius: 8, fontSize: 11, color: C.muted, lineHeight: 1.7,
        }}>
          Source: Shopify Commerce Trends 2024, Triple Whale Benchmarks, Klaviyo Email Performance Report.
          Ranges reflect median-performing DTC brands — top quartile brands typically exceed the upper bound.
        </div>
      </Section>
    </div>
  );
}
