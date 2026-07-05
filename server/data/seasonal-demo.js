'use strict';

// Hardcoded seasonal patterns per vertical.
// For real Shopify clients, these would be computed from actual order history.
// A full year of data is needed before real computation is useful.

const MONTHLY = {
  coffee: [
    { short: 'Jul', revenue: 232400, orders: 2810 },
    { short: 'Aug', revenue: 245800, orders: 2970 },
    { short: 'Sep', revenue: 238200, orders: 2880 },
    { short: 'Oct', revenue: 268400, orders: 3240 },
    { short: 'Nov', revenue: 412600, orders: 4980 },
    { short: 'Dec', revenue: 395200, orders: 4770 },
    { short: 'Jan', revenue: 201400, orders: 2430 },
    { short: 'Feb', revenue: 248600, orders: 3000 },
    { short: 'Mar', revenue: 231000, orders: 2790 },
    { short: 'Apr', revenue: 226800, orders: 2740 },
    { short: 'May', revenue: 271400, orders: 3270 },
    { short: 'Jun', revenue: 258200, orders: 3120 },
  ],
  supplements: [
    { short: 'Jul', revenue: 198400, orders: 2210 },
    { short: 'Aug', revenue: 214600, orders: 2390 },
    { short: 'Sep', revenue: 241200, orders: 2680 },
    { short: 'Oct', revenue: 228800, orders: 2540 },
    { short: 'Nov', revenue: 312400, orders: 3470 },
    { short: 'Dec', revenue: 278600, orders: 3090 },
    { short: 'Jan', revenue: 384200, orders: 4270 },
    { short: 'Feb', revenue: 298400, orders: 3320 },
    { short: 'Mar', revenue: 226000, orders: 2510 },
    { short: 'Apr', revenue: 218400, orders: 2430 },
    { short: 'May', revenue: 232800, orders: 2590 },
    { short: 'Jun', revenue: 221600, orders: 2460 },
  ],
  fashion: [
    { short: 'Jul', revenue: 182400, orders: 1320 },
    { short: 'Aug', revenue: 241800, orders: 1750 },
    { short: 'Sep', revenue: 298200, orders: 2160 },
    { short: 'Oct', revenue: 312400, orders: 2260 },
    { short: 'Nov', revenue: 498600, orders: 3610 },
    { short: 'Dec', revenue: 462200, orders: 3340 },
    { short: 'Jan', revenue: 168400, orders: 1220 },
    { short: 'Feb', revenue: 284600, orders: 2060 },
    { short: 'Mar', revenue: 268000, orders: 1940 },
    { short: 'Apr', revenue: 318400, orders: 2300 },
    { short: 'May', revenue: 362800, orders: 2620 },
    { short: 'Jun', revenue: 298200, orders: 2160 },
  ],
  beauty: [
    { short: 'Jul', revenue: 164200, orders: 1880 },
    { short: 'Aug', revenue: 182800, orders: 2090 },
    { short: 'Sep', revenue: 204400, orders: 2340 },
    { short: 'Oct', revenue: 218600, orders: 2500 },
    { short: 'Nov', revenue: 368400, orders: 4220 },
    { short: 'Dec', revenue: 342800, orders: 3920 },
    { short: 'Jan', revenue: 148200, orders: 1700 },
    { short: 'Feb', revenue: 298600, orders: 3420 },
    { short: 'Mar', revenue: 194000, orders: 2220 },
    { short: 'Apr', revenue: 188400, orders: 2160 },
    { short: 'May', revenue: 262800, orders: 3010 },
    { short: 'Jun', revenue: 221600, orders: 2540 },
  ],
  pets: [
    { short: 'Jul', revenue: 218400, orders: 2740 },
    { short: 'Aug', revenue: 228800, orders: 2870 },
    { short: 'Sep', revenue: 238200, orders: 2990 },
    { short: 'Oct', revenue: 254400, orders: 3190 },
    { short: 'Nov', revenue: 368600, orders: 4620 },
    { short: 'Dec', revenue: 412200, orders: 5170 },
    { short: 'Jan', revenue: 198400, orders: 2490 },
    { short: 'Feb', revenue: 224600, orders: 2820 },
    { short: 'Mar', revenue: 214000, orders: 2680 },
    { short: 'Apr', revenue: 228400, orders: 2870 },
    { short: 'May', revenue: 248800, orders: 3120 },
    { short: 'Jun', revenue: 234200, orders: 2940 },
  ],
  home: [
    { short: 'Jul', revenue: 142400, orders: 1180 },
    { short: 'Aug', revenue: 162800, orders: 1350 },
    { short: 'Sep', revenue: 198200, orders: 1640 },
    { short: 'Oct', revenue: 224400, orders: 1860 },
    { short: 'Nov', revenue: 398600, orders: 3300 },
    { short: 'Dec', revenue: 468200, orders: 3880 },
    { short: 'Jan', revenue: 128400, orders: 1060 },
    { short: 'Feb', revenue: 168600, orders: 1400 },
    { short: 'Mar', revenue: 184000, orders: 1520 },
    { short: 'Apr', revenue: 214400, orders: 1780 },
    { short: 'May', revenue: 278800, orders: 2310 },
    { short: 'Jun', revenue: 198200, orders: 1640 },
  ],
  general: [
    { short: 'Jul', revenue: 232400, orders: 2810 },
    { short: 'Aug', revenue: 245800, orders: 2970 },
    { short: 'Sep', revenue: 238200, orders: 2880 },
    { short: 'Oct', revenue: 268400, orders: 3240 },
    { short: 'Nov', revenue: 412600, orders: 4980 },
    { short: 'Dec', revenue: 395200, orders: 4770 },
    { short: 'Jan', revenue: 201400, orders: 2430 },
    { short: 'Feb', revenue: 248600, orders: 3000 },
    { short: 'Mar', revenue: 231000, orders: 2790 },
    { short: 'Apr', revenue: 226800, orders: 2740 },
    { short: 'May', revenue: 271400, orders: 3270 },
    { short: 'Jun', revenue: 258200, orders: 3120 },
  ],
};

