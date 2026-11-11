import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayersIcon, LockIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/Feedback';
import { Tabs } from '../../components/ui/Tabs';
import { Panel, SpecLabel, SpecRow, TitleBlock } from '../../components/smpro/Primitives';
import { PipelineTrail, TrailStage } from '../../components/common/PipelineTrail';
import { Cell, Denied, ListToolbar, RecordTable, Row, ScopeNote } from '../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierProjects } from '../../data/supplierOrg';
import { currency } from '../../utils/format';

const FILTERS = ['All', 'Estimating', 'Quoted', 'Order in Progress', 'Delivery in Progress', 'Completed'];

export function SupplierProjects() {
  const navigate = useNavigate();
  const { can } = useSupplier();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  if (!can('projects.view')) return <Denied module="Projects" />;

  const rows = supplierProjects.filter((p) => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const q = query.trim().toLowerCase();
    return (
      matchesFilter && (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.number.toLowerCase().includes(q) ||
      customerName(p.customerId).toLowerCase().includes(q)));

  });

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Builder projects this yard has been given access to — you see only what the builder shared" />
      

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by project, number or builder…"
        filters={FILTERS}
        active={filter}
        onFilter={setFilter} />
      

      {rows.length === 0 ?
      <EmptyState
        icon={<LayersIcon className="h-5 w-5" />}
        title="No projects match"
        body="Projects appear here when a builder shares one with this yard as part of an RFQ." /> :


      <RecordTable
        caption="Shared builder projects"
        columns={[
        { key: 'project', label: 'Project' },
        { key: 'builder', label: 'Builder' },
        { key: 'estimator', label: 'Estimator', hideBelow: 'lg' },
        { key: 'rep', label: 'Sales rep', hideBelow: 'lg' },
        { key: 'value', label: 'Package value', align: 'right' },
        { key: 'activity', label: 'Last activity', hideBelow: 'md' },
        { key: 'status', label: 'Stage', align: 'right' }]
        }>
        
          {rows.map((p) =>
        <Row key={p.id} onClick={() => navigate(`/supplier/projects/${p.id}`)}>
              <Cell strong>
                {p.name}
                <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">
                  {p.number} · {p.city}
                </span>
              </Cell>
              <Cell>{customerName(p.customerId)}</Cell>
              <Cell hideBelow="lg" muted>
                {p.estimator}
              </Cell>
              <Cell hideBelow="lg" muted>
                {p.salesRep}
              </Cell>
              <Cell align="right" mono strong>
                {currency(p.value, { compact: true })}
              </Cell>
              <Cell hideBelow="md" muted>
                {p.lastActivity}
              </Cell>
              <Cell align="right">
                <StatusBadge status={p.status === 'Completed' ? 'Completed' : 'Active'} dot={false} />
              </Cell>
            </Row>
        )}
        </RecordTable>
      }
    </div>);

}

const TABS = ['Overview', 'Takeoff', 'Quotes', 'Orders', 'Deliveries', 'Invoices', 'Activity'];

