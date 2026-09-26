import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  BellIcon,
  CheckIcon,
  FileTextIcon,
  PaperclipIcon,
  SendIcon } from
'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Panel, SpecLabel, TickRule, TitleBlock } from '../../components/smpro/Primitives';
import { Cell, Denied, ListToolbar, RecordTable, Row, ScopeNote } from '../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierProjectName } from '../../data/supplierOrg';
import {
  SupplierMessage,
  SupplierThread,
  supplierDocuments,
  supplierThreads } from
'../../data/supplierEngagement';

/* ------------------------------------------------------------------ */
/* Messages — always in record context                                 */
/* ------------------------------------------------------------------ */

export function SupplierMessages() {
  const navigate = useNavigate();
  const s = useSupplier();
  const [threads, setThreads] = useState<SupplierThread[]>(supplierThreads);
  const [activeId, setActiveId] = useState(supplierThreads[0].id);
  const [draft, setDraft] = useState('');

  const active = threads.find((t) => t.id === activeId)!;

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    const message: SupplierMessage = {
      id: `m-${Date.now()}`,
      author: s.user.name,
      org: 'yard',
      body,
      at: 'Just now'
    };
    setThreads((prev) =>
    prev.map((t) =>
    t.id === activeId ? { ...t, messages: [...t.messages, message], last: 'Just now', unread: 0 } : t
    )
    );
    setDraft('');
  };

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Builder conversations attached to the record they are about" />
      

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Thread list */}
        <Panel className="h-fit overflow-hidden">
          <TitleBlock label="Conversations" reference={`${threads.length}`} />
          <ul className="divide-y divide-ink-100">
            {threads.map((t) => {
              const isActive = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setActiveId(t.id);
                      setThreads((prev) => prev.map((x) => x.id === t.id ? { ...x, unread: 0 } : x));
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors duration-150 ease-smooth ${
                    isActive ? 'bg-brand-50/50' : 'hover:bg-ink-50'}`
                    }>
                    
                    <div className="flex items-center justify-between gap-2">
                      <SpecLabel className="text-brand-600">
                        {t.contextLabel} {t.contextRef}
                      </SpecLabel>
                      {t.unread > 0 &&
                      <span className="measure flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9.5px] font-semibold text-white">
                          {t.unread}
                        </span>
                      }
                    </div>
                    <p className="mt-1 truncate text-[13px] font-semibold text-ink-900">{t.subject}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-400">
                      {customerName(t.customerId)} · {t.last}
                    </p>
                  </button>
                </li>);

            })}
          </ul>
        </Panel>

        {/* Thread */}
        <Panel className="flex h-[calc(100vh-232px)] min-h-[420px] flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-4 py-2.5">
            <div className="min-w-0">
              <SpecLabel>
                {active.contextLabel} {active.contextRef} · {customerName(active.customerId)}
              </SpecLabel>
              <p className="mt-1 truncate text-[14px] font-semibold text-ink-900">{active.subject}</p>
            </div>
            {active.contextPath &&
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(active.contextPath!)}
              icon={<ArrowRightIcon className="h-3.5 w-3.5" />}>
              
                Open {active.contextRef}
              </Button>
            }
          </div>

          <ul className="no-scrollbar min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
            {active.messages.map((m) =>
            <li
              key={m.id}
              className={`flex flex-col ${m.org === 'yard' ? 'items-end' : 'items-start'}`}>
              
                <span className="spec-label mb-1">
                  {m.author} · {m.at}
                </span>
                <p
                className={`max-w-[560px] rounded-[3px] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.org === 'yard' ?
                'bg-ink-900 text-white' :
                'border border-ink-200 bg-white text-ink-800'}`
                }>
                
                  {m.body}
                </p>
              </li>
            )}
          </ul>

          {/* Composer pinned to the bottom edge */}
          <div className="flex items-center gap-2 border-t border-ink-100 bg-white px-3 py-3">
            <IconButton
              label="Attach a file"
              onClick={() => s.toast({ tone: 'info', title: 'Attach', body: 'Pick a document from the library.' })}>
              
              <PaperclipIcon className="h-[18px] w-[18px]" />
            </IconButton>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Reply about ${active.contextRef}`}
              aria-label="Message"
              className="h-11 min-w-0 flex-1 rounded-[3px] border border-ink-200 px-3.5 text-[13px] text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
            
            <Button onClick={send} disabled={!draft.trim()} icon={<SendIcon className="h-4 w-4" />}>
              Send
            </Button>
          </div>
        </Panel>
      </div>

      <ScopeNote>
        Builders only see the threads on their own records. Pricing, margin and other builders&apos;
        conversations are never exposed here.
      </ScopeNote>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

const CATEGORY_TONE: Record<string, 'brand' | 'violet' | 'info' | 'positive' | 'danger' | 'caution'> = {
  RFQ: 'brand',
  Takeoff: 'violet',
  Quote: 'brand',
  Order: 'info',
  Delivery: 'info',
  Invoice: 'caution',
  Payment: 'danger',
  Service: 'danger'
};

export function SupplierNotifications() {
  const navigate = useNavigate();
  const s = useSupplier();
  const [tab, setTab] = useState('mine');

  /* Notifications are role-aware — a driver never sees an invoice alert. */
  const mine = s.notifications.filter((n) => !n.permission || s.can(n.permission));
  const rows = tab === 'mine' ? mine : tab === 'unread' ? mine.filter((n) => !n.read) : s.notifications;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Alerts scoped to the modules your role can act on"
        action={
        s.unreadCount > 0 &&
        <Button size="sm" variant="secondary" onClick={s.markAllRead} icon={<CheckIcon className="h-3.5 w-3.5" />}>
              Mark all read
            </Button>

        } />
      

      <Panel className="mb-4 overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
          { value: 'mine', label: 'For my role', count: mine.length },
          { value: 'unread', label: 'Unread', count: mine.filter((n) => !n.read).length },
          { value: 'all', label: 'All yard alerts', count: s.notifications.length }]
          } />
        
      </Panel>

      {rows.length === 0 ?
      <Panel className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
            <BellIcon className="h-5 w-5" />
          </span>
          <h2 className="display-tight mt-4 text-[17px] font-bold text-ink-900">Nothing to read</h2>
          <p className="mt-2 max-w-[360px] text-[13px] leading-relaxed text-ink-500">
            New RFQs, quote decisions, load changes and payment events land here.
          </p>
        </Panel> :

      <Panel className="overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {rows.map((n) => {
            const actionable = !n.permission || s.can(n.permission);
            return (
              <li key={n.id} className={n.read ? '' : 'bg-brand-50/30'}>
                  <button
                  onClick={() => {
                    s.markRead(n.id);
                    if (actionable) navigate(n.to);
                  }}
                  className="flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50/70">
                  
                    <span className="mt-0.5 shrink-0">
                      <Badge tone={CATEGORY_TONE[n.category] ?? 'neutral'} dot={false}>
                        {n.category}
                      </Badge>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold text-ink-900">{n.title}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-500">{n.body}</span>
                      {!actionable &&
                    <span className="spec-label mt-1.5 block text-ink-400">
                          Outside your role — no action available
                        </span>
                    }
                    </span>
                    <span className="measure shrink-0 text-[10.5px] text-ink-400">{n.at}</span>
                  </button>
                </li>);

          })}
          </ul>
        </Panel>
      }
    </div>);

}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
'All documents',
'Drawings',
'Takeoffs',
'Quotes',
'Orders',
'PODs',
'Invoices',
'Contracts'];


