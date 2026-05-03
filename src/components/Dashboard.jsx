// Dashboard.jsx — main layout
import Header from './Header';
import WebhookList from './WebhookList';
import SendTestWebhook from './SendTestWebhook';
import { apiSetupHint, isApiConfigured, webhookEndpoint } from '../utils/api';

const Dashboard = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <Header />

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left / main: event list */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest">
            Live Events
          </h2>
          <WebhookList />
        </section>

        {/* Right sidebar */}
        <aside className="space-y-6">
          {!isApiConfigured && (
            <div className="rounded-xl border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-200">
              <p className="font-semibold">Backend not configured for production</p>
              <p className="mt-1 text-xs leading-5">{apiSetupHint}</p>
            </div>
          )}

          <SendTestWebhook />

          {/* Info card */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 space-y-2 text-sm text-slate-400">
            <p className="font-semibold text-slate-300">Webhook Endpoint</p>
            <code className="block bg-slate-900 px-3 py-2 rounded text-xs text-blue-300 break-all">
              POST {webhookEndpoint}
            </code>
            <p className="text-xs">
              Required headers:{' '}
              <code className="text-slate-300">x-webhook-source</code>,{' '}
              <code className="text-slate-300">x-webhook-event</code>
            </p>
            <p className="text-xs">Auto-refreshes every 4 seconds.</p>
          </div>
        </aside>
      </div>
    </main>
  </div>
);

export default Dashboard;
