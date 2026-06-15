import { useState, useEffect, useCallback } from 'react';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../utils/api';

export function useExpenses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExpenses();
      setData(result.expenses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (expense) => {
    const created = await createExpense(expense);
    setData((prev) => [created, ...prev]);
    return created;
  };

  const update = async (id, expense) => {
    const updated = await updateExpense(id, expense);
    setData((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  const remove = async (id) => {
    await deleteExpense(id);
    setData((prev) => prev.filter((e) => e.id !== id));
  };

  return { data, loading, error, refresh: load, add, update, remove };
}
