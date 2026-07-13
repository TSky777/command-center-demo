'use strict';

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
    const link  = res.headers.get('link') || '';
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    nextUrl = match ? match[1] : null;
  }
  return orders;
}

function resolveDateRange(range, start, end) {
  const now   = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const DAY   = 86400000;
  const allStart = new Date(Date.UTC(2020, 0, 1));
  const presets = {
    today:     { start: today,                                  end: new Date(today.getTime() + DAY - 1), days: 1   },
    yesterday: { start: new Date(today.getTime() - DAY),        end: new Date(today.getTime() - 1),       days: 1   },
    '7d':      { start: new Date(today.getTime() - 7   * DAY), end: new Date(today.getTime() - 1),       days: 7   },
    '14d':     { start: new Date(today.getTime() - 14  * DAY), end: new Date(today.getTime() - 1),       days: 14  },
    '30d':     { start: new Date(today.getTime() - 30  * DAY), end: new Date(today.getTime() - 1),       days: 30  },
    '1yr':     { start: new Date(today.getTime() - 365 * DAY), end: new Date(today.getTime() - 1),       days: 365 },
    all:       { start: allStart, end: new Date(today.getTime() + DAY - 1), days: Math.round((today - allStart) / DAY) + 1 },
  };
  if (presets[range]) return presets[range];
  if (range === 'custom' && start && end) {
    const s = new Date(start);
    const e = new Date(new Date(end).getTime() + DAY - 1);
    return { start: s, end: e, days: Math.min(Math.round((e - s) / DAY) + 1, 365) };
  }
  return presets['7d'];
}

async function getChartsFromShopify(client, range = '7d', start, end) {
  const { start: startDate, end: endDate, days } = resolveDateRange(range, start, end);
  const DAY = 86400000;

  const orders = await fetchOrders(
    client.shopify_shop,
    client.shopify_token,
    startDate.toISOString(),
    endDate.toISOString()
  );

  console.log(`[shopify-charts] ${client.username} ${range}: ${orders.length} orders`);

  // Pre-build daily buckets for every day in the range
  const bucketMap = {};
  for (let i = 0; i < days; i++) {
    const d   = new Date(startDate.getTime() + i * DAY);
    const key = d.toISOString().split('T')[0];
    bucketMap[key] = { date: key, revenue: 0, orders: 0, newCustomers: 0, returningRevenue: 0 };
  }

  const valueBrackets = [
    { range: '$0–25',    min: 0,   max: 25   },
    { range: '$25–50',   min: 25,  max: 50   },
    { range: '$50–75',   min: 50,  max: 75   },
    { range: '$75–100',  min: 75,  max: 100  },
    { range: '$100–150', min: 100, max: 150  },
    { range: '$150–200', min: 150, max: 200  },
    { range: '$200+',    min: 200, max: Infinity },
  ];
  const valueCounts  = new Array(valueBrackets.length).fill(0);
  const productMap   = {};
  let totalRevenue = 0, totalOrders = 0, newRevenue = 0, returningRevenue = 0;

  for (const order of orders) {
    if (order.financial_status === 'refunded') continue;

    const total   = parseFloat(order.total_price || 0);
    const dateKey = (order.created_at || '').split('T')[0];
    const bucket  = bucketMap[dateKey];

    if (bucket) {
      bucket.revenue += total;
      bucket.orders  += 1;
      const isNew = (order.customer?.orders_count ?? 1) <= 1;
      if (isNew) {
        bucket.newCustomers += 1;
        newRevenue          += total;
      } else {
        bucket.returningRevenue += total;
        returningRevenue        += total;
      }
    }

    totalRevenue += total;
    totalOrders  += 1;

    // Order value bucket
    const bi = valueBrackets.findIndex(b => total >= b.min && total < b.max);
    if (bi >= 0) valueCounts[bi]++;

    // Product revenue aggregation from line items
    for (const item of (order.line_items || [])) {
      const name = item.title || 'Unknown';
      if (!productMap[name]) productMap[name] = { name, revenue: 0, orders: 0 };
      productMap[name].revenue += parseFloat(item.price || 0) * (item.quantity || 1);
      productMap[name].orders  += item.quantity || 1;
    }
  }

  // Build series — daily, or weekly if range > 90 days
  let series = Object.values(bucketMap).map(b => ({
    ...b,
    revenue:          Math.round(b.revenue),
    returningRevenue: Math.round(b.returningRevenue),
  }));

  if (days > 90) {
    const grouped = [];
    for (let i = 0; i < series.length; i += 7) {
      const chunk = series.slice(i, i + 7);
      grouped.push({
        date:             chunk[0].date,
        revenue:          chunk.reduce((s, d) => s + d.revenue, 0),
        orders:           chunk.reduce((s, d) => s + d.orders, 0),
        newCustomers:     chunk.reduce((s, d) => s + d.newCustomers, 0),
        returningRevenue: chunk.reduce((s, d) => s + d.returningRevenue, 0),
      });
    }
    series = grouped;
  }

  // Day-of-week averages (always from the daily buckets)
  const dowBuckets = Array(7).fill(null).map(() => ({ r: 0, o: 0, n: 0 }));
  Object.values(bucketMap).forEach(d => {
    const i   = new Date(d.date + 'T12:00:00').getDay();
    const idx = i === 0 ? 6 : i - 1; // Mon=0 … Sun=6
    dowBuckets[idx].r += d.revenue;
    dowBuckets[idx].o += d.orders;
    dowBuckets[idx].n++;
  });
  const dayOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    revenue: dowBuckets[i].n > 0 ? Math.round(dowBuckets[i].r / dowBuckets[i].n) : 0,
    orders:  dowBuckets[i].n > 0 ? Math.round(dowBuckets[i].o / dowBuckets[i].n) : 0,
  }));

  // Top 7 products by revenue
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7)
    .map(p => ({ name: p.name, revenue: Math.round(p.revenue), orders: p.orders }));

  const orderValueBuckets = valueBrackets.map((b, i) => ({ range: b.range, count: valueCounts[i] }));
  const newPct = totalRevenue > 0 ? Math.round((newRevenue / totalRevenue) * 100) : 0;

  return {
    series,
    dayOfWeek,
    orderValueBuckets,
    topProducts,
    summary: {
      totalRevenue:     Math.round(totalRevenue),
      totalOrders,
      newRevenue:       Math.round(newRevenue),
      returningRevenue: Math.round(returningRevenue),
      newPct,
    },
  };
}

module.exports = { getChartsFromShopify };