export function SupplierProjectDetail() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const [tab, setTab] = useState('Overview');
  const project = supplierProjects.find((p) => p.id === projectId);

  if (!s.can('projects.view')) return <Denied module="Projects" />;
  if (!project) return <Denied module="This project" />;

  const rfq = s.rfqs.find((r) => r.projectId === project.id);
  const quotes = s.quotes.filter((q) => q.projectId === project.id);
  const orders = s.orders.filter((o) => o.projectId === project.id);
  const deliveries = s.deliveries.filter((d) => d.projectId === project.id);
  const invoices = s.invoices.filter((i) => i.projectId === project.id);

  const trail: TrailStage[] = [
  { label: `RFQ ${rfq?.id ?? '—'} received`, detail: rfq ? `${rfq.takeoffRef} · ${rfq.revision}` : 'No request yet', state: rfq ? 'done' : 'todo' },
  {
    label: 'Takeoff reviewed',
    detail: rfq ? `${rfq.lines.filter((l) => l.decision !== 'pending').length}/${rfq.lines.length} lines decided` : '—',
    state: rfq && rfq.lines.every((l) => l.decision !== 'pending') ? 'done' : rfq ? 'active' : 'todo'
  },
  {
    label: 'Quote issued',
    detail: quotes.length ? `${quotes.length} version${quotes.length > 1 ? 's' : ''}` : 'Not yet priced',
    state: quotes.length ? 'done' : 'todo'
  },
  {
    label: 'Order placed',
    detail: orders.length ? orders.map((o) => o.id).join(', ') : 'Awaiting builder acceptance',
    state: orders.length ? 'done' : 'todo'
  },
  {
    label: 'Delivered & POD',
    detail: deliveries.some((d) => d.pod) ? 'POD captured' : `${deliveries.length} loads planned`,
    state: deliveries.some((d) => d.pod) ? 'done' : deliveries.length ? 'active' : 'todo'
  },
  {
    label: 'Invoiced & paid',
    detail: invoices.length ?
    `${invoices.filter((i) => i.status === 'Paid').length}/${invoices.length} settled` :
    'Not billed',
    state: invoices.length && invoices.every((i) => i.status === 'Paid') ? 'done' : invoices.length ? 'active' : 'todo'
  }];


  return (
    <div>
      <div className="mb-5 overflow-hidden border border-ink-200 bg-white">
        <div className="relative h-[188px]">
          <img src={project.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-ink-900/45" />
          <div className="absolute inset-x-5 bottom-4">
            <SpecLabel className="text-white/60">{customerName(project.customerId)}</SpecLabel>
            <h1 className="display-tight mt-1 text-[26px] font-bold leading-tight text-white">{project.name}</h1>
            <p className="measure mt-1 text-[11px] text-white/60">
              {project.number} · {project.city}
            </p>
          </div>
          <div className="absolute right-5 top-4">
            <StatusBadge status={project.status === 'Completed' ? 'Completed' : 'Active'} />
          </div>
        </div>
        <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-ink-100 px-5 py-3.5">
          {[
          ['Package value', currency(project.value)],
          ['Estimator', project.estimator],
          ['Sales rep', project.salesRep],
          ['Stage', project.status]].
          map(([label, value]) =>
          <div key={label} className="min-w-0">
              <dt className="spec-label">{label}</dt>
              <dd className="mt-0.5 truncate text-[12.5px] font-bold text-ink-900">{value}</dd>
            </div>
          )}
        </dl>
      </div>

      <Tabs tabs={TABS.map((t) => ({ value: t, label: t }))} value={tab} onChange={setTab} />

      <div className="mt-5 space-y-6">
        {tab === 'Overview' &&
        <>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Panel className="overflow-hidden">
                <TitleBlock label="Traceability" title="RFQ to payment" reference="This project" />
                <div className="p-4">
                  <PipelineTrail stages={trail} />
                </div>
              </Panel>
              <Panel className="overflow-hidden">
                <TitleBlock label="Access" title="What the builder shared" />
                <ul className="divide-y divide-ink-100">
                  {project.sharedScope.map((item) =>
                <li key={item} className="px-4 py-2.5 text-[12.5px] text-ink-700">
                      {item}
                    </li>
                )}
                </ul>
                <div className="border-t border-ink-100 px-4 py-3">
                  <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-400">
                    <LockIcon className="mt-0.5 h-3 w-3 shrink-0" />
                    Anything outside this list — other suppliers&apos; quotes, the builder&apos;s internal
                    budget, other projects — stays on the builder side.
                  </p>
                </div>
              </Panel>
            </div>
          </>
        }

        {tab === 'Takeoff' &&
        <>
            {!rfq ?
          <EmptyState
            icon={<LayersIcon className="h-5 w-5" />}
            title="No takeoff shared"
            body="The builder has not sent an approved takeoff for this project yet." /> :


          <Panel className="overflow-hidden">
                <TitleBlock
              label="Inbound takeoff"
              title={`${rfq.takeoffRef} · ${rfq.revision}`}
              reference={`${rfq.sheets} sheets`}
              action={
              s.can('takeoff.review') ?
              <Button size="sm" onClick={() => navigate(`/supplier/takeoffs/${rfq.id}`)}>
                        Open review workspace
                      </Button> :
              undefined
              } />
            
                <dl className="px-4 py-1">
                  <SpecRow label="Plan set" value={rfq.planSet} />
                  <SpecRow label="Lines" value={String(rfq.lines.length)} mono />
                  <SpecRow
                label="Decided"
                value={`${rfq.lines.filter((l) => l.decision !== 'pending').length}/${rfq.lines.length}`}
                mono />
              
                  <SpecRow label="Requested by" value={rfq.requestedBy} />
                  <SpecRow label="Quote due" value={rfq.dueDate} mono />
                </dl>
              </Panel>
          }
          </>
        }

        {tab === 'Quotes' &&
        <RecordTable
          caption="Quotes for this project"
          columns={[
          { key: 'id', label: 'Quote' },
          { key: 'version', label: 'Version', align: 'right' },
          { key: 'valid', label: 'Valid until', hideBelow: 'sm' },
          { key: 'status', label: 'Status', align: 'right' }]
          }>
          
            {quotes.map((q) =>
          <Row key={q.id} onClick={() => navigate(`/supplier/quotes/${q.id}`)}>
                <Cell strong mono>
                  {q.id}
                </Cell>
                <Cell align="right" mono>
                  {`v${q.version}`}
                </Cell>
                <Cell hideBelow="sm" muted>
                  {q.validUntil}
                </Cell>
                <Cell align="right">
                  <StatusBadge status={q.status} dot={false} />
                </Cell>
              </Row>
          )}
          </RecordTable>
        }

        {tab === 'Orders' &&
        <RecordTable
          caption="Sales orders"
          columns={[
          { key: 'id', label: 'Order' },
          { key: 'placed', label: 'Placed', hideBelow: 'sm' },
          { key: 'total', label: 'Value', align: 'right' },
          { key: 'status', label: 'Status', align: 'right' }]
          }>
          
            {orders.map((o) =>
          <Row key={o.id} onClick={() => navigate(`/supplier/orders/${o.id}`)}>
                <Cell strong mono>
                  {o.id}
                </Cell>
                <Cell hideBelow="sm" muted>
                  {o.placed}
                </Cell>
                <Cell align="right" mono strong>
                  {currency(o.total)}
                </Cell>
                <Cell align="right">
                  <StatusBadge status={o.status} dot={false} />
                </Cell>
              </Row>
          )}
          </RecordTable>
        }

        {tab === 'Deliveries' &&
        <RecordTable
          caption="Loads for this project"
          columns={[
          { key: 'id', label: 'Load' },
          { key: 'date', label: 'Date' },
          { key: 'window', label: 'Window', hideBelow: 'sm' },
          { key: 'pod', label: 'POD', align: 'right', hideBelow: 'md' },
          { key: 'status', label: 'Status', align: 'right' }]
          }>
          
            {deliveries.map((d) =>
          <Row key={d.id} onClick={() => navigate(`/supplier/deliveries/${d.id}`)}>
                <Cell strong mono>
                  {d.id}
                </Cell>
                <Cell>{d.date}</Cell>
                <Cell hideBelow="sm" muted>
                  {d.window}
                </Cell>
                <Cell align="right" hideBelow="md" muted>
                  {d.pod ? 'Captured' : '—'}
                </Cell>
                <Cell align="right">
                  <StatusBadge status={d.status} dot={false} />
                </Cell>
              </Row>
          )}
          </RecordTable>
        }

        {tab === 'Invoices' &&
        <RecordTable
          caption="Invoices raised"
          columns={[
          { key: 'id', label: 'Invoice' },
          { key: 'issued', label: 'Issued', hideBelow: 'sm' },
          { key: 'due', label: 'Due' },
          { key: 'total', label: 'Total', align: 'right' },
          { key: 'status', label: 'Status', align: 'right' }]
          }>
          
            {invoices.map((i) =>
          <Row key={i.id} onClick={() => navigate(`/supplier/invoices/${i.id}`)}>
                <Cell strong mono>
                  {i.id}
                </Cell>
                <Cell hideBelow="sm" muted>
                  {i.issued}
                </Cell>
                <Cell mono>{i.due}</Cell>
                <Cell align="right" mono strong>
                  {currency(i.total)}
                </Cell>
                <Cell align="right">
                  <StatusBadge status={i.status} dot={false} />
                </Cell>
              </Row>
          )}
          </RecordTable>
        }

        {tab === 'Activity' &&
        <Panel className="overflow-hidden">
            <TitleBlock label="Audit" title="Everything that happened on this project" />
            <ul className="divide-y divide-ink-100">
              {[
            ['RFQ received with approved takeoff', rfq?.received ?? '—', customerName(project.customerId)],
            ['Estimator assigned', 'Aug 31', 'Ray Coleman'],
            ['Quote issued to builder', quotes[0]?.sentAt ?? '—', quotes[0]?.createdBy ?? '—'],
            ['Order created from accepted quote', orders[0]?.placed ?? '—', 'Tanya Brooks'],
            ['Load dispatched from yard', deliveries[0]?.date ?? '—', 'Dana Whitmore']].
            map(([label, at, by]) =>
            <li key={label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-2.5">
                  <span className="min-w-0 flex-1 text-[12.5px] font-semibold text-ink-800">{label}</span>
                  <span className="text-[11.5px] text-ink-500">{by}</span>
                  <span className="measure text-[10.5px] text-ink-400">{at}</span>
                </li>
            )}
            </ul>
          </Panel>
        }

        <ScopeNote>
          This workspace is scoped to {customerName(project.customerId)}. Other builders&apos; projects and
          pricing are not reachable from here.
        </ScopeNote>
      </div>
    </div>);

}