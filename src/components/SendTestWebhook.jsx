// SendTestWebhook.jsx — form to fire a test event from the UI
import { useState } from 'react';
import { useWebhookContext } from '../context/WebhookContext';
import { apiSetupHint, apiUrl, isApiConfigured, parseJsonSafe } from '../utils/api';

const SOURCES = ['github', 'stripe', 'shopify', 'slack', 'custom'];
const EVENTS  = ['push', 'pull_request', 'payment_intent', 'order_created', 'message', 'ping'];

const SendTestWebhook = () => {
  const { refresh } = useWebhookContext();
  const [source, setSource]   = useState('github');
  const [event, setEvent]     = useState('push');
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState(null);   // { ok, message }

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(apiUrl('/api/webhook'), {
        method: 'POST',
        headers: {
          'Content-Type':     'application/json',
          'x-webhook-source': source,
          'x-webhook-event':  event,
        },
        body: JSON.stringify({
          action: event,
          sender: { login: 'test-user' },
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await parseJsonSafe(res);
      const defaultError =
        (!isApiConfigured && import.meta.env.PROD && res.status === 404)
          ? `Failed: 404. ${apiSetupHint}`
          : `Failed: ${res.status}`;

      setResult({
        ok: res.ok,
        message: res.ok
          ? `Sent — id: ${data?.id?.slice(0, 8) ?? 'unknown'}…`
          : (data?.error ?? data?.message ?? defaultError),
      });
      if (res.ok) refresh();
    } catch (err) {
      setResult({ ok: false, message: err?.message ?? 'Network error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
      <h2 className="text-slate-200 font-semibold text-sm">Send Test Webhook</h2>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Source picker */}
        <Select label="Source" value={source} onChange={setSource} options={SOURCES} />
        {/* Event picker */}
        <Select label="Event"  value={event}  onChange={setEvent}  options={EVENTS}  />

        <button
          onClick={handleSend}
          disabled={sending}
          className="self-end sm:self-auto px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? 'Sending…' : 'Send →'}
        </button>
      </div>

      {result && (
        <p className={`text-xs ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.message}
        </p>
      )}
    </div>
  );
};

const Select = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1 flex-1">
    <span className="text-xs text-slate-400">{label}</span>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </label>
);

export default SendTestWebhook;
