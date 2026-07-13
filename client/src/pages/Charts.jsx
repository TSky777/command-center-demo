import { useState } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { C } from '../theme';
import DatePicker from '../components/DatePicker';
import LoadingState, { ErrorState } from '../components/LoadingState';
import { useCharts } from '../hooks/useCharts';
import { useSeasonal } from '../hooks/useSeasonal';

// ── Shared chart styles ────────────────────────────────────────────────────────
const TT = {
  contentStyle: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.text, fontSize: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,.5)',
  },
  cursor: { stroke: C.dim, strokeWidth: 1 },
};
const TICK = { fill: C.muted, fontSize: 11 };
const GRID_COLOR = C.border;
const A = C.accent;   // purple  #6355ff
const G = C.green;    // green   #22c55e
const V = '#9085e9';  // violet

function fmtK(v) { return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`; }
function fmtDate(d, len) {
  const dt = new Date(d + 'T12:00:00');
  if (len > 30) return dt.toLocaleDateString('en-US', { month: 'short' });
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function tickInterval(len) {
  if (len <=  7) return 0;
  if (len <= 14) return 1;
  if (len <= 30) return 4;
  return Math.floor(len / 12);
}

// ── Card wrapper ───────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '18px 16px 10px',
      animation: 'fadeUp .35s ease both', ...style,
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Custom donut label in center ───────────────────────────────────────────────
function DonutCenter({ cx, cy, pct }) {
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" fill={C.white} fontSize={22} fontWeight={700}>{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={C.muted} fontSize={11}>New customers</text>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const STRENGTH_COLOR = { Huge: '#22c55e', Strong: '#22c55e', Moderate: '#6355ff', Slight: '#62627a' };

export default function Charts({ dateRange, setDateRange, custom, setCustom }) {
  const [applied, setApplied] = useState({ s: custom.s, e: custom.e });
  const start = dateRange === 'custom' ? applied.s : undefined;
  const end   = dateRange === 'custom' ? applied.e : undefined;
  const { data, loading, error, refresh } = useCharts(dateRange, start, end);
  const { data: seasonal } = useSeasonal();

  const handleGo = () => setApplied({ s: custom.s, e: custom.e });

  if (loading && !data) return <LoadingState message="Building charts…" />;
  if (error && !data)   return <ErrorState message={error} onRetry={refresh} />;
  if (!data)            return <ErrorState message="No chart data available" />;

  const { series, dayOfWeek, orderValueBuckets, topProducts, summary } = data;
  const len = series.length;
  const interval = tickInterval(len);
  const fmtTick = (d) => fmtDate(d, len);

  const pieData = [
    { name: 'New',       value: summary.newRevenue },
    { name: 'Returning', value: summary.returningRevenue },
  ];
  const PIE_COLORS = [A, V];

  const maxDow = Math.max(...dayOfWeek.map(d => d.revenue));

  return (
    <div>
      {/* Date picker */}
      <div style={{ marginBottom: 14, animation: 'fadeUp .3s ease both' }}>
        <DatePicker selected={dateRange} onSelect={setDateRange} custom={custom} onCustom={setCustom} onApply={handleGo} />
      </div>

      {/* ── Row 1: Revenue over time (full width) ── */}
      <ChartCard
        title="Revenue Over Time"
        subtitle={`${series.length > 30 ? 'Weekly' : 'Daily'} revenue · ${summary.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} total`}
        style={{ marginBottom: 14 }}
      >
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={series} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={A} stopOpacity={0.35} />
                <stop offset="95%" stopColor={A} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" tick={TICK} tickFormatter={fmtTick} interval={interval} axisLine={false} tickLine={false} />
            <YAxis tick={TICK} tickFormatter={fmtK} axisLine={false} tickLine={false} width={46} />
            <Tooltip {...TT} formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} labelFormatter={fmtTick} />
            <Area type="monotone" dataKey="revenue" stroke={A} strokeWidth={2} fill="url(#gRev)" dot={false} activeDot={{ r: 4, fill: A }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 2: Orders per day + New vs Returning ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 14 }} className="charts-row-2">
        <style>{`.charts-row-2{grid-template-columns:1fr !important}@media(min-width:640px){.charts-row-2{grid-template-columns:3fr 2fr !important}}`}</style>

        <ChartCard
          title="Orders Per Day"
          subtitle={`${summary.totalOrders.toLocaleString()} total orders`}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={series} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="date" tick={TICK} tickFormatter={fmtTick} interval={interval} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} width={36} />
              <Tooltip {...TT} formatter={(v) => [v, 'Orders']} labelFormatter={fmtTick} />
              <Bar dataKey="orders" radius={[3, 3, 0, 0]} maxBarSize={20}>
                {series.map((entry, i) => (
                  <Cell key={i} fill={entry.orders === Math.max(...series.map(d => d.orders)) ? G : A} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New vs Returning Revenue" subtitle="By customer type">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="45%"
                innerRadius={58} outerRadius={82}
                dataKey="value"
                paddingAngle={3}
                startAngle={90} endAngle={-270}
              >
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                <DonutCenter cx="50%" cy="45%" pct={summary.newPct} />
              </Pie>
              <Tooltip {...TT} formatter={(v) => [`$${v.toLocaleString()}`, '']} />
              <Legend
                iconType="circle" iconSize={8}
                formatter={(v) => <span style={{ color: C.text, fontSize: 12 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 3: Day of week + Top products ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 14 }} className="charts-row-3">
        <style>{`.charts-row-3{grid-template-columns:1fr !important}@media(min-width:640px){.charts-row-3{grid-template-columns:1fr 1fr !important}}`}</style>

        <ChartCard title="Best Days of the Week" subtitle="Avg daily revenue by weekday">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayOfWeek} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="day" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} tickFormatter={fmtK} axisLine={false} tickLine={false} width={46} />
              <Tooltip {...TT} formatter={(v) => [`$${v.toLocaleString()}`, 'Avg Revenue']} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {dayOfWeek.map((entry, i) => (
                  <Cell key={i} fill={entry.revenue === maxDow ? G : A} fillOpacity={entry.revenue === maxDow ? 1 : 0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Products" subtitle="By revenue">
          <ResponsiveContainer width="100%" height={Math.max(240, (topProducts?.length || 7) * 36)}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 4, right: 40, left: 4, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={TICK} tickFormatter={fmtK} axisLine={false} tickLine={false} />
              <YAxis
                type="category" dataKey="name" width={180}
                tick={{ fill: C.text, fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip {...TT} formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill={A} radius={[0, 4, 4, 0]} maxBarSize={14} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 4: Order value distribution (full width) ── */}
      <ChartCard
        title="Order Value Distribution"
        subtitle="How many orders fall in each price range"
        style={{ marginBottom: 14 }}
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={orderValueBuckets} margin={{ top: 4, right: 12, left: -10, bottom: 0 }} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="range" tick={TICK} axisLine={false} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} width={40} />
            <Tooltip {...TT} formatter={(v) => [v, 'Orders']} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {orderValueBuckets.map((_, i) => (
                <Cell key={i} fill={A} fillOpacity={0.55 + i * 0.05} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Seasonal: Monthly revenue ── */}
      {seasonal && (
        <>
          <ChartCard
            title="Monthly Revenue — Last 12 Months"
            subtitle="Which months drive the most revenue for your store"
            style={{ marginBottom: 14 }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={seasonal.monthly} margin={{ top: 4, right: 12, left: -10, bottom: 0 }} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} tickFormatter={fmtK} axisLine={false} tickLine={false} width={46} />
                <Tooltip {...TT} formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {seasonal.monthly.map((m, i) => {
                    const max = Math.max(...seasonal.monthly.map(x => x.revenue));
                    return <Cell key={i} fill={m.revenue === max ? G : A} fillOpacity={m.revenue === max ? 1 : 0.7} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ── Seasonal: Holiday performance ── */}
          <ChartCard
            title="Holiday Performance"
            subtitle="Revenue lift during major US holidays vs a normal week — ranked by impact"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
              {seasonal.holidays
                .slice()
                .sort((a, b) => b.uplift - a.uplift)
                .map((h) => {
                  const col = STRENGTH_COLOR[h.strength];
                  const pct = Math.min((h.uplift / 300) * 100, 100);
                  return (
                    <div key={h.name} style={{
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>
                            {h.icon} {h.name}
                          </div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{h.window}</div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                          background: col + '18', color: col, border: `1px solid ${col}30`,
                          whiteSpace: 'nowrap',
                        }}>
                          {h.strength}
                        </span>
                      </div>
                      {/* Uplift bar */}
                      <div style={{ height: 5, background: C.card, borderRadius: 3, marginBottom: 6 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 3, transition: 'width .4s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: col, fontWeight: 700 }}>+{h.uplift}% vs baseline</span>
                        <span style={{ color: C.muted }}>${h.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 14 }}>
              Baseline = average 7-day revenue for non-holiday weeks. Window = days included in the holiday calculation.
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
}
