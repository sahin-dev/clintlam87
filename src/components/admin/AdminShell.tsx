import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import {
  BellIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  ShieldAlertIcon,
  XIcon } from
'lucide-react';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { IconButton, Button } from '../ui/Button';
import { ADMIN_NAV } from './navigation';
import { useAdmin } from '../../contexts/AdminContext';
import { SERVICES } from '../../data/platformOps';

/**
 * The Super Admin shell. Deliberately reads as a control plane rather than a
 * tenant workspace: a status spine in the header, a support-session banner
 * that cannot be missed, and the same SM PRO geometry as the other two
 * platforms so it belongs to the same product.
 */
export function AdminShell() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { session, toasts, dismissToast } = useAdmin();

  return (
    <div className="min-h-full bg-canvas">
      {session && <SupportBanner />}
      <AdminSidebar
        mobileOpen={navOpen}
        onCloseMobile={() => setNavOpen(false)}
        offset={Boolean(session)} />
      
      <div className={twMerge('flex min-h-full flex-col lg:pl-[264px]', session && 'pt-[52px]')}>
        <AdminTopBar onOpenNav={() => setNavOpen(true)} sessionActive={Boolean(session)} />
        <main className="flex-1">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="page-container pb-16">
            
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Same layer as the other two platforms: banner 60 < modal 70 < toast 80. */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[340px] max-w-[calc(100vw-40px)] flex-col gap-2">
        {toasts.map((t) =>
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className={twMerge(
            'pointer-events-auto rounded-[3px] border-l-[3px] bg-ink-900 px-4 py-3 shadow-raised',
            t.tone === 'success' && 'border-l-positive-500',
            t.tone === 'danger' && 'border-l-danger-500',
            t.tone === 'info' && 'border-l-brand-500'
          )}>
          
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">{t.title}</p>
                {t.body && <p className="mt-0.5 text-[12px] leading-snug text-white/60">{t.body}</p>}
              </div>
              <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
              className="text-white/40 transition-colors duration-150 ease-smooth hover:text-white">
              
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>);

}

function SupportBanner() {
  const { session, endSession, org } = useAdmin();
  const navigate = useNavigate();
  if (!session) return null;
  const target = org(session.orgId);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] border-b border-caution-600 bg-caution-500">
      <div className="page-container flex h-[52px] flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-900">
          <ShieldAlertIcon className="h-4 w-4" />
          Support session active
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-900/80">
          Viewing <span className="font-semibold">{target?.name}</span> · {session.reason}
          {session.caseId && ` · ${session.caseId}`}
        </span>
        <span className="measure hidden text-[10.5px] text-ink-900/60 md:block">
          EVERY ACTION ATTRIBUTED TO {session.by.toUpperCase()}
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            endSession();
            navigate('/admin/support');
          }}>
          
          Exit support session
        </Button>
      </div>
    </div>);

}

function AdminSidebar({
  mobileOpen,
  onCloseMobile,
  offset




}: {mobileOpen: boolean;onCloseMobile: () => void;offset: boolean;}) {
  const location = useLocation();
  const { unreadCount, cases, incidents, org } = useAdmin();
  const openCases = cases.filter((c) => !['Resolved', 'Closed'].includes(c.status)).length;
  const liveIncidents = incidents.filter((i) => i.status !== 'Resolved').length;

  /* Organization detail is one route serving both tenant kinds, so the section
     it belongs to is decided by the organization, not by the path. */
  const orgId = location.pathname.match(/^\/admin\/org\/([^/]+)/)?.[1];
  const orgSection = orgId ?
  org(orgId)?.kind === 'builder' ?
  'builders' :
  org(orgId) ?
  'suppliers' :
  undefined :
  undefined;

  return (
    <>
      {mobileOpen &&
      <button
        aria-label="Close navigation"
        onClick={onCloseMobile}
        className="fixed inset-0 z-40 bg-ink-900/50 lg:hidden" />

      }
      <aside
        style={offset ? { top: 52 } : undefined}
        className={twMerge(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-white/5 bg-ink-900 transition-transform duration-200 ease-smooth lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
        
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <Logo size="md" inverted />
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 lg:hidden">
            
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="spec-label mb-3 px-5 text-caution-500">Platform administration</p>

        <PlatformStatus />

        <nav aria-label="Platform modules" className="no-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {ADMIN_NAV.map((group) =>
          <div key={group.id} className="mb-1.5">
              <div className="flex items-center gap-2 px-3 pb-1.5 pt-3.5">
                <p className="spec-label text-white/35">{group.label}</p>
                <span className="h-px flex-1 bg-white/10" aria-hidden />
              </div>
              <ul>
                {group.modules.map((m) => {
                const Icon = m.icon;
                const badge =
                m.id === 'support' ? openCases : m.id === 'health' ? liveIncidents : 0;
                const nested =
                (m.match ?? []).some((p) => location.pathname.startsWith(p)) ||
                m.id === orgSection;
                return (
                  <li key={m.id}>
                      <NavLink
                      to={m.path}
                      end={m.id === 'ai-overview'}
                      onClick={onCloseMobile}
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
                        <span className="measure flex h-[18px] min-w-[18px] items-center justify-center rounded-[2px] bg-brand-500 px-1 text-[10px] font-semibold text-white">
                                {badge}
                              </span>
                        }
                          </>
                      }
                      </NavLink>
                    </li>);

              })}
              </ul>
            </div>
          )}
          {unreadCount > 0 &&
          <NavLink
            to="/admin/notifications"
            onClick={onCloseMobile}
            className="mt-2 flex items-center gap-2.5 rounded-[3px] border border-white/10 px-3 py-2 text-[12.5px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white">
            
              <BellIcon className="h-4 w-4 text-brand-500" />
              <span className="flex-1">Notifications</span>
              <span className="measure text-[11px] text-brand-400">{unreadCount}</span>
            </NavLink>
          }
        </nav>

        <AdminFooter />
      </aside>
    </>);

}

