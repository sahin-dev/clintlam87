import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RouteSuspense } from '../app/RouteLoading';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import {
  BellIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  MenuIcon,
  MessageSquareIcon,
  SearchIcon,
  XIcon } from
'lucide-react';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/Button';
import { SUPPLIER_NAV } from './navigation';
import { useSupplier } from '../../contexts/SupplierContext';
import { SUPPLIER_ROLES } from '../../utils/supplierRbac';

/** Routes that own the full viewport (dense workspaces). */
const FULL_BLEED = [/^\/supplier\/takeoffs\/[^/]+$/];

export function SupplierShell() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const fullBleed = FULL_BLEED.some((r) => r.test(location.pathname));

  return (
    <div className={fullBleed ? 'h-full overflow-hidden bg-canvas' : 'min-h-full bg-canvas'}>
      <SupplierSidebar mobileOpen={navOpen} onCloseMobile={() => setNavOpen(false)} />
      <div className={`flex flex-col lg:pl-[264px] ${fullBleed ? 'h-full' : 'min-h-full'}`}>
        <SupplierTopBar onOpenNav={() => setNavOpen(true)} />
        <main className={fullBleed ? 'min-h-0 flex-1' : 'flex-1'}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: fullBleed ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className={fullBleed ? 'h-full' : 'page-container pb-16'}>
            
            <RouteSuspense>
              <Outlet />
            </RouteSuspense>
          </motion.div>
        </main>
      </div>
    </div>);

}

function SupplierSidebar({
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
        
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <Logo size="md" inverted />
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 lg:hidden">
            
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="spec-label mb-3 px-5 text-brand-400">Supplier / lumber yard</p>

        <YardSwitcher />

        <nav aria-label="Supplier modules" className="no-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <SupplierNavGroups onNavigate={onCloseMobile} />
        </nav>

        <RoleFooter />
      </aside>
    </>);

}

function YardSwitcher() {
  const { org, branches, branchId, setBranchId } = useSupplier();
  const [open, setOpen] = useState(false);
  const branch = branches.find((b) => b.id === branchId)!;

  return (
    <div className="relative px-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-[3px] border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors duration-150 ease-smooth hover:bg-white/[0.08]">
        
        <span className="measure flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-brand-500 text-[11px] font-bold text-white">
          AB
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-white">{org.name}</span>
          <span className="block truncate text-[11px] text-white/45">{branch.name}</span>
        </span>
        <ChevronsUpDownIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
      </button>

      {open &&
      <div className="absolute inset-x-3 top-full z-10 mt-1.5 overflow-hidden rounded-[3px] border border-white/10 bg-ink-800 py-1 shadow-raised">
          <p className="spec-label px-3 py-1.5 text-white/35">Yard scope</p>
          {branches.map((b) =>
        <button
          key={b.id}
          onClick={() => {
            setBranchId(b.id);
            setOpen(false);
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.06]">
          
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-white">{b.name}</span>
                <span className="block truncate text-[11px] text-white/40">{b.yard}</span>
              </span>
              {b.id === branchId && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-400" strokeWidth={3} />}
            </button>
        )}
        </div>
      }
    </div>);

}

function SupplierNavGroups({ onNavigate }: {onNavigate: () => void;}) {
  const { can, unreadCount, rfqs } = useSupplier();
  const location = useLocation();
  const newRfqs = rfqs.filter((r) => r.status === 'New').length;

  return (
    <>
      {SUPPLIER_NAV.map((group) => {
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
                const badge = m.id === 'rfqs' ? newRfqs : m.id === 'notifications' ? unreadCount : 0;
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

function RoleFooter() {
  const { user, userRoles, activeRole, setActiveRole, toast } = useSupplier();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative border-t border-white/5 p-3">
      {open &&
      <div className="absolute inset-x-3 bottom-full mb-1.5 max-h-[60vh] overflow-y-auto rounded-[3px] border border-white/10 bg-ink-800 py-1 shadow-raised">
          <p className="spec-label px-3 py-1.5 text-white/35">
            View as · {userRoles.length} roles on this account
          </p>
          {userRoles.map((r) =>
        <button
          key={r}
          onClick={() => {
            setActiveRole(r);
            setOpen(false);
            navigate(SUPPLIER_ROLES[r].landing);
            toast({
              tone: 'info',
              title: `Viewing as ${SUPPLIER_ROLES[r].short}`,
              body: 'Navigation and actions updated.'
            });
          }}
          className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-white/[0.06]">
          
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-white">
                  {SUPPLIER_ROLES[r].label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-white/40">
                  {SUPPLIER_ROLES[r].focus}
                </span>
              </span>
              {r === activeRole &&
          <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" strokeWidth={3} />
          }
            </button>
        )}
        </div>
      }
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-[3px] px-2 py-2 text-left transition-colors duration-150 ease-smooth hover:bg-white/[0.06]">
        
        <Avatar name={user.name} size="sm" tone="brand" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-bold text-white">{user.name}</span>
          <span className="block truncate text-[11px] text-white/45">{SUPPLIER_ROLES[activeRole].label}</span>
        </span>
        <ChevronsUpDownIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
      </button>
    </div>);

}

function SupplierTopBar({ onOpenNav }: {onOpenNav: () => void;}) {
  const navigate = useNavigate();
  const { unreadCount, activeRole, rfqs, can } = useSupplier();
  const [query, setQuery] = useState('');
  const newRfqs = rfqs.filter((r) => r.status === 'New').length;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
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
            navigate(query.trim() ? `/supplier/search?q=${encodeURIComponent(query.trim())}` : '/supplier/search');
          }}
          className="relative hidden min-w-0 max-w-md flex-1 sm:block">
          
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search builders, projects, quotes, orders, SKUs…"
            aria-label="Global search"
            className="h-10 w-full rounded-[3px] border border-ink-200 bg-white pl-10 pr-3 text-[13.5px] text-ink-900 placeholder:text-ink-300 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
          
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="mr-1 hidden items-center gap-2 xl:flex">
            <span className="text-[12px] text-ink-400">Viewing as</span>
            <Badge tone="brand" dot={false}>
              {SUPPLIER_ROLES[activeRole].label}
            </Badge>
          </span>

          {can('rfq.view') && newRfqs > 0 &&
          <button
            onClick={() => navigate('/supplier/rfqs')}
            className="hidden rounded-[3px] border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-[12px] font-semibold text-brand-700 transition-colors duration-150 ease-smooth hover:bg-brand-100 md:inline-flex">
            
              {/* One text node — a literal sitting beside an expression is
                 dropped by static export, leaving a bare number. */}
              {`${newRfqs} new RFQ${newRfqs > 1 ? 's' : ''}`}
            </button>
          }

          <IconButton label="Messages" onClick={() => navigate('/supplier/messages')}>
            <MessageSquareIcon className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="Notifications" onClick={() => navigate('/supplier/notifications')} className="relative">
            <BellIcon className="h-[18px] w-[18px]" />
            {unreadCount > 0 &&
            <span className="measure absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            }
          </IconButton>
        </div>
      </div>
    </header>);

}
