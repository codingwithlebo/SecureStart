import type { FindingStatus, Severity } from './scoring';

export interface F { priority: Severity; status: FindingStatus; due_date: string | null }
const ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];
const isActive = (s: FindingStatus) => s === 'open' || s === 'in_progress';

export function summarize(findings: F[], today: string) {
  const byPriority: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  let resolved = 0;
  let overdue = 0;
  for (const f of findings) {
    if (isActive(f.status)) {
      byPriority[f.priority]++;
      if (f.due_date && f.due_date < today) overdue++;
    }
    if (f.status === 'resolved') resolved++;
  }
  const total = findings.length;
  return { byPriority, resolved, total, overdue, progressPct: total === 0 ? 0 : Math.round((resolved / total) * 100) };
}

export function topRisks<T extends F>(findings: T[], n = 5): T[] {
  return findings
    .filter((f) => isActive(f.status))
    .sort((a, b) => ORDER.indexOf(a.priority) - ORDER.indexOf(b.priority) || (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'))
    .slice(0, n);
}

export function scoreChange(scores: number[]): number | null {
  return scores.length < 2 ? null : scores[scores.length - 1] - scores[scores.length - 2];
}
