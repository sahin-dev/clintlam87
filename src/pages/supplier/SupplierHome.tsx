import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { Panel, SpecLabel, TitleBlock, WorkHeading, TickRule } from '../../components/smpro/Primitives';
import { AttentionCard } from '../../components/smpro/AttentionCard';
import { LedgerStrip } from '../../components/supplier/Records';
import { PageHeader } from '../../components/shell/PageHeader';
import { useSupplier } from '../../contexts/SupplierContext';
import { SUPPLIER_ROLES } from '../../utils/supplierRbac';
import { customerName, supplierProjectName, driverName } from '../../data/supplierOrg';
import { supplierActivity } from '../../data/supplierOps';
import { available, products } from '../../data/supplierCatalog';
import { quoteTotal } from '../../data/supplierSales';
import { currency, greeting, qty } from '../../utils/format';

interface QueueItem {
  id: string;
  urgency: 'critical' | 'action' | 'operational' | 'ai';
  kind: string;
  title: string;
  project: string;
  facts: {label: string;value: string;tone?: 'default' | 'positive' | 'danger' | 'brand';}[];
  meta: string;
  cta: string;
  to: string;
}

/**
 * The yard's command centre. Ordered by the three business loops — estimate &
 * sell, sell & deliver, deliver & get paid — and filtered to what the active
 * role is accountable for.
 */
