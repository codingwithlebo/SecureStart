import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { scoreChange, summarize, topRisks } from '../lib/dashboard';
import type { FindingStatus, Severity } from '../lib/scoring';

interface Finding { id: string; priority: Severity; status: FindingStatus; due_date: string | null; question: { text: string } | null }
interface Point { score: number; date: string }
const ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

function Trend({ points }: { points: Point[] }) {
  const W = 320, H = 130, P = 18;
  const x = (i: number) => (points.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (points.length - 1));
  const y = (s: number) => H - P - (s / 100) * (H - 2 * P);
  const label = `Score over time: ${points.map((p) => `${p.score} on ${p.date}`).join(', ')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="w-full">
      <line x1={P} y1={y(0)} x2={W - P} y2={y(0)} stroke="#cbd5e1" />
      <line x1={P} y1={y(100)} x2={W - P} y2={y(100)} stroke="#e2e8f0" strokeDasharray="4" />
      <polyline fill="none" stroke="#006b5f" strokeWidth="2.5" points={points.map((p, i) => `${x(i)},${y(p.score)}`).join(' ')} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.score)} r="4" fill="#006b5f" />
          <text x={x(i)} y={y(p.score) - 8} textAnchor="middle" fontSize="11" fill="#0f2a43">{p.score}</text>
        </g>
      ))}
    </svg>
  );
}

export function Dashboard() {
  const { orgs } = useAuth();
  const orgId = orgs[0]?.id;
  const [points, setPoints] = useState<Point[] | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgId) return;
    void Promise.all([
      supabase.from('assessments').select('score, submitted_at').eq('org_id', orgId).eq('status', 'submitted').order('submitted_at'),
      supabase.from('findings').select('id, priority, status, due_date, question:questions(text)').eq('org_id', orgId),
    ]).then(([a, f]) => {
      if (a.error || f.error) return setError((a.error ?? f.error)!.message);
      setPoints((a.data ?? []).filter((r) => r.score !== null).map((r) => ({ score: r.score as number, date: String(r.submitted_at).slice(0, 10) })));
      setFindings(f.data as unknown as Finding[]);
    });
  }, [orgId]);

  if (!orgId) return <p>You are not part of a firm yet.</p>;
  if (error) return <p role="alert" className="text-red-700">{error}</p>;
  if (!points) return <p>Loading…</p>;

  const card = 'bg-white rounded-2xl shadow p-5';
  if (points.length === 0) {
    return (
      <section className="max-w-xl space-y-4">
        <h1 className="text-3xl">Dashboard</h1>
        <div className={card}>
          <h2 className="text-xl">No assessment yet</h2>
          <p className="mt-1">Complete your first security assessment to see your score, your risks and your progress here.</p>
          <Link to="/assessment" className="inline-block mt-4 rounded-lg bg-secondary text-white px-4 py-2 font-medium">Start assessment</Link>
        </div>
      </section>
    );
  }

  const latest = points[points.length - 1].score;
  const change = scoreChange(points.map((p) => p.score));
  const s = summarize(findings, new Date().toISOString().slice(0, 10));
  const risks = topRisks(findings);

  return (
    <section className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Dashboard</h1>
        <Link to="/assessment" className="rounded-lg bg-secondary text-white px-4 py-2 font-medium">Start new assessment</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <p className="text-sm">Security score</p>
          <p className="font-heading text-5xl text-primary">{latest}<span className="text-xl"> / 100</span></p>
          <p className="text-sm mt-1">{change === null ? 'First assessment' : `${change >= 0 ? '+' : ''}${change} since last assessment`}</p>
        </div>
        <div className={card}>
          <p className="text-sm mb-2">Open findings by priority</p>
          <ul className="space-y-1">
            {ORDER.map((p) => (
              <li key={p} className="flex items-center justify-between"><PriorityBadge p={p} /><span className="font-semibold">{s.byPriority[p]}</span></li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <p className="text-sm">Remediation progress</p>
          <p className="font-heading text-4xl text-primary">{s.progressPct}%</p>
          <div className="h-2 rounded bg-container mt-2"><div className="h-2 rounded bg-secondary" style={{ width: `${s.progressPct}%` }} /></div>
          <p className="text-sm mt-2">{s.resolved} of {s.total} resolved</p>
        </div>
        <div className={card}>
          <p className="text-sm">Overdue</p>
          <p className={`font-heading text-5xl ${s.overdue > 0 ? 'text-red-700' : 'text-primary'}`}>{s.overdue}</p>
          <p className="text-sm mt-1">{s.overdue > 0 ? 'Past their due date' : 'Nothing overdue'}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="text-xl mb-2">Score over time</h2>
          <Trend points={points} />
        </div>
        <div className={card}>
          <h2 className="text-xl mb-2">Top risks to fix first</h2>
          {risks.length === 0 && <p className="text-sm">No open risks. Nice work.</p>}
          <ul className="space-y-3">
            {risks.map((r) => (
              <li key={r.id}>
                <Link to={`/findings/${r.id}`} className="block hover:underline">
                  <span className="flex gap-2 mb-1"><PriorityBadge p={r.priority} /><StatusBadge s={r.status} /></span>
                  <span className="text-sm font-medium">{r.question?.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-xs">SecureStart is a risk assessment and tracking tool. It does not scan your systems or give legal advice.</p>
    </section>
  );
}
