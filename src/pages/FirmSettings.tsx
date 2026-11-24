import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

const INDUSTRIES = ['Accounting', 'Legal', 'Medical or dental', 'Other professional services'];
const SIZES = [
  { value: '1-5', label: '1 to 5 staff' },
  { value: '6-20', label: '6 to 20 staff' },
  { value: '21-50', label: '21 to 50 staff' },
];
interface Member { user_id: string; member_role: 'owner' | 'administrator'; profiles: { full_name: string } | null }

export function FirmSettings() {
  const { orgs, role, refresh } = useAuth();
  const orgId = orgs[0]?.id;
  const isOwner = role === 'owner';
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [size, setSize] = useState(SIZES[0].value);
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState('');
  const [detailsMsg, setDetailsMsg] = useState('');
  const [detailsErr, setDetailsErr] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [addErr, setAddErr] = useState('');
  const [ready, setReady] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase.from('org_members').select('user_id, member_role, profiles(full_name)').eq('org_id', orgId);
    setMembers((data ?? []) as unknown as Member[]);
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    void (async () => {
      const { data } = await supabase.from('organizations').select('name, industry, size_band').eq('id', orgId).single();
      if (data) { setName(data.name); setIndustry(data.industry); setSize(data.size_band); }
      await loadMembers();
      setReady(true);
    })();
  }, [orgId, loadMembers]);

  const saveDetails = async (e: FormEvent) => {
    e.preventDefault();
    setDetailsMsg(''); setDetailsErr('');
    const { error } = await supabase.from('organizations').update({ name: name.trim(), industry, size_band: size }).eq('id', orgId!);
    if (error) return setDetailsErr(error.message);
    setDetailsMsg('Saved');
    await refresh();
  };

  const addAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setAddMsg(''); setAddErr('');
    const { error } = await supabase.rpc('add_administrator', { p_org: orgId, p_email: email });
    if (error) return setAddErr(error.message);
    setAddMsg('Administrator added');
    setEmail('');
    await loadMembers();
  };

  if (!orgId) return <p>You are not part of a firm yet.</p>;
  if (!ready) return <p>Loading…</p>;
  const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100';
  const card = 'bg-white rounded-2xl shadow p-5 space-y-4';

  return (
    <section className="max-w-2xl space-y-5">
      <h1 className="text-3xl">Firm settings</h1>

      <form onSubmit={saveDetails} className={card}>
        <h2 className="text-xl">Firm details</h2>
        <label className="block text-sm">Firm name
          <input className={field} required disabled={!isOwner} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm">Industry
          <select className={field} disabled={!isOwner} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </label>
        <label className="block text-sm">Firm size
          <select className={field} disabled={!isOwner} value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        {detailsErr && <p role="alert" className="text-sm text-red-700">{detailsErr}</p>}
        {detailsMsg && <p role="status" className="text-sm text-green-800">{detailsMsg}</p>}
        {isOwner
          ? <button className="rounded-lg bg-secondary text-white px-4 py-2 font-medium">Save</button>
          : <p className="text-xs">Only the firm owner can change these details.</p>}
      </form>

      <div className={card}>
        <h2 className="text-xl">Members</h2>
        <ul className="divide-y divide-slate-200">
          {members.map((m) => (
            <li key={m.user_id} className="flex items-center justify-between py-2">
              <span>{m.profiles?.full_name || 'Unnamed user'}</span>
              <span className="rounded-full bg-container px-2.5 py-0.5 text-xs font-semibold">{m.member_role === 'owner' ? 'Owner' : 'Administrator'}</span>
            </li>
          ))}
        </ul>
        {isOwner && (
          <form onSubmit={addAdmin} className="space-y-2 border-t border-slate-200 pt-4">
            <label className="block text-sm">Add a security administrator by email
              <input type="email" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="administrator@example.com" />
            </label>
            <p className="text-xs">They need to have signed up as a Security administrator first.</p>
            {addErr && <p role="alert" className="text-sm text-red-700">{addErr}</p>}
            {addMsg && <p role="status" className="text-sm text-green-800">{addMsg}</p>}
            <button className="rounded-lg bg-secondary text-white px-4 py-2 font-medium">Add administrator</button>
          </form>
        )}
      </div>
    </section>
  );
}