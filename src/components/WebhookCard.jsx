// WebhookCard.jsx
import { useWebhookContext } from '../context/WebhookContext';
import StatusBadge from './StatusBadge';
import { relativeTime, sourceColor, truncate } from '../utils/formatters';

/**
 * Single webhook event card — clickable to view detail.
 * @param {{ event: import('../hooks/useWebhooks').WebhookEvent }} props
 */
const WebhookCard = ({ event }) => {
  const { selected, setSelected, deleteEvent } = useWebhookContext();
  const isSelected = selected === event.id;

  return (
    <article
      onClick={() => setSelected(isSelected ? null : event.id)}
      className={`
        animate-slide-in cursor-pointer rounded-xl border p-4 transition-all
        ${isSelected
          ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/10'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'}
      `}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source badge */}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${sourceColor(event.source)}`}>
            {event.source}
          </span>
          <StatusBadge status={event.status} />
        </div>
        <time className="text-slate-500 text-xs whitespace-nowrap" dateTime={event.receivedAt}>
          {relativeTime(event.receivedAt)}
        </time>
      </div>

      {/* Event name */}
      <p className="mt-2 text-slate-200 font-medium text-sm">
        {truncate(event.event, 60)}
      </p>

      {/* Expanded detail */}
      {isSelected && (
        <div className="mt-3 space-y-3">
          {/* Headers */}
          <Section title="Headers">
            <KeyValueTable data={event.headers} />
          </Section>

          {/* Payload */}
          <Section title="Payload">
            <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </Section>

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Delete event
          </button>
        </div>
      )}
    </article>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</h3>
    {children}
  </div>
);

const KeyValueTable = ({ data }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
    {Object.entries(data).map(([k, v]) => (
      <>
        <dt key={`k-${k}`} className="text-slate-400 font-mono">{k}</dt>
        <dd key={`v-${k}`} className="text-slate-300 font-mono truncate">{v || '—'}</dd>
      </>
    ))}
  </dl>
);

export default WebhookCard;
