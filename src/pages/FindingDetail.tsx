import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { PriorityBadge, StatusBadge, STATUS_LABEL, isOverdue } from '../components/Badges';
import type { FindingStatus, Severity } from '../lib/scoring';

interface Finding {
  id: string; org_id: string; priority: Severity; status: FindingStatus; due_date: string | null;
  notes: string; assignee_id: string | null;
  question: { text: string; category: string; guidance: string; remediation: string; popia_ref: string | null } | null;
}
interface Event { id: string; from_status: FindingStatus | null; to_status: FindingStatus; created_at: string; actor: { full_name: string } | null }
interface Admin { user_id: string; profiles: { full_name: string } | null }

export function FindingDetail() {
  const { id } = useParams();
  const { role } = useAuth();
  const isAdmin = role === 'administrator';
  const [f, setF] = useState<Finding | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [status, setStatus] = useState<FindingStatus>('open');
  const [notes, setNotes] = useState('');
  const [assignee, setAssignee] = useState('');
  const [due, setDue] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const loadEvents = useCallback(async () => {
    const { data } = await supabase
      .from('finding_events')
      .select('id, from_status, to_status, created_at, actor:profiles!actor_id(full_name)')
      .eq('finding_id', id!)
      .order('created_at', { ascending: false });
    setEvents((data ?? []) as unknown as Event[]);
  }, [id]);

  useEffect(() => {
    void (async () => {
      const { data, error: e } = await supabase
        .from('findings')
        .select('id, org_id, priority, status, due_date, notes, assignee_id, question:questions(text, category, guidance, remediation, popia_ref)')
        .eq('id', id!)
        .single();
      if (e || !data) { setError(e?.message ?? 'Finding not found'); return; }
      const row = data as unknown as Finding;
      setF(row); setStatus(row.status); setNotes(row.notes); setAssignee(row.assignee_id ?? ''); setDue(row.due_date ?? '');
      const { data: a } = await supabase
        .from('org_members').select('user_id, profiles(full_name)').eq('org_id', row.org_id).eq('member_role', 'administrator');
      setAdmins((a ?? []) as unknown as Admin[]);
      await loadEvents();
    })();
  }, [id, loadEvents]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(''); setMsg('');
    const changes = isAdmin
      ? { status, notes, assignee_id: assignee || null, due_date: due || null }
      : { status, notes };
    const { error: err } = await supabase.from('findings').update(changes).eq('id', id!);
    setBusy(false);
    if (err) return setError(err.message);
    setF((prev) => (prev ? { ...prev, status, notes, assignee_id: assignee || null, due_date: due || null } : prev));
    setMsg('Saved');
    await loadEvents();
  };

  if (error && !f) return <p role="alert" className="text-red-700">{error}</p>;
  if (!f || !f.question) return <p>Loading…</p>;
  const q = f.question;
  const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2';

  return (
    <section className="max-w-4xl space-y-5">
      <Link to="/findings" className="text-sm underline">← Back to findings</Link>
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge p={f.priority} />
        <StatusBadge s={f.status} />
        {isOverdue(f.due_date, f.status) && <span className="text-xs font-semibold text-red-700">Overdue</span>}
        {q.popia_ref && <span className="rounded bg-container px-2 py-0.5 text-xs">{q.popia_ref}</span>}
      </div>
      <h1 className="text-3xl">{q.text}</h1>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-xl">Why this matters</h2>
            <p className="mt-1">{q.guidance}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-xl">Recommended fix</h2>
            <p className="mt-1">{q.remediation}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-xl">Activity</h2>
            {events.length === 0 && <p className="text-sm mt-1">No status changes yet.</p>}
            <ul className="mt-2 space-y-2 text-sm">
              {events.map((ev) => (
                <li key={ev.id}>
                  {ev.actor?.full_name ?? 'Someone'} changed the status{ev.from_status ? ` from ${STATUS_LABEL[ev.from_status]}` : ''} to{' '}
                  <b>{STATUS_LABEL[ev.to_status]}</b> · {new Date(ev.created_at).toLocaleString('en-ZA')}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={save} className="bg-white rounded-2xl shadow p-5 space-y-4 self-start">
          <h2 className="text-xl">Manage this finding</h2>
          <label className="block text-sm">Status
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value as FindingStatus)}>
              {(Object.keys(STATUS_LABEL) as FindingStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <label className="block text-sm">Assignee
            <select className={field} value={assignee} disabled={!isAdmin} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Unassigned</option>
              {admins.map((a) => <option key={a.user_id} value={a.user_id}>{a.profiles?.full_name || 'Administrator'}</option>)}
            </select>
          </label>
          <label className="block text-sm">Due date
            <input type="date" className={field} value={due} disabled={!isAdmin} onChange={(e) => setDue(e.target.value)} />
          </label>
          {!isAdmin && <p className="text-xs">Your IT administrator manages assignment and due dates.</p>}
          <label className="block text-sm">Notes
            <textarea className={field} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {msg && <p role="status" className="text-sm text-green-800">{msg}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-secondary text-white py-2 font-medium disabled:opacity-60">
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </section>
  );
}