// Holiday uplifts vs a ~$58k/week baseline.
// Tuned per vertical: beauty spikes on Valentine's, supplements spike New Year's, etc.
const HOLIDAYS = {
  coffee: [
    { name: 'Labor Day',       icon: '🍂', date: 'Sep 1, 2025',  window: 'Aug 29 – Sep 7',  revenue: 68200,  baseline: 58000, uplift: 18 },
    { name: 'Halloween',       icon: '🎃', date: 'Oct 31, 2025', window: 'Oct 25 – Nov 3',  revenue: 72400,  baseline: 58000, uplift: 25 },
    { name: 'Black Friday',    icon: '🛍️', date: 'Nov 28, 2025', window: 'Nov 24 – Dec 1',  revenue: 148600, baseline: 58000, uplift: 156 },
    { name: 'Christmas',       icon: '🎄', date: 'Dec 25, 2025', window: 'Dec 19 – Dec 28', revenue: 124800, baseline: 58000, uplift: 115 },
    { name: "New Year's",      icon: '🥂', date: 'Jan 1, 2026',  window: 'Dec 28 – Jan 6',  revenue: 74200,  baseline: 58000, uplift: 28 },
    { name: "Valentine's Day", icon: '❤️', date: 'Feb 14, 2026', window: 'Feb 9 – Feb 16',  revenue: 86400,  baseline: 58000, uplift: 49 },
    { name: "Mother's Day",    icon: '💐', date: 'May 10, 2026', window: 'May 6 – May 13',  revenue: 95600,  baseline: 58000, uplift: 65 },
    { name: 'Memorial Day',    icon: '🇺🇸', date: 'May 25, 2026', window: 'May 21 – May 28', revenue: 71200,  baseline: 58000, uplift: 23 },
    { name: "Father's Day",    icon: '👔', date: 'Jun 21, 2026', window: 'Jun 17 – Jun 24', revenue: 82400,  baseline: 58000, uplift: 42 },
    { name: 'Independence Day',icon: '🎆', date: 'Jul 4, 2026',  window: 'Jun 30 – Jul 7',  revenue: 61800,  baseline: 58000, uplift: 7 },
  ],
  supplements: [
    { name: "New Year's",      icon: '🥂', date: 'Jan 1, 2026',  window: 'Dec 28 – Jan 13', revenue: 186400, baseline: 72000, uplift: 159 },
    { name: 'Black Friday',    icon: '🛍️', date: 'Nov 28, 2025', window: 'Nov 24 – Dec 1',  revenue: 168200, baseline: 72000, uplift: 134 },
    { name: 'Christmas',       icon: '🎄', date: 'Dec 25, 2025', window: 'Dec 19 – Dec 28', revenue: 128400, baseline: 72000, uplift: 78 },
    { name: "Valentine's Day", icon: '❤️', date: 'Feb 14, 2026', window: 'Feb 9 – Feb 16',  revenue: 98600,  baseline: 72000, uplift: 37 },
    { name: "Mother's Day",    icon: '💐', date: 'May 10, 2026', window: 'May 6 – May 13',  revenue: 88400,  baseline: 72000, uplift: 23 },
    { name: 'Labor Day',       icon: '🍂', date: 'Sep 1, 2025',  window: 'Aug 29 – Sep 7',  revenue: 81200,  baseline: 72000, uplift: 13 },
    { name: "Father's Day",    icon: '👔', date: 'Jun 21, 2026', window: 'Jun 17 – Jun 24', revenue: 79800,  baseline: 72000, uplift: 11 },
  ],
  fashion: [
    { name: 'Black Friday',    icon: '🛍️', date: 'Nov 28, 2025', window: 'Nov 24 – Dec 1',  revenue: 248600, baseline: 86000, uplift: 189 },
    { name: 'Christmas',       icon: '🎄', date: 'Dec 25, 2025', window: 'Dec 19 – Dec 28', revenue: 198400, baseline: 86000, uplift: 131 },
    { name: "Valentine's Day", icon: '❤️', date: 'Feb 14, 2026', window: 'Feb 9 – Feb 16',  revenue: 148200, baseline: 86000, uplift: 72 },
    { name: "Mother's Day",    icon: '💐', date: 'May 10, 2026', window: 'May 6 – May 13',  revenue: 138600, baseline: 86000, uplift: 61 },
    { name: 'Labor Day',       icon: '🍂', date: 'Sep 1, 2025',  window: 'Aug 29 – Sep 7',  revenue: 124800, baseline: 86000, uplift: 45 },
    { name: 'Memorial Day',    icon: '🇺🇸', date: 'May 25, 2026', window: 'May 21 – May 28', revenue: 112400, baseline: 86000, uplift: 31 },
    { name: "Father's Day",    icon: '👔', date: 'Jun 21, 2026', window: 'Jun 17 – Jun 24', revenue: 96800,  baseline: 86000, uplift: 13 },
  ],
  beauty: [
    { name: "Valentine's Day", icon: '❤️', date: 'Feb 14, 2026', window: 'Feb 9 – Feb 16',  revenue: 168400, baseline: 54000, uplift: 212 },
    { name: 'Black Friday',    icon: '🛍️', date: 'Nov 28, 2025', window: 'Nov 24 – Dec 1',  revenue: 148600, baseline: 54000, uplift: 175 },
    { name: 'Christmas',       icon: '🎄', date: 'Dec 25, 2025', window: 'Dec 19 – Dec 28', revenue: 124800, baseline: 54000, uplift: 131 },
    { name: "Mother's Day",    icon: '💐', date: 'May 10, 2026', window: 'May 6 – May 13',  revenue: 118600, baseline: 54000, uplift: 120 },
    { name: "Father's Day",    icon: '👔', date: 'Jun 21, 2026', window: 'Jun 17 – Jun 24', revenue: 72800,  baseline: 54000, uplift: 35 },
    { name: "New Year's",      icon: '🥂', date: 'Jan 1, 2026',  window: 'Dec 28 – Jan 6',  revenue: 68400,  baseline: 54000, uplift: 27 },
    { name: 'Halloween',       icon: '🎃', date: 'Oct 31, 2025', window: 'Oct 25 – Nov 3',  revenue: 64200,  baseline: 54000, uplift: 19 },
  ],
  pets: [
    { name: 'Christmas',       icon: '🎄', date: 'Dec 25, 2025', window: 'Dec 19 – Dec 28', revenue: 148200, baseline: 62000, uplift: 139 },
    { name: 'Black Friday',    icon: '🛍️', date: 'Nov 28, 2025', window: 'Nov 24 – Dec 1',  revenue: 138600, baseline: 62000, uplift: 124 },
    { name: "Father's Day",    icon: '👔', date: 'Jun 21, 2026', window: 'Jun 17 – Jun 24', revenue: 92400,  baseline: 62000, uplift: 49 },
    { name: "Mother's Day",    icon: '💐', date: 'May 10, 2026', window: 'May 6 – May 13',  revenue: 88200,  baseline: 62000, uplift: 42 },
    { name: "Valentine's Day", icon: '❤️', date: 'Feb 14, 2026', window: 'Feb 9 – Feb 16',  revenue: 82400,  baseline: 62000, uplift: 33 },
    { name: 'Halloween',       icon: '🎃', date: 'Oct 31, 2025', window: 'Oct 25 – Nov 3',  revenue: 76800,  baseline: 62000, uplift: 24 },
    { name: 'Labor Day',       icon: '🍂', date: 'Sep 1, 2025',  window: 'Aug 29 – Sep 7',  revenue: 68400,  baseline: 62000, uplift: 10 },
  ],
  home: [
    { name: 'Black Friday',    icon: '🛍️', date: 'Nov 28, 2025', window: 'Nov 24 – Dec 1',  revenue: 198600, baseline: 52000, uplift: 282 },
    { name: 'Christmas',       icon: '🎄', date: 'Dec 25, 2025', window: 'Dec 19 – Dec 28', revenue: 178400, baseline: 52000, uplift: 243 },
    { name: "Mother's Day",    icon: '💐', date: 'May 10, 2026', window: 'May 6 – May 13',  revenue: 98600,  baseline: 52000, uplift: 90 },
    { name: 'Memorial Day',    icon: '🇺🇸', date: 'May 25, 2026', window: 'May 21 – May 28', revenue: 88400,  baseline: 52000, uplift: 70 },
    { name: "Father's Day",    icon: '👔', date: 'Jun 21, 2026', window: 'Jun 17 – Jun 24', revenue: 72800,  baseline: 52000, uplift: 40 },
    { name: 'Labor Day',       icon: '🍂', date: 'Sep 1, 2025',  window: 'Aug 29 – Sep 7',  revenue: 64200,  baseline: 52000, uplift: 23 },
    { name: "New Year's",      icon: '🥂', date: 'Jan 1, 2026',  window: 'Dec 28 – Jan 6',  revenue: 58800,  baseline: 52000, uplift: 13 },
  ],
};

// Label months with real year for display (last 12 complete months from today)
function labeledMonthly(vertical) {
  const raw = MONTHLY[vertical] || MONTHLY.general;
  const today = new Date();
  // Work backwards: current month is index 11, 11 months ago is index 0
  return raw.map((m, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return { ...m, label };
  });
}

function getSeasonalData(vertical = 'general') {
  const v = MONTHLY[vertical] ? vertical : 'general';
  const monthly = labeledMonthly(v);
  const holidays = (HOLIDAYS[v] || HOLIDAYS.coffee).map(h => ({
    ...h,
    strength: h.uplift >= 100 ? 'Huge' : h.uplift >= 50 ? 'Strong' : h.uplift >= 20 ? 'Moderate' : 'Slight',
  }));
  return { vertical: v, monthly, holidays };
}

module.exports = { getSeasonalData };
