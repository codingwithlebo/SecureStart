import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth, type Role } from './AuthContext';

interface Props { children: ReactNode; role?: Role; needsOrg?: boolean }

export function RequireAuth({ children, role, needsOrg }: Props) {
  const { session, role: userRole, orgs, loading } = useAuth();
  if (loading) return <p className="p-6">Loading…</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;
  if (needsOrg && userRole === 'owner' && orgs.length === 0) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}
