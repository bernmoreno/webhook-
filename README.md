# Webhook Dashboard

Real-time webhook event monitor built with **Vite 5**, **React 18**, and **Tailwind CSS 3**.  
WEB 268 Capstone Portfolio project.

---

## Features

| Concept | Where |
|---------|-------|
| `useState` / `useEffect` / `useContext` | `useWebhooks.js`, `useDataFetching.js`, `WebhookContext.jsx` |
| Custom hooks | `src/hooks/useWebhooks.js`, `src/hooks/useDataFetching.js` |
| ES2021+ (optional chaining `?.`, nullish coalescing `??`) | `server/index.js`, `formatters.js`, all hooks |
| Responsive layout (Tailwind CSS) | `Dashboard.jsx`, `Header.jsx`, `WebhookCard.jsx` |
| Modern build tooling (Vite 5) | `vite.config.js` |
| Webhook ingestion & storage | `server/index.js` (Express) |

---

## Project Structure

```
webhook-dashboard/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── server/
│   └── index.js          ← Express webhook receiver (port 3001)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── WebhookContext.jsx
    ├── hooks/
    │   ├── useDataFetching.js
    │   └── useWebhooks.js
    ├── components/
    │   ├── Dashboard.jsx
    │   ├── Header.jsx
    │   ├── WebhookList.jsx
    │   ├── WebhookCard.jsx
    │   ├── SendTestWebhook.jsx
    │   └── StatusBadge.jsx
    └── utils/
        └── formatters.js
```

---

## Prerequisites

- Node.js 18+
- npm 9+

---

## Installation

```bash
# 1 — clone / download the project
cd webhook-dashboard

# 2 — install dependencies
npm install

# 3 — start both the API server and Vite dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Sending Webhooks

The Express server listens on `http://localhost:3001`.  
Use the **Send Test Webhook** panel in the UI, or send from a terminal:

```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-source: github" \
  -H "x-webhook-event: push" \
  -d '{"action":"push","repository":{"name":"my-repo"}}'
```

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/webhook` | Receive a webhook payload |
| `GET`  | `/api/webhooks` | List all stored events |
| `GET`  | `/api/webhooks/:id` | Single event by id |
| `DELETE` | `/api/webhooks/:id` | Delete one event |
| `DELETE` | `/api/webhooks` | Clear all events |
| `GET`  | `/api/stats` | Aggregate statistics |

---

## Build for Production

```bash
npm run build        # outputs to dist/
npm run preview      # local preview of the build
```

---

## Deployment

| Platform | Steps |
|----------|-------|
| **Vercel** | `vercel --prod` from project root (set `VITE_API_URL` env var to your backend URL) |
| **Netlify** | Drag `dist/` to Netlify dashboard, or connect the Git repo |
| **GitHub Pages** | Uses `.github/workflows/deploy-pages.yml` to build and deploy `dist/` automatically on push to `main` |

> **Note:** The Express server must be deployed separately (e.g. Railway, Render, Fly.io) for a fully live deployment.

### GitHub Pages setup checklist

1. In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Add repository variable **`VITE_API_URL`** with your deployed backend origin
  (example: `https://your-backend.onrender.com`).
3. Push to `main` and wait for the **Deploy to GitHub Pages** workflow to finish.

---

## Modern JavaScript Concepts Used

```js
// Optional chaining & nullish coalescing (ES2021+)
const source = req.headers['x-webhook-source'] ?? 'unknown';
const color  = map[source?.toLowerCase()] ?? 'bg-blue-700 text-blue-100';

// Top-level async inside useEffect
const fetchData = async () => { ... };
fetchData();

// Numeric separators & const declarations
const POLL_INTERVAL_MS = 4_000;
const MAX_STORE        = 200;
```

---

## License

MIT — free to use for educational and portfolio purposes.
