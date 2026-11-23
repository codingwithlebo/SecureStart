import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'owner' | 'administrator';
export interface Org { id: string; name: string }
interface AuthState {
  session: Session | null;
  role: Role | null;
  orgs: Org[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null, role: null, orgs: [], loading: true, refresh: async () => {},
});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (s: Session | null) => {
    setSession(s);
    if (!s) {
      setRole(null);
      setOrgs([]);
      setLoading(false);
      return;
    }
    const [profile, members] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', s.user.id).single(),
      supabase.from('org_members').select('organizations(id, name)').eq('user_id', s.user.id),
    ]);
    setRole((profile.data?.role as Role) ?? null);
    const rows = (members.data ?? []) as unknown as { organizations: Org | null }[];
    setOrgs(rows.flatMap((r) => (r.organizations ? [r.organizations] : [])));
    setLoading(false);
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setTimeout(() => void load(s), 0); // avoid calling Supabase inside the auth callback
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await load(data.session);
  }, [load]);

  const value = useMemo(() => ({ session, role, orgs, loading, refresh }), [session, role, orgs, loading, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
