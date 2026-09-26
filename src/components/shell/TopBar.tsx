import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, MenuIcon, MessageSquareIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { Button, IconButton } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { useApp } from '../../contexts/AppContext';
import { threads } from '../../data/engagement';

export function TopBar({ onOpenNav }: {onOpenNav: () => void;}) {
  const navigate = useNavigate();
  const { unreadCount, can, approvals } = useApp();
  const [query, setQuery] = useState('');
  const unreadThreads = threads.reduce((sum, t) => sum + t.unread, 0);
  const pending = approvals.filter((a) => a.status === 'pending' && can(a.requiredPermission)).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/search');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="page-container flex h-16 items-center gap-3">
        <button
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100 lg:hidden">
          
          <MenuIcon className="h-5 w-5" />
        </button>

        <span className="mr-1 lg:hidden">
          <Logo size="sm" />
        </span>

        <form onSubmit={submit} className="relative hidden min-w-0 max-w-md flex-1 sm:block">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, materials, orders, invoices…"
            aria-label="Global search"
            className="h-10 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-3 text-[13.5px] text-ink-900 placeholder:text-ink-300 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
          
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          {pending > 0 &&
          <Button
            size="sm"
            variant="secondary"
            className="hidden md:inline-flex"
            onClick={() => navigate('/approvals')}>
            
              {pending} approval{pending > 1 ? 's' : ''} pending
            </Button>
          }

          {(can('request.create') || can('request.manage')) &&
          <Button
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => navigate('/procurement/requests/new')}
            icon={<PlusIcon className="h-4 w-4" />}>
            
              New request
            </Button>
          }

          <IconButton label="Search" onClick={() => navigate('/search')} className="sm:hidden">
            <SearchIcon className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="Messages" onClick={() => navigate('/messages')} className="relative">
            <MessageSquareIcon className="h-[18px] w-[18px]" />
            {unreadThreads > 0 &&
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
            }
          </IconButton>
          <IconButton label="Notifications" onClick={() => navigate('/notifications')} className="relative">
            <BellIcon className="h-[18px] w-[18px]" />
            {unreadCount > 0 &&
            <span className="tabular absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            }
          </IconButton>
        </div>
      </div>
    </header>);

}
