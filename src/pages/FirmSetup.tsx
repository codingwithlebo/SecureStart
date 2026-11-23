import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

const INDUSTRIES = ['Accounting', 'Legal', 'Medical or dental', 'Other professional services'];
const SIZES = [
  { value: '1-5', label: '1 to 5 staff' },
  { value: '6-20', label: '6 to 20 staff' },
  { value: '21-50', label: '21 to 50 staff' },
];

export function FirmSetup() {
  const { orgs, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [size, setSize] = useState(SIZES[0].value);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (orgs.length > 0) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.rpc('create_organization', {
      p_name: name, p_industry: industry, p_size_band: size,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    await refresh();
    navigate('/', { replace: true });
  };

  const field = 'w-full rounded-lg border border-slate-300 px-3 py-2 bg-white';
  return (
    <div className="min-h-screen grid place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <p className="text-sm text-secondary font-medium">Step 1 of 2</p>
        <h1 className="text-3xl">Set up your firm</h1>
        <p className="text-sm">Tell us about your firm so we can tailor your security assessment.</p>
        <label className="block text-sm">Firm name
          <input className={field} required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm">Industry
          <select className={field} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </label>
        <label className="block text-sm">Firm size
          <select className={field} value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy || !name.trim()} className="w-full rounded-lg bg-secondary text-white py-2 font-medium disabled:opacity-60">
          {busy ? 'Creating…' : 'Create firm and start'}
        </button>
      </form>
    </div>
  );
}
