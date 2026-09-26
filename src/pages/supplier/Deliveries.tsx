import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  CameraIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon } from
'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Drawer, Modal } from '../../components/ui/Sheet';
import { Input, Select } from '../../components/ui/Field';
import {
  Panel,
  SpecLabel,
  SpecRow,
  TickRule,
  TitleBlock,
  WorkHeading } from
'../../components/smpro/Primitives';
import { DeliveryTimeline, DeliveryStage } from '../../components/smpro/DeliveryTimeline';
import { Denied, LedgerStrip, RecordHeader, ScopeNote } from '../../components/supplier/Records';
import { useSupplier } from '../../contexts/SupplierContext';
import { customerName, drivers, driverName, supplierProjectName } from '../../data/supplierOrg';
import { qty } from '../../utils/format';
import { DriverException, SupplierDelivery, SupplierDeliveryStatus } from '../../types/supplier';

/** Delivery status → the stage the run has reached on the timeline. */
export function stageOf(status: SupplierDeliveryStatus): DeliveryStage {
  switch (status) {
    case 'Pending':
      return 'Confirmed';
    case 'Scheduled':
      return 'Scheduled';
    case 'Loading':
      return 'Loading';
    case 'Out for Delivery':
    case 'Delayed':
      return 'Out for Delivery';
    case 'Arrived':
      return 'Arrived';
    default:
      return 'Delivered';
  }
}

const DAY_ORDER = ['Today', 'Tomorrow'];

/**
 * Dispatch board. Loads are grouped by day and ordered by their delivery
 * window, so the yard reads it like a run sheet rather than a record list.
 */
