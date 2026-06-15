import { useState, useEffect, useCallback } from 'react';
import { fetchKPIs } from '../utils/api';

export function useKPIs(range, customStart, customEnd) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const kpis = await fetchKPIs(range, customStart, customEnd);
      setData(kpis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range, customStart, customEnd]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}