function PlatformStatus() {
  const degraded = SERVICES.filter((s) => s.state !== 'Operational');
  const state = degraded.some((s) => s.state === 'Down') ?
  'Down' :
  degraded.length ?
  'Degraded' :
  'Operational';

  return (
    <div className="px-3">
      <NavLink
        to="/admin/health"
        className="flex items-center gap-2.5 rounded-[3px] border border-white/10 bg-white/[0.04] px-3 py-2.5 transition-colors duration-150 ease-smooth hover:bg-white/[0.08]">
        
        <span className="min-w-0 flex-1">
          <span
            className={twMerge(
              'block text-[12.5px] font-semibold',
              state === 'Operational' ?
              'text-positive-400' :
              state === 'Degraded' ?
              'text-caution-300' :
              'text-danger-400'
            )}>
            
            {`Platform ${state.toLowerCase()}`}
          </span>
          <span className="block truncate text-[11px] text-white/45">
            {degraded.length ? `${degraded.length} services degraded` : 'All 8 services nominal'}
          </span>
        </span>
      </NavLink>
    </div>);

}

function AdminFooter() {
  const { admin, signOut } = useAdmin();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative border-t border-white/5 p-3">
      {open &&
      <div className="absolute inset-x-3 bottom-full mb-1.5 overflow-hidden rounded-[3px] border border-white/10 bg-ink-800 py-1 shadow-raised">
          <p className="spec-label px-3 py-1.5 text-white/35">Platform role</p>
          <div className="flex items-start gap-2 px-3 py-2">
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-semibold text-white">Platform Administrator</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-white/40">
                Governs every tenant. Not a member of any organization.
              </span>
            </span>
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" strokeWidth={3} />
          </div>
          <div className="mt-1 border-t border-white/10 pt-1">
            <button
            onClick={() => {
              signOut();
              navigate('/admin/access');
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white">
            
              <LogOutIcon className="h-3.5 w-3.5 text-white/40" />
              Sign out
            </button>
          </div>
        </div>
      }
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-[3px] px-2 py-2 text-left transition-colors duration-150 ease-smooth hover:bg-white/[0.06]">
        
        <Avatar name={admin.name} size="sm" tone="brand" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold text-white">{admin.name}</span>
          <span className="block truncate text-[11px] text-white/45">{admin.role}</span>
        </span>
        <ChevronsUpDownIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
      </button>
    </div>);

}

function AdminTopBar({
  onOpenNav,
  sessionActive



}: {onOpenNav: () => void;sessionActive: boolean;}) {
  const navigate = useNavigate();
  const { unreadCount, cases } = useAdmin();
  const [query, setQuery] = useState('');
  const escalated = cases.filter((c) => c.status === 'Escalated').length;

  return (
    <header
      style={sessionActive ? { top: 52 } : undefined}
      className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
      
      <div className="page-container flex h-16 items-center gap-3">
        <button
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-[3px] text-ink-600 hover:bg-ink-100 lg:hidden">
          
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="mr-1 lg:hidden">
          <Logo size="sm" />
        </span>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/admin/search?q=${encodeURIComponent(query)}`);
          }}
          className="relative hidden min-w-0 max-w-md flex-1 sm:block">
          
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations, users, takeoffs, orders, cases…"
            aria-label="Platform search"
            className="h-10 w-full rounded-[3px] border border-ink-200 bg-white pl-10 pr-3 text-[13.5px] text-ink-900 placeholder:text-ink-300 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
          
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          {escalated > 0 &&
          <button
            onClick={() => navigate('/admin/support')}
            className="hidden rounded-[3px] border border-danger-100 bg-danger-50 px-2.5 py-1.5 text-[12px] font-semibold text-danger-700 transition-colors duration-150 ease-smooth hover:bg-danger-100 md:inline-flex">
            
              {escalated} escalated
            </button>
          }
          <IconButton label="Notifications" onClick={() => navigate('/admin/notifications')} className="relative">
            <BellIcon className="h-[18px] w-[18px]" />
            {unreadCount > 0 &&
            <span className="measure absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-semibold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            }
          </IconButton>
        </div>
      </div>
    </header>);

}
