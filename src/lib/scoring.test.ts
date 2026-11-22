import { describe, expect, it } from 'vitest';
import { calculateScore, derivePriority, planFindingChanges } from './scoring';

describe('calculateScore', () => {
  it('scores all yes as 100 and all no as 0', () => {
    expect(calculateScore([{ response: 'yes', weight: 2 }, { response: 'yes', weight: 1 }])).toBe(100);
    expect(calculateScore([{ response: 'no', weight: 2 }])).toBe(0);
  });
  it('counts partly as half and applies weights', () => {
    expect(calculateScore([{ response: 'yes', weight: 3 }, { response: 'partly', weight: 1 }])).toBe(88);
  });
  it('excludes not applicable and returns null when nothing applies', () => {
    expect(calculateScore([{ response: 'yes', weight: 1 }, { response: 'na', weight: 5 }])).toBe(100);
    expect(calculateScore([{ response: 'na', weight: 5 }])).toBeNull();
  });
});

describe('derivePriority', () => {
  it('keeps severity for no, lowers one level for partly, floors at low', () => {
    expect(derivePriority('critical', 'no')).toBe('critical');
    expect(derivePriority('critical', 'partly')).toBe('high');
    expect(derivePriority('low', 'partly')).toBe('low');
  });
  it('makes no finding for yes or na', () => {
    expect(derivePriority('high', 'yes')).toBeNull();
    expect(derivePriority('high', 'na')).toBeNull();
  });
});

describe('planFindingChanges', () => {
  const a = (response: 'yes' | 'no') => [{ questionId: 'q1', response, severity: 'high' as const }];
  it('creates a finding once and does not duplicate', () => {
    expect(planFindingChanges(a('no'), []).create).toEqual([{ questionId: 'q1', priority: 'high' }]);
    expect(planFindingChanges(a('no'), [{ questionId: 'q1', status: 'open' }]).create).toEqual([]);
  });
  it('auto-resolves open findings when the answer becomes yes', () => {
    expect(planFindingChanges(a('yes'), [{ questionId: 'q1', status: 'in_progress' }]).resolve).toEqual(['q1']);
  });
  it('leaves accepted risks alone and reopens resolved findings that worsen', () => {
    expect(planFindingChanges(a('yes'), [{ questionId: 'q1', status: 'accepted' }]).resolve).toEqual([]);
    expect(planFindingChanges(a('no'), [{ questionId: 'q1', status: 'resolved' }]).reopen).toEqual(['q1']);
  });
});
