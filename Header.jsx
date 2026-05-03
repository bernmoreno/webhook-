// Header.jsx
import { useWebhookContext } from '../context/WebhookContext';

const Header = () => {
  const { stats, clearAll, refresh } = useWebhookContext();

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center gap-3">

        {/* Logo + title */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg select-none">
            W
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">Webhook Dashboard</h1>
            <p className="text-slate-400 text-xs">Real-time event monitor</p>
          </div>
        </div>

        {/* Live stat chips */}
        {stats && (
          <div className="flex gap-2 flex-wrap text-xs">
            <Chip label="Total"   value={stats.total}   color="bg-slate-700 text-slate-200" />
            <Chip label="OK"      value={stats.success} color="bg-emerald-900/60 text-emerald-300" />
            <Chip label="Error"   value={stats.error}   color="bg-red-900/60 text-red-300" />
            <Chip label="Pending" value={stats.pending} color="bg-yellow-900/60 text-yellow-300" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1.5 text-sm rounded-md bg-red-700/80 text-red-100 hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </header>
  );
};

const Chip = ({ label, value, color }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${color}`}>
    <span className="opacity-70">{label}</span>
    <span className="font-bold">{value}</span>
  </span>
);

export default Header;
