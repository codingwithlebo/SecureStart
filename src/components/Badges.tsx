import type { FindingStatus, Severity } from '../lib/scoring';

const PRIORITY: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-200 text-slate-700',
};
const STATUS: Record<FindingStatus, string> = {
  open: 'bg-slate-200 text-slate-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  accepted: 'bg-purple-100 text-purple-800',
};
export const STATUS_LABEL: Record<FindingStatus, string> = {
  open: 'Open', in_progress: 'In progress', resolved: 'Resolved', accepted: 'Accepted risk',
};
const chip = 'rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap';

export const PriorityBadge = ({ p }: { p: Severity }) => (
  <span className={`${chip} ${PRIORITY[p]}`}>{p[0].toUpperCase() + p.slice(1)}</span>
);
export const StatusBadge = ({ s }: { s: FindingStatus }) => (
  <span className={`${chip} ${STATUS[s]}`}>{STATUS_LABEL[s]}</span>
);
export const isOverdue = (due: string | null, status: FindingStatus) =>
  !!due && due < new Date().toISOString().slice(0, 10) && (status === 'open' || status === 'in_progress');
