/**
 * webhook-dashboard — Express backend
 * Receives, stores, and serves webhook events.
 *
 * Endpoints:
 *   POST /api/webhook          — receive an incoming webhook payload
 *   GET  /api/webhooks         — list all stored events (newest first)
 *   GET  /api/webhooks/:id     — get a single event by id
 *   DELETE /api/webhooks/:id   — delete a single event
 *   DELETE /api/webhooks       — clear all events
 *   GET  /api/stats            — summary statistics
 */

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT ?? 3001;

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,https://bernmoreno.github.io')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl/Postman) and configured frontends
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
}));

// Parse JSON bodies; also capture raw body for signature verification hooks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── In-memory store (replace with a DB for production) ───────────────────────
/** @type {WebhookEvent[]} */
let webhookStore = [];

/**
 * @typedef {Object} WebhookEvent
 * @property {string}  id
 * @property {string}  source      — derived from x-webhook-source header
 * @property {string}  event       — derived from x-webhook-event header
 * @property {'success'|'error'|'pending'} status
 * @property {string}  receivedAt  — ISO timestamp
 * @property {unknown} payload     — raw JSON body
 * @property {Record<string,string>} headers — selected request headers
 */

// Seed with sample events so the UI isn't empty on first load
function seedStore() {
  const samples = [
    { source: 'github',  event: 'push',          status: 'success' },
    { source: 'stripe',  event: 'payment_intent', status: 'success' },
    { source: 'shopify', event: 'order_created',  status: 'pending' },
    { source: 'github',  event: 'pull_request',   status: 'error'   },
  ];

  webhookStore = samples.map((s, i) => ({
    id: randomUUID(),
    source: s.source,
    event: s.event,
    status: s.status,
    receivedAt: new Date(Date.now() - (samples.length - i) * 60_000).toISOString(),
    payload: {
      action: s.event,
      sender: { login: 'demo-user' },
      repository: { name: 'demo-repo' },
    },
    headers: {
      'content-type': 'application/json',
      'x-webhook-source': s.source,
      'x-webhook-event': s.event,
    },
  }));
}
seedStore();

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/webhook — receive a webhook
app.post('/api/webhook', (req, res) => {
  const source = req.headers['x-webhook-source'] ?? req.headers['x-github-event'] ? 'github' : 'unknown';
  const event  = req.headers['x-webhook-event']  ?? req.headers['x-github-event'] ?? 'unknown';

  // Validate: reject empty bodies
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Empty payload rejected' });
  }

  /** @type {WebhookEvent} */
  const entry = {
    id: randomUUID(),
    source: String(source).slice(0, 64),
    event:  String(event).slice(0, 64),
    status: 'success',
    receivedAt: new Date().toISOString(),
    payload: req.body,
    headers: {
      'content-type':     req.headers['content-type']     ?? '',
      'x-webhook-source': req.headers['x-webhook-source'] ?? '',
      'x-webhook-event':  req.headers['x-webhook-event']  ?? '',
    },
  };

  webhookStore.unshift(entry);

  // Cap the store at 200 events
  if (webhookStore.length > 200) webhookStore = webhookStore.slice(0, 200);

  console.log(`[webhook] ${entry.source} • ${entry.event} — ${entry.id}`);
  res.status(201).json({ received: true, id: entry.id });
});

// GET /api/webhooks — list all events
app.get('/api/webhooks', (_req, res) => {
  res.json(webhookStore);
});

// GET /api/webhooks/:id — single event
app.get('/api/webhooks/:id', (req, res) => {
  const entry = webhookStore.find(e => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
});

// DELETE /api/webhooks/:id — remove one event
app.delete('/api/webhooks/:id', (req, res) => {
  const before = webhookStore.length;
  webhookStore = webhookStore.filter(e => e.id !== req.params.id);
  if (webhookStore.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: req.params.id });
});

// DELETE /api/webhooks — clear all
app.delete('/api/webhooks', (_req, res) => {
  webhookStore = [];
  res.json({ cleared: true });
});

// GET /api/stats — aggregate counts
app.get('/api/stats', (_req, res) => {
  const total   = webhookStore.length;
  const success = webhookStore.filter(e => e.status === 'success').length;
  const error   = webhookStore.filter(e => e.status === 'error').length;
  const pending = webhookStore.filter(e => e.status === 'pending').length;

  // Events per source
  const bySources = webhookStore.reduce((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + 1;
    return acc;
  }, {});

  res.json({ total, success, error, pending, bySources });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Webhook server listening on http://localhost:${PORT}`);
  console.log(`  POST http://localhost:${PORT}/api/webhook  — send a test webhook`);
});
