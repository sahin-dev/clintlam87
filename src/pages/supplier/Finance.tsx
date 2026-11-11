import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckIcon,
  CreditCardIcon,
  LockIcon,
  ReceiptIcon,
  SendIcon } from
'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import { Panel, SpecLabel, SpecRow, TickRule, TitleBlock, WorkHeading } from '../../components/smpro/Primitives';
import {
  Cell,
  Denied,
  LedgerStrip,
  ListToolbar,
  RecordHeader,
  RecordTable,
  Row,
  ScopeNote } from
'../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierCustomers, supplierProjectName } from '../../data/supplierOrg';
import { currency, qty } from '../../utils/format';

const OPEN_STATES = ['Draft', 'Sent', 'Pending', 'Partially Paid', 'Overdue', 'Failed'];

export function SupplierInvoices() {
  const { can } = useSupplier();
  if (!can('invoice.view')) return <Denied module="Invoices" />;
  return <SupplierInvoicesView />;
}

function SupplierInvoicesView() {
  const navigate = useNavigate();
  const s = useSupplier();
  const [tab, setTab] = useState('open');
  const [query, setQuery] = useState('');


  const rows = useMemo(() => {
    const byTab = s.invoices.filter((i) =>
    tab === 'open' ?
    OPEN_STATES.includes(i.status) :
    tab === 'overdue' ?
    i.status === 'Overdue' || i.status === 'Failed' :
    tab === 'paid' ?
    i.status === 'Paid' :
    true
    );
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((i) =>
    [i.id, i.orderId, customerName(i.customerId), supplierProjectName(i.projectId)].
    join(' ').
    toLowerCase().
    includes(q)
    );
  }, [s.invoices, tab, query]);

  const outstanding = s.invoices.reduce((sum, i) => sum + (i.total - i.paid), 0);
  const overdue = s.invoices.
  filter((i) => i.status === 'Overdue').
  reduce((sum, i) => sum + (i.total - i.paid), 0);
  const failed = s.invoices.filter((i) => i.status === 'Failed').length;

  /* Delivered loads with a signed POD and no invoice can be billed now. */
  const billable = s.deliveries.filter(
    (d) => d.pod && !s.invoices.some((i) => i.deliveryId === d.id)
  );

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Billing against delivered loads and signed PODs" />

      <LedgerStrip
        items={[
        { label: 'Outstanding', value: currency(outstanding), tone: 'brand' },
        { label: 'Overdue', value: currency(overdue), tone: overdue ? 'danger' : 'default' },
        { label: 'Failed payments', value: String(failed), tone: failed ? 'danger' : 'default' },
        { label: 'Ready to bill', value: String(billable.length), note: 'Signed PODs not invoiced' }]
        } />
      

      {billable.length > 0 && s.can('invoice.manage') &&
      <Panel className="mb-5 overflow-hidden">
          <TitleBlock label="Ready to bill" reference={`${billable.length} delivered load(s)`} />
          <ul className="divide-y divide-ink-100">
            {billable.map((d) =>
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900">
                    {d.id} · {customerName(d.customerId)}
                  </p>
                  <p className="measure mt-0.5 text-[11px] text-ink-400">
                    POD signed {d.pod?.signedAt} by {d.pod?.receivedBy} · order {d.orderId}
                  </p>
                </div>
                <Button
              size="sm"
              onClick={() =>
              s.toast({
                tone: 'success',
                title: `Invoice drafted for ${d.id}`,
                body: 'Lines were pulled from the POD quantities, not the ordered quantities.'
              })
              }
              icon={<ReceiptIcon className="h-3.5 w-3.5" />}>
              
                  Raise invoice
                </Button>
              </li>
          )}
          </ul>
        </Panel>
      }

      <Panel className="mb-4 overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
          { value: 'open', label: 'Open', count: s.invoices.filter((i) => OPEN_STATES.includes(i.status)).length },
          {
            value: 'overdue',
            label: 'Needs chasing',
            count: s.invoices.filter((i) => i.status === 'Overdue' || i.status === 'Failed').length
          },
          { value: 'paid', label: 'Paid', count: s.invoices.filter((i) => i.status === 'Paid').length },
          { value: 'all', label: 'All', count: s.invoices.length }]
          } />
        
      </Panel>

      <ListToolbar query={query} onQuery={setQuery} placeholder="Search invoices by number, order or builder" />

      <RecordTable
        caption="Invoices"
        columns={[
        { key: 'invoice', label: 'Invoice' },
        { key: 'builder', label: 'Builder / project' },
        { key: 'issued', label: 'Issued', hideBelow: 'lg' },
        { key: 'due', label: 'Due', hideBelow: 'md' },
        { key: 'total', label: 'Total', align: 'right' },
        { key: 'balance', label: 'Balance', align: 'right' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
        {rows.map((i) => {
          const balance = i.total - i.paid;
          return (
            <Row
              key={i.id}
              onClick={() => navigate(`/supplier/invoices/${i.id}`)}
              spine={
              i.status === 'Overdue' || i.status === 'Failed' ?
              'danger' :
              i.status === 'Paid' ?
              'positive' :
              'brand'
              }>
              
              <Cell strong>
                {i.id}
                <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">
                  {i.orderId} · {i.terms}
                </span>
              </Cell>
              <Cell>
                {customerName(i.customerId)}
                <span className="mt-0.5 block text-[11.5px] text-ink-400">
                  {supplierProjectName(i.projectId)}
                </span>
              </Cell>
              <Cell mono muted hideBelow="lg">
                {i.issued}
              </Cell>
              <Cell mono muted hideBelow="md">
                {i.due}
              </Cell>
              <Cell align="right" mono>
                {currency(i.total)}
              </Cell>
              <Cell align="right" mono strong className={balance ? undefined : 'text-ink-300'}>
                {currency(balance)}
              </Cell>
              <Cell align="right">
                <StatusBadge status={i.status} />
              </Cell>
            </Row>);

        })}
      </RecordTable>

      <ScopeNote>
        Invoice detail is scoped to the builder it belongs to. Nobody outside your yard — and no other
        builder — can see these records.
      </ScopeNote>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Invoice detail                                                      */
/* ------------------------------------------------------------------ */

export function SupplierInvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const invoice = s.invoices.find((i) => i.id === invoiceId);
  const [recording, setRecording] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('ACH transfer');

  if (!s.can('invoice.view')) return <Denied module="Invoices" />;
  if (!invoice) return <Denied module="This invoice" />;

  const order = s.orders.find((o) => o.id === invoice.orderId);
  const delivery = s.deliveries.find((d) => d.id === invoice.deliveryId);
  const related = s.payments.filter((p) => p.invoiceId === invoice.id);
  const balance = invoice.total - invoice.paid;

  return (
    <div className="detail-column">
      <RecordHeader
        backTo="/supplier/invoices"
        eyebrow="Invoice"
        title={invoice.id}
        reference={`${customerName(invoice.customerId)} · ${supplierProjectName(invoice.projectId)}`}
        status={<StatusBadge status={invoice.status} />}
        actions={
        s.can('invoice.manage') &&
        <div className="flex gap-2">
              {invoice.status === 'Draft' &&
          <Button
            size="sm"
            onClick={() => {
              s.issueInvoice(invoice.id);
              s.toast({
                tone: 'success',
                title: `${invoice.id} sent`,
                body: 'It is now in the builder’s accounting, matched to their order.'
              });
            }}
            icon={<SendIcon className="h-3.5 w-3.5" />}>
            
                  Send
                </Button>
          }
              {balance > 0 &&
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAmount(String(balance));
              setRecording(true);
            }}>
            
                  Record payment
                </Button>
          }
            </div>

        }
        facts={[
        { label: 'Order', value: invoice.orderId },
        { label: 'Issued', value: invoice.issued },
        { label: 'Due', value: invoice.due },
        { label: 'Terms', value: invoice.terms },
        { label: 'Balance', value: currency(balance) }]
        } />
      

      {invoice.status === 'Failed' &&
      <Panel className="mb-5 overflow-hidden border-l-[3px] border-l-danger-500">
          <div className="flex items-start gap-3 px-4 py-3.5">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
            <div>
              <SpecLabel className="text-danger-700">Payment failed</SpecLabel>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-700">
                {related.find((p) => p.status === 'Failed')?.failureReason ??
              'The builder’s payment did not clear. Ask them to retry with another method.'}
              </p>
            </div>
          </div>
        </Panel>
      }

      {/* Three-way match */}
      <Panel className="mb-5 overflow-hidden">
        <TitleBlock label="Matched against" title="Order, delivery and POD" />
        <div className="grid divide-y divide-ink-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
          { label: 'Sales order', value: invoice.orderId, note: order ? `${currency(order.total)} ordered` : '—' },
          {
            label: 'Delivered load',
            value: delivery?.id ?? 'Not linked',
            note: delivery ? `${delivery.date} · ${delivery.window}` : 'Invoice raised on the order'
          },
          {
            label: 'Proof of delivery',
            value: delivery?.pod ? 'Signed' : 'Not signed',
            note: delivery?.pod ? `${delivery.pod.receivedBy}` : 'No POD on file'
          }].
          map((c) =>
          <div key={c.label} className="px-4 py-3.5">
              <SpecLabel>{c.label}</SpecLabel>
              <p className="measure mt-1 text-[14px] font-semibold text-ink-900">{c.value}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-ink-400">{c.note}</p>
            </div>
          )}
        </div>
        {delivery &&
        <>
            <TickRule />
            <div className="flex flex-wrap gap-2 px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => navigate(`/supplier/deliveries/${delivery.id}`)}>
                Open the POD
              </Button>
              {order &&
            <Button size="sm" variant="ghost" onClick={() => navigate(`/supplier/orders/${order.id}`)}>
                  Open order
                </Button>
            }
            </div>
          </>
        }
      </Panel>

      {/* Lines + totals */}
      {order &&
      <Panel className="mb-5 overflow-hidden">
          <TitleBlock label="Billed lines" reference={`${order.lines.length} lines`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50/70">
                  <th scope="col" className="spec-label px-4 py-2.5">Material</th>
                  <th scope="col" className="spec-label px-4 py-2.5 text-right">Delivered</th>
                  <th scope="col" className="spec-label px-4 py-2.5 text-right">Unit price</th>
                  <th scope="col" className="spec-label px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {order.lines.map((l) =>
              <tr key={l.productId}>
                    <td className="px-4 py-3 text-[12.5px] font-medium text-ink-800">{l.description}</td>
                    <td className="measure px-4 py-3 text-right text-[12.5px] text-ink-700">
                      {qty(l.fulfilled || l.ordered)} {l.unit}
                    </td>
                    <td className="measure px-4 py-3 text-right text-[12.5px] text-ink-500">
                      ${l.unitPrice.toFixed(2)}
                    </td>
                    <td className="measure px-4 py-3 text-right text-[12.5px] font-semibold text-ink-900">
                      {currency((l.fulfilled || l.ordered) * l.unitPrice)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
          <TickRule />
          <dl className="px-4 py-1">
            <SpecRow label="Subtotal" value={currency(invoice.subtotal)} mono />
            {invoice.discount > 0 && <SpecRow label="Discount" value={`−${currency(invoice.discount)}`} mono />}
            <SpecRow label="Delivery" value={currency(invoice.deliveryFee)} mono />
            <SpecRow label="Tax" value={currency(invoice.tax)} mono />
          </dl>
          <div className="flex items-center justify-between border-t border-ink-200 bg-ink-50/70 px-4 py-3">
            <SpecLabel>Invoice total</SpecLabel>
            <p className="measure text-[22px] font-bold text-ink-900">{currency(invoice.total)}</p>
          </div>
        </Panel>
      }

      {/* Payments against this invoice */}
      <WorkHeading label="Received" title="Payments against this invoice" count={`${related.length}`} />
      {related.length === 0 ?
      <Panel className="px-4 py-8 text-center">
          <p className="text-[13px] text-ink-500">Nothing received yet. Balance {currency(balance)}.</p>
        </Panel> :

      <Panel className="overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {related.map((p) =>
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink-900">
                    {currency(p.amount)} · {p.method}
                  </p>
                  <p className="measure mt-0.5 text-[11px] text-ink-400">
                    {p.date} · {p.reference}
                  </p>
                </div>
                <StatusBadge status={p.status === 'Cleared' ? 'Paid' : p.status} />
              </li>
          )}
          </ul>
        </Panel>
      }

      <ScopeNote>
        SM PRO never stores the builder&apos;s card or bank credentials. Only the method used and a
        masked reference are kept against the payment.
      </ScopeNote>

      <Modal
        open={recording}
        onClose={() => setRecording(false)}
        title="Record a payment"
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setRecording(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            disabled={!Number(amount)}
            onClick={() => {
              const paidNow = Number(amount);
              s.setInvoiceStatus(invoice.id, paidNow >= balance ? 'Paid' : 'Partially Paid');
              s.toast({
                tone: 'success',
                title: `${currency(paidNow)} recorded`,
                body:
                paidNow >= balance ?
                `${invoice.id} is settled in full.` :
                `${currency(balance - paidNow)} still outstanding on ${invoice.id}.`
              });
              setRecording(false);
            }}>
            
              Record payment
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-ink-100">
              <div className="px-4 py-3">
                <SpecLabel>Invoice total</SpecLabel>
                <p className="measure mt-1 text-[17px] font-bold text-ink-900">{currency(invoice.total)}</p>
              </div>
              <div className="px-4 py-3">
                <SpecLabel>Balance</SpecLabel>
                <p className="measure mt-1 text-[17px] font-bold text-brand-600">{currency(balance)}</p>
              </div>
            </div>
          </Panel>
          <Input label="Amount received" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select label="Method" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>ACH transfer</option>
            <option>Card on file</option>
            <option>Check</option>
            <option>Wire</option>
          </Select>
          <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-400">
            <LockIcon className="mt-0.5 h-3 w-3 shrink-0" />
            Card and bank details are handled by the payment processor. SM PRO stores only the masked
            reference.
          </p>
        </div>
      </Modal>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export function SupplierPayments() {
  const navigate = useNavigate();
  const s = useSupplier();
  const [tab, setTab] = useState('all');

  if (!s.can('payment.view')) return <Denied module="Payments" />;

  const rows = s.payments.filter((p) =>
  tab === 'failed' ? p.status === 'Failed' : tab === 'cleared' ? p.status === 'Cleared' : true
  );

  const cleared = s.payments.filter((p) => p.status === 'Cleared').reduce((sum, p) => sum + p.amount, 0);
  const failed = s.payments.filter((p) => p.status === 'Failed');

  /* Aging buckets read from the invoice ledger, not the payment ledger. */
  const aging = [
  { label: 'Current', test: (st: string) => st === 'Pending' || st === 'Sent' || st === 'Draft' },
  { label: 'Part paid', test: (st: string) => st === 'Partially Paid' },
  { label: 'Overdue', test: (st: string) => st === 'Overdue' },
  { label: 'Failed', test: (st: string) => st === 'Failed' }].
  map((b) => ({
    label: b.label,
    value: s.invoices.filter((i) => b.test(i.status)).reduce((sum, i) => sum + (i.total - i.paid), 0),
    count: s.invoices.filter((i) => b.test(i.status)).length
  }));

  return (
    <div>
      <PageHeader title="Payments" subtitle="Receipts, aging and failed payment recovery" />

      <LedgerStrip
        items={[
        { label: 'Cleared to date', value: currency(cleared), tone: 'positive' },
        { label: 'Failed', value: String(failed.length), tone: failed.length ? 'danger' : 'default' },
        {
          label: 'Refunded',
          value: String(s.payments.filter((p) => p.status === 'Refunded').length)
        },
        {
          label: 'Outstanding',
          value: currency(s.invoices.reduce((sum, i) => sum + (i.total - i.paid), 0)),
          tone: 'brand'
        }]
        } />
      

      <Panel className="mb-5 overflow-hidden">
        <TitleBlock label="Aging" title="Outstanding by state" />
        <div className="grid divide-y divide-ink-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {aging.map((b) =>
          <div key={b.label} className="px-4 py-3.5">
              <SpecLabel>{b.label}</SpecLabel>
              <p
              className={`measure mt-1 text-[18px] font-bold ${
              b.label === 'Overdue' || b.label === 'Failed' ? 'text-danger-600' : 'text-ink-900'}`
              }>
              
                {currency(b.value)}
              </p>
              <p className="measure mt-0.5 text-[10.5px] text-ink-400">
                {b.count} invoice{b.count === 1 ? '' : 's'}
              </p>
            </div>
          )}
        </div>
      </Panel>

      {failed.length > 0 &&
      <Panel className="mb-5 overflow-hidden border-l-[3px] border-l-danger-500">
          <TitleBlock label="Needs recovery" reference={`${failed.length} failed`} />
          <ul className="divide-y divide-ink-100">
            {failed.map((p) =>
          <li key={p.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900">
                      {currency(p.amount)} · {customerName(p.customerId)}
                    </p>
                    <p className="measure mt-0.5 text-[11px] text-ink-400">
                      {p.invoiceId} · {p.method} · {p.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/supplier/invoices/${p.invoiceId}`)}>
                  
                      Open invoice
                    </Button>
                    {s.can('payment.manage') &&
                <Button
                  size="sm"
                  onClick={() =>
                  s.toast({
                    tone: 'info',
                    title: 'Retry requested',
                    body: `${customerName(p.customerId)} has been asked to pay ${p.invoiceId} by ACH.`
                  })
                  }
                  icon={<ArrowRightIcon className="h-3.5 w-3.5" />}>
                  
                        Ask for a retry
                      </Button>
                }
                  </div>
                </div>
                {p.failureReason &&
            <p className="mt-2 border-l-2 border-danger-400 pl-2.5 text-[12px] leading-relaxed text-ink-600">
                    {p.failureReason}
                  </p>
            }
              </li>
          )}
          </ul>
        </Panel>
      }

      <Panel className="mb-4 overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
          { value: 'all', label: 'All', count: s.payments.length },
          { value: 'cleared', label: 'Cleared', count: s.payments.filter((p) => p.status === 'Cleared').length },
          { value: 'failed', label: 'Failed', count: failed.length }]
          } />
        
      </Panel>

      <RecordTable
        caption="Payments received"
        columns={[
        { key: 'payment', label: 'Payment' },
        { key: 'builder', label: 'Builder' },
        { key: 'method', label: 'Method', hideBelow: 'md' },
        { key: 'date', label: 'Date', hideBelow: 'lg' },
        { key: 'amount', label: 'Amount', align: 'right' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
        {rows.map((p) =>
        <Row
          key={p.id}
          onClick={() => navigate(`/supplier/invoices/${p.invoiceId}`)}
          spine={p.status === 'Failed' ? 'danger' : p.status === 'Cleared' ? 'positive' : undefined}>
          
            <Cell strong>
              {p.id}
              <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">
                against {p.invoiceId}
              </span>
            </Cell>
            <Cell>{customerName(p.customerId)}</Cell>
            <Cell muted hideBelow="md">
              <span className="inline-flex items-center gap-1.5">
                <CreditCardIcon className="h-3.5 w-3.5" />
                {p.method}
              </span>
            </Cell>
            <Cell mono muted hideBelow="lg">
              {p.date}
            </Cell>
            <Cell align="right" mono strong>
              {currency(p.amount)}
            </Cell>
            <Cell align="right">
              <StatusBadge status={p.status === 'Cleared' ? 'Paid' : p.status} />
            </Cell>
          </Row>
        )}
      </RecordTable>

      {/* Statement by builder */}
      <WorkHeading className="mt-6" label="Reconciliation" title="Balance by builder" />
      <Panel className="overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {supplierCustomers.
          filter((c) => c.status === 'Active').
          map((c) => {
            const invs = s.invoices.filter((i) => i.customerId === c.id);
            const bal = invs.reduce((sum, i) => sum + (i.total - i.paid), 0);
            const over = invs.some((i) => i.status === 'Overdue' || i.status === 'Failed');
            return (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900">{c.name}</p>
                    <p className="measure mt-0.5 text-[11px] text-ink-400">
                      {c.terms} · credit {currency(c.creditLimit)} · {invs.length} invoice
                      {invs.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {over &&
                  <Badge tone="danger" dot>
                        Needs chasing
                      </Badge>
                  }
                    <span
                    className={`measure text-[14px] font-semibold ${
                    bal ? 'text-ink-900' : 'text-positive-700'}`
                    }>
                    
                      {bal ? currency(bal) : 'Settled'}
                    </span>
                    {!bal && <CheckIcon className="h-4 w-4 text-positive-600" strokeWidth={3} />}
                  </div>
                </li>);

          })}
        </ul>
      </Panel>
    </div>);

}