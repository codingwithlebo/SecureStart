export type Response = 'yes' | 'partly' | 'no' | 'na';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'accepted';

const VALUE: Record<Exclude<Response, 'na'>, number> = { yes: 1, partly: 0.5, no: 0 };
const ORDER: Severity[] = ['low', 'medium', 'high', 'critical'];

/** Score 0-100: earned weight / applicable weight. Null when nothing applies. */
export function calculateScore(answers: { response: Response; weight: number }[]): number | null {
  let earned = 0;
  let total = 0;
  for (const a of answers) {
    if (a.response === 'na') continue;
    earned += VALUE[a.response] * a.weight;
    total += a.weight;
  }
  return total === 0 ? null : Math.round((earned / total) * 100);
}

/** No keeps the question severity; Partly lowers it one level (floor Low); Yes/NA make no finding. */
export function derivePriority(severity: Severity, response: Response): Severity | null {
  if (response === 'yes' || response === 'na') return null;
  if (response === 'no') return severity;
  return ORDER[Math.max(ORDER.indexOf(severity) - 1, 0)];
}

export interface FindingPlan {
  create: { questionId: string; priority: Severity }[];
  resolve: string[];
  reopen: string[];
}

/** One finding per question: create new gaps, auto-resolve fixed ones, reopen worsened ones. */
export function planFindingChanges(
  answers: { questionId: string; response: Response; severity: Severity }[],
  existing: { questionId: string; status: FindingStatus }[],
): FindingPlan {
  const plan: FindingPlan = { create: [], resolve: [], reopen: [] };
  for (const a of answers) {
    const priority = derivePriority(a.severity, a.response);
    const found = existing.find((f) => f.questionId === a.questionId);
    if (priority) {
      if (!found) plan.create.push({ questionId: a.questionId, priority });
      else if (found.status === 'resolved') plan.reopen.push(a.questionId);
    } else if (found && (found.status === 'open' || found.status === 'in_progress')) {
      plan.resolve.push(a.questionId);
    }
  }
  return plan;
}
