import { useState } from 'react';
import { C } from '../theme';
import { fmtCurrency, fmtNumber, fmtPercent, fmtDecimal } from '../utils/formatters';
import MetricCard, { Grid } from '../components/MetricCard';
import Section from '../components/Section';
import DatePicker from '../components/DatePicker';
import AttributionTable from '../components/AttributionTable';
import LoadingState, { ErrorState } from '../components/LoadingState';
import { useKPIs } from '../hooks/useKPIs';
import { METRIC_GUIDE } from '../data/metricsGuide';

const tip = (label) => METRIC_GUIDE[label];

export default function Dashboard({ dateRange, setDateRange, custom, setCustom, collapsed, toggle }) {
  const [applied, setApplied] = useState({ s: custom.s, e: custom.e });
  const start = dateRange === 'custom' ? applied.s : undefined;
  const end = dateRange === 'custom' ? applied.e : undefined;
  const { data, loading, error, refresh } = useKPIs(dateRange, start, end);
  const handleGo = () => setApplied({ s: custom.s, e: custom.e });

  if (loading && !data) return <LoadingState message="Calculating KPIs..." />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return <ErrorState message="No data available" />;

  const s = data.store || {};
  const cust = data.customers || {};
  const meta = data.meta || {};
  const google = data.google || {};
  const ltv = data.ltv || {};
  const exp = data.expenses || {};

  return (
    <div>
      <div style={{ marginBottom: 14, animation: 'fadeUp .3s ease both' }}>
        <DatePicker selected={dateRange} onSelect={setDateRange} custom={custom} onCustom={setCustom} onApply={handleGo} />
        {dateRange === 'today' && (
          <div style={{ fontSize: 10, color: C.green, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />
            Live data · Updates every 15 minutes · Compared to yesterday
          </div>
        )}
      </div>

      {/* Store */}
      <Section id="store" icon="🏪" title="Store" color={C.green} collapsed={collapsed} toggle={toggle}>
        <Grid>
          <MetricCard label="Order Revenue" value={fmtCurrency(s.orderRevenue?.value)} change={s.orderRevenue?.change} highlight delay={0.02} tooltip={tip('Order Revenue')} />
          <MetricCard label="Orders" value={fmtNumber(s.orders?.value)} change={s.orders?.change} delay={0.04} tooltip={tip('Orders')} />
          <MetricCard label="Net Profit" value={fmtCurrency(s.netProfit?.value)} change={s.netProfit?.change} highlight delay={0.06} tooltip={tip('Net Profit')} />
          <MetricCard label="Contribution Margin" value={fmtCurrency(s.contributionMargin?.value)} change={s.contributionMargin?.change} delay={0.08} tooltip={tip('Contribution Margin')} />
          <MetricCard label="Net Margin" value={fmtPercent(s.netMargin?.value)} change={s.netMargin?.change} delay={0.10} tooltip={tip('Net Margin')} />
          <MetricCard label="ROAS" value={fmtDecimal(s.roas?.value)} change={s.roas?.change} highlight delay={0.12} tooltip={tip('ROAS')} />
          <MetricCard label="NC-ROAS" value={fmtDecimal(s.ncRoas?.value)} change={s.ncRoas?.change} delay={0.14} tooltip={tip('NC-ROAS')} />
          <MetricCard label="POAS" value={fmtDecimal(s.poas?.value)} change={s.poas?.change} delay={0.16} tooltip={tip('POAS')} />
          <MetricCard label="True AOV" value={fmtCurrency(s.trueAov?.value)} change={s.trueAov?.change} delay={0.18} tooltip={tip('True AOV')} />
          <MetricCard label="Avg Order Value" value={fmtCurrency(s.aov?.value)} change={s.aov?.change} delay={0.20} tooltip={tip('Avg Order Value')} />
          <MetricCard label="Units Sold" value={fmtNumber(s.unitsSold?.value)} change={s.unitsSold?.change} delay={0.22} tooltip={tip('Units Sold')} />
          <MetricCard label="Returns" value={fmtCurrency(s.returns?.value)} change={s.returns?.change} delay={0.24} tooltip={tip('Returns')} />
          <MetricCard label="Blended CPA" value={fmtCurrency(s.blendedCpa?.value)} change={s.blendedCpa?.change} invertColor delay={0.26} tooltip={tip('Blended CPA')} />
          <MetricCard label="MER" value={fmtPercent(s.mer?.value)} change={s.mer?.change} invertColor delay={0.28} tooltip={tip('MER')} />
          <MetricCard label="NCPA" value={fmtCurrency(s.ncpa?.value)} change={s.ncpa?.change} invertColor delay={0.30} tooltip={tip('NCPA')} />
          <MetricCard label="Discounts" value={fmtCurrency(s.discounts?.value)} change={s.discounts?.change} delay={0.32} tooltip={tip('Discounts')} />
          <MetricCard label="Taxes" value={fmtCurrency(s.taxes?.value)} change={s.taxes?.change} delay={0.34} tooltip={tip('Taxes')} />
        </Grid>
      </Section>

      {/* Customers */}
      <Section id="customers" icon="👥" title="Customers" color="#a78bfa" collapsed={collapsed} toggle={toggle}>
        <Grid>
          <MetricCard label="New Customer %" value={fmtPercent(cust.newPct?.value)} change={cust.newPct?.change} delay={0.02} tooltip={tip('New Customer %')} />
          <MetricCard label="Returning %" value={fmtPercent(cust.returningPct?.value)} delay={0.04} tooltip={tip('Returning %')} />
          <MetricCard label="New Cust Revenue" value={fmtCurrency(cust.newCustomerRevenue?.value)} change={cust.newCustomerRevenue?.change} delay={0.06} tooltip={tip('New Cust Revenue')} />
          <MetricCard label="Returning Revenue" value={fmtCurrency(cust.returningRevenue?.value)} change={cust.returningRevenue?.change} delay={0.08} tooltip={tip('Returning Revenue')} />
          <MetricCard label="New Cust Orders" value={fmtNumber(cust.newCustomerOrders?.value)} change={cust.newCustomerOrders?.change} delay={0.10} tooltip={tip('New Cust Orders')} />
          <MetricCard label="Unique Customers" value={fmtNumber(cust.uniqueCustomers?.value)} change={cust.uniqueCustomers?.change} delay={0.12} tooltip={tip('Unique Customers')} />
        </Grid>
      </Section>

      {/* Meta Ads */}
      <Section id="meta" icon="🔵" title="Meta Ads" color={C.meta} collapsed={collapsed} toggle={toggle}>
        <Grid>
          <MetricCard label="Spend" value={fmtCurrency(meta.spend?.value)} change={meta.spend?.change} sparkColor={C.meta} delay={0.02} tooltip={tip('Spend')} />
          <MetricCard label="ROAS" value={fmtDecimal(meta.roas?.value)} change={meta.roas?.change} sparkColor={C.meta} highlight delay={0.04} tooltip={tip('ROAS')} />
          <MetricCard label="Purchases" value={fmtNumber(meta.purchases?.value)} change={meta.purchases?.change} sparkColor={C.meta} delay={0.06} tooltip={tip('Purchases')} />
          <MetricCard label="CPA" value={fmtCurrency(meta.cpa?.value)} change={meta.cpa?.change} invertColor sparkColor={C.meta} delay={0.08} tooltip={tip('CPA')} />
          <MetricCard label="CPC" value={`$${fmtDecimal(meta.cpc?.value)}`} change={meta.cpc?.change} invertColor sparkColor={C.meta} delay={0.10} tooltip={tip('CPC')} />
          <MetricCard label="CTR" value={fmtPercent(meta.ctr?.value)} change={meta.ctr?.change} sparkColor={C.meta} delay={0.12} tooltip={tip('CTR')} />
          <MetricCard label="Conv. Value" value={fmtCurrency(meta.convValue?.value)} change={meta.convValue?.change} sparkColor={C.meta} delay={0.14} tooltip={tip('Conv. Value')} />
          <MetricCard label="CPM" value={fmtCurrency(meta.cpm?.value)} change={meta.cpm?.change} sparkColor={C.meta} delay={0.16} tooltip={tip('CPM')} />
        </Grid>
      </Section>

      {/* Google Ads */}
      <Section id="google" icon="🟢" title="Google Ads" color={C.google} collapsed={collapsed} toggle={toggle}>
        <Grid>
          <MetricCard label="Spend" value={fmtCurrency(google.spend?.value)} change={google.spend?.change} sparkColor={C.google} delay={0.02} tooltip={tip('Spend')} />
          <MetricCard label="ROAS" value={fmtDecimal(google.roas?.value)} change={google.roas?.change} sparkColor={C.google} highlight delay={0.04} tooltip={tip('ROAS')} />
          <MetricCard label="Conversions" value={fmtNumber(google.conversions?.value)} change={google.conversions?.change} sparkColor={C.google} delay={0.06} tooltip={tip('Conversions')} />
          <MetricCard label="Conv. Value" value={fmtCurrency(google.convValue?.value)} change={google.convValue?.change} sparkColor={C.google} delay={0.08} tooltip={tip('Conv. Value')} />
          <MetricCard label="CPA" value={fmtCurrency(google.cpa?.value)} change={google.cpa?.change} invertColor sparkColor={C.google} delay={0.10} tooltip={tip('CPA')} />
          <MetricCard label="CPC" value={`$${fmtDecimal(google.cpc?.value)}`} change={google.cpc?.change} invertColor sparkColor={C.google} delay={0.12} tooltip={tip('CPC')} />
          <MetricCard label="CTR" value={fmtPercent(google.ctr?.value)} change={google.ctr?.change} sparkColor={C.google} delay={0.14} tooltip={tip('CTR')} />
          <MetricCard label="CPM" value={fmtCurrency(google.cpm?.value)} change={google.cpm?.change} sparkColor={C.google} delay={0.16} tooltip={tip('CPM')} />
        </Grid>
      </Section>

      {/* Attribution */}
      <Section id="attrib" icon="🔀" title="Attribution" color={C.accent} collapsed={collapsed} toggle={toggle}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 11, overflow: 'hidden' }}>
          <AttributionTable data={data.attribution} />
        </div>
      </Section>

      {/* LTV */}
      <Section id="ltv" icon="💎" title="LTV" color="#d946ef" collapsed={collapsed} toggle={toggle}>
        <Grid>
          <MetricCard label="LTV" value={fmtCurrency(ltv.ltv?.value)} change={ltv.ltv?.change} highlight delay={0.02} tooltip={tip('LTV')} />
          <MetricCard label="Frequency" value={fmtDecimal(ltv.frequency?.value)} change={ltv.frequency?.change} delay={0.04} tooltip={tip('Frequency')} />
          <MetricCard label="LTV / CPA" value={fmtDecimal(ltv.ltvCpa?.value)} change={ltv.ltvCpa?.change} highlight delay={0.06} tooltip={tip('LTV / CPA')} />
          <MetricCard label="Unique Customers" value={fmtNumber(ltv.uniqueCustomers?.value)} change={ltv.uniqueCustomers?.change} delay={0.08} tooltip={tip('Unique Customers')} />
        </Grid>
      </Section>

      {/* Expenses */}
      <Section id="expenses" icon="💳" title="Expenses" color={C.red} collapsed={collapsed} toggle={toggle}>
        <Grid>
          <MetricCard label="COGS" value={fmtCurrency(exp.cogs?.value)} change={exp.cogs?.change} delay={0.02} tooltip={tip('COGS')} />
          <MetricCard label="Shipping" value={fmtCurrency(exp.shipping?.value)} change={exp.shipping?.change} delay={0.04} tooltip={tip('Shipping')} />
          <MetricCard label="Payment Gateways" value={fmtCurrency(exp.paymentGateways?.value)} change={exp.paymentGateways?.change} delay={0.06} tooltip={tip('Payment Gateways')} />
          <MetricCard label="Custom Expenses" value={fmtCurrency(exp.customExpenses?.value)} delay={0.08} tooltip={tip('Custom Expenses')} />
          <MetricCard label="Total Expenses" value={fmtCurrency(exp.totalExpenses?.value)} change={exp.totalExpenses?.change} highlight delay={0.10} tooltip={tip('Total Expenses')} />
        </Grid>
      </Section>
    </div>
  );
}
