// Generates time-series chart data from the same DAY constants as kpis.js.
// Used when no Shopify credentials are present (demo clients).

const DAY = 86400000;
const BASE = { revenue: 8283, orders: 107, newCustomers: 66 };
const DOW_MULT = [0.72, 0.88, 0.93, 1.08, 1.22, 1.12, 0.62]; // Mon..Sun

function rand(seed) {
  const x = Math.sin(seed + 1.7) * 10000;
  return x - Math.floor(x);
}

function getChartsData(range = '7d', start, end) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const PRESET_DAYS = { today: 1, yesterday: 1, '7d': 7, '14d': 14, '30d': 30, '1yr': 365, all: 365 };
  let numDays = PRESET_DAYS[range] ?? 14;
  let startDate = new Date(today.getTime() - numDays * DAY);

  if (range === 'custom' && start && end) {
    startDate = new Date(start);
    numDays = Math.min(Math.round((new Date(end) - startDate) / DAY) + 1, 365);
  }

  const weekly = numDays > 90;

  const daily = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate.getTime() + i * DAY);
    const dow = d.getDay();
    const dowIdx = dow === 0 ? 6 : dow - 1;
    const mult = DOW_MULT[dowIdx];
    const noise = 0.78 + rand(d.getTime() / DAY) * 0.44;
    const rev = Math.round(BASE.revenue * mult * noise);
    const ord = Math.round(BASE.orders * mult * noise);
    daily.push({
      date: d.toISOString().split('T')[0],
      revenue: rev,
      orders: ord,
      newCustomers: Math.round(BASE.newCustomers * mult * noise),
      returningRevenue: Math.round(rev * 0.383),
    });
  }

  let series = daily;
  if (weekly) {
    series = [];
    for (let i = 0; i < daily.length; i += 7) {
      const chunk = daily.slice(i, i + 7);
      series.push({
        date: chunk[0].date,
        revenue: chunk.reduce((s, d) => s + d.revenue, 0),
        orders:  chunk.reduce((s, d) => s + d.orders, 0),
        newCustomers:     chunk.reduce((s, d) => s + d.newCustomers, 0),
        returningRevenue: chunk.reduce((s, d) => s + d.returningRevenue, 0),
      });
    }
  }

  const dowBuckets = Array(7).fill(null).map(() => ({ r: 0, o: 0, n: 0 }));
  daily.forEach(d => {
    const i = new Date(d.date + 'T12:00:00').getDay();
    const idx = i === 0 ? 6 : i - 1;
    dowBuckets[idx].r += d.revenue;
    dowBuckets[idx].o += d.orders;
    dowBuckets[idx].n++;
  });
  const dayOfWeek = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
    day,
    revenue: dowBuckets[i].n > 0 ? Math.round(dowBuckets[i].r / dowBuckets[i].n) : 0,
    orders:  dowBuckets[i].n > 0 ? Math.round(dowBuckets[i].o / dowBuckets[i].n) : 0,
  }));

  const totalOrders  = daily.reduce((s, d) => s + d.orders,  0);
  const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0);
  const retRevenue   = daily.reduce((s, d) => s + d.returningRevenue, 0);

  const orderValueBuckets = ['$0–25','$25–50','$50–75','$75–100','$100–150','$150–200','$200+']
    .map((r, i) => ({ range: r, count: Math.round(totalOrders * [0.08,0.15,0.22,0.25,0.16,0.09,0.05][i]) }));

  const topProducts = [
    { name: 'Whey Protein Isolate — 5lb', rp: 0.24, op: 0.21 },
    { name: 'Pre-Workout Formula',         rp: 0.18, op: 0.20 },
    { name: 'Creatine Monohydrate — 500g', rp: 0.14, op: 0.16 },
    { name: 'Daily Multivitamin — 90ct',   rp: 0.12, op: 0.14 },
    { name: 'Omega-3 Fish Oil — 90ct',     rp: 0.10, op: 0.09 },
    { name: 'Monthly Starter Bundle',      rp: 0.08, op: 0.07 },
    { name: 'Collagen Peptides — 1lb',     rp: 0.05, op: 0.06 },
  ].map(p => ({
    name: p.name,
    revenue: Math.round(totalRevenue * p.rp),
    orders:  Math.round(totalOrders  * p.op),
  }));

  return {
    series,
    dayOfWeek,
    orderValueBuckets,
    topProducts,
    summary: {
      totalRevenue,
      totalOrders,
      newRevenue: totalRevenue - retRevenue,
      returningRevenue: retRevenue,
      newPct: Math.round(((totalRevenue - retRevenue) / totalRevenue) * 100),
    },
  };
}

module.exports = { getChartsData };
