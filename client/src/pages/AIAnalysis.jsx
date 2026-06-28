import { useState, useRef } from 'react';
import { C } from '../theme';
import { fmtTime } from '../utils/formatters';
import { getToken } from '../utils/api';

// ─── API call ──────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function requestAnalysis(range, start, end) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ range, start, end }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.hint || data.details || data.error || 'Analysis failed');
  return data;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ScoreRing({ score, label }) {
  const color = score >= 70 ? C.green : score >= 40 ? C.amber : C.red;
  const r = 52, cx = 64, cy = 64, stroke = 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={128} height={128} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ marginTop: -100, marginBottom: 36, textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>/ 100</div>
      </div>
      <div style={{
        fontSize: 12, fontWeight: 700, color,
        background: `${color}18`, border: `1px solid ${color}40`,
        borderRadius: 20, padding: '4px 14px', letterSpacing: '0.05em',
      }}>
        {label}
      </div>
    </div>
  );
}

function ScoreBar({ score, color }) {
  const fill = color === 'green' ? C.green : color === 'amber' ? C.amber : C.red;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${score}%`, height: '100%', background: fill,
          borderRadius: 4, transition: 'width 1s ease',
        }} />
      </div>
      <div style={{ fontSize: 11, color: fill, marginTop: 4, fontWeight: 600 }}>{score} / 100</div>
    </div>
  );
}

const PRIORITY_COLOR = { High: C.red, Medium: C.amber, Low: C.green };
const SECTION_ICONS = { profitability: '💰', advertising: '📣', customers: '👥', expenses: '💳' };

// ─── Main page ─────────────────────────────────────────────────────────────

const IS_STATIC = import.meta.env.VITE_DEMO_STATIC === '1';
const HAS_REMOTE_API = !!import.meta.env.VITE_API_BASE;

export default function AIAnalysis({ dateRange, custom }) {
  // Show feature preview only in static mode with no remote API configured
  if (IS_STATIC && !HAS_REMOTE_API) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 20, animation: 'fadeUp .3s ease both' }}>
        <div style={{ fontSize: 48 }}>🤖</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white }}>AI Business Analysis</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8, maxWidth: 400, lineHeight: 1.7 }}>
            Get a full AI-powered business review — profit health score, warnings, and a prioritised action plan — available in your private dashboard.
          </div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 24px', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Includes</div>
          {['Overall business health score (0–100)', 'Strengths and warnings with real numbers', 'Priority action plan ranked High / Medium / Low', 'Section scores: Profitability, Ads, Customers, Expenses'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ color: C.green, fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 13, color: C.text }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const cacheRef = useRef({});

  const cacheKey = dateRange === 'custom' ? `custom_${custom.s}_${custom.e}` : dateRange;

  async function run() {
    // Return cached result for the same range without re-calling the API
    if (cacheRef.current[cacheKey]) {
      setAnalysis(cacheRef.current[cacheKey]);
      setState('done');
      return;
    }

    setState('loading');
    setError('');
    try {
      const start = dateRange === 'custom' ? custom.s : undefined;
      const end   = dateRange === 'custom' ? custom.e : undefined;
      const result = await requestAnalysis(dateRange, start, end);
      cacheRef.current[cacheKey] = result;
      setAnalysis(result);
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }

  function refresh() {
    delete cacheRef.current[cacheKey];
    run();
  }

  // ── Idle / prompt to generate ──
  if (state === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 20, animation: 'fadeUp .3s ease both' }}>
        <div style={{ fontSize: 48 }}>🤖</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white }}>AI Business Analysis</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6, maxWidth: 380 }}>
            AI will review your metrics and give you a prioritised plan to grow profit.
          </div>
        </div>
        <button onClick={run} style={{
          background: C.accent, color: '#fff', border: 'none', borderRadius: 10,
          padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em',
        }}>
          Generate Analysis
        </button>
      </div>
    );
  }

  // ── Loading ──
  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16, animation: 'fadeUp .3s ease both' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: C.muted, fontSize: 13 }}>AI is analyzing your business…</div>
      </div>
    );
  }

  // ── Error ──
  if (state === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 16, animation: 'fadeUp .3s ease both' }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ color: C.red, fontSize: 14, textAlign: 'center', maxWidth: 420 }}>{error}</div>
        <button onClick={run} style={{
          background: C.surface, color: C.white, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        }}>Try Again</button>
      </div>
    );
  }

  // ── Results ──
  const a = analysis;
  const sectionKeys = ['profitability', 'advertising', 'customers', 'expenses'];
  const sectionLabels = { profitability: 'Profitability', advertising: 'Advertising', customers: 'Customers', expenses: 'Expenses' };

  const ts = a.generatedAt ? fmtTime(a.generatedAt) : '';

  return (
    <div style={{ animation: 'fadeUp .3s ease both', paddingBottom: 40 }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.white }}>🤖 AI Business Analysis</div>
          {ts && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Generated at {ts} · {a.range?.toUpperCase()}</div>}
        </div>
        <button onClick={refresh} style={{
          background: C.surface, color: C.muted, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}>↺ Refresh</button>
      </div>

      {/* Score + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginBottom: 16, alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
        <ScoreRing score={a.score} label={a.scoreLabel} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>Executive Summary</div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>{a.summary}</div>
        </div>
      </div>

      {/* Strengths + Warnings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* Strengths */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✅</span> Strengths
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(a.strengths || []).map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠️</span> Warnings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(a.warnings || []).map((w, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 3 }}>{w.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{w.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Actions */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.white, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          🎯 Priority Actions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(a.actions || []).map((action, i) => {
            const pColor = PRIORITY_COLOR[action.priority] || C.muted;
            return (
              <div key={i} style={{ display: 'flex', gap: 14, borderBottom: i < a.actions.length - 1 ? `1px solid ${C.border}` : 'none', paddingBottom: i < a.actions.length - 1 ? 16 : 0 }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: pColor,
                    background: `${pColor}18`, border: `1px solid ${pColor}40`,
                    borderRadius: 4, padding: '2px 7px', letterSpacing: '0.06em',
                  }}>
                    {action.priority?.toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 4 }}>{action.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65, marginBottom: 6 }}>{action.detail}</div>
                  {action.impact && (
                    <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>
                      Impact: {action.impact}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {sectionKeys.map((key) => {
          const sec = a.sections?.[key];
          if (!sec) return null;
          return (
            <div key={key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                {SECTION_ICONS[key]} {sectionLabels[key]}
              </div>
              <ScoreBar score={sec.score} color={sec.color} />
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginTop: 10 }}>{sec.insight}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
