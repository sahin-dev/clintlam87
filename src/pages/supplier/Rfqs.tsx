import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardListIcon, FileTextIcon, ScanSearchIcon, UserCheckIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, InlineAlert } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Field';
import { Panel, SpecLabel, SpecRow, TitleBlock, WorkHeading, TickRule } from '../../components/smpro/Primitives';
import { ConfidenceMeter } from '../../components/smpro/Confidence';
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
import { customerName, supplierProjectName, supplierStaff } from '../../data/supplierOrg';
import { qty } from '../../utils/format';

const FILTERS = ['All', 'New', 'In Review', 'Needs Clarification', 'Estimating', 'Quoted'];

/** Inbound pricing requests. This is where the supplier side of the flow starts. */
export function Rfqs() {
  const navigate = useNavigate();
  const s = useSupplier();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  if (!s.can('rfq.view')) return <Denied module="RFQs" />;

  const rows = s.rfqs.filter((r) => {
    const matchesFilter = filter === 'All' || r.status === filter;
    const q = query.trim().toLowerCase();
    return (
      matchesFilter && (
      !q ||
      r.id.toLowerCase().includes(q) ||
      customerName(r.customerId).toLowerCase().includes(q) ||
      supplierProjectName(r.projectId).toLowerCase().includes(q)));

  });

  return (
    <div>
      <PageHeader
        title="Requests for quote"
        subtitle="Each request arrives with the builder's approved takeoff, its plan revision and its source sheets" />
      

      <LedgerStrip
        items={[
        { label: 'New today', value: String(s.rfqs.filter((r) => r.status === 'New').length), tone: 'brand' },
        { label: 'In review', value: String(s.rfqs.filter((r) => r.status === 'In Review').length) },
        {
          label: 'Blocked on the builder',
          value: String(s.rfqs.filter((r) => r.status === 'Needs Clarification').length),
          tone: 'danger'
        },
        { label: 'Quoted', value: String(s.rfqs.filter((r) => r.status === 'Quoted').length) }]
        } />
      

      <ListToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by request, builder or project…"
        filters={FILTERS}
        active={filter}
        onFilter={setFilter} />
      

      {rows.length === 0 ?
      <EmptyState
        icon={<ClipboardListIcon className="h-5 w-5" />}
        title="No requests match"
        body="Builders send requests from an approved takeoff. Nothing is waiting on the yard right now." /> :


      <RecordTable
        caption="Inbound requests for quote"
        columns={[
        { key: 'id', label: 'Request' },
        { key: 'builder', label: 'Builder / project' },
        { key: 'takeoff', label: 'Takeoff', hideBelow: 'md' },
        { key: 'lines', label: 'Lines', align: 'right' },
        { key: 'due', label: 'Quote due' },
        { key: 'estimator', label: 'Estimator', hideBelow: 'lg' },
        { key: 'status', label: 'Status', align: 'right' }]
        }>
        
          {rows.map((r) =>
        <Row
          key={r.id}
          onClick={() => navigate(`/supplier/rfqs/${r.id}`)}
          spine={r.status === 'New' ? 'brand' : r.status === 'Needs Clarification' ? 'danger' : undefined}>
          
              <Cell strong mono>
                {r.id}
                <span className="mt-0.5 block text-[10.5px] font-medium text-ink-400">{r.received}</span>
              </Cell>
              <Cell>
                {customerName(r.customerId)}
                <span className="mt-0.5 block text-[11.5px] text-ink-400">{supplierProjectName(r.projectId)}</span>
              </Cell>
              <Cell hideBelow="md" mono muted>
                {r.takeoffRef} · {r.revision}
              </Cell>
              <Cell align="right" mono>
                {r.lines.length}
              </Cell>
              <Cell mono strong>
                {r.dueDate}
              </Cell>
              <Cell hideBelow="lg" muted>
                {supplierStaff.find((st) => st.id === r.estimatorId)?.name ?? 'Unassigned'}
              </Cell>
              <Cell align="right">
                <StatusBadge status={r.status === 'New' ? 'Submitted' : r.status} dot={false} />
              </Cell>
            </Row>
        )}
        </RecordTable>
      }
    </div>);

}

