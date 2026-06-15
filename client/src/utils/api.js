import {
  staticKpis,
  staticFetchExpenses,
  staticCreateExpense,
  staticUpdateExpense,
  staticDeleteExpense,
} from './staticData';

// In static builds (GitHub Pages etc.) there is no server — use bundled demo
// data + localStorage instead of hitting /api. Set at build time.
const STATIC = import.meta.env.VITE_DEMO_STATIC === '1';

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

export function fetchKPIs(range = 'today', start, end) {
  if (STATIC) return staticKpis(range);
  const params = new URLSearchParams({ range });
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  return apiFetch(`/api/kpis?${params}`);
}

export function fetchExpenses() {
  if (STATIC) return staticFetchExpenses();
  return apiFetch('/api/expenses');
}

export function createExpense(data) {
  if (STATIC) return staticCreateExpense(data);
  return apiFetch('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
}

export function updateExpense(id, data) {
  if (STATIC) return staticUpdateExpense(id, data);
  return apiFetch(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteExpense(id) {
  if (STATIC) return staticDeleteExpense(id);
  return apiFetch(`/api/expenses/${id}`, { method: 'DELETE' });
}

export function triggerRefresh() {
  if (STATIC) return Promise.resolve({ success: true });
  return apiFetch('/api/refresh', { method: 'POST' });
}

export function demoLogin() {
  if (STATIC) return Promise.resolve({ name: 'Demo Admin', email: 'demo@democo.example', role: 'admin', picture: null });
  return apiFetch('/api/auth/demo', { method: 'POST' });
}
