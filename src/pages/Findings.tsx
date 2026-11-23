import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { PriorityBadge, StatusBadge, STATUS_LABEL, isOverdue } from '../components/Badges';
import type { FindingStatus, Severity } from '../lib/scoring';

interface Row {
  id: string; priority: Severity; status: FindingStatus; due_date: string | null;
  question: { text: string; category: string } | null;
  assignee: { full_name: string } | null;
}
const ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

export function Findings() {
  const { orgs } = useAuth();
  const orgId = orgs[0]?.id;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'all' | FindingStatus>('all');
  const [priority, setPriority] = useState<'all' | Severity>('all');

  useEffect(() => {
    if (!orgId) return;
    void supabase
      .from('findings')
      .select('id, priority, status, due_date, question:questions(text, category), assignee:profiles!assignee_id(full_name)')
      .eq('org_id', orgId)
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setRows(data as unknown as Row[]);
      });
  }, [orgId]);

  const shown = useMemo(
    () =>
      (rows ?? [])
        .filter((r) => (status === 'all' || r.status === status) && (priority === 'all' || r.priority === priority))
        .sort((a, b) => ORDER.indexOf(a.priority) - ORDER.indexOf(b.priority) || (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999')),
    [rows, status, priority],
  );

  if (!orgId) return <p>You are not part of a firm yet.</p>;
  if (error) return <p role="alert" className="text-red-700">{error}</p>;
  if (!rows) return <p>Loading…</p>;

  const select = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
  return (
    <section className="max-w-4xl space-y-4">
      <h1 className="text-3xl">Findings</h1>
      <p className="text-sm">Findings are created automatically when an assessment is submitted.</p>
      <div className="flex flex-wrap gap-3">
        <label className="text-sm">Status{' '}
          <select className={select} value={status} onChange={(e) => setStatus(e.target.value as 'all' | FindingStatus)}>
            <option value="all">All</option>
            {(Object.keys(STATUS_LABEL) as FindingStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
        <label className="text-sm">Priority{' '}
          <select className={select} value={priority} onChange={(e) => setPriority(e.target.value as 'all' | Severity)}>
            <option value="all">All</option>
            {ORDER.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
          </select>
        </label>
        <span className="text-sm self-center">{shown.length} shown</span>
      </div>

      {rows.length === 0 && <p className="bg-white rounded-2xl p-6 shadow">No findings yet. Complete an assessment to find out where your gaps are.</p>}
      {rows.length > 0 && shown.length === 0 && <p>No findings match these filters.</p>}

      <ul className="space-y-3">
        {shown.map((r) => (
          <li key={r.id}>
            <Link to={`/findings/${r.id}`} className="block bg-white rounded-2xl shadow p-4 hover:ring-2 hover:ring-secondary focus-visible:ring-2 focus-visible:ring-secondary">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <PriorityBadge p={r.priority} />
                <StatusBadge s={r.status} />
                {isOverdue(r.due_date, r.status) && <span className="text-xs font-semibold text-red-700">Overdue</span>}
                <span className="text-xs">{r.question?.category}</span>
              </div>
              <p className="font-medium">{r.question?.text}</p>
              <p className="text-sm mt-2">
                {r.assignee ? `Assigned to ${r.assignee.full_name}` : 'Unassigned'}
                {r.due_date ? ` · Due ${r.due_date}` : ''}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
