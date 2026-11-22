import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth, type Role } from '../auth/AuthContext';

export function Login() {
  const { session } = useAuth();
  const [signUp, setSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('owner');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = signUp
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name, role } } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setBusy(false);
  };

  const input = 'w-full rounded-lg border border-slate-300 px-3 py-2';
  return (
    <div className="min-h-screen grid place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-3xl">{signUp ? 'Create your account' : 'Log in to SecureStart'}</h1>
        {signUp && (
          <>
            <label className="block text-sm">Full name
              <input className={input} required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <fieldset className="grid grid-cols-2 gap-2">
              <legend className="text-sm mb-1">I am a…</legend>
              {(['owner', 'administrator'] as Role[]).map((r) => (
                <label key={r} className={`rounded-lg border p-3 text-sm cursor-pointer ${role === r ? 'border-secondary bg-container' : 'border-slate-300'}`}>
                  <input type="radio" name="role" className="sr-only" checked={role === r} onChange={() => setRole(r)} />
                  {r === 'owner' ? 'Business owner' : 'Security administrator'}
                </label>
              ))}
            </fieldset>
          </>
        )}
        <label className="block text-sm">Email
          <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm">Password
          <input className={input} type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-secondary text-white py-2 font-medium disabled:opacity-60">
          {busy ? 'Please wait…' : signUp ? 'Sign up' : 'Log in'}
        </button>
        <button type="button" onClick={() => setSignUp(!signUp)} className="text-sm underline">
          {signUp ? 'Already have an account? Log in' : 'New here? Create an account'}
        </button>
      </form>
    </div>
  );
}
