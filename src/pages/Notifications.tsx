import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, SettingsIcon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/Field';
import { EmptyState } from '../components/ui/Feedback';
import { BottomSheet } from '../components/ui/Sheet';
import { useApp } from '../contexts/AppContext';

type Filter = 'all' | 'unread' | 'approvals' | 'operations' | 'finance';

const GROUPS: Record<Exclude<Filter, 'all' | 'unread'>, string[]> = {
  approvals: ['Approval', 'AI Takeoff'],
  operations: ['Delivery', 'Order', 'Project', 'Team'],
  finance: ['Invoice', 'Payment', 'Quote']
};

export function Notifications() {
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead, unreadCount } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [prefsOpen, setPrefsOpen] = useState(false);

  const list = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return GROUPS[filter].includes(n.category);
  });

  return (
    <div>
      <PageHeader
        back={false}
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        action={
        <Button size="sm" variant="ghost" onClick={() => setPrefsOpen(true)} icon={<SettingsIcon className="h-4 w-4" />}>
            Prefs
          </Button>
        } />
      

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread' },
          { value: 'approvals', label: 'Approvals & AI' },
          { value: 'operations', label: 'Operations' },
          { value: 'finance', label: 'Finance' }]
          } />
        
        {unreadCount > 0 &&
        <button onClick={markAllRead} className="text-[12.5px] font-bold text-brand-600">
            Mark all as read
          </button>
        }
      </div>

      <div>
        {list.length === 0 ?
        <EmptyState icon={<BellIcon className="h-5 w-5" />} title="You're all caught up" body="New alerts about approvals, takeoffs, deliveries and payments will show up here." /> :

        <Card className="divide-y divide-ink-100">
            {list.map((n) =>
          <button
            key={n.id}
            onClick={() => {
              markRead(n.id);
              navigate(n.link);
            }}
            className="flex w-full gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50">
            
                <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              n.read ?
              'bg-ink-200' :
              n.tone === 'critical' ?
              'bg-danger-500' :
              n.tone === 'warning' ?
              'bg-caution-500' :
              n.tone === 'success' ?
              'bg-positive-500' :
              'bg-info-500'}`
              } />
            
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate text-[13.5px] ${n.read ? 'font-semibold text-ink-700' : 'font-bold text-ink-900'}`}>
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-400">{n.at}</span>
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-500">{n.body}</span>
                  <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    {n.category}
                  </span>
                </span>
              </button>
          )}
          </Card>
        }
      </div>

      <BottomSheet
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        title="Notification preferences"
        description="Choose what reaches you, and how.">
        
        <ul className="divide-y divide-ink-100">
          {[
          ['Approval requests', 'Push · Email'],
          ['AI takeoff completed', 'Push'],
          ['Quotes received', 'Push · Email'],
          ['Delivery scheduled or delayed', 'Push · SMS'],
          ['Invoice received', 'Email'],
          ['Payment status', 'Email'],
          ['Team activity', 'In-app only']].
          map(([label, channels]) =>
          <li key={label} className="flex items-center justify-between gap-3 py-3">
              <span className="text-[13.5px] font-semibold text-ink-800">{label}</span>
              <span className="shrink-0 text-[12px] text-ink-400">{channels}</span>
            </li>
          )}
        </ul>
      </BottomSheet>
    </div>);

}