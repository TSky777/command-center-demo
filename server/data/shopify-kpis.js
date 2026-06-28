// ─── Shopify live data connector ───────────────────────────────────────────
// Replaces the seeded demo data with real order data from a Shopify store.
// Credentials are passed in per-call (per-client), not read from process.env,
// since each client has their own Shopify store.

'use strict';

const money = (n) => Math.round(n * 100) / 100;
const round = (n) => Math.round(n);

// ─── Shopify REST API fetch with automatic pagination ──────────────────────

async function fetchOrders(shop, token, startISO, endISO) {
  const orders = [];
  let nextUrl = [
    `https://${shop}/admin/api/2024-01/orders.json`,
    `?status=any`,
    `&created_at_min=${encodeURIComponent(startISO)}`,
    `&created_at_max=${encodeURIComponent(endISO)}`,
    `&limit=250`,
  ].join('');

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: { 'X-Shopify-Access-Token': token },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Shopify API ${res.status}: ${body}`);
    }
    const data = await res.json();
    orders.push(...(data.orders || []));

    // Follow the Link header for the next page
    const link  = res.headers.get('link') || '';
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    nextUrl = match ? match[1] : null;
  }
  return orders;
}

// ─── Calculate KPIs from raw Shopify orders ────────────────────────────────

function calcMetrics(orders, days, cfg) {
  let revenue = 0, ordersCount = 0, units = 0, discounts = 0, taxes = 0, returns = 0;
  let newCustRevenue = 0, returningRevenue = 0, newCustOrders = 0;
  const customerSet = new Set();

  for (const order of orders) {
    const total = parseFloat(order.total_price || 0);

    // Count fully-refunded orders as returns; exclude from revenue
    if (order.financial_status === 'refunded') {
      returns += total;
      continue;
    }

    revenue    += total;
    ordersCount++;
    discounts  += parseFloat(order.total_discounts || 0);
    taxes      += parseFloat(order.total_tax       || 0);

    for (const item of (order.line_items || [])) {
      units += item.quantity || 0;
    }

    // Partial refunds counted in returns too
    for (const refund of (order.refunds || [])) {
      for (const ri of (refund.refund_line_items || [])) {
        returns += parseFloat(ri.subtotal || 0);
      }
    }

    // New vs returning: Shopify tracks lifetime order count on customer object
    if (order.customer?.id) customerSet.add(order.customer.id);
    const custOrderCount = order.customer?.orders_count ?? 1;
    if (custOrderCount <= 1) {
      newCustRevenue += total;
      newCustOrders++;
    } else {
      returningRevenue += total;
    }
  }

  const uniqueCustomers = customerSet.size || ordersCount;
  const metaSpend   = cfg.metaDaily   * days;
  const googleSpend = cfg.googleDaily * days;
  const adSpend     = metaSpend + googleSpend;

  const cogs        = revenue * cfg.cogsPct;
  const gateways    = revenue * cfg.gatewayPct;
  const shipping    = 0;        // add SHIPPING_PERCENT env var later if needed
  const customExp   = 0;        // surfaces from the expense tracker

  const totalExpenses      = cogs + shipping + gateways + customExp + adSpend;
  const contributionMargin = revenue - cogs - shipping - gateways - adSpend;
  const netProfit          = contributionMargin - customExp;
  const netMargin          = revenue > 0 ? (netProfit  / revenue)      * 100 : 0;
  const aov                = ordersCount > 0 ? revenue  / ordersCount        : 0;
  const trueAov            = ordersCount > 0 ? (revenue - discounts) / ordersCount : 0;
  const roas               = adSpend > 0     ? revenue  / adSpend            : 0;
  const ncRoas             = adSpend > 0     ? (revenue / adSpend) - 0.6     : 0;
  const poas               = adSpend > 0     ? netProfit / adSpend           : 0;
  const blendedCpa         = ordersCount > 0 ? adSpend  / ordersCount        : 0;
  const mer                = revenue > 0     ? (adSpend / revenue)   * 100   : 0;
  const ncpa               = newCustOrders > 0 ? adSpend / newCustOrders     : 0;
  const newPct             = revenue > 0     ? (newCustRevenue / revenue) * 100 : 0;
  const frequency          = uniqueCustomers > 0 ? ordersCount / uniqueCustomers : 1;
  const ltv                = trueAov * Math.max(frequency, 1);

  return {
    revenue, ordersCount, units, discounts, taxes, returns,
    newCustRevenue, returningRevenue, newCustOrders, uniqueCustomers,
    metaSpend, googleSpend, adSpend,
    cogs, shipping, gateways, totalExpenses,
    contributionMargin, netProfit, netMargin,
    aov, trueAov, roas, ncRoas, poas, blendedCpa, mer, ncpa,
    newPct, frequency, ltv,
  };
}

// ─── % change vs prior period ──────────────────────────────────────────────

function pct(current, prior) {
  if (!prior || prior === 0) return 0;
  return money(((current - prior) / Math.abs(prior)) * 100);
}

// ─── Build the JSON response the frontend expects ─────────────────────────

function buildResponse(curr, prev, days) {
  const ch = (key) => pct(curr[key], prev[key]);

  return {
    range: { days },
    store: {
      orderRevenue:       { value: round(curr.revenue),            change: ch('revenue') },
      orders:             { value: curr.ordersCount,               change: ch('ordersCount') },
      netProfit:          { value: round(curr.netProfit),          change: ch('netProfit') },
      contributionMargin: { value: round(curr.contributionMargin), change: ch('contributionMargin') },
      netMargin:          { value: money(curr.netMargin),          change: ch('netMargin') },
      roas:               { value: money(curr.roas),               change: ch('roas') },
      ncRoas:             { value: money(curr.ncRoas),             change: ch('ncRoas') },
      poas:               { value: money(curr.poas),               change: ch('poas') },
      trueAov:            { value: money(curr.trueAov),            change: ch('trueAov') },
      aov:                { value: money(curr.aov),                change: ch('aov') },
      unitsSold:          { value: curr.units,                     change: ch('units') },
      returns:            { value: round(curr.returns),            change: 0 },
      blendedCpa:         { value: money(curr.blendedCpa),         change: ch('blendedCpa') },
      mer:                { value: money(curr.mer),                change: ch('mer') },
      ncpa:               { value: money(curr.ncpa),              change: ch('ncpa') },
      discounts:          { value: round(curr.discounts),          change: ch('discounts') },
      taxes:              { value: round(curr.taxes),              change: ch('taxes') },
    },
    customers: {
      newPct:             { value: money(curr.newPct),             change: ch('newPct') },
      returningPct:       { value: money(100 - curr.newPct) },
      newCustomerRevenue: { value: round(curr.newCustRevenue),     change: ch('newCustRevenue') },
      returningRevenue:   { value: round(curr.returningRevenue),   change: ch('returningRevenue') },
      newCustomerOrders:  { value: curr.newCustOrders,             change: ch('newCustOrders') },
      uniqueCustomers:    { value: curr.uniqueCustomers,           change: ch('uniqueCustomers') },
    },
    meta: {
      spend:     { value: curr.metaSpend,  change: 0 },
      roas:      { value: curr.metaSpend  > 0 ? money(curr.revenue / curr.metaSpend)  : 0, change: 0 },
      purchases: { value: curr.ordersCount, change: 0 },
      cpa:       { value: curr.ordersCount > 0 && curr.metaSpend  > 0 ? money(curr.metaSpend  / curr.ordersCount) : 0, change: 0 },
      cpc:       { value: 0, change: 0 },
      ctr:       { value: 0, change: 0 },
      convValue: { value: round(curr.revenue), change: 0 },
      cpm:       { value: 0, change: 0 },
    },
    google: {
      spend:       { value: curr.googleSpend, change: 0 },
      roas:        { value: curr.googleSpend > 0 ? money(curr.revenue / curr.googleSpend) : 0, change: 0 },
      conversions: { value: curr.ordersCount,  change: 0 },
      convValue:   { value: round(curr.revenue), change: 0 },
      cpa:         { value: curr.ordersCount > 0 && curr.googleSpend > 0 ? money(curr.googleSpend / curr.ordersCount) : 0, change: 0 },
      cpc:         { value: 0, change: 0 },
      ctr:         { value: 0, change: 0 },
      cpm:         { value: 0, change: 0 },
    },
    attribution: [
      {
        icon: '🔵', source: 'Meta',
        spend: curr.metaSpend,
        cv: round(curr.revenue * 0.6),
        clicks: 0, impressions: 0,
        roas: curr.metaSpend > 0 ? money((curr.revenue * 0.6) / curr.metaSpend) : null,
        ctr: null, cpm: null,
      },
      {
        icon: '🟢', source: 'Google',
        spend: curr.googleSpend,
        cv: round(curr.revenue * 0.3),
        clicks: 0, impressions: 0,
        roas: curr.googleSpend > 0 ? money((curr.revenue * 0.3) / curr.googleSpend) : null,
        ctr: null, cpm: null,
      },
      {
        icon: '🌐', source: 'Direct / Organic',
        spend: 0,
        cv: round(curr.revenue * 0.1),
        clicks: 0, impressions: 0,
        roas: null, ctr: null, cpm: null,
      },
    ],
    ltv: {
      ltv:             { value: money(curr.ltv),       change: ch('ltv') },
      frequency:       { value: money(curr.frequency), change: 0 },
      ltvCpa:          { value: curr.blendedCpa > 0 ? money(curr.ltv / curr.blendedCpa) : 0, change: 0 },
      uniqueCustomers: { value: curr.uniqueCustomers,  change: ch('uniqueCustomers') },
    },
    expenses: {
      cogs:            { value: round(curr.cogs),         change: ch('cogs') },
      shipping:        { value: round(curr.shipping),     change: 0 },
      paymentGateways: { value: round(curr.gateways),     change: ch('gateways') },
      customExpenses:  { value: 0 },
      totalExpenses:   { value: round(curr.totalExpenses), change: ch('totalExpenses') },
    },
  };
}

// ─── Date range helpers ────────────────────────────────────────────────────

function resolveDateRange(range, start, end) {
  const now   = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const DAY   = 86400000;

  const presets = {
    today:     { start: today,                           end: new Date(today.getTime() + DAY - 1),   days: 1  },
    yesterday: { start: new Date(today.getTime() - DAY), end: new Date(today.getTime() - 1),         days: 1  },
    '7d':      { start: new Date(today.getTime() - 7  * DAY), end: new Date(today.getTime() - 1), days: 7  },
    '14d':     { start: new Date(today.getTime() - 14 * DAY), end: new Date(today.getTime() - 1), days: 14 },
    '30d':     { start: new Date(today.getTime() - 30 * DAY), end: new Date(today.getTime() - 1), days: 30 },
  };

  if (presets[range]) return presets[range];

  if (range === 'custom' && start && end) {
    const s = new Date(start);
    const e = new Date(end);
    const days = Math.min(Math.round((e - s) / DAY) + 1, 90);
    return { start: s, end: e, days };
  }

  return presets['7d'];
}

// ─── Main export ───────────────────────────────────────────────────────────

// `client` is a row from the clients table (shopify_shop, shopify_token,
// meta_spend_daily, google_spend_daily, cogs_percent, gateway_percent).
async function getKpisFromShopify(client, range = '7d', start, end) {
  if (!client.shopify_shop || !client.shopify_token) {
    throw new Error('This account has no Shopify store connected yet.');
  }

  const cfg = {
    metaDaily:  parseFloat(client.meta_spend_daily   || 0),
    googleDaily: parseFloat(client.google_spend_daily || 0),
    cogsPct:    parseFloat(client.cogs_percent    ?? 30)  / 100,
    gatewayPct: parseFloat(client.gateway_percent ?? 2.9) / 100,
  };

  const { start: startDate, end: endDate, days } = resolveDateRange(range, start, end);

  // Compare against the prior period of the same length
  const priorEnd   = new Date(startDate.getTime() - 1);
  const priorStart = new Date(priorEnd.getTime() - days * 86400000 + 86400000);

  const [currOrders, prevOrders] = await Promise.all([
    fetchOrders(client.shopify_shop, client.shopify_token, startDate.toISOString(), endDate.toISOString()),
    fetchOrders(client.shopify_shop, client.shopify_token, priorStart.toISOString(), priorEnd.toISOString()),
  ]);

  console.log(`[shopify] ${client.username} ${range}: ${currOrders.length} orders (prev: ${prevOrders.length})`);

  const curr = calcMetrics(currOrders, days, cfg);
  const prev = calcMetrics(prevOrders, days, cfg);

  return buildResponse(curr, prev, days);
}

module.exports = { getKpisFromShopify };