export function RfqDetail() {
  const { rfqId = '' } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const rfq = s.rfqs.find((r) => r.id === rfqId);

  if (!s.can('rfq.view')) return <Denied module="RFQs" />;
  if (!rfq) return <Denied module="This request" />;

  const estimators = supplierStaff.filter((st) => st.roles.includes('estimator'));
  const lowConfidence = rfq.lines.filter((l) => l.confidence < 75);

  return (
    <div className="detail-column">
      <RecordHeader
        backTo="/supplier/rfqs"
        eyebrow={`Request for quote · ${customerName(rfq.customerId)}`}
        title={supplierProjectName(rfq.projectId)}
        reference={`${rfq.id} · ${rfq.takeoffRef} · ${rfq.revision} · ${rfq.sheets} sheets`}
        status={<StatusBadge status={rfq.status === 'New' ? 'Submitted' : rfq.status} />}
        actions={
        s.can('takeoff.review') ?
        <Button
          size="sm"
          onClick={() => navigate(`/supplier/takeoffs/${rfq.id}`)}
          icon={<ScanSearchIcon className="h-4 w-4" />}>
          
              Review takeoff
            </Button> :
        undefined
        }
        facts={[
        { label: 'Requested by', value: rfq.requestedBy },
        { label: 'Received', value: rfq.received },
        { label: 'Quote due', value: rfq.dueDate },
        { label: 'Needed on site', value: rfq.requiredDelivery },
        { label: 'Material lines', value: String(rfq.lines.length) }]
        } />
      

      <div className="space-y-6">
        {rfq.notes &&
        <Panel className="overflow-hidden">
            <TitleBlock label="Builder note" />
            <p className="px-4 py-3.5 text-[13px] leading-relaxed text-ink-700">{rfq.notes}</p>
          </Panel>
        }

        {lowConfidence.length > 0 &&
        <InlineAlert
          tone="warning"
          title={`${lowConfidence.length} line${lowConfidence.length > 1 ? 's' : ''} arrived below 75% AI confidence`}
          body="The builder approved these quantities, but the model was unsure. Verify them against the source sheet before you price them."
          action="Open review workspace"
          onAction={() => navigate(`/supplier/takeoffs/${rfq.id}`)} />

        }

        {s.can('rfq.assign') &&
        <Panel className="overflow-hidden">
            <TitleBlock label="Assignment" title="Who is estimating this" />
            <div className="flex flex-wrap items-end gap-3 px-4 py-3.5">
              <div className="min-w-[220px] flex-1">
                <Select
                label="Estimator"
                value={rfq.estimatorId ?? ''}
                onChange={(e) => {
                  s.assignEstimator(rfq.id, e.target.value);
                  s.toast({
                    tone: 'success',
                    title: 'Estimator assigned',
                    body: `${supplierStaff.find((st) => st.id === e.target.value)?.name} now owns ${rfq.id}.`
                  });
                }}>
                
                  <option value="">Unassigned</option>
                  {estimators.map((st) =>
                <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                )}
                </Select>
              </div>
              <Button
              variant="secondary"
              icon={<UserCheckIcon className="h-4 w-4" />}
              onClick={() =>
              s.toast({ tone: 'info', title: 'Builder notified', body: 'We confirmed receipt of the request.' })
              }>
              
                Acknowledge to builder
              </Button>
            </div>
          </Panel>
        }

        <section>
          <WorkHeading label="Scope" title="Material lines requested" count={`${rfq.lines.length}`} />
          <RecordTable
            caption="Requested material lines"
            columns={[
            { key: 'material', label: 'Material' },
            { key: 'qty', label: 'Builder qty', align: 'right' },
            { key: 'source', label: 'Source', hideBelow: 'sm' },
            { key: 'confidence', label: 'AI confidence', hideBelow: 'md' },
            { key: 'state', label: 'Builder state', align: 'right', hideBelow: 'lg' }]
            }>
            
            {rfq.lines.map((l) =>
            <Row key={l.id} spine={l.confidence < 75 ? 'caution' : undefined}>
                <Cell strong>
                  {l.material}
                  <span className="mt-0.5 block text-[10.5px] font-medium text-ink-400">{l.category}</span>
                </Cell>
                <Cell align="right" mono strong>
                  {qty(l.builderQty)}
                  <span className="ml-1 text-[10px] font-medium text-ink-400">{l.unit}</span>
                </Cell>
                <Cell hideBelow="sm" mono muted>
                  {l.sheet} · p{l.page}
                </Cell>
                <Cell hideBelow="md">
                  <ConfidenceMeter value={l.confidence} />
                </Cell>
                <Cell align="right" hideBelow="lg" muted>
                  {l.builderVerification}
                </Cell>
              </Row>
            )}
          </RecordTable>
        </section>

        <Panel className="overflow-hidden">
          <TitleBlock label="Attachments" title="What the builder sent" reference={`${rfq.attachments.length} items`} />
          <TickRule />
          <ul className="divide-y divide-ink-100">
            {rfq.attachments.map((a) =>
            <li key={a.name} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-ink-100 text-ink-500">
                  <FileTextIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-bold text-ink-900">{a.name}</span>
                  <span className="block truncate text-[11.5px] text-ink-400">{a.meta}</span>
                </span>
                <SpecLabel>{a.kind}</SpecLabel>
              </li>
            )}
          </ul>
        </Panel>

        <Panel className="overflow-hidden">
          <TitleBlock label="Delivery" title="Where this package is going" />
          <dl className="px-4 py-1">
            <SpecRow label="Project" value={supplierProjectName(rfq.projectId)} />
            <SpecRow label="Required on site" value={rfq.requiredDelivery} mono />
            <SpecRow label="Quote deadline" value={rfq.dueDate} mono />
            <SpecRow label="Plan set" value={`${rfq.planSet} · ${rfq.revision}`} />
          </dl>
        </Panel>
      </div>
    </div>);

}