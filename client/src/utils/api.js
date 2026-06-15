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
  const params = new URLSearchParams({ range });
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  return apiFetch(`/api/kpis?${params}`);
}

export function fetchExpenses() {
  return apiFetch('/api/expenses');
}

export function createExpense(data) {
  return apiFetch('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
}

export function updateExpense(id, data) {
  return apiFetch(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteExpense(id) {
  return apiFetch(`/api/expenses/${id}`, { method: 'DELETE' });
}

export function triggerRefresh() {
  return apiFetch('/api/refresh', { method: 'POST' });
}

export function demoLogin() {
  return apiFetch('/api/auth/demo', { method: 'POST' });
}