export function SupplierDocuments() {
  const s = useSupplier();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  if (!s.can('projects.view')) return <Denied module="Documents" />;

  const rows = useMemo(() => {
    const visible = supplierDocuments.filter((d) => !d.permission || s.can(d.permission));
    const byCategory =
    category === CATEGORIES[0] ? visible : visible.filter((d) => d.category === category);
    const q = query.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter((d) =>
    [d.name, d.version, customerName(d.customerId)].join(' ').toLowerCase().includes(q)
    );
  }, [query, category, s]);

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Drawings, takeoffs, quotes, PODs and invoices — versioned, never overwritten" />
      

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search documents by name, revision or builder"
        filters={CATEGORIES}
        active={category}
        onFilter={setCategory} />
      

      {rows.length === 0 ?
      <Panel className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
            <FileTextIcon className="h-5 w-5" />
          </span>
          <h2 className="display-tight mt-4 text-[17px] font-bold text-ink-900">No documents here</h2>
          <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-ink-500">
            Documents arrive automatically as builders share drawings and as you raise quotes, orders,
            PODs and invoices.
          </p>
        </Panel> :

      <RecordTable
        caption="Document library"
        columns={[
        { key: 'name', label: 'Document' },
        { key: 'category', label: 'Type', hideBelow: 'sm' },
        { key: 'builder', label: 'Builder / project', hideBelow: 'md' },
        { key: 'version', label: 'Version', align: 'right' },
        { key: 'added', label: 'Added', align: 'right', hideBelow: 'lg' }]
        }>
        
          {rows.map((d) =>
        <Row key={d.id} spine={d.supersedes ? 'brand' : undefined}>
              <Cell strong>
                {d.name}
                <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">{d.meta}</span>
              </Cell>
              <Cell muted hideBelow="sm">
                {d.category}
              </Cell>
              <Cell hideBelow="md">
                {customerName(d.customerId)}
                {d.projectId &&
            <span className="mt-0.5 block text-[11.5px] text-ink-400">
                    {supplierProjectName(d.projectId)}
                  </span>
            }
              </Cell>
              <Cell align="right" mono strong>
                {d.version}
                {d.supersedes &&
            <span className="spec-label mt-0.5 block text-ink-400">supersedes {d.supersedes}</span>
            }
              </Cell>
              <Cell align="right" mono muted hideBelow="lg">
                {d.added}
                <span className="mt-0.5 block text-[10.5px] font-medium text-ink-400">{d.addedBy}</span>
              </Cell>
            </Row>
        )}
        </RecordTable>
      }

      <ScopeNote>
        Revisions are kept side by side so a quantity can always be traced back to the drawing
        revision it came from. Nothing is replaced in place.
      </ScopeNote>

      <Panel className="mt-5 overflow-hidden">
        <TitleBlock label="Retention" title="Why versions are kept" />
        <TickRule />
        <p className="px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-600">
          A takeoff, quote or invoice may be challenged months later. Keeping every revision means the
          exact document a decision was made against can still be produced — with who added it and
          when.
        </p>
      </Panel>
    </div>);

}