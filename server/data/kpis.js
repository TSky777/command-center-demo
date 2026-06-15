// ─── Seeded demo KPI data ───
// This module fabricates realistic-but-fake analytics for a fictional store
// ("Demo Co") so the dashboard is fully populated with NO external data source.
// In a real deployment, replace this with a calculator that reads from your
// own database / Shopify / ad platforms. The shape returned here is the only
// contract the front-end depends on.

const DAY = {
  revenue: 8283,
  orders: 107,
  units: 196,
  newCustRevenue: 5104,
  returningRevenue: 3179,
  newCustOrders: 66,
  uniqueCustomers: 99,
  metaSpend: 1452,
  metaPurchases: 58,
  metaConvValue: 5410,
  metaClicks: 2140,
  metaImpressions: 198400,
  googleSpend: 718,
  googleConversions: 31,
  googleConvValue: 3090,
  googleClicks: 690,
  googleImpressions: 41200,
  emailConvValue: 1980,
  emailClicks: 410,
  emailImpressions: 22600,
  discounts: 641,
  taxes: 412,
  returns: 523,
  cogs: 2481,
  shipping: 762,
  gateways: 248,
  customExpenses: 196, // prorated daily from the seeded expense list
};

const round = (n) => Math.round(n);
const money = (n) => Math.round(n * 100) / 100;

// Build a fully self-consistent KPI payload for a given number of days.
// `ch` is a per-range "change vs. prior period" seed so the badges vary.
function build(days, ch) {
  const f = (v) => round(v * days); // flow metric (scales with time)

  const revenue = f(DAY.revenue);
  const orders = f(DAY.orders);
  const units = f(DAY.units);
  const metaSpend = f(DAY.metaSpend);
  const metaCV = f(DAY.metaConvValue);
  const metaPurch = f(DAY.metaPurchases);
  const metaClicks = f(DAY.metaClicks);
  const metaImpr = f(DAY.metaImpressions);
  const googleSpend = f(DAY.googleSpend);
  const googleCV = f(DAY.googleConvValue);
  const googleConv = f(DAY.googleConversions);
  const googleClicks = f(DAY.googleClicks);
  const googleImpr = f(DAY.googleImpressions);
  const emailCV = f(DAY.emailConvValue);
  const emailClicks = f(DAY.emailClicks);
  const emailImpr = f(DAY.emailImpressions);

  const adSpend = metaSpend + googleSpend;
  const cogs = f(DAY.cogs);
  const shipping = f(DAY.shipping);
  const gateways = f(DAY.gateways);
  const customExpenses = f(DAY.customExpenses);
  const discounts = f(DAY.discounts);
  const taxes = f(DAY.taxes);
  const returns = f(DAY.returns);

  const totalExpenses = cogs + shipping + gateways + customExpenses + adSpend;
  const contributionMargin = revenue - cogs - shipping - gateways - adSpend;
  const netProfit = contributionMargin - customExpenses;
  const netMargin = (netProfit / revenue) * 100;
  const aov = revenue / orders;
  const trueAov = (revenue - discounts) / orders;
  const roas = (metaCV + googleCV) / adSpend;
  const ncRoas = (metaCV + googleCV) / adSpend - 0.6;
  const poas = netProfit / adSpend;
  const blendedCpa = adSpend / orders;
  const mer = (adSpend / revenue) * 100;
  const ncpa = adSpend / Math.max(1, f(DAY.newCustOrders));
  const newCustRev = f(DAY.newCustRevenue);
  const returningRev = f(DAY.returningRevenue);
  const newCustOrders = f(DAY.newCustOrders);
  const uniqueCustomers = f(DAY.uniqueCustomers);
  const newPct = (newCustRev / revenue) * 100;

  const ltv = trueAov * 2.4;
  const frequency = 2.4;

  return {
    range: { days },
    store: {
      orderRevenue: { value: revenue, change: ch.rev },
      orders: { value: orders, change: ch.ord },
      netProfit: { value: round(netProfit), change: ch.np },
      contributionMargin: { value: round(contributionMargin), change: ch.cm },
      netMargin: { value: money(netMargin), change: ch.nm },
      roas: { value: money(roas), change: ch.roas },
      ncRoas: { value: money(ncRoas), change: ch.roas },
      poas: { value: money(poas), change: ch.np },
      trueAov: { value: money(trueAov), change: ch.aov },
      aov: { value: money(aov), change: ch.aov },
      unitsSold: { value: units, change: ch.ord },
      returns: { value: returns, change: -ch.ord },
      blendedCpa: { value: money(blendedCpa), change: -ch.roas },
      mer: { value: money(mer), change: -ch.roas },
      ncpa: { value: money(ncpa), change: -ch.roas },
      discounts: { value: discounts, change: ch.ord },
      taxes: { value: taxes, change: ch.ord },
    },
    customers: {
      newPct: { value: money(newPct), change: ch.cust },
      returningPct: { value: money(100 - newPct) },
      newCustomerRevenue: { value: newCustRev, change: ch.cust },
      returningRevenue: { value: returningRev, change: ch.rev },
      newCustomerOrders: { value: newCustOrders, change: ch.cust },
      uniqueCustomers: { value: uniqueCustomers, change: ch.ord },
    },
    meta: {
      spend: { value: metaSpend, change: ch.spend },
      roas: { value: money(metaCV / metaSpend), change: ch.roas },
      purchases: { value: metaPurch, change: ch.ord },
      cpa: { value: money(metaSpend / metaPurch), change: -ch.roas },
      cpc: { value: money(metaSpend / metaClicks), change: -ch.spend },
      ctr: { value: money((metaClicks / metaImpr) * 100), change: ch.cust },
      convValue: { value: metaCV, change: ch.rev },
      cpm: { value: money((metaSpend / metaImpr) * 1000), change: ch.spend },
    },
    google: {
      spend: { value: googleSpend, change: ch.spend },
      roas: { value: money(googleCV / googleSpend), change: ch.roas },
      conversions: { value: googleConv, change: ch.ord },
      convValue: { value: googleCV, change: ch.rev },
      cpa: { value: money(googleSpend / googleConv), change: -ch.roas },
      cpc: { value: money(googleSpend / googleClicks), change: -ch.spend },
      ctr: { value: money((googleClicks / googleImpr) * 100), change: ch.cust },
      cpm: { value: money((googleSpend / googleImpr) * 1000), change: ch.spend },
    },
    attribution: [
      attribRow('🔵', 'Meta', metaSpend, metaCV, metaClicks, metaImpr),
      attribRow('🟢', 'Google', googleSpend, googleCV, googleClicks, googleImpr),
      attribRow('✉️', 'Email', 0, emailCV, emailClicks, emailImpr),
      attribRow('🌐', 'Direct / Organic', 0, round(revenue - metaCV - googleCV - emailCV > 0 ? revenue - metaCV - googleCV - emailCV : revenue * 0.18), 0, 0),
    ],
    ltv: {
      ltv: { value: money(ltv), change: ch.aov },
      frequency: { value: money(frequency), change: ch.cust },
      ltvCpa: { value: money(ltv / blendedCpa), change: ch.roas },
      uniqueCustomers: { value: uniqueCustomers, change: ch.ord },
    },
    expenses: {
      cogs: { value: cogs, change: ch.ord },
      shipping: { value: shipping, change: ch.ord },
      paymentGateways: { value: gateways, change: ch.ord },
      customExpenses: { value: customExpenses },
      totalExpenses: { value: round(totalExpenses), change: ch.ord },
    },
  };
}