export function SupplierDeliveries() {
  const navigate = useNavigate();
  const s = useSupplier();
  const [assigning, setAssigning] = useState<SupplierDelivery | null>(null);
  const [driverId, setDriverId] = useState(drivers[0].id);
  const [delaying, setDelaying] = useState<SupplierDelivery | null>(null);
  const [delayReason, setDelayReason] = useState('');
  const [answering, setAnswering] = useState<DriverException | null>(null);
  const [answer, setAnswer] = useState('');

  if (!s.can('delivery.view')) return <Denied module="Deliveries" />;

  const days = useMemo(() => {
    const groups = new Map<string, SupplierDelivery[]>();
    s.deliveries.forEach((d) => {
      const list = groups.get(d.date) ?? [];
      list.push(d);
      groups.set(d.date, list);
    });
    return Array.from(groups.entries()).
    map(([date, loads]) => ({ date, loads: [...loads].sort((a, b) => a.sequence - b.sequence) })).
    sort((a, b) => {
      const ai = DAY_ORDER.indexOf(a.date);
      const bi = DAY_ORDER.indexOf(b.date);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return 0;
    });
  }, [s.deliveries]);

  const today = s.deliveries.filter((d) => d.date === 'Today');
  const unassigned = s.deliveries.filter((d) => !d.driverId && d.status !== 'Delivered');
  const delayed = s.deliveries.filter((d) => d.status === 'Delayed');
  const openExceptions = s.driverExceptions.filter((e) => e.status === 'Open');

  return (
    <div>
      <PageHeader
        title="Dispatch board"
        subtitle="Loads, trucks, drivers and proof of delivery across the yard" />
      

      <LedgerStrip
        items={[
        { label: 'Loads today', value: String(today.length) },
        {
          label: 'Needs a driver',
          value: String(unassigned.length),
          tone: unassigned.length ? 'danger' : 'default'
        },
        { label: 'Delayed', value: String(delayed.length), tone: delayed.length ? 'danger' : 'default' },
        {
          label: 'Driver reports open',
          value: String(openExceptions.length),
          tone: openExceptions.length ? 'danger' : 'default'
        },
        {
          label: 'Drivers available',
          value: String(drivers.filter((d) => d.status === 'Available').length),
          note: `${drivers.length} on the roster`
        }]
        } />
      

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_296px]">
        {/* Run sheet */}
        <div className="space-y-5">
          {days.map((day) =>
          <Panel key={day.date} className="overflow-hidden">
              <TitleBlock
              label="Run sheet"
              title={day.date}
              reference={`${day.loads.length} load${day.loads.length > 1 ? 's' : ''}`} />
            
              <ul className="divide-y divide-ink-100">
                {day.loads.map((d) => {
                const spine =
                d.status === 'Delayed' ?
                'border-l-danger-500' :
                !d.driverId ?
                'border-l-caution-500' :
                d.status === 'Delivered' ?
                'border-l-positive-500' :
                'border-l-brand-500';
                return (
                  <li key={d.id} className={`border-l-[3px] ${spine}`}>
                      <div className="flex flex-wrap items-start gap-x-5 gap-y-3 px-4 py-3.5">
                        <div className="w-[76px] shrink-0">
                          <SpecLabel>Window</SpecLabel>
                          <p className="measure mt-1 text-[13px] font-semibold text-ink-900">
                            {d.window.split('–')[0].trim()}
                          </p>
                          <p className="measure text-[10.5px] text-ink-400">
                            stop {d.sequence}
                          </p>
                        </div>

                        <button
                        onClick={() => navigate(`/supplier/deliveries/${d.id}`)}
                        className="min-w-[200px] flex-1 text-left">
                        
                          <p className="text-[13.5px] font-semibold text-ink-900">
                            {d.id} · {customerName(d.customerId)}
                          </p>
                          <p className="mt-0.5 text-[12px] text-ink-500">
                            {supplierProjectName(d.projectId)} · {d.address.split(',')[0]}
                          </p>
                          <p className="measure mt-1 text-[10.5px] text-ink-400">
                            {d.items.length} line{d.items.length > 1 ? 's' : ''} ·{' '}
                            {d.items.filter((i) => i.loaded).length} loaded · order {d.orderId}
                            {d.partialOf && ` · load ${d.partialOf.deliveryNo}/${d.partialOf.ofTotal}`}
                          </p>
                        </button>

                        <div className="w-[168px] shrink-0">
                          <SpecLabel>Driver / truck</SpecLabel>
                          <p className="mt-1 truncate text-[12.5px] font-medium text-ink-800">
                            {driverName(d.driverId)}
                          </p>
                          <p className="measure truncate text-[10.5px] text-ink-400">
                            {d.truck ?? 'No truck assigned'}
                          </p>
                          {s.acceptedRuns[d.id] && d.status === 'Scheduled' &&
                        <p className="measure mt-0.5 text-[10.5px] text-positive-700">
                              Accepted by the driver
                            </p>
                        }
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <StatusBadge status={d.status} />
                          {s.can('delivery.dispatch') && d.status !== 'Delivered' &&
                        <div className="flex gap-1.5">
                              <Button
                            size="sm"
                            variant={d.driverId ? 'ghost' : 'primary'}
                            onClick={() => {
                              setAssigning(d);
                              setDriverId(d.driverId ?? drivers[0].id);
                            }}>
                            
                                {d.driverId ? 'Reassign' : 'Assign'}
                              </Button>
                              {d.status !== 'Delayed' &&
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDelaying(d);
                              setDelayReason('');
                            }}>
                            
                                  Delay
                                </Button>
                          }
                            </div>
                        }
                          {d.pod && <span className="spec-label text-positive-700">POD signed</span>}
                        </div>
                      </div>

                      {d.status === 'Delayed' && d.delayReason &&
                    <p className="border-t border-ink-100 bg-danger-50/40 px-4 py-2 text-[12px] text-danger-700">
                          {d.delayReason}
                        </p>
                    }
                    </li>);

              })}
              </ul>
            </Panel>
          )}
        </div>

        {/* Driver roster */}
        <div className="space-y-5">
          {/* Reports raised from the cab. Dispatch owns these — the driver can
               only report, so an unanswered one is work sitting here. */}
          {s.driverExceptions.length > 0 &&
          <Panel className="overflow-hidden">
              <TitleBlock
              label="From the drivers"
              reference={
              openExceptions.length ? `${openExceptions.length} to answer` : 'All answered'
              } />
            
              <ul className="divide-y divide-ink-100">
                {s.driverExceptions.map((e) =>
              <li
                key={e.id}
                className={`border-l-[3px] px-4 py-3 ${
                e.status === 'Open' ? 'border-l-caution-500' : 'border-l-positive-500'}`
                }>
                
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="min-w-0 flex-1 text-[12.5px] font-semibold text-ink-900">
                        {e.kind}
                      </p>
                      <span className="measure shrink-0 text-[10px] text-ink-400">{e.at}</span>
                    </div>
                    <p className="measure mt-0.5 text-[10.5px] text-ink-400">
                      {`${e.driverName}${e.deliveryId ? ` · ${e.deliveryId}` : ' · no run'} · ${e.photos} photo${e.photos === 1 ? '' : 's'}`}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-600">{e.detail}</p>

                    {e.response ?
                <p className="mt-1.5 border-l-2 border-ink-200 pl-2 text-[11.5px] leading-relaxed text-ink-500">
                        {e.response}
                      </p> :

                s.can('delivery.dispatch') &&
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => {
                    setAnswering(e);
                    setAnswer('');
                  }}>
                  
                          Answer the driver
                        </Button>

                }
                  </li>
              )}
              </ul>
            </Panel>
          }

          <Panel className="overflow-hidden">
            <TitleBlock label="Drivers" reference={`${drivers.length} on roster`} />
            <ul className="divide-y divide-ink-100">
              {drivers.map((dr) =>
              <li key={dr.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink-900">{dr.name}</p>
                      <p className="measure mt-0.5 text-[10.5px] text-ink-400">{dr.truck}</p>
                    </div>
                    <Badge
                    tone={
                    dr.status === 'Available' ?
                    'positive' :
                    dr.status === 'Off Duty' ?
                    'neutral' :
                    'info'
                    }
                    dot>
                    
                      {dr.status}
                    </Badge>
                  </div>
                  <p className="measure mt-1.5 text-[10.5px] text-ink-400">
                    {dr.runsToday} run{dr.runsToday === 1 ? '' : 's'} today · {dr.phone}
                  </p>
                </li>
              )}
            </ul>
          </Panel>

          <Panel className="overflow-hidden">
            <TitleBlock label="Route" title="Yard to site" />
            <ol className="px-4 py-3.5">
              {[
              { label: 'ABC Lumber · Austin Yard', note: 'Depart 07:40' },
              ...s.deliveries.
              filter((d) => d.date === 'Today').
              map((d) => ({
                label: `${customerName(d.customerId)} · stop ${d.sequence}`,
                note: `${d.window} · ${d.address.split(',')[0]}`
              }))].
              map((stop, i, arr) =>
              <li key={stop.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < arr.length - 1 &&
                <span aria-hidden className="absolute left-[7px] top-4 h-full w-px bg-ink-200" />
                }
                  <span
                  className={`relative z-10 mt-1 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[2px] ${
                  i === 0 ? 'bg-ink-900' : 'border border-ink-300 bg-white'}`
                  }>
                  
                    {i === 0 && <TruckIcon className="h-2.5 w-2.5 text-white" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-ink-800">{stop.label}</p>
                    <p className="measure truncate text-[10.5px] text-ink-400">{stop.note}</p>
                  </div>
                </li>
              )}
            </ol>
          </Panel>
        </div>
      </div>

      {/* Assign driver + truck */}
      <Drawer
        open={!!assigning}
        onClose={() => setAssigning(null)}
        title="Assign this load"
        description={assigning ? `${assigning.id} · ${assigning.window}` : undefined}
        footer={
        <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setAssigning(null)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              if (!assigning) return;
              const driver = drivers.find((d) => d.id === driverId)!;
              s.assignDelivery(assigning.id, driver.id, driver.truck);
              s.toast({
                tone: 'success',
                title: `${assigning.id} assigned to ${driver.name}`,
                body: `${driver.truck} · the builder now sees a scheduled load.`
              });
              setAssigning(null);
            }}>
            
              Assign load
            </Button>
          </div>
        }>
        
        {assigning &&
        <div className="space-y-4">
            <Panel className="overflow-hidden">
              <TitleBlock label="Load" title={`${customerName(assigning.customerId)}`} />
              <dl className="divide-y divide-ink-100 px-4 py-1">
                <SpecRow label="Site" value={assigning.address} />
                <SpecRow label="Window" value={assigning.window} mono />
                <SpecRow label="Lines" value={String(assigning.items.length)} mono />
              </dl>
            </Panel>
            <Select label="Driver" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              {drivers.map((d) =>
            <option key={d.id} value={d.id} disabled={d.status === 'Off Duty'}>
                  {d.name} · {d.truck} {d.status === 'Off Duty' ? '(off duty)' : `(${d.status})`}
                </option>
            )}
            </Select>
            <p className="text-[11.5px] leading-relaxed text-ink-400">
              The driver gets this run on their phone with the manifest and site contact. Reassigning
              is recorded in the audit log.
            </p>
          </div>
        }
      </Drawer>

      {/* Mark delayed */}
      <Modal
        open={!!delaying}
        onClose={() => setDelaying(null)}
        title="Mark this load delayed"
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setDelaying(null)}>
              Cancel
            </Button>
            <Button
            variant="danger"
            className="flex-1"
            disabled={!delayReason.trim()}
            onClick={() => {
              if (!delaying) return;
              s.setDeliveryStatus(delaying.id, 'Delayed');
              s.toast({
                tone: 'info',
                title: `${delaying.id} marked delayed`,
                body: 'The builder and the site contact have been notified.'
              });
              setDelaying(null);
            }}>
            
              Mark delayed
            </Button>
          </>
        }>
        
        <div className="space-y-3.5">
          <p className="text-[13px] leading-relaxed text-ink-600">
            The builder sees the delay on their delivery record straight away, so say what happened
            in plain language.
          </p>
          <Input
            label="What happened?"
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
            placeholder="e.g. crane occupying the drop zone until 17:00" />
          
        </div>
      </Modal>

      {/* Answer a driver's report */}
      <Modal
        open={!!answering}
        onClose={() => setAnswering(null)}
        title="Answer the driver"
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setAnswering(null)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            disabled={!answer.trim()}
            onClick={() => {
              if (!answering) return;
              s.respondToDriverException(answering.id, answer.trim());
              s.toast({
                tone: 'success',
                title: 'Sent to the driver',
                body: `${answering.driverName} can now see your delivery update.`
              });
              setAnswering(null);
            }}>
            
              Send answer
            </Button>
          </>
        }>
        
        {answering &&
        <div className="space-y-3.5">
            <div>
              <SpecLabel>{`${answering.kind}${answering.deliveryId ? ` · ${answering.deliveryId}` : ''}`}</SpecLabel>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-700">{answering.detail}</p>
            </div>
            <Input
            label="What should the driver do?"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g. leave the damaged bundle on the truck, we will credit it" />
          
          </div>
        }
      </Modal>
    </div>);

}

