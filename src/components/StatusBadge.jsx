// StatusBadge.jsx
import { statusColor } from '../utils/formatters';

/**
 * Small pill badge for webhook event status.
 * @param {{ status: 'success'|'error'|'pending' }} props
 */
const StatusBadge = ({ status }) => {
  const classes = statusColor(status);
  const icons = { success: '✓', error: '✕', pending: '◌' };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${classes}`}
    >
      <span aria-hidden="true">{icons[status] ?? '?'}</span>
      {status}
    </span>
  );
};

export default StatusBadge;
