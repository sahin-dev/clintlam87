import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CameraIcon,
  CheckIcon,
  ClipboardCheckIcon,
  MessageSquareIcon,
  PenLineIcon as SignatureIcon,
  PhoneIcon,
  TriangleAlertIcon } from
'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/ui/Sheet';
import { ErrorState, InlineAlert } from '../../components/ui/Feedback';
import { Input, Select, TextArea } from '../../components/ui/Field';
import { DeliveryStage, DeliveryTimeline } from '../../components/smpro/DeliveryTimeline';
import {
  Measured,
  Panel,
  SpecLabel,
  SpecRow,
  TickRule,
  TitleBlock } from
'../../components/smpro/Primitives';
import { useApp } from '../../contexts/AppContext';
import { qty } from '../../utils/format';
import { supplierName } from '../../data/procurement';
import { projectName } from '../../data/projects';
import { IMAGES } from '../../data/images';

const TRUCK = IMAGES.deliveryTruck;

export function DeliveryDetail() {
  const { deliveryId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const delivery = app.deliveries.find((d) => d.id === deliveryId);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);

  if (!delivery) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState title="Delivery not found" body="It may have been cancelled by the supplier." action="Back" onAction={() => navigate('/deliveries')} />
      </div>);

  }

  const order = app.orders.find((o) => o.id === delivery.orderId);
  const delayed = delivery.status === 'Delayed';

  /* Map the record onto the logistics run a superintendent actually watches. */
  const stage: DeliveryStage = delivery.pod ?
  'Delivered' :
  delivery.status === 'Out for Delivery' ?
  'Out for Delivery' :
  delayed ?
  'Loading' :
  delivery.status === 'Scheduled' ?
  'Scheduled' :
  'Confirmed';

  const stamps: Partial<Record<DeliveryStage, string>> = {
    Confirmed: order?.createdAt,
    Scheduled: delivery.date,
    'Out for Delivery': delivery.eta,
    Delivered: delivery.pod?.deliveredAt
  };

  return (
    <div>
      <PageHeader
        back
        backLabel="Deliveries"
        title={`Load ${delivery.id}`}
        subtitle={`${supplierName(delivery.supplierId)} → ${projectName(delivery.projectId)} · order ${delivery.orderId}`}
        action={<StatusBadge status={delivery.status} />} />
      

      {delayed &&
      <InlineAlert
        className="mb-5"
        tone="danger"
        title="Supplier reported a delay"
        body={`Plant shutdown pushed this load. ${delivery.eta}. The superintendent and project manager were notified.`}
        action="Message supplier"
        onAction={() => navigate('/messages')} />

      }

      {/* Dispatch board: the run on the left, the manifest and POD on the right. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel className="overflow-hidden">
            <div className="relative h-32">
              <img src={TRUCK} alt="Delivery truck loaded with lumber" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ink-900/45" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                <div>
                  <SpecLabel className="text-white/60">Truck</SpecLabel>
                  <p className="measure text-[16px] font-bold text-white">
                    {delivery.truck === 'Unassigned' ? 'TBD' : delivery.truck}
                  </p>
                </div>
                <div className="text-right">
                  <SpecLabel className="text-white/60">ETA</SpecLabel>
                  <p className="measure text-[16px] font-bold text-white">{delivery.eta}</p>
                </div>
              </div>
            </div>
            <dl className="divide-y divide-ink-100 px-4">
              <SpecRow label="Driver" value={delivery.driver} />
              <SpecRow label="Delivery window" value={delivery.date} mono />
              <SpecRow label="Site contact" value={app.user.name} />
              <SpecRow label="Manifest lines" value={`${delivery.itemCount}`} mono />
            </dl>
            <div className="flex gap-2 border-t border-ink-100 bg-ink-50/60 p-3">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => navigate('/messages')} icon={<MessageSquareIcon className="h-3.5 w-3.5" />}>
                Message
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() =>
                app.toast({
                  tone: 'info',
                  title: `${delivery.driver} · (512) 445-0198`,
                  body: 'Dispatch line for this load. Calls are logged against the delivery.'
                })
                }
                icon={<PhoneIcon className="h-3.5 w-3.5" />}>
                
                Call driver
              </Button>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <TitleBlock label="Load progress" reference={delivery.id} />
            <div className="p-4">
              <DeliveryTimeline current={stage} stamps={stamps} delayed={delayed} />
            </div>
          </Panel>
        </div>

        <div className="min-w-0 space-y-5">
          {order &&
          <Panel className="overflow-hidden">
              <TitleBlock
              label="Manifest"
              title="Expected on this load"
              reference={`PO ${order.id}`} />
            
              <ul className="divide-y divide-ink-100">
                {order.lines.map((line) =>
              <li key={line.item} className="flex items-center justify-between gap-3 px-4 py-3">
                    <p className="min-w-0 truncate text-[13.5px] font-semibold text-ink-900">{line.item}</p>
                    <span className="measure shrink-0 text-[14px] font-bold text-ink-900">
                      {qty(line.qty)}
                      <span className="ml-1 text-[10.5px] font-medium text-ink-400">{line.unit}</span>
                    </span>
                  </li>
              )}
              </ul>
            </Panel>
          }

          {delivery.pod ?
          <Panel className="overflow-hidden">
              <TitleBlock
              label="Proof of delivery"
              title="Signed and verified on site"
              reference={delivery.pod.deliveredAt}
              action={
              <span className="inline-flex items-center gap-1.5 rounded-[3px] bg-positive-50 px-2 py-1">
                    <SignatureIcon className="h-3.5 w-3.5 text-positive-600" />
                    <span className="spec-label text-positive-700">
                      {delivery.pod.signature ? 'Signature captured' : 'No signature'}
                    </span>
                  </span>
              } />
            
              <div className="grid gap-4 px-4 py-3.5 sm:grid-cols-3">
                <Measured label="Received by" value={delivery.pod.receivedBy} size="sm" />
                <Measured
                label="Shortage"
                value={delivery.pod.shortage}
                size="sm"
                tone={delivery.pod.shortage.startsWith('None') ? 'positive' : 'danger'} />
              
                <Measured
                label="Damage"
                value={delivery.pod.damage}
                size="sm"
                tone={delivery.pod.damage.startsWith('None') ? 'positive' : 'danger'} />
              
              </div>
              <TickRule />
              <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
                {Array.from({ length: delivery.pod.photos }).map((_, i) =>
              <div key={i} className="overflow-hidden border border-ink-100">
                    <img src={TRUCK} alt={`Delivery photo ${i + 1}`} className="h-24 w-full object-cover" />
                  </div>
              )}
              </div>
              <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-3">
                <SpecLabel>Field notes</SpecLabel>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-700">{delivery.pod.notes}</p>
                <p className="measure mt-2 text-[11px] text-ink-400">
                  Verified by {delivery.pod.verifiedBy ?? 'pending field verification'}
                </p>
              </div>
            </Panel> :
          app.can('delivery.verify') ?
          <Panel className="p-5">
              <SpecLabel>Field action required</SpecLabel>
              <p className="mt-1.5 text-[15px] font-bold text-ink-900">Receive this load on site</p>
              <p className="mt-1 max-w-[520px] text-[13px] leading-relaxed text-ink-500">
                Count each line against the purchase order, record condition, then capture the signature and
                photos that become the proof of delivery.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Button onClick={() => setReceiveOpen(true)} icon={<ClipboardCheckIcon className="h-4 w-4" />}>
                  Receive &amp; verify
                </Button>
                <Button variant="secondary" onClick={() => setIssueOpen(true)} icon={<TriangleAlertIcon className="h-4 w-4" />}>
                  Report a problem
                </Button>
              </div>
            </Panel> :

          <InlineAlert
            tone="info"
            title="Receiving happens in the field"
            body="The superintendent verifies quantities and condition on site; the POD then becomes visible here." />

          }
        </div>
      </div>

      <ReceiveSheet open={receiveOpen} onClose={() => setReceiveOpen(false)} deliveryId={delivery.id} />

      <BottomSheet
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Report a delivery problem"
        description="This creates a field issue linked to the order and notifies purchasing."
        footer={
        <Button
          block
          size="lg"
          onClick={() => {
            setIssueOpen(false);
            app.toast({ tone: 'info', title: 'Issue reported', body: 'Purchasing and the PM were notified.' });
          }}>
          
            Submit issue
          </Button>
        }>
        
        <div className="space-y-3">
          <Select label="Problem type" defaultValue="shortage">
            <option value="shortage">Shortage</option>
            <option value="damage">Damage</option>
            <option value="wrong">Wrong material</option>
            <option value="access">Site access</option>
          </Select>
          <TextArea label="What happened" placeholder="Two plywood bundles arrived with water damage on the top sheets." />
          <PhotoAttach label="Add photos" />
        </div>
      </BottomSheet>
    </div>);

}

/**
 * Real photo capture rather than a decorative dashed box — the file picker
 * opens, and what was attached is listed back.
 */
function PhotoAttach({ label }: {label: string;}) {
  const [files, setFiles] = useState<string[]>([]);

  return (
    <div>
      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 px-4 py-5 text-[13px] font-semibold text-ink-500 transition-colors duration-150 ease-smooth hover:border-brand-500 hover:text-brand-600">
        <CameraIcon className="h-4 w-4" />
        {files.length > 0 ? `${label} (${files.length})` : label}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) =>
          setFiles((prev) => [...prev, ...Array.from(e.target.files ?? []).map((f) => f.name)])
          } />
        
      </label>
      {files.length > 0 &&
      <ul className="mt-2 space-y-1">
          {files.map((name, i) =>
        <li key={`${name}-${i}`} className="flex items-center gap-2 text-[12px] text-ink-600">
              <CameraIcon className="h-3.5 w-3.5 shrink-0 text-ink-300" />
              <span className="min-w-0 flex-1 truncate">{name}</span>
              <button
            type="button"
            onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
            className="shrink-0 text-[11.5px] font-semibold text-ink-400 hover:text-danger-600">
            
                Remove
              </button>
            </li>
        )}
        </ul>
      }
    </div>);

}

