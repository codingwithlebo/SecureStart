import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import type { Response } from '../lib/scoring';

interface Question {
  id: string; category: string; text: string; guidance: string; popia_ref: string | null; sort_order: number;
}
const OPTIONS: { value: Response; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'partly', label: 'Partly' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'Not applicable' },
];

export function Assessment() {
  const { session, orgs } = useAuth();
  const orgId = orgs[0]?.id;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Response>>({});
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'loading' | 'idle' | 'saving' | 'saved' | 'error'>('loading');
  const [result, setResult] = useState<number | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    setStatus('loading');
    setError('');
    const { data: qs, error: qe } = await supabase
      .from('questions')
      .select('id, category, text, guidance, popia_ref, sort_order')
      .order('sort_order');
    if (qe) {
      setError(qe.message);
      setStatus('error');
      return;
    }
    const list = (qs ?? []) as Question[];
    setQuestions(list);
    setCategory((c) => c || list[0]?.category || '');
    const { data: draft } = await supabase
      .from('assessments').select('id').eq('org_id', orgId).eq('status', 'draft')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (draft) {
      setAssessmentId(draft.id);
      const { data: ans } = await supabase.from('answers').select('question_id, response').eq('assessment_id', draft.id);
      setAnswers(Object.fromEntries((ans ?? []).map((a) => [a.question_id, a.response as Response])));
    } else {
      setAssessmentId(null);
      setAnswers({});
    }
    setStatus('idle');
  }, [orgId]);

  useEffect(() => { void load(); }, [load]);

  const categories = useMemo(() => [...new Set(questions.map((q) => q.category))], [questions]);
  const answered = questions.filter((q) => answers[q.id]).length;
  const complete = questions.length > 0 && answered === questions.length;

  const start = async () => {
    if (!orgId || !session) return;
    setError('');
    const { data, error: err } = await supabase
      .from('assessments').insert({ org_id: orgId, started_by: session.user.id }).select('id').single();
    if (err) return setError(err.message);
    setAssessmentId(data.id);
    setAnswers({});
    setResult(undefined);
  };

  const answer = async (questionId: string, value: Response) => {
    if (!assessmentId) return;
    setAnswers((a) => ({ ...a, [questionId]: value }));
    setStatus('saving');
    const { error: err } = await supabase.from('answers').upsert(
      { assessment_id: assessmentId, question_id: questionId, response: value },
      { onConflict: 'assessment_id,question_id' },
    );
    if (err) { setError(err.message); setStatus('error'); } else { setError(''); setStatus('saved'); }
  };

  const submit = async () => {
    if (!assessmentId) return;
    setSubmitting(true);
    setError('');
    const { data, error: err } = await supabase.rpc('submit_assessment', { p_assessment: assessmentId });
    setSubmitting(false);
    if (err) return setError(err.message);
    setResult(data as number | null);
    setAssessmentId(null);
    setAnswers({});
  };

  if (!orgId) return <p>You are not part of a firm yet.</p>;
  if (status === 'loading') return <p>Loading…</p>;

  const formula = (
    <p className="text-sm">
      How your score is calculated: Yes counts as 1, Partly as 0.5 and No as 0, each multiplied by the question’s
      weight. Not applicable questions are left out. The score is the points earned divided by the points possible.
    </p>
  );

  if (result !== undefined) {
    return (
      <section className="max-w-xl space-y-4">
        <h1 className="text-3xl">Assessment submitted</h1>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-sm">Your security score</p>
          <p className="font-heading text-6xl text-primary">{result === null ? '–' : result}<span className="text-2xl"> / 100</span></p>
          {result === null && <p className="text-sm mt-2">No questions applied, so no score was calculated.</p>}
        </div>
        {formula}
        <p>Every gap you reported has become a finding you can track.</p>
        <div className="flex gap-3">
          <Link to="/findings" className="rounded-lg bg-secondary text-white px-4 py-2 font-medium">View findings</Link>
          <button onClick={() => void start()} className="rounded-lg border border-secondary text-secondary px-4 py-2 font-medium">Start new assessment</button>
        </div>
      </section>
    );
  }

  if (!assessmentId) {
    return (
      <section className="max-w-xl space-y-4">
        <h1 className="text-3xl">Security and POPIA assessment</h1>
        <p>Answer {questions.length} questions about how your firm protects client information. You can leave and come back: your answers are saved as you go.</p>
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        <button onClick={() => void start()} className="rounded-lg bg-secondary text-white px-4 py-2 font-medium">Start assessment</button>
      </section>
    );
  }

  const inCategory = questions.filter((q) => q.category === category);
  const nextCategory = categories[categories.indexOf(category) + 1];

  return (
    <section className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-3xl">Security and POPIA assessment</h1>
        <div className="mt-3" aria-label="Progress">
          <div className="h-2 rounded bg-container"><div className="h-2 rounded bg-secondary" style={{ width: `${(answered / questions.length) * 100}%` }} /></div>
          <p className="text-sm mt-1" aria-live="polite">
            {answered} of {questions.length} answered ·{' '}
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Draft saved' : status === 'error' ? 'Not saved' : ''}
          </p>
        </div>
        <details className="mt-2"><summary className="text-sm underline cursor-pointer">How is my score calculated?</summary>{formula}</details>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
        {categories.map((c) => {
          const total = questions.filter((q) => q.category === c).length;
          const done = questions.filter((q) => q.category === c && answers[q.id]).length;
          return (
            <button key={c} role="tab" aria-selected={c === category} onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-sm border ${c === category ? 'bg-primary text-white border-primary' : 'bg-white border-slate-300'}`}>
              {c} ({done}/{total})
            </button>
          );
        })}
      </div>

      {inCategory.map((q) => (
        <fieldset key={q.id} className="bg-white rounded-2xl shadow p-5 space-y-3">
          <legend className="sr-only">{q.text}</legend>
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{q.text}</p>
            {q.popia_ref && <span className="shrink-0 rounded bg-container px-2 py-0.5 text-xs">{q.popia_ref}</span>}
          </div>
          <p className="text-sm bg-surface rounded-lg p-3">{q.guidance}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OPTIONS.map((o) => (
              <label key={o.value}
                className={`rounded-lg border px-3 py-2 text-sm text-center cursor-pointer focus-within:ring-2 focus-within:ring-secondary ${answers[q.id] === o.value ? 'border-secondary bg-container font-medium' : 'border-slate-300'}`}>
                <input type="radio" name={q.id} className="sr-only" checked={answers[q.id] === o.value} onChange={() => void answer(q.id, o.value)} />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {nextCategory && (
          <button onClick={() => setCategory(nextCategory)} className="rounded-lg border border-secondary text-secondary px-4 py-2 font-medium">Next: {nextCategory}</button>
        )}
        <button disabled={!complete || submitting} onClick={() => void submit()}
          className="rounded-lg bg-secondary text-white px-4 py-2 font-medium disabled:opacity-50">
          {submitting ? 'Submitting…' : 'Submit assessment'}
        </button>
        {!complete && <span className="text-sm">Answer all {questions.length} questions to submit.</span>}
      </div>
    </section>
  );
}
