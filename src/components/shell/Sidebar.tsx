import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { CheckIcon, ChevronsUpDownIcon, LogOutIcon, XIcon } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { NAV_GROUPS } from './navigation';
import { useApp } from '../../contexts/AppContext';

export function Sidebar({
  mobileOpen,
  onCloseMobile



}: {mobileOpen: boolean;onCloseMobile: () => void;}) {
  return (
    <>
      {mobileOpen &&
      <button
        aria-label="Close navigation"
        onClick={onCloseMobile}
        className="fixed inset-0 z-40 bg-ink-900/50 lg:hidden" />

      }
      <aside
        className={twMerge(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-white/5 bg-ink-900 transition-transform duration-200 ease-smooth lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
        
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Logo size="md" inverted />
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 lg:hidden">
            
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <OrgSwitcher />

        <nav aria-label="Main" className="no-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <NavGroups onNavigate={onCloseMobile} />
        </nav>

        <UserFooter />
      </aside>
    </>);

}

function OrgSwitcher() {
  const { organization, branchId, setBranchId } = useApp();
  const [open, setOpen] = React.useState(false);
  const branch = organization.branches.find((b) => b.id === branchId)!;

  return (
    <div className="relative px-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors duration-150 ease-smooth hover:bg-white/[0.08]">
        
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-[12px] font-bold text-white">
          AC
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-white">{organization.name}</span>
          <span className="block truncate text-[11px] text-white/45">{branch.name}</span>
        </span>
        <ChevronsUpDownIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
      </button>

      {open &&
      <div className="absolute inset-x-3 top-full z-10 mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-ink-800 py-1 shadow-raised">
          <p className="spec-label px-3 py-1.5 text-white/35">Branch scope</p>
          {organization.branches.map((b) =>
        <button
          key={b.id}
          onClick={() => {
            setBranchId(b.id);
            setOpen(false);
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.06]">
          
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-white">{b.name}</span>
                <span className="block truncate text-[11px] text-white/40">{b.city}</span>
              </span>
              {b.id === branchId && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-400" strokeWidth={3} />}
            </button>
        )}
        </div>
      }
    </div>);

}

function NavGroups({ onNavigate }: {onNavigate: () => void;}) {
  const { can, approvals, unreadCount } = useApp();
  const location = useLocation();
  const pendingApprovals = approvals.filter((a) => a.status === 'pending' && can(a.requiredPermission)).length;

  return (
    <>
      {NAV_GROUPS.map((group) => {
        const modules = group.modules.filter((m) => !m.permission || can(m.permission));
        if (!modules.length) return null;
        return (
          <div key={group.id} className="mb-1.5">
            <div className="flex items-center gap-2 px-3 pb-1.5 pt-3.5">
              <p className="spec-label text-white/35">{group.label}</p>
              <span className="h-px flex-1 bg-white/10" aria-hidden />
            </div>
            <ul>
              {modules.map((m) => {
                const Icon = m.icon;
                const badge =
                m.id === 'approvals' ? pendingApprovals : m.id === 'notifications' ? unreadCount : 0;
                const nested = (m.match ?? []).some((p) => location.pathname.startsWith(p));
                return (
                  <li key={m.id}>
                    <NavLink
                      to={m.path}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                      twMerge(
                        'group flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-[13px] font-semibold transition-colors duration-150 ease-smooth',
                        isActive || nested ?
                        'bg-white/10 text-white shadow-[inset_2px_0_0_0_#F96317]' :
                        'text-white/55 hover:bg-white/[0.06] hover:text-white'
                      )
                      }>
                      
                      {({ isActive }) =>
                      <>
                          <Icon
                          className={twMerge(
                            'h-[17px] w-[17px] shrink-0',
                            isActive || nested ? 'text-brand-500' : 'text-white/40 group-hover:text-white/70'
                          )} />
                        
                          <span className="min-w-0 flex-1 truncate">{m.label}</span>
                          {badge > 0 &&
                        <span className="measure flex h-[18px] min-w-[18px] items-center justify-center rounded-[2px] bg-brand-500 px-1 text-[10px] font-bold text-white">
                              {badge}
                            </span>
                        }
                        </>
                      }
                    </NavLink>
                  </li>);

              })}
            </ul>
          </div>);

      })}
    </>);

}

function UserFooter() {
  const { user, signOut } = useApp();
  return (
    <div className="flex items-center gap-2.5 border-t border-white/5 p-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2">
        <Avatar name={user.name} size="sm" tone="brand" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-bold text-white">{user.name}</span>
          <span className="block truncate text-[11px] text-white/45">{user.email}</span>
        </span>
      </div>
      <button
        onClick={signOut}
        aria-label="Sign out"
        title="Sign out"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white">
        <LogOutIcon className="h-4 w-4" />
      </button>
    </div>);

}
