import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, PencilIcon, SaveIcon, XIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import { Panel, SpecLabel, TickRule } from '../../components/smpro/Primitives';
import { ConfidenceMeter } from '../../components/smpro/Confidence';
import { SourceTrace } from '../../components/smpro/SourceTrace';
import { BlueprintViewer, Sheet } from '../../components/smpro/BlueprintViewer';
import { Denied } from '../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, supplierProjectName } from '../../data/supplierOrg';
import { available, products, productById } from '../../data/supplierCatalog';
import { InboundTakeoffLine, LineDecision } from '../../types/supplier';
import { IMAGES } from '../../data/images';
import { currency, qty } from '../../utils/format';
const DECISION_LABEL: Record<LineDecision, string> = {
  pending: 'Not reviewed',
  accepted: 'Accepted',
  adjusted: 'Adjusted',
  rejected: 'Rejected',
  clarify: 'Clarification requested'
};

/**
 * The estimator's workspace. Left: the sheets the builder shared. Centre: the
 * drawing with the detected regions behind each quantity. Right: the inbound
 * takeoff, where every line has to be accepted, adjusted, rejected or queried
 * before it can be priced.
 */
export function SupplierTakeoffReview() {
  const {
    rfqId = ''
  } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const rfq = s.rfqs.find((r) => r.id === rfqId);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [editing, setEditing] = useState<InboundTakeoffLine | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editReason, setEditReason] = useState('');
  const [clarifyLine, setClarifyLine] = useState<InboundTakeoffLine | null>(null);
  const [clarifyNote, setClarifyNote] = useState('');
  const [saved, setSaved] = useState(true);
  if (!s.can('takeoff.review')) return <Denied module="Takeoff review" />;
  if (!rfq) return <Denied module="This takeoff" />;

  /* Sheets are derived from the lines: one entry per source sheet, with each
     line's detected region drawn on it. */
  const viewerSheets: Sheet[] = useMemo(() => {
    const codes = Array.from(new Set(rfq.lines.map((l) => l.sheet)));
    return codes.map((code) => {
      const onSheet = rfq.lines.filter((l) => l.sheet === code);
      return {
        id: code,
        code,
        title: onSheet[0]?.category ? `${onSheet[0].category} scope` : 'Drawing',
        image: IMAGES.blueprint,
        markers: onSheet.map((l, i) => ({
          id: l.id,
          x: 14 + i * 23 % 58,
          y: 18 + i * 19 % 52,
          w: 22,
          h: 16,
          label: l.material.split('·')[0].trim(),
          confidence: l.confidence
        }))
      };
    });
  }, [rfq]);
  const focusLine = (lineId: string) => {
    const line = rfq.lines.find((l) => l.id === lineId);
    if (!line) return;
    setActiveLineId(lineId);
    const idx = viewerSheets.findIndex((sh) => sh.code === line.sheet);
    if (idx >= 0) setSheetIndex(idx);
  };
  const decided = rfq.lines.filter((l) => l.decision !== 'pending').length;
  const rejected = rfq.lines.filter((l) => l.decision === 'rejected').length;
  const queried = rfq.lines.filter((l) => l.decision === 'clarify').length;
  const readyToEstimate = decided === rfq.lines.length && queried === 0;
  const mapped = rfq.lines.filter((l) => l.productId).length;
  const decide = (line: InboundTakeoffLine, decision: LineDecision, patch: Partial<InboundTakeoffLine> = {}) => {
    s.decideLine(rfq.id, line.id, {
      decision,
      changedBy: s.user.name,
      changedAt: 'Just now',
      ...patch
    });
    setSaved(false);
  };
  return <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col bg-canvas">
      <header className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b border-ink-200 bg-white px-4 py-2.5">
        <button onClick={() => navigate(`/supplier/rfqs/${rfq.id}`)} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Request
        </button>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <HeadField label="Builder" value={customerName(rfq.customerId)} />
          <HeadField label="Project" value={supplierProjectName(rfq.projectId)} />
          <HeadField label="Takeoff" value={`${rfq.takeoffRef} · ${rfq.revision}`} mono />
          <HeadField label="Plan set" value={`${rfq.planSet} · ${rfq.sheets} sheets`} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="spec-label rounded-[2px] bg-caution-500 px-2 py-1 text-ink-900">
            Builder approved · supplier unverified
          </span>
          <button onClick={() => {
          setSaved(true);
          s.toast({
            tone: 'success',
            title: 'Review saved',
            body: `${decided} of ${rfq.lines.length} lines decided.`
          });
        }} className="flex items-center gap-1.5 rounded-[3px] border border-ink-200 px-2.5 py-1.5 text-[11px] font-bold text-ink-600 transition-colors duration-150 ease-smooth hover:text-brand-600">
            <SaveIcon className="h-3.5 w-3.5" />
            {saved ? 'Saved' : 'Save review'}
          </button>
          <Button size="sm" disabled={!readyToEstimate} onClick={() => {
          s.setRfqStatus(rfq.id, 'Ready for Pricing');
          navigate(`/supplier/estimates/new?rfq=${rfq.id}`);
        }}>
            {readyToEstimate ? 'Build estimate' : `${rfq.lines.length - decided + queried} lines open`}
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1.5 border-b border-ink-100 bg-ink-50/70 px-4 py-1.5">
        <Counter label="Lines received" value={String(rfq.lines.length)} />
        <Counter label="Decided" value={`${decided}/${rfq.lines.length}`} tone={decided === rfq.lines.length ? 'positive' : 'caution'} />
        <Counter label="Mapped to SKU" value={`${mapped}/${rfq.lines.length}`} />
        <Counter label="Queried" value={String(queried)} tone={queried ? 'danger' : 'positive'} />
        <Counter label="Rejected" value={String(rejected)} tone={rejected ? 'danger' : 'default'} />
        <span className="measure ml-auto text-[10.5px] text-ink-400">
          BUILDER MODEL RUN · {rfq.takeoffRef} · {rfq.revision}
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[212px_minmax(0,1fr)_380px]">
        {/* Sheet index */}
        <aside className="hidden min-h-0 flex-col border-r border-ink-200 bg-white lg:flex">
          <div className="border-b border-ink-100 px-3 py-2.5">
            <SpecLabel>Shared sheets</SpecLabel>
          </div>
          <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            {viewerSheets.map((sh, i) => {
            const lines = rfq.lines.filter((l) => l.sheet === sh.code);
            const open = lines.filter((l) => l.decision === 'pending').length;
            return <li key={sh.id}>
                  <button onClick={() => {
                setSheetIndex(i);
                setActiveLineId(null);
              }} className={`w-full border-l-2 px-3 py-2.5 text-left transition-colors duration-150 ease-smooth ${i === sheetIndex ? 'border-brand-500 bg-brand-50/50' : 'border-transparent hover:bg-ink-50'}`}>
                    <span className="measure block text-[12px] font-semibold text-ink-900">{sh.code}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-ink-400">{sh.title}</span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="measure text-[10px] text-ink-400">{`${lines.length} lines`}</span>
                      {open > 0 && <span className="measure rounded-[2px] bg-caution-100 px-1 text-[9.5px] font-semibold text-caution-800">
                          {`${open} open`}
                        </span>}
                    </span>
                  </button>
                </li>;
          })}
          </ul>
        </aside>

        {/* Drawing */}
        <div className="min-h-0 min-w-0">
          <BlueprintViewer sheets={viewerSheets} sheetIndex={sheetIndex} onSheetChange={(i) => {
          setSheetIndex(i);
          setActiveLineId(null);
        }} activeMarkerId={activeLineId} onMarkerSelect={(id) => setActiveLineId(id)} className="h-full border-0" />
        </div>

        {/* Inbound takeoff */}
        <aside className="flex min-h-0 flex-col border-t border-ink-200 bg-white lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-3.5 py-2.5">
            <SpecLabel>Inbound takeoff</SpecLabel>
            <span className="measure text-[10.5px] text-ink-400">{rfq.lines.length} LINES</span>
          </div>
          <TickRule />
          <ul className="no-scrollbar min-h-0 flex-1 divide-y divide-ink-100 overflow-y-auto">
            {rfq.lines.map((l) => {
            const active = l.id === activeLineId;
            const product = productById(l.productId);
            const finalQty = l.supplierQty ?? l.builderQty;
            return <li key={l.id} className={active ? 'bg-brand-50/40' : ''}>
                  <button onClick={() => focusLine(l.id)} className="w-full px-3.5 py-3 text-left transition-colors duration-150 ease-smooth hover:bg-brand-50/30">
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-bold text-ink-900">{l.material}</span>
                        <SourceTrace compact source={{
                      project: supplierProjectName(rfq.projectId),
                      planSet: rfq.planSet,
                      revision: rfq.revision,
                      sheet: l.sheet,
                      page: l.page
                    }} className="mt-1" />
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="measure block text-[14px] font-bold text-ink-900">
                          {qty(finalQty)}
                          <span className="ml-1 text-[10px] font-medium text-ink-400">{l.unit}</span>
                        </span>
                        {l.supplierQty && l.supplierQty !== l.builderQty && <span className="measure block text-[10px] text-ink-400 line-through">
                            {qty(l.builderQty)}
                          </span>}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <ConfidenceMeter value={l.confidence} size="sm" />
                      <span className={`spec-label ${l.decision === 'pending' ? 'text-caution-800' : l.decision === 'rejected' || l.decision === 'clarify' ? 'text-danger-600' : 'text-positive-700'}`}>
                        {DECISION_LABEL[l.decision]}
                      </span>
                    </div>

                    {l.reason && <p className="mt-1.5 border-l-2 border-brand-300 pl-2 text-[11.5px] leading-snug text-ink-500">
                        {l.reason}
                        {l.changedBy && <span className="mt-0.5 block text-[10.5px] text-ink-400">
                            {l.changedBy} · {l.changedAt}
                          </span>}
                      </p>}

                    <div className="mt-2">
                      <SpecLabel>Yard product</SpecLabel>
                      {product ? <p className="mt-0.5 text-[11.5px] font-semibold text-ink-800">
                          {product.name}
                          <span className="measure ml-1.5 text-[10.5px] font-medium text-ink-400">
                            {qty(available(product))} {product.unit} avail · {currency(product.price)}
                          </span>
                        </p> : <p className="mt-0.5 text-[11.5px] text-ink-400">Not mapped yet</p>}
                    </div>
                  </button>

                  {active && <div className="border-t border-ink-100 bg-white px-3.5 py-3">
                      <SpecLabel>Map to catalog</SpecLabel>
                      <Select className="mt-1.5" value={l.productId ?? ''} onChange={(e) => {
                  s.decideLine(rfq.id, l.id, {
                    productId: e.target.value
                  });
                  setSaved(false);
                }} aria-label="Map to product">
                        <option value="">Choose a product…</option>
                        {products.map((p) => <option key={p.id} value={p.id}>
                            {p.name} · {p.sku}
                          </option>)}
                      </Select>

                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <Button size="sm" variant={l.decision === 'accepted' ? 'primary' : 'secondary'} icon={<CheckIcon className="h-3.5 w-3.5" />} onClick={() => decide(l, 'accepted', {
                    supplierQty: undefined,
                    reason: undefined
                  })}>
                          Accept
                        </Button>
                        <Button size="sm" variant="secondary" icon={<PencilIcon className="h-3.5 w-3.5" />} onClick={() => {
                    setEditing(l);
                    setEditQty(String(l.supplierQty ?? l.builderQty));
                    setEditReason(l.reason ?? '');
                  }}>
                          Adjust
                        </Button>
                        <Button size="sm" variant="secondary" icon={<div className="h-3.5 w-3.5" />} onClick={() => {
                    setClarifyLine(l);
                    setClarifyNote('');
                  }}>
                          Query
                        </Button>
                        <Button size="sm" variant="ghost" icon={<XIcon className="h-3.5 w-3.5" />} onClick={() => decide(l, 'rejected', {
                    reason: 'Out of scope for this yard'
                  })}>
                          Reject
                        </Button>
                      </div>

                      <p className="mt-2.5 text-[11px] leading-relaxed text-ink-400">
                        The builder&apos;s approved quantity is never overwritten. An adjustment is recorded
                        beside it with your name and reason, and both travel onto the quote.
                      </p>
                    </div>}
                </li>;
          })}
          </ul>
        </aside>
      </div>

      {/* Adjust quantity */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Adjust this quantity" footer={<>
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!editReason.trim() || !editQty.trim()} onClick={() => {
        if (!editing) return;
        decide(editing, 'adjusted', {
          supplierQty: Number(editQty),
          reason: editReason.trim()
        });
        s.toast({
          tone: 'success',
          title: 'Adjustment recorded',
          body: `${editing.material}: ${qty(editing.builderQty)} → ${qty(Number(editQty))} ${editing.unit}.`
        });
        setEditing(null);
      }}>
              Save adjustment
            </Button>
          </>}>
        {editing && <div className="space-y-3.5">
            <Panel className="px-3.5 py-3">
              <div className="flex items-baseline justify-between gap-4">
                <SpecLabel>Builder approved</SpecLabel>
                <span className="measure text-[15px] font-bold text-ink-900">
                  {`${qty(editing.builderQty)} ${editing.unit}`}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-ink-400">
                {`${editing.sheet} · page ${editing.page} · ${editing.confidence}% confidence`}
              </p>
            </Panel>
            <Input label="Your quantity" type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} />
            <Input label="Reason for the change" hint="Recorded on the quote and visible to the builder" value={editReason} onChange={(e) => setEditReason(e.target.value)} placeholder="e.g. added 5% waste for the gable walls" />
          </div>}
      </Modal>

      {/* Request clarification */}
      <Modal open={!!clarifyLine} onClose={() => setClarifyLine(null)} title="Ask the builder to clarify" footer={<>
            <Button variant="secondary" className="flex-1" onClick={() => setClarifyLine(null)}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!clarifyNote.trim()} onClick={() => {
        if (!clarifyLine) return;
        decide(clarifyLine, 'clarify', {
          reason: clarifyNote.trim()
        });
        s.setRfqStatus(rfq.id, 'Needs Clarification');
        s.toast({
          tone: 'info',
          title: 'Clarification requested',
          body: 'The builder has been notified on this request.'
        });
        setClarifyLine(null);
      }}>
              Send question
            </Button>
          </>}>
        {clarifyLine && <div className="space-y-3.5">
            <p className="text-[13px] leading-relaxed text-ink-600">
              This line stays unpriced until the builder answers. The request status changes to{' '}
              <span className="font-bold text-ink-900">Needs clarification</span> so nobody quotes around it.
            </p>
            <Input label="What do you need to know?" value={clarifyNote} onChange={(e) => setClarifyNote(e.target.value)} placeholder="e.g. schedule on S4.02 calls for 15/32 — please confirm" />
          </div>}
      </Modal>
    </div>;
}
function HeadField({
  label,
  value,
  mono




}: {label: string;value: string;mono?: boolean;}) {
  return <div className="min-w-0">
      <SpecLabel>{label}</SpecLabel>
      <p className={`mt-0.5 truncate text-[12.5px] font-bold text-ink-900 ${mono ? 'measure' : ''}`}>{value}</p>
    </div>;
}
function Counter({
  label,
  value,
  tone = 'default'




}: {label: string;value: string;tone?: 'default' | 'positive' | 'caution' | 'danger';}) {
  const toneClass = {
    default: 'text-ink-900',
    positive: 'text-positive-700',
    caution: 'text-caution-800',
    danger: 'text-danger-600'
  }[tone];
  return <span className="flex items-baseline gap-2">
      <span className="spec-label">{label}</span>
      <span className={`measure text-[13px] font-bold ${toneClass}`}>{value}</span>
    </span>;
}

