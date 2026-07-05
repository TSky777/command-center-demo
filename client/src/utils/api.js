import {
  staticKpis,
  staticCharts,
  staticSeasonal,
  staticFetchExpenses,
  staticCreateExpense,
  staticUpdateExpense,
  staticDeleteExpense,
} from './staticData';

// In static builds (GitHub Pages etc.) there is no server — use bundled demo
// data + localStorage instead of hitting /api. Set at build time.
const STATIC = import.meta.env.VITE_DEMO_STATIC === '1';
const API_BASE = import.meta.env.VITE_API_BASE || '';
const TOKEN_KEY = 'cc_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    if (res.status === 401) {
      const hasStoredSession = token || localStorage.getItem('cc_user');
      if (hasStoredSession) {
        clearToken();
        localStorage.removeItem('cc_user');
        window.location.reload();
        throw new Error('Session expired');
      }
    }
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

export function fetchSeasonal() {
  if (STATIC) return staticSeasonal();
  return apiFetch('/api/seasonal');
}

export function fetchCharts(range = '7d', start, end) {
  if (STATIC) return staticCharts(range);
  const params = new URLSearchParams({ range });
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  return apiFetch(`/api/charts?${params}`);
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

// ─── Real client login ───
export async function login(username, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data.user;
}
