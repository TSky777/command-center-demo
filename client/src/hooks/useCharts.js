import { useState, useEffect, useCallback } from 'react';
import { fetchCharts } from '../utils/api';

export function useCharts(range, customStart, customEnd) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchCharts(range, customStart, customEnd);
      setData(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range, customStart, customEnd]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}
