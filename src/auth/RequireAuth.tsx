import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth, type Role } from './AuthContext';

export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { session, role: userRole, loading } = useAuth();
  if (loading) return <p className="p-6">Loading…</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