function ReceiveSheet({
  open,
  onClose,
  deliveryId




}: {open: boolean;onClose: () => void;deliveryId: string;}) {
  const app = useApp();
  const delivery = app.deliveries.find((d) => d.id === deliveryId)!;
  const order = app.orders.find((o) => o.id === delivery.orderId);
  const [receiver, setReceiver] = useState(app.user.name);
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [counts, setCounts] = useState<Record<string, string>>(
    Object.fromEntries((order?.lines ?? []).map((l) => [l.item, String(l.qty)]))
  );
  const [error, setError] = useState('');

  const shortages = (order?.lines ?? []).filter((l) => Number(counts[l.item]) < l.qty);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Receive delivery"
      description={`${delivery.id} · verify quantities against the purchase order`}
      footer={
      <Button
        block
        size="lg"
        onClick={() => {
          if (!receiver.trim()) {
            setError('Enter who received the delivery');
            return;
          }
          app.confirmDelivery(delivery.id, {
            deliveredAt: 'Just now',
            receivedBy: receiver.trim(),
            signature: true,
            photos: 2,
            damage: condition === 'Good' ? 'None reported' : condition,
            shortage: shortages.length ? `${shortages.length} line(s) short` : 'None reported',
            notes: notes || 'Received and staged on site.',
            verifiedBy: app.user.name
          });
          app.toast({ tone: 'success', title: 'Delivery confirmed', body: 'POD is now available to the office.' });
          onClose();
        }}
        icon={<CheckIcon className="h-4 w-4" />}>
        
          Confirm delivery
        </Button>
      }>
      
      <div className="space-y-3">
        {(order?.lines ?? []).map((line) =>
        <div key={line.item} className="rounded-xl border border-ink-100 p-3.5">
            <p className="text-[13.5px] font-semibold text-ink-900">{line.item}</p>
            <div className="mt-2 flex items-end gap-3">
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Expected</p>
                <p className="tabular text-[14px] font-bold text-ink-700">
                  {qty(line.qty)} {line.unit}
                </p>
              </div>
              <div className="flex-1">
                <Input
                label="Delivered"
                value={counts[line.item] ?? ''}
                inputMode="numeric"
                onChange={(e) => setCounts((prev) => ({ ...prev, [line.item]: e.target.value }))} />
              
              </div>
            </div>
            {Number(counts[line.item]) < line.qty &&
          <p className="mt-2 text-[12px] font-semibold text-caution-700">
                Short by {qty(line.qty - Number(counts[line.item] || 0))} {line.unit}
              </p>
          }
          </div>
        )}

        <Select label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="Good">Good — no damage</option>
          <option value="Minor damage">Minor damage — accepted</option>
          <option value="Damaged">Damaged — rejected</option>
        </Select>
        <Input label="Received by" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
        <TextArea label="Notes" hint="Optional" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Staged at the east gate." />
        <PhotoAttach label="Attach site photos" />
        {error && <p className="text-[12.5px] font-medium text-danger-600">{error}</p>}
      </div>
    </BottomSheet>);

}