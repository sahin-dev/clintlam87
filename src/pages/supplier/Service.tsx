import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HeadsetIcon, PackageIcon, RotateCcwIcon, TruckIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import { Panel, SpecRow, TickRule, TitleBlock, WorkHeading } from '../../components/smpro/Primitives';
import {
  Cell,
  Denied,
  LedgerStrip,
  ListToolbar,
  RecordHeader,
  RecordTable,
  Row } from
'../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName } from '../../data/supplierOrg';
import { CaseStatus } from '../../types/supplier';

const OPEN: CaseStatus[] = ['Open', 'Investigating', 'Awaiting Customer'];

const RESOLUTIONS = [
'Re-deliver the short or damaged quantity at no charge',
'Credit the affected lines on the invoice',
'Replace from stock and adjust yard inventory',
'Waive the re-delivery fee once',
'No action — resolved with the builder'];


export function SupplierService() {
  const { can } = useSupplier();
  if (!can('service.manage')) return <Denied module="Customer service" />;
  return <SupplierServiceView />;
}

function SupplierServiceView() {
  const navigate = useNavigate();
  const s = useSupplier();
  const [tab, setTab] = useState('open');
  const [query, setQuery] = useState('');


  const rows = useMemo(() => {
    const byTab = s.cases.filter((c) =>
    tab === 'open' ? OPEN.includes(c.status) : tab === 'closed' ? !OPEN.includes(c.status) : true
    );
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((c) =>
    [c.id, c.subject, customerName(c.customerId), c.category].join(' ').toLowerCase().includes(q)
    );
  }, [s.cases, tab, query]);

  const open = s.cases.filter((c) => OPEN.includes(c.status));
  const critical = open.filter((c) => c.priority === 'Critical' || c.priority === 'High');

  return (
    <div>
      <PageHeader
        title="Customer service"
        subtitle="Damage, shortage, delivery and billing cases raised against your loads" />
      

      <LedgerStrip
        items={[
        { label: 'Open cases', value: String(open.length) },
        { label: 'High priority', value: String(critical.length), tone: critical.length ? 'danger' : 'default' },
        {
          label: 'Awaiting the builder',
          value: String(s.cases.filter((c) => c.status === 'Awaiting Customer').length),
          tone: 'brand'
        },
        { label: 'Resolved', value: String(s.cases.filter((c) => c.status === 'Resolved').length) }]
        } />
      

      <Panel className="mb-4 overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
          { value: 'open', label: 'Open', count: open.length },
          { value: 'closed', label: 'Closed', count: s.cases.length - open.length },
          { value: 'all', label: 'All', count: s.cases.length }]
          } />
        
      </Panel>

      <ListToolbar query={query} onQuery={setQuery} placeholder="Search cases by number, builder or subject" />

      {rows.length === 0 ?
      <Panel className="flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
            <HeadsetIcon className="h-5 w-5" />
          </span>
          <h2 className="display-tight mt-4 text-[17px] font-bold text-ink-900">No cases here</h2>
          <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-ink-500">
            Cases are opened from a POD exception, a builder message or a billing dispute.
          </p>
        </Panel> :

      <RecordTable
        caption="Service cases"
        columns={[
        { key: 'case', label: 'Case' },
        { key: 'builder', label: 'Builder', hideBelow: 'sm' },
        { key: 'category', label: 'Type', hideBelow: 'md' },
        { key: 'owner', label: 'Owner', hideBelow: 'lg' },
        { key: 'priority', label: 'Priority', align: 'right' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
          {rows.map((c) =>
        <Row
          key={c.id}
          onClick={() => navigate(`/supplier/service/${c.id}`)}
          spine={
          c.priority === 'Critical' || c.priority === 'High' ?
          'danger' :
          OPEN.includes(c.status) ?
          'caution' :
          'positive'
          }>
          
              <Cell strong>
                {c.subject}
                <span className="measure mt-0.5 block text-[10.5px] font-medium text-ink-400">
                  {c.id} · opened {c.opened}
                  {c.orderId && ` · ${c.orderId}`}
                </span>
              </Cell>
              <Cell hideBelow="sm">{customerName(c.customerId)}</Cell>
              <Cell muted hideBelow="md">
                {c.category}
              </Cell>
              <Cell muted hideBelow="lg">
                {c.owner}
              </Cell>
              <Cell align="right">
                <StatusBadge status={c.priority} />
              </Cell>
              <Cell align="right">
                <StatusBadge status={c.status === 'Awaiting Customer' ? 'Pending' : c.status} />
              </Cell>
            </Row>
        )}
        </RecordTable>
      }
    </div>);

}

/* ------------------------------------------------------------------ */
/* Case detail                                                         */
/* ------------------------------------------------------------------ */

export function SupplierCaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const record = s.cases.find((c) => c.id === caseId);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [note, setNote] = useState('');

  if (!s.can('service.manage')) return <Denied module="Customer service" />;
  if (!record) return <Denied module="This case" />;

  const delivery = s.deliveries.find((d) => d.id === record.deliveryId);
  const order = s.orders.find((o) => o.id === record.orderId);
  const invoice = s.invoices.find((i) => i.orderId === record.orderId);
  const closed = !OPEN.includes(record.status);

  return (
    <div className="detail-column">
      <RecordHeader
        backTo="/supplier/service"
        eyebrow={`${record.category} case`}
        title={record.subject}
        reference={`${record.id} · ${customerName(record.customerId)} · opened ${record.opened}`}
        status={
        <div className="flex gap-2">
            <StatusBadge status={record.priority} />
            <StatusBadge status={record.status === 'Awaiting Customer' ? 'Pending' : record.status} />
          </div>
        }
        actions={
        !closed &&
        <div className="flex gap-2">
              {record.status === 'Open' &&
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              s.setCaseStatus(record.id, 'Investigating');
              s.toast({ tone: 'info', title: `${record.id} under investigation` });
            }}>
            
                  Start investigating
                </Button>
          }
              <Button size="sm" onClick={() => setResolving(true)}>
                Resolve
              </Button>
            </div>

        }
        facts={[
        { label: 'Owner', value: record.owner },
        { label: 'Order', value: record.orderId ?? '—' },
        { label: 'Load', value: record.deliveryId ?? '—' },
        { label: 'Priority', value: record.priority }]
        } />
      

      <Panel className="mb-5 overflow-hidden">
        <TitleBlock label="What happened" />
        <p className="px-4 py-3.5 text-[13px] leading-relaxed text-ink-700">{record.detail}</p>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Evidence chain */}
        <Panel className="overflow-hidden">
          <TitleBlock label="Evidence" title="Where this came from" />
          <ul className="divide-y divide-ink-100">
            {delivery &&
            <li>
                <button
                onClick={() => navigate(`/supplier/deliveries/${delivery.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50/40">
                
                  <TruckIcon className="h-4 w-4 shrink-0 text-ink-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-ink-900">
                      Load {delivery.id}
                    </span>
                    <span className="measure block text-[10.5px] text-ink-400">
                      {delivery.pod ?
                    `POD signed by ${delivery.pod.receivedBy} · ${delivery.pod.photos} photos` :
                    `${delivery.status} · no POD yet`}
                    </span>
                  </span>
                </button>
              </li>
            }
            {order &&
            <li>
                <button
                onClick={() => navigate(`/supplier/orders/${order.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50/40">
                
                  <PackageIcon className="h-4 w-4 shrink-0 text-ink-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-ink-900">
                      {`Order ${order.id}`}
                    </span>
                    <span className="measure block text-[10.5px] text-ink-400">
                      {`${order.lines.length} lines · ${order.status}`}
                    </span>
                  </span>
                </button>
              </li>
            }
            {invoice &&
            <li>
                <button
                onClick={() => navigate(`/supplier/invoices/${invoice.id}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50/40">
                
                  <RotateCcwIcon className="h-4 w-4 shrink-0 text-ink-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-ink-900">
                      Invoice {invoice.id}
                    </span>
                    <span className="measure block text-[10.5px] text-ink-400">
                      {invoice.status} · due {invoice.due}
                    </span>
                  </span>
                </button>
              </li>
            }
          </ul>
        </Panel>

        {/* Case timeline */}
        <Panel className="overflow-hidden">
          <TitleBlock label="Case history" reference={`${record.timeline.length} events`} />
          <ol className="px-4 py-4">
            {record.timeline.map((t, i) =>
            <li key={t.label} className="relative flex gap-3 pb-4 last:pb-0">
                {i < record.timeline.length - 1 &&
              <span aria-hidden className="absolute left-[7px] top-4 h-full w-px bg-ink-200" />
              }
                <span className="relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-[2px] border border-ink-300 bg-white" />
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-ink-800">{t.label}</p>
                  <p className="measure mt-0.5 text-[10.5px] text-ink-400">
                    {t.at} · {t.by}
                  </p>
                </div>
              </li>
            )}
          </ol>
        </Panel>
      </div>

      {record.resolution &&
      <>
          <WorkHeading className="mt-6" label="Outcome" title="How it was resolved" />
          <Panel className="overflow-hidden border-l-[3px] border-l-positive-500">
            <p className="px-4 py-3.5 text-[13px] leading-relaxed text-ink-700">{record.resolution}</p>
            <TickRule />
            <dl className="px-4 py-1">
              <SpecRow label="Closed by" value={record.owner} />
              <SpecRow label="Status" value={<Badge tone="positive" dot={false}>{record.status}</Badge>} />
            </dl>
          </Panel>
        </>
      }

      <Modal
        open={resolving}
        onClose={() => setResolving(false)}
        title="Resolve this case"
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setResolving(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              s.setCaseStatus(
                record.id,
                'Resolved',
                note.trim() ? `${resolution} — ${note.trim()}` : resolution
              );
              s.toast({
                tone: 'success',
                title: `${record.id} resolved`,
                body: 'The builder has been notified and the outcome is on the case record.'
              });
              setResolving(false);
            }}>
            
              Resolve case
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Select label="Resolution" value={resolution} onChange={(e) => setResolution(e.target.value)}>
            {RESOLUTIONS.map((r) =>
            <option key={r}>{r}</option>
            )}
          </Select>
          <Input
            label="Note for the builder"
            hint="Optional"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. replacement headers on load DL-561, Sep 04" />
          
          <p className="text-[11.5px] leading-relaxed text-ink-400">
            Replacements adjust yard inventory. Credits appear against the related invoice rather than
            changing the original amount.
          </p>
        </div>
      </Modal>
    </div>);

}