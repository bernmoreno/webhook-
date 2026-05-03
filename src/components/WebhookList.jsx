// WebhookList.jsx
import { useWebhookContext } from '../context/WebhookContext';
import WebhookCard from './WebhookCard';
import { webhookEndpoint } from '../utils/api';

const WebhookList = () => {
  const { events, loading, error, filter, setFilter, sources } = useWebhookContext();

  return (
    <div className="flex flex-col gap-4">

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {sources.map(src => (
          <button
            key={src}
            onClick={() => setFilter(src)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === src
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* State: loading */}
      {loading && (
        <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
          <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          Loading events…
        </div>
      )}

      {/* State: error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-4 text-red-300 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* State: empty */}
      {!loading && !error && events.length === 0 && (
        <div className="py-16 text-center text-slate-500">
          <p className="text-4xl mb-3" aria-hidden="true">📭</p>
          <p>No webhook events yet.</p>
          <p className="text-xs mt-1">
            Send a POST to{' '}
            <code className="bg-slate-700 px-1 rounded text-slate-300">{webhookEndpoint}</code>
          </p>
        </div>
      )}

      {/* Event list */}
      {!loading && !error && events.length > 0 && (
        <ul className="space-y-3 event-scroll overflow-y-auto max-h-[calc(100vh-14rem)]">
          {events.map(event => (
            <li key={event.id}>
              <WebhookCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WebhookList;
