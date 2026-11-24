import { describe, expect, it } from 'vitest';
import { scoreChange, summarize, topRisks } from './dashboard';

const f = (priority: 'critical' | 'high' | 'medium' | 'low', status: 'open' | 'in_progress' | 'resolved' | 'accepted', due_date: string | null = null) => ({ priority, status, due_date });

describe('summarize', () => {
  const list = [f('critical', 'open', '2026-11-01'), f('high', 'in_progress'), f('low', 'resolved'), f('medium', 'accepted'), f('high', 'resolved', '2026-11-01')];
  it('counts active findings by priority, ignoring resolved and accepted', () => {
    expect(summarize(list, '2026-11-24').byPriority).toEqual({ critical: 1, high: 1, medium: 0, low: 0 });
  });
  it('computes progress and overdue (resolved findings are never overdue)', () => {
    const s = summarize(list, '2026-11-24');
    expect(s.progressPct).toBe(40);
    expect(s.overdue).toBe(1);
  });
  it('handles no findings', () => {
    expect(summarize([], '2026-11-24').progressPct).toBe(0);
  });
});

describe('topRisks', () => {
  it('returns active findings by priority then due date, limited to n', () => {
    const r = topRisks([f('low', 'open'), f('critical', 'resolved'), f('high', 'open', '2026-12-01'), f('high', 'open', '2026-11-30')], 2);
    expect(r.map((x) => x.due_date)).toEqual(['2026-11-30', '2026-12-01']);
  });
});

describe('scoreChange', () => {
  it('is null with fewer than two scores, otherwise last minus previous', () => {
    expect(scoreChange([60])).toBeNull();
    expect(scoreChange([50, 68])).toBe(18);
  });
});