export function SupplierHome() {
  const navigate = useNavigate();
  const s = useSupplier();
  const { can, activeRole } = s;

  const newRfqs = s.rfqs.filter((r) => r.status === 'New');
  const clarify = s.rfqs.filter((r) => r.status === 'Needs Clarification');
  const revisionQuotes = s.quotes.filter((q) => q.status === 'Revision Requested');
  const expiring = s.quotes.filter((q) => q.status === 'Sent' || q.status === 'Viewed');
  const ordersToProcess = s.orders.filter((o) => o.status === 'New' || o.status === 'Processing');
  const todayLoads = s.deliveries.filter((d) => d.date === 'Today');
  const unassigned = todayLoads.filter((d) => !d.driverId);
  const delayed = s.deliveries.filter((d) => d.status === 'Delayed');
  const overdue = s.invoices.filter((i) => i.status === 'Overdue');
  const failed = s.payments.filter((p) => p.status === 'Failed');
  const openCases = s.cases.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed');
  const lowStock = products.filter((p) => available(p) <= p.reorderLevel);
  const outstanding = s.invoices.reduce((sum, i) => sum + (i.total - i.paid), 0);

  /* ---------------- work queue ---------------- */
  const queue: QueueItem[] = [];

  if (can('rfq.view')) {
    newRfqs.forEach((r) =>
    queue.push({
      id: r.id,
      urgency: 'action',
      kind: 'New builder request',
      title: `${r.lines.length} material lines to price from ${r.takeoffRef}`,
      project: `${customerName(r.customerId)} · ${supplierProjectName(r.projectId)}`,
      facts: [
      { label: 'Quote due', value: r.dueDate, tone: 'danger' },
      { label: 'Needed on site', value: r.requiredDelivery },
      { label: 'Plan set', value: `${r.revision} · ${r.sheets} sheets` }],

      meta: `Arrived ${r.received} from ${r.requestedBy}`,
      cta: 'Review request',
      to: `/supplier/rfqs/${r.id}`
    })
    );
  }

  if (can('takeoff.review')) {
    clarify.forEach((r) =>
    queue.push({
      id: `${r.id}-clarify`,
      urgency: 'ai',
      kind: 'Takeoff needs clarification',
      title: 'A builder quantity conflicts with its source drawing',
      project: `${customerName(r.customerId)} · ${supplierProjectName(r.projectId)}`,
      facts: [
      { label: 'Takeoff', value: r.takeoffRef },
      { label: 'Revision', value: r.revision },
      { label: 'Lines flagged', value: String(r.lines.filter((l) => l.decision === 'clarify').length), tone: 'danger' }],

      meta: 'Nothing gets priced from a quantity we cannot stand behind',
      cta: 'Open workspace',
      to: `/supplier/takeoffs/${r.id}`
    })
    );
  }

  if (can('quote.view')) {
    revisionQuotes.forEach((q) =>
    queue.push({
      id: q.id,
      urgency: 'action',
      kind: 'Revision requested',
      title: q.revisionRequest?.note ?? 'The builder asked for a change to this quote',
      project: `${customerName(q.customerId)} · ${supplierProjectName(q.projectId)}`,
      facts: [
      { label: 'Current version', value: `v${q.version}` },
      { label: 'Total', value: currency(quoteTotal(q)), tone: 'brand' },
      { label: 'Valid until', value: q.validUntil }],

      meta: `Requested by ${q.revisionRequest?.by ?? 'the builder'} · ${q.revisionRequest?.at ?? ''}`,
      cta: 'Open quote',
      to: `/supplier/quotes/${q.id}`
    })
    );
  }

  if (can('delivery.dispatch')) {
    unassigned.forEach((d) =>
    queue.push({
      id: d.id,
      urgency: 'critical',
      kind: 'Load without a driver',
      title: `${d.items.length} line load scheduled for ${d.window} today`,
      project: `${customerName(d.customerId)} · ${supplierProjectName(d.projectId)}`,
      facts: [
      { label: 'Order', value: d.orderId },
      { label: 'Window', value: d.window, tone: 'danger' },
      { label: 'Stop', value: `#${d.sequence}` }],

      meta: 'Assign a driver and truck to release it from the yard',
      cta: 'Open dispatch board',
      to: '/supplier/deliveries'
    })
    );
  }

  if (can('delivery.view')) {
    delayed.forEach((d) =>
    queue.push({
      id: `${d.id}-delay`,
      urgency: 'critical',
      kind: 'Delivery delayed',
      title: d.delayReason ?? 'This load did not complete',
      project: `${customerName(d.customerId)} · ${supplierProjectName(d.projectId)}`,
      facts: [
      { label: 'Load', value: d.id },
      { label: 'New plan', value: d.eta, tone: 'danger' },
      { label: 'Driver', value: driverName(d.driverId) }],

      meta: 'The builder sees this status on their delivery record',
      cta: 'Open load',
      to: `/supplier/deliveries/${d.id}`
    })
    );
  }

  if (can('order.manage')) {
    ordersToProcess.forEach((o) =>
    queue.push({
      id: o.id,
      urgency: 'operational',
      kind: 'Order awaiting processing',
      title: `${o.lines.length} lines to validate against yard stock`,
      project: `${customerName(o.customerId)} · ${supplierProjectName(o.projectId)}`,
      facts: [
      { label: 'Value', value: currency(o.total), tone: 'brand' },
      { label: 'Requested', value: o.requestedDate },
      { label: 'Terms', value: o.terms }],

      meta: `Placed ${o.placed} from quote ${o.quoteId}`,
      cta: 'Process order',
      to: `/supplier/orders/${o.id}`
    })
    );
  }

  if (can('payment.manage') || can('invoice.manage')) {
    overdue.forEach((i) =>
    queue.push({
      id: i.id,
      urgency: 'critical',
      kind: 'Invoice overdue',
      title: `${currency(i.total)} unpaid past ${i.due}`,
      project: `${customerName(i.customerId)} · ${supplierProjectName(i.projectId)}`,
      facts: [
      { label: 'Terms', value: i.terms },
      { label: 'Issued', value: i.issued },
      { label: 'Order', value: i.orderId }],

      meta: 'Aging past terms — consider a statement or credit hold',
      cta: 'Open invoice',
      to: `/supplier/invoices/${i.id}`
    })
    );
    failed.forEach((p) =>
    queue.push({
      id: p.id,
      urgency: 'action',
      kind: 'Payment failed',
      title: p.failureReason ?? 'A payment attempt did not clear',
      project: customerName(p.customerId),
      facts: [
      { label: 'Amount', value: currency(p.amount), tone: 'danger' },
      { label: 'Method', value: p.method },
      { label: 'Attempted', value: p.date }],

      meta: `Against invoice ${p.invoiceId}`,
      cta: 'Open payments',
      to: '/supplier/payments'
    })
    );
  }

  if (can('service.manage')) {
    openCases.slice(0, 2).forEach((c) =>
    queue.push({
      id: c.id,
      urgency: c.priority === 'High' || c.priority === 'Critical' ? 'critical' : 'operational',
      kind: `${c.category} case`,
      title: c.subject,
      project: customerName(c.customerId),
      facts: [
      { label: 'Priority', value: c.priority, tone: c.priority === 'High' ? 'danger' : 'default' },
      { label: 'Status', value: c.status },
      { label: 'Owner', value: c.owner }],

      meta: `Opened ${c.opened}`,
      cta: 'Open case',
      to: `/supplier/service/${c.id}`
    })
    );
  }

  if (can('delivery.drive')) {
    s.deliveries.
    filter((d) => d.date === 'Today' && d.driverId === 'dr-1').
    forEach((d) =>
    queue.push({
      id: `run-${d.id}`,
      urgency: 'operational',
      kind: 'Your run today',
      title: `${d.window} · ${d.address}`,
      project: `${customerName(d.customerId)} · ${supplierProjectName(d.projectId)}`,
      facts: [
      { label: 'Stop', value: `#${d.sequence}` },
      { label: 'Status', value: d.status },
      { label: 'Lines', value: String(d.items.length) }],

      meta: `Site contact ${d.siteContact}`,
      cta: 'Open run',
      to: '/supplier/driver'
    })
    );
  }

  /* ---------------- ledger ---------------- */
  const ledger: {label: string;value: string;note?: string;tone?: 'default' | 'brand' | 'danger';}[] = [];
  if (can('customers.view'))
  ledger.push({
    label: 'Active builders',
    value: '3',
    note: '1 connection request pending'
  });
  if (can('rfq.view'))
  ledger.push({
    label: 'RFQs to price',
    value: String(newRfqs.length + clarify.length),
    note: 'Inbound from builders',
    tone: newRfqs.length ? 'brand' : 'default'
  });
  if (can('quote.view'))
  ledger.push({ label: 'Quotes out', value: String(expiring.length), note: 'Awaiting builder decision' });
  if (can('order.view'))
  ledger.push({ label: 'Orders in progress', value: String(s.orders.filter((o) => o.status !== 'Completed').length), note: 'Across all yards' });
  if (can('delivery.view'))
  ledger.push({
    label: 'Loads today',
    value: String(todayLoads.length),
    note: unassigned.length ? `${unassigned.length} unassigned` : 'All assigned',
    tone: unassigned.length ? 'danger' : 'default'
  });
  if (can('inventory.view'))
  ledger.push({ label: 'SKUs below reorder', value: String(lowStock.length), note: 'Buy-in required' });
  if (can('invoice.view') || can('payment.view'))
  ledger.push({
    label: 'Receivable',
    value: currency(outstanding, { compact: true }),
    note: `${overdue.length} overdue`,
    tone: 'brand'
  });

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${s.user.name.split(' ')[0]}`}
        subtitle={`${s.org.name} · ${SUPPLIER_ROLES[activeRole].label} · ${s.branches.find((b) => b.id === s.branchId)?.name}`} />
      

      <LedgerStrip items={ledger} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_356px]">
        <div className="min-w-0 space-y-7">
          <section aria-labelledby="queue-heading">
            <WorkHeading
              label="Work queue"
              title="What needs your attention"
              count={`${queue.length} open`}
              action={
              <span className="text-[11.5px] text-ink-400">Scoped to {SUPPLIER_ROLES[activeRole].short}</span>
              } />
            
            {queue.length === 0 ?
            <Panel className="px-6 py-10 text-center">
                <p className="text-[14.5px] font-bold text-ink-900">Nothing is waiting on you</p>
                <p className="mt-1 text-[13px] text-ink-400">
                  Every request, quote, load and invoice in your scope has moved on.
                </p>
              </Panel> :

            <div className="space-y-3">
                {queue.map((item) =>
              <AttentionCard
                key={item.id}
                urgency={item.urgency}
                kind={item.kind}
                title={item.title}
                project={item.project}
                facts={item.facts}
                meta={item.meta}
                cta={item.cta}
                onAction={() => navigate(item.to)} />

              )}
              </div>
            }
          </section>

          <section>
            <WorkHeading label="Ledger" title="Recent activity across the yard" />
            <Panel className="overflow-hidden">
              <ul className="divide-y divide-ink-100">
                {supplierActivity.map((a) =>
                <li key={a.id} className="flex items-baseline gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink-700">
                      <span className="font-bold text-ink-900">{a.actor}</span> {a.action}
                    </span>
                    <span className="measure shrink-0 text-[10.5px] text-ink-400">{a.at}</span>
                  </li>
                )}
              </ul>
            </Panel>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel className="overflow-hidden">
            <TitleBlock label="Business loops" title="Where work sits right now" reference="ALL YARDS" />
            <div className="divide-y divide-ink-100">
              <LoopBlock
                name="Estimate → sell"
                rows={[
                ['RFQs received, not yet estimated', String(newRfqs.length + clarify.length)],
                ['Estimates in progress', String(s.estimates.filter((e) => e.status !== 'Ready for Quote').length)],
                ['Quotes awaiting a decision', String(expiring.length)]]
                }
                onOpen={() => navigate('/supplier/rfqs')} />
              
              <LoopBlock
                name="Sell → deliver"
                rows={[
                ['Orders to process', String(ordersToProcess.length)],
                ['Short lines on buy-in', '2'],
                ['Loads scheduled today', String(todayLoads.length)]]
                }
                onOpen={() => navigate('/supplier/orders')} />
              
              <LoopBlock
                name="Deliver → get paid"
                rows={[
                ['PODs captured this week', '1'],
                ['Invoices unpaid', String(s.invoices.filter((i) => i.status !== 'Paid').length)],
                ['Open service cases', String(openCases.length)]]
                }
                onOpen={() => navigate('/supplier/invoices')} />
              
            </div>
          </Panel>

          {can('inventory.view') &&
          <Panel className="overflow-hidden">
              <TitleBlock label="Yard stock" title="Below reorder level" reference="ON HAND − RESERVED" />
              <TickRule />
              <ul className="divide-y divide-ink-100">
                {lowStock.map((p) =>
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-bold text-ink-900">{p.name}</span>
                      <span className="measure block text-[10.5px] text-ink-400">{p.sku}</span>
                    </span>
                    <span className="measure shrink-0 text-right text-[12.5px] font-bold text-danger-600">
                      {qty(available(p))}
                      <span className="ml-1 text-[10px] font-medium text-ink-400">{p.unit}</span>
                    </span>
                  </li>
              )}
              </ul>
            </Panel>
          }
        </div>
      </div>
    </div>);

}

function LoopBlock({
  name,
  rows,
  onOpen




}: {name: string;rows: [string, string][];onOpen: () => void;}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <SpecLabel>{name}</SpecLabel>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-brand-600 transition-colors duration-150 ease-smooth hover:text-brand-700">
          
          Open
          <ArrowRightIcon className="h-3 w-3" />
        </button>
      </div>
      <dl className="mt-2 space-y-1.5">
        {rows.map(([label, value]) =>
        <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-600">{label}</dt>
            <dd className="measure text-[13px] font-bold text-ink-900">{value}</dd>
          </div>
        )}
      </dl>
    </div>);

}