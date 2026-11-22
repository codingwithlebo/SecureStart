import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'owner' | 'administrator';
interface AuthState { session: Session | null; role: Role | null; loading: boolean }

const AuthContext = createContext<AuthState>({ session: null, role: null, loading: true });
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, role: null, loading: true });

  useEffect(() => {
    const load = async (session: Session | null) => {
      if (!session) return setState({ session: null, role: null, loading: false });
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      setState({ session, role: (data?.role as Role) ?? null, loading: false });
    };
    void supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { void load(s); });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
