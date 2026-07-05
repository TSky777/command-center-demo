// ─── Static (serverless) demo data layer ───
// When the app is built with VITE_DEMO_STATIC=1 (e.g. for GitHub Pages), there
// is no backend. KPIs are read from pre-generated JSON snapshots and expenses
// are kept in the browser's localStorage. The full-stack build does not use
// this file at all.

const BASE = import.meta.env.BASE_URL || '/';
const LS_KEY = 'cc_demo_expenses';

const RANGE_FILE = {
  today: 'today', yesterday: 'yesterday', '7d': '7d', '14d': '14d', '30d': '30d',
  '1yr': '30d', all: '30d',
  custom: '14d', // custom ranges reuse the 14-day snapshot in static mode
};

const CHART_RANGE_FILE = {
  today: '7d', yesterday: '7d', '7d': '7d', '14d': '14d', '30d': '30d',
  '1yr': '1yr', all: '1yr', custom: '14d',
};

export async function staticCharts(range = '7d') {
  const file = CHART_RANGE_FILE[range] || '7d';
  const res = await fetch(`${BASE}demo-data/charts-${file}.json`);
  if (!res.ok) throw new Error('Demo chart data not found');
  return res.json();
}

export async function staticSeasonal() {
  const res = await fetch(`${BASE}demo-data/seasonal.json`);
  if (!res.ok) throw new Error('Demo seasonal data not found');
  return res.json();
}

export async function staticKpis(range = 'today') {
  const file = RANGE_FILE[range] || '14d';
  const res = await fetch(`${BASE}demo-data/kpis-${file}.json`);
  if (!res.ok) throw new Error('Demo data not found');
  return res.json();
}

async function seedExpenses() {
  const res = await fetch(`${BASE}demo-data/expenses.json`);
  const data = res.ok ? await res.json() : { expenses: [] };
  localStorage.setItem(LS_KEY, JSON.stringify(data.expenses || []));
  return data.expenses || [];
}

async function readExpenses() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return seedExpenses();
  try {
    return JSON.parse(raw);
  } catch {
    return seedExpenses();
  }
}

function writeExpenses(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export async function staticFetchExpenses() {
  return { expenses: await readExpenses() };
}

export async function staticCreateExpense(body) {
  const list = await readExpenses();
  const row = {
    id: Date.now(),
    name: body.name,
    amount: parseFloat(body.amount),
    frequency: body.frequency || 'monthly',
    category: body.category || 'Other',
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    created_at: new Date().toISOString(),
  };
  writeExpenses([row, ...list]);
  return row;
}

export async function staticUpdateExpense(id, patch) {
  const list = await readExpenses();
  const row = list.find((e) => e.id === Number(id));
  if (!row) throw new Error('Expense not found');
  Object.assign(row, {
    ...patch,
    amount: patch.amount !== undefined ? parseFloat(patch.amount) : row.amount,
  });
  writeExpenses(list);
  return row;
}

export async function staticDeleteExpense(id) {
  const list = await readExpenses();
  writeExpenses(list.filter((e) => e.id !== Number(id)));
  return { deleted: true };
}
