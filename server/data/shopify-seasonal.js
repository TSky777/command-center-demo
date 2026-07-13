'use strict';

async function fetchOrders(shop, token, startISO, endISO) {
  const orders = [];
  let nextUrl = [
    `https://${shop}/admin/api/2024-01/orders.json`,
    `?status=any`,
    `&created_at_min=${encodeURIComponent(startISO)}`,
    `&created_at_max=${encodeURIComponent(endISO)}`,
    `&limit=250`,
    `&fields=id,created_at,total_price,financial_status`,
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

// Holiday definitions: month/day anchor + window offset in days [before, after]
const HOLIDAY_DEFS = [
  { name: "New Year's",       icon: '🥂',  month: 1,  day: 1,  window: [-4, 13] },
  { name: "Valentine's Day",  icon: '❤️',  month: 2,  day: 14, window: [-5, 2]  },
  { name: "Mother's Day",     icon: '💐',  month: 5,  day: 11, window: [-4, 3]  },
  { name: 'Memorial Day',     icon: '🇺🇸', month: 5,  day: 26, window: [-4, 2]  },
  { name: "Father's Day",     icon: '👔',  month: 6,  day: 15, window: [-4, 3]  },
  { name: 'Independence Day', icon: '🎆',  month: 7,  day: 4,  window: [-4, 3]  },
  { name: 'Labor Day',        icon: '🍂',  month: 9,  day: 1,  window: [-3, 6]  },
  { name: 'Halloween',        icon: '🎃',  month: 10, day: 31, window: [-6, 3]  },
  { name: 'Black Friday',     icon: '🛍️', month: 11, day: 28, window: [-4, 3]  },
  { name: 'Christmas',        icon: '🎄',  month: 12, day: 25, window: [-6, 3]  },
];

async function getSeasonalFromShopify(client) {
  const now   = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const DAY   = 86400000;

  // Pull the last 13 months so all 12 calendar months have full data
  const endDate   = new Date(today.getTime() + DAY - 1);
  const startDate = new Date(Date.UTC(today.getFullYear() - 1, today.getMonth(), 1));

  const orders = await fetchOrders(
    client.shopify_shop,
    client.shopify_token,
    startDate.toISOString(),
    endDate.toISOString()
  );

  console.log(`[shopify-seasonal] ${client.username}: ${orders.length} orders over 13 months`);

  // Aggregate daily revenue
  const dailyMap = {};
  for (const order of orders) {
    if (order.financial_status === 'refunded') continue;
    const key = (order.created_at || '').split('T')[0];
    if (!dailyMap[key]) dailyMap[key] = { revenue: 0, orders: 0 };
    dailyMap[key].revenue += parseFloat(order.total_price || 0);
    dailyMap[key].orders  += 1;
  }

  // Build the 12 most recent complete calendar months
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const d     = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const yr    = d.getFullYear();
    const mo    = String(d.getMonth() + 1).padStart(2, '0');
    const prefix = `${yr}-${mo}`;

    let revenue = 0, ordersCount = 0;
    for (const [date, data] of Object.entries(dailyMap)) {
      if (date.startsWith(prefix)) {
        revenue     += data.revenue;
        ordersCount += data.orders;
      }
    }

    monthly.push({
      short:   d.toLocaleDateString('en-US', { month: 'short' }),
      label:   d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: Math.round(revenue),
      orders:  ordersCount,
    });
  }

  // Compute average daily revenue as the baseline for uplift calculations
  const totalDays     = Math.round((endDate - startDate) / DAY);
  const totalRevenue  = Object.values(dailyMap).reduce((s, d) => s + d.revenue, 0);
  const avgDailyRev   = totalDays > 0 ? totalRevenue / totalDays : 0;

  // Compute holiday window revenues
  const holidays = [];
  for (const def of HOLIDAY_DEFS) {
    // Find the most recent occurrence within the data window
    let holidayDate = null;
    for (let yr = today.getFullYear(); yr >= today.getFullYear() - 1; yr--) {
      const candidate = new Date(Date.UTC(yr, def.month - 1, def.day));
      if (candidate <= today && candidate >= startDate) {
        holidayDate = candidate;
        break;
      }
    }
    if (!holidayDate) continue;

    const winStart   = new Date(holidayDate.getTime() + def.window[0] * DAY);
    const winEnd     = new Date(holidayDate.getTime() + def.window[1] * DAY);
    const windowDays = Math.round((winEnd - winStart) / DAY) + 1;

    let winRevenue = 0;
    for (let d = new Date(winStart); d <= winEnd; d = new Date(d.getTime() + DAY)) {
      const key = d.toISOString().split('T')[0];
      winRevenue += dailyMap[key]?.revenue || 0;
    }

    // Skip holidays with no data (store may not have existed yet)
    if (winRevenue === 0) continue;

    const baseline = Math.round(avgDailyRev * windowDays);
    const uplift   = baseline > 0 ? Math.round(((winRevenue - baseline) / baseline) * 100) : 0;
    const strength = uplift >= 100 ? 'Huge' : uplift >= 50 ? 'Strong' : uplift >= 20 ? 'Moderate' : 'Slight';

    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fmtShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    holidays.push({
      name:     def.name,
      icon:     def.icon,
      date:     fmt(holidayDate),
      window:   `${fmtShort(winStart)} – ${fmtShort(winEnd)}`,
      revenue:  Math.round(winRevenue),
      baseline,
      uplift,
      strength,
    });
  }

  holidays.sort((a, b) => b.revenue - a.revenue);

  return {
    vertical: client.vertical || 'general',
    monthly,
    holidays,
  };
}

module.exports = { getSeasonalFromShopify };
