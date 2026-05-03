// useWebhooks.js — domain hook that wraps polling + mutations
import { useState, useEffect, useCallback } from 'react';
import { apiUrl, formatApiError, isDemoMode } from '../utils/api';

const POLL_INTERVAL_MS = 4_000;

const demoEvents = [
  {
    id: 'demo-github-push',
    source: 'github',
    event: 'push',
    status: 'success',
    receivedAt: new Date(Date.now() - 120_000).toISOString(),
    payload: { action: 'push', repository: { name: 'webhook-dashboard' } },
    headers: { 'x-webhook-source': 'github', 'x-webhook-event': 'push' },
  },
  {
    id: 'demo-stripe-payment',
    source: 'stripe',
    event: 'payment_intent',
    status: 'pending',
    receivedAt: new Date(Date.now() - 60_000).toISOString(),
    payload: { type: 'payment_intent.succeeded', amount: 4999 },
    headers: { 'x-webhook-source': 'stripe', 'x-webhook-event': 'payment_intent' },
  },
];

const demoStats = {
  total: demoEvents.length,
  success: demoEvents.filter(e => e.status === 'success').length,
  error: demoEvents.filter(e => e.status === 'error').length,
  pending: demoEvents.filter(e => e.status === 'pending').length,
  bySources: demoEvents.reduce((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + 1;
    return acc;
  }, {}),
};

/**
 * Manages live webhook event data with polling, filtering, and mutations.
 * @returns webhook state and action callbacks
 */
export const useWebhooks = () => {
  const [events, setEvents]         = useState(isDemoMode ? demoEvents : []);
  const [loading, setLoading]       = useState(!isDemoMode);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState('all');   // 'all' | source name
  const [selected, setSelected]     = useState(null);    // selected event id
  const [stats, setStats]           = useState(isDemoMode ? demoStats : null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    if (isDemoMode) {
      setEvents(demoEvents);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/webhooks'));
      if (!res.ok) throw new Error(formatApiError(res.status, 'Failed to fetch events'));
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
    if (isDemoMode) {
      setStats(demoStats);
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/stats'));
      if (!res.ok) return;
      setStats(await res.json());
    } catch {
      // stats are non-critical, fail silently
    }
  }, []);

  // ── Initial load + polling ─────────────────────────────────────────────────
  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      setError(null);
      setEvents(demoEvents);
      setStats(demoStats);
      return;
    }

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
    if (isDemoMode) {
      setEvents(prev => prev.filter(e => e.id !== id));
      if (selected === id) setSelected(null);
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/webhooks/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setEvents(prev => prev.filter(e => e.id !== id));
      if (selected === id) setSelected(null);
      fetchStats();
    } catch (err) {
      setError(err?.message ?? 'Delete failed');
    }
  }, [selected, fetchStats]);

  const clearAll = useCallback(async () => {
    if (isDemoMode) {
      setEvents([]);
      setSelected(null);
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/webhooks'), { method: 'DELETE' });
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