/* ------------------------------------------------------------------ */
/* Load detail + POD                                                   */
/* ------------------------------------------------------------------ */

export function SupplierDeliveryDetail() {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const s = useSupplier();
  const delivery = s.deliveries.find((d) => d.id === deliveryId);
  const [podOpen, setPodOpen] = useState(false);

  if (!s.can('delivery.view')) return <Denied module="Deliveries" />;
  if (!delivery) return <Denied module="This load" />;

  const order = s.orders.find((o) => o.id === delivery.orderId);
  const stage = stageOf(delivery.status);

  return (
    <div className="detail-column">
      <RecordHeader
        backTo="/supplier/deliveries"
        eyebrow="Load"
        title={delivery.id}
        reference={`${customerName(delivery.customerId)} · ${supplierProjectName(delivery.projectId)}`}
        status={<StatusBadge status={delivery.status} />}
        actions={
        s.can('delivery.dispatch') &&
        !delivery.pod &&
        <Button size="sm" variant="secondary" onClick={() => setPodOpen(true)}>
              Record POD
            </Button>

        }
        facts={[
        { label: 'Order', value: delivery.orderId },
        { label: 'Date', value: delivery.date },
        { label: 'Window', value: delivery.window },
        { label: 'ETA', value: delivery.eta },
        { label: 'Driver', value: driverName(delivery.driverId) }]
        } />
      

      {delivery.status === 'Delayed' && delivery.delayReason &&
      <Panel className="mb-5 overflow-hidden border-l-[3px] border-l-danger-500">
          <div className="flex items-start gap-3 px-4 py-3.5">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
            <div>
              <SpecLabel className="text-danger-700">Delayed</SpecLabel>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-700">{delivery.delayReason}</p>
            </div>
          </div>
        </Panel>
      }

      {delivery.partialOf &&
      <Panel className="mb-5 overflow-hidden">
          <TitleBlock
          label="Partial fulfilment"
          title={`Load ${delivery.partialOf.deliveryNo} of ${delivery.partialOf.ofTotal}`}
          reference={delivery.orderId} />
        
          <p className="px-4 py-3 text-[12.5px] leading-relaxed text-ink-600">
            Still to come on this order: {delivery.partialOf.remaining}. The builder sees the same
            split on their order so the crew can plan around it.
          </p>
        </Panel>
      }

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Run */}
        <Panel className="overflow-hidden">
          <TitleBlock label="Run" title="Yard to jobsite" reference={delivery.truck ?? 'No truck'} />
          <div className="px-4 py-4">
            <DeliveryTimeline
              current={stage}
              delayed={delivery.status === 'Delayed'}
              stamps={{
                Confirmed: delivery.date === 'Today' ? 'Confirmed' : delivery.date,
                Scheduled: delivery.window,
                Delivered: delivery.pod?.signedAt
              }} />
            
          </div>
          <TickRule />
          <dl className="divide-y divide-ink-100 px-4 py-1">
            <SpecRow
              label="Driver"
              value={
              <span className="inline-flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-ink-400" />
                  {driverName(delivery.driverId)}
                </span>
              } />
            
            <SpecRow label="Truck" value={delivery.truck ?? 'Not assigned'} mono />
            <SpecRow
              label="Site contact"
              value={
              <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon className="h-3.5 w-3.5 text-ink-400" />
                  {delivery.siteContact}
                </span>
              } />
            
            <SpecRow
              label="Address"
              value={
              <span className="inline-flex items-start gap-1.5 text-left">
                  <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                  {delivery.address}
                </span>
              } />
            
          </dl>
        </Panel>

        {/* Manifest */}
        <Panel className="overflow-hidden">
          <TitleBlock
            label="Manifest"
            title={`${delivery.items.length} line${delivery.items.length > 1 ? 's' : ''}`}
            reference={`${delivery.items.filter((i) => i.loaded).length} loaded`} />
          
          <ul className="divide-y divide-ink-100">
            {delivery.items.map((i) =>
            <li key={i.description} className="flex items-center gap-3 px-4 py-3">
                <span
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border ${
                i.loaded ? 'border-positive-500 bg-positive-500 text-white' : 'border-ink-300 bg-white'}`
                }>
                
                  {i.loaded && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 text-[13px] font-medium text-ink-800">
                  {i.description}
                </span>
                <span className="measure shrink-0 text-[12.5px] font-semibold text-ink-900">
                  {qty(i.qty)} {i.unit}
                </span>
              </li>
            )}
          </ul>
          {order &&
          <>
              <TickRule />
              <div className="px-4 py-3">
                <Button size="sm" variant="secondary" onClick={() => navigate(`/supplier/orders/${order.id}`)}>
                  Open order {order.id}
                </Button>
              </div>
            </>
          }
        </Panel>
      </div>

      {/* POD */}
      <WorkHeading className="mt-6" label="Proof of delivery" title="What the site signed for" />
      {delivery.pod ?
      <Panel className="overflow-hidden">
          <TitleBlock
          label="POD"
          title={delivery.pod.receivedBy}
          reference={delivery.pod.signedAt}
          action={
          <Badge tone="positive" dot={false}>
                Signed
              </Badge>
          } />
        
          <dl className="divide-y divide-ink-100 px-4 py-1">
            <SpecRow label="Signed at" value={delivery.pod.signedAt} mono />
            <SpecRow label="Location" value={delivery.pod.location} mono />
            <SpecRow
            label="Photos"
            value={
            <span className="inline-flex items-center gap-1.5">
                  <CameraIcon className="h-3.5 w-3.5 text-ink-400" />
                  {delivery.pod.photos} captured on site
                </span>
            } />
          
            <SpecRow label="Exceptions" value={delivery.pod.exceptions} />
          </dl>
          <TickRule />
          <p className="px-4 py-3 text-[12.5px] leading-relaxed text-ink-600">{delivery.pod.notes}</p>
        </Panel> :

      <Panel className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[3px] bg-ink-100 text-ink-500">
            <ClockIcon className="h-5 w-5" />
          </span>
          <h3 className="display-tight mt-4 text-[16px] font-bold text-ink-900">Not delivered yet</h3>
          <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-ink-500">
            The POD is captured by the driver at the site — receiver, signature, photos and any
            exception against the manifest.
          </p>
          {s.can('delivery.dispatch') &&
        <Button variant="secondary" className="mt-5" onClick={() => setPodOpen(true)}>
              Record POD on their behalf
            </Button>
        }
        </Panel>
      }

      <ScopeNote>
        A signed POD is shared with the builder automatically and becomes the evidence this load can
        be invoiced against.
      </ScopeNote>

      <PodDrawer open={podOpen} onClose={() => setPodOpen(false)} delivery={delivery} />
    </div>);

}

/* ------------------------------------------------------------------ */
/* Shared POD capture                                                  */
/* ------------------------------------------------------------------ */

export function PodDrawer({
  open,
  onClose,
  delivery




}: {open: boolean;onClose: () => void;delivery: SupplierDelivery;}) {
  const s = useSupplier();
  const [receivedBy, setReceivedBy] = useState('');
  const [signed, setSigned] = useState(false);
  const [photos, setPhotos] = useState(0);
  const [notes, setNotes] = useState('');
  const [exceptions, setExceptions] = useState('');

  const ready = receivedBy.trim().length > 2 && signed;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Proof of delivery"
      description={`${delivery.id} · ${customerName(delivery.customerId)}`}
      footer={
      <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
          className="flex-1"
          disabled={!ready}
          onClick={() => {
            s.completeDelivery(delivery.id, {
              receivedBy,
              signedAt: 'Just now',
              location: `${delivery.address} · captured on site`,
              photos,
              notes: notes.trim() || 'No additional notes.',
              exceptions: exceptions.trim() || 'None reported'
            });
            s.toast({
              tone: 'success',
              title: `${delivery.id} delivered`,
              body: exceptions.trim() ?
              'POD signed with an exception — a service case has been flagged.' :
              'POD signed and shared with the builder. Ready to invoice.'
            });
            onClose();
          }}>
          
            Confirm delivery
          </Button>
        </div>
      }>
      
      <div className="space-y-4">
        <Panel className="overflow-hidden">
          <TitleBlock label="Verify against the manifest" reference={`${delivery.items.length} lines`} />
          <ul className="divide-y divide-ink-100">
            {delivery.items.map((i) =>
            <li key={i.description} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <span className="min-w-0 truncate text-[12.5px] text-ink-700">{i.description}</span>
                <span className="measure shrink-0 text-[12.5px] font-semibold text-ink-900">
                  {qty(i.qty)} {i.unit}
                </span>
              </li>
            )}
          </ul>
        </Panel>

        <Input
          label="Received by"
          hint="Required"
          value={receivedBy}
          onChange={(e) => setReceivedBy(e.target.value)}
          placeholder="Name and role of the person signing" />
        

        <div>
          <SpecLabel>Signature</SpecLabel>
          <button
            onClick={() => setSigned((v) => !v)}
            aria-pressed={signed}
            className={`mt-1.5 flex h-[92px] w-full items-center justify-center rounded-[3px] border-2 border-dashed transition-colors duration-150 ease-smooth ${
            signed ?
            'border-positive-500 bg-positive-50/60 text-positive-700' :
            'border-ink-200 bg-ink-50/60 text-ink-400 hover:border-ink-300'}`
            }>
            
            {signed ?
            <span className="flex items-center gap-2 text-[13px] font-semibold">
                <CheckIcon className="h-4 w-4" strokeWidth={3} />
                Signature captured
              </span> :

            <span className="text-[12.5px] font-medium">Tap to capture the signature</span>
            }
          </button>
        </div>

        <div>
          <SpecLabel>Site photos</SpecLabel>
          <div className="mt-1.5 flex items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPhotos((p) => p + 1)}
              icon={<CameraIcon className="h-3.5 w-3.5" />}>
              
              Add photo
            </Button>
            <span className="measure text-[12px] text-ink-500">
              {photos} captured{photos === 0 ? ' — at least one is recommended' : ''}
            </span>
          </div>
        </div>

        <Input
          label="Delivery notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. dropped at the north stack pad" />
        
        <Input
          label="Exceptions"
          hint="Shortage, damage or refusal"
          value={exceptions}
          onChange={(e) => setExceptions(e.target.value)}
          placeholder="Leave blank if the load was accepted in full" />
        
        <p className="text-[11.5px] leading-relaxed text-ink-400">
          Anything entered here opens a service case automatically so the shortage or damage is
          resolved before the invoice goes out.
        </p>
      </div>
    </Drawer>);

}