function attribRow(icon, source, spend, cv, clicks, impressions) {
  const roas = spend > 0 ? Number((cv / spend).toFixed(2)) : null;
  const ctr = impressions > 0 ? `${((clicks / impressions) * 100).toFixed(2)}%` : null;
  const cpm = impressions > 0 ? `$${((spend / impressions) * 1000).toFixed(2)}` : null;
  return { icon, source, spend, cv, clicks, impressions, roas, ctr, cpm };
}

// Per-range change seeds (vs. the comparison period) — purely cosmetic.
const CHANGES = {
  today: { rev: 12.4, ord: 9.1, np: 18.2, cm: 14.0, nm: 3.6, roas: 7.8, aov: 2.9, cust: 4.4, spend: -5.1 },
  yesterday: { rev: 6.2, ord: 4.7, np: 9.3, cm: 7.1, nm: 2.1, roas: 4.0, aov: 1.4, cust: 2.2, spend: 3.3 },
  '7d': { rev: 8.9, ord: 6.4, np: 11.7, cm: 9.5, nm: 2.8, roas: 5.6, aov: 2.1, cust: 3.5, spend: -2.4 },
  '14d': { rev: 5.3, ord: 3.8, np: 7.0, cm: 5.4, nm: 1.7, roas: 3.1, aov: 1.2, cust: 2.0, spend: 1.8 },
  '30d': { rev: 10.6, ord: 7.9, np: 14.1, cm: 11.2, nm: 3.0, roas: 6.2, aov: 2.6, cust: 4.0, spend: -3.7 },
};

const DAYS = { today: 1, yesterday: 1, '7d': 7, '14d': 14, '30d': 30, custom: 14 };

function getKpis(range = 'today', start, end) {
  let days = DAYS[range] ?? 14;
  let ch = CHANGES[range] || CHANGES['14d'];
  // For custom ranges, derive the day count from the dates if provided.
  if (range === 'custom' && start && end) {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.round((e - s) / 86400000) + 1;
    if (Number.isFinite(diff) && diff > 0) days = Math.min(diff, 90);
  }
  return build(days, ch);
}

module.exports = { getKpis };
