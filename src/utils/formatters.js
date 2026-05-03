// formatters.js — utility helpers (ES2021+ optional chaining / nullish coalescing)

/**
 * Format an ISO date string into a human-readable relative time.
 * @param {string} iso
 */
export const relativeTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1_000);
  if (seconds < 60)  return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
};

/**
 * Truncate a string to maxLen characters.
 * @param {string | undefined} str
 * @param {number} maxLen
 */
export const truncate = (str, maxLen = 48) =>
  (str?.length ?? 0) > maxLen ? `${str.slice(0, maxLen)}…` : (str ?? '');

/**
 * Map a source name to a colour class for badges.
 * Uses nullish coalescing to fall back to a default.
 * @param {string} source
 */
export const sourceColor = (source) => {
  const map = {
    github:  'bg-gray-700 text-gray-100',
    stripe:  'bg-purple-700 text-purple-100',
    shopify: 'bg-green-700 text-green-100',
    slack:   'bg-yellow-700 text-yellow-100',
  };
  return map[source?.toLowerCase()] ?? 'bg-blue-700 text-blue-100';
};

/**
 * Map a status string to Tailwind classes.
 * @param {'success'|'error'|'pending'} status
 */
export const statusColor = (status) => {
  const map = {
    success: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
    error:   'bg-red-500/20 text-red-400 ring-red-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
  };
  return map[status] ?? 'bg-slate-500/20 text-slate-400 ring-slate-500/30';
};
