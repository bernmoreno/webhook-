// useWebhooks.js — domain hook that wraps polling + mutations
import { useState, useEffect, useCallback } from 'react';

const POLL_INTERVAL_MS = 4_000;

/**
 * Manages live webhook event data with polling, filtering, and mutations.
 * @returns webhook state and action callbacks
 */
export const useWebhooks = () => {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState('all');   // 'all' | source name
  const [selected, setSelected]     = useState(null);    // selected event id
  const [stats, setStats]           = useState(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/webhooks');
      if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
      const data = await res.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err?.message ?? 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      setStats(await res.json());
    } catch {
      // stats are non-critical, fail silently
    }
  }, []);

  // ── Initial load + polling ─────────────────────────────────────────────────
  useEffect(() => {
    fetchEvents();
    fetchStats();

    const id = setInterval(() => {
      fetchEvents();
      fetchStats();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [fetchEvents, fetchStats]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const deleteEvent = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setEvents(prev => prev.filter(e => e.id !== id));
      if (selected === id) setSelected(null);
      fetchStats();
    } catch (err) {
      setError(err?.message ?? 'Delete failed');
    }
  }, [selected, fetchStats]);

  const clearAll = useCallback(async () => {
    try {
      const res = await fetch('/api/webhooks', { method: 'DELETE' });
      if (!res.ok) throw new Error('Clear failed');
      setEvents([]);
      setSelected(null);
      fetchStats();
    } catch (err) {
      setError(err?.message ?? 'Clear failed');
    }
  }, [fetchStats]);

  // ── Derived: filtered list ─────────────────────────────────────────────────
  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.source === filter);

  // Unique sources for filter tabs (ES2021 Set spread)
  const sources = ['all', ...new Set(events.map(e => e.source))];

  return {
    events: filteredEvents,
    allEvents: events,
    loading,
    error,
    stats,
    filter,
    setFilter,
    sources,
    selected,
    setSelected,
    deleteEvent,
    clearAll,
    refresh: fetchEvents,
  };
};