/** List view for the takeoff inbox (same records, queue framing). */
export function TakeoffInbox() {
  const navigate = useNavigate();
  const s = useSupplier();
  if (!s.can('takeoff.review')) return <Denied module="Takeoffs" />;
  return <div>
      <div className="mb-5">
        <SpecLabel>Takeoff inbox</SpecLabel>
        <h1 className="display-tight mt-1.5 text-[26px] font-bold text-ink-900">
          Builder quantities waiting on the yard
        </h1>
        <p className="mt-1.5 max-w-[620px] text-[13.5px] leading-relaxed text-ink-500">
          Every line arrives with the sheet, page and confidence it was approved at. Accept it, adjust it with
          a reason, or query it — nothing gets priced until each line has a decision.
        </p>
      </div>

      <div className="space-y-3">
        {s.rfqs.map((r) => {
        const decided = r.lines.filter((l) => l.decision !== 'pending').length;
        const low = r.lines.filter((l) => l.confidence < 75).length;
        return <Panel key={r.id} className="overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-3.5">
                <div className="min-w-0">
                  <SpecLabel>
                    {`${customerName(r.customerId)} · ${r.takeoffRef} · ${r.revision}`}
                  </SpecLabel>
                  <p className="mt-1 text-[15px] font-semibold text-ink-900">
                    {supplierProjectName(r.projectId)}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-400">
                    {`${r.lines.length} lines · ${r.sheets} sheets · received ${r.received}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={r.status === 'New' ? 'Submitted' : r.status} dot={false} />
                  <Button size="sm" onClick={() => navigate(`/supplier/takeoffs/${r.id}`)}>
                    Open workspace
                  </Button>
                </div>
              </div>
              <TickRule />
              <dl className="flex flex-wrap gap-x-8 gap-y-2 px-4 py-3">
                <Stat label="Lines decided" value={`${decided}/${r.lines.length}`} />
                <Stat label="Below 75% confidence" value={String(low)} tone={low ? 'danger' : 'default'} />
                <Stat label="Quote due" value={r.dueDate} />
                <Stat label="Needed on site" value={r.requiredDelivery} />
              </dl>
            </Panel>;
      })}
      </div>
    </div>;
}
function Stat({
  label,
  value,
  tone = 'default'




}: {label: string;value: string;tone?: 'default' | 'danger';}) {
  return <div className="min-w-0">
      <dt className="spec-label">{label}</dt>
      <dd className={`measure mt-0.5 text-[13px] font-bold ${tone === 'danger' ? 'text-danger-600' : 'text-ink-900'}`}>
        {value}
      </dd>
    </div>;
}