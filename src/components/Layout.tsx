import { NavLink, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/assessment', label: 'Assessment' },
  { to: '/findings', label: 'Findings' },
  { to: '/firm', label: 'Firm settings' },
];

const cls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-secondary text-white' : 'text-white/80 hover:bg-white/10'}`;

export function Layout() {
  return (
    <div className="min-h-screen md:flex">
      <nav aria-label="Main" className="bg-primary p-3 md:w-60 md:p-5 flex md:flex-col gap-1 overflow-x-auto">
        <span className="hidden md:block font-heading text-2xl text-white mb-6">SecureStart</span>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={cls}>{l.label}</NavLink>
        ))}
        <button onClick={() => void supabase.auth.signOut()} className="px-3 py-2 text-sm text-white/80 md:mt-auto text-left">
          Log out
        </button>
      </nav>
      <main className="flex-1 p-5 md:p-10"><Outlet /></main>
    </div>
  );
}
