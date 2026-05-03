// useDataFetching.js — generic fetch hook (ES2021+)
import { useState, useEffect } from 'react';

/**
 * Generic data-fetching hook.
 * @template T
 * @param {string | null} url — pass null to skip fetching
 * @returns {{ data: T | null, loading: boolean, error: string | null, refetch: () => void }}
 */
export const useDataFetching = (url) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);

  // Expose a manual refetch trigger
  const refetch = () => setTick(t => t + 1);

  useEffect(() => {
    // Skip if no URL provided
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response failed: ${response.status}`);
        const result = await response.json();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    // Cleanup: ignore stale responses
    return () => { cancelled = true; };
  }, [url, tick]);

  return { data, loading, error, refetch };
};
