import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DriverException,
  Estimate,
  InboundTakeoffLine,
  Rfq,
  SalesOrder,
  ServiceCase,
  SupplierDelivery,
  SupplierInvoice,
  SupplierNotification,
  SupplierPayment,
  SupplierPermission,
  SupplierPod,
  SupplierQuote,
  SupplierRoleId } from
'../types/supplier';
import { supplierPermissionsFor } from '../utils/supplierRbac';
import { useApp } from './AppContext';
import { useExchange, useExchangeSubscription } from './ExchangeContext';
import {
  ExchangeEvent,
  PARTNERSHIP,
  builderProjectFor,
  isPartnerCustomer,
  nextId,
  supplierProjectFor } from
'../data/interop';
import { drivers, supplierProjects } from '../data/supplierOrg';
import {
  supplierBranches,
  supplierCurrentUserId,
  supplierOrg,
  supplierStaff } from
'../data/supplierOrg';
import { estimates as seedEstimates, rfqs as seedRfqs, salesOrders as seedOrders, supplierQuotes as seedQuotes } from '../data/supplierSales';
import {
  serviceCases as seedCases,
  supplierDeliveries as seedDeliveries,
  supplierInvoices as seedInvoices,
  supplierNotifications as seedNotifications,
  supplierPayments as seedPayments } from
'../data/supplierOps';

interface SupplierState {
  authed: boolean;
  signIn: () => void;
  signOut: () => void;

  org: typeof supplierOrg;
  branches: typeof supplierBranches;
  branchId: string;
  setBranchId: (id: string) => void;
  staff: typeof supplierStaff;
  user: (typeof supplierStaff)[number];

  userRoles: SupplierRoleId[];
  activeRole: SupplierRoleId;
  setActiveRole: (r: SupplierRoleId) => void;
  can: (p: SupplierPermission) => boolean;

  rfqs: Rfq[];
  setRfqStatus: (id: string, status: Rfq['status']) => void;
  assignEstimator: (id: string, staffId: string) => void;
  decideLine: (rfqId: string, lineId: string, patch: Partial<InboundTakeoffLine>) => void;

  estimates: Estimate[];
  upsertEstimate: (estimate: Estimate) => void;

  quotes: SupplierQuote[];
  setQuoteStatus: (id: string, status: SupplierQuote['status']) => void;
  /** Sends the quote to the builder's platform. */
  sendQuote: (id: string) => void;

  orders: SalesOrder[];
  setOrderStatus: (id: string, status: SalesOrder['status']) => void;
  /** Confirms the order back to the builder with a promised date. */
  confirmOrder: (id: string, promisedDate?: string) => void;

  deliveries: SupplierDelivery[];
  assignDelivery: (id: string, driverId: string, truck: string) => void;
  setDeliveryStatus: (id: string, status: SupplierDelivery['status']) => void;
  completeDelivery: (id: string, pod: SupplierPod) => void;
  reportDelay: (id: string, reason: string) => void;
  /** Recorded when a driver takes the load, so dispatch knows it is picked up. */
  acceptedRuns: Record<string, string>;
  noteRunAccepted: (id: string, driverName: string) => void;

  /** Field exceptions raised by drivers, owned and resolved by dispatch. */
  driverExceptions: DriverException[];
  logDriverException: (e: Omit<DriverException, 'id' | 'at' | 'status'>) => void;
  respondToDriverException: (id: string, response: string) => void;

  invoices: SupplierInvoice[];
  setInvoiceStatus: (id: string, status: SupplierInvoice['status']) => void;
  /** Issues the invoice to the builder's accounts payable. */
  issueInvoice: (id: string) => void;
  payments: SupplierPayment[];
  /** Reconciles or fails a received payment, reporting the result back. */
  reconcilePayment: (invoiceId: string, outcome: 'Cleared' | 'Failed', reason?: string) => void;

  cases: ServiceCase[];
  setCaseStatus: (id: string, status: ServiceCase['status'], resolution?: string) => void;

  notifications: SupplierNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;

  /** True when this customer is the builder running the connected platform. */
  isConnectedCustomer: (customerId: string) => boolean;
  partnership: typeof PARTNERSHIP;

  /** Shared with the builder shell so one toast host serves both. */
  toast: ReturnType<typeof useApp>['toast'];
}

const SupplierContext = createContext<SupplierState | null>(null);

export function SupplierProvider({ children }: {children: React.ReactNode;}) {
  const { toast } = useApp();
  const user = supplierStaff.find((s) => s.id === supplierCurrentUserId)!;
  const [authed, setAuthed] = useState(false);
  const [branchId, setBranchId] = useState(supplierBranches[0].id);
  const [activeRole, setActiveRole] = useState<SupplierRoleId>('management');

  const [rfqs, setRfqs] = useState(seedRfqs);
  const [estimates, setEstimates] = useState(seedEstimates);
  const [quotes, setQuotes] = useState(seedQuotes);
  const [orders, setOrders] = useState(seedOrders);
  const [deliveries, setDeliveries] = useState(seedDeliveries);
  const [invoices, setInvoices] = useState(seedInvoices);
  const [payments, setPayments] = useState(seedPayments);
  const [cases, setCases] = useState(seedCases);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [acceptedRuns, setAcceptedRuns] = useState<Record<string, string>>({});
  const [driverExceptions, setDriverExceptions] = useState<DriverException[]>([
  {
    id: 'dx-seed',
    deliveryId: 'DL-547',
    driverId: 'dr-1',
    driverName: 'John Alvarez',
    kind: 'Site access',
    stage: 'On site',
    detail: 'Crane sat in the drop zone until 17:00 — could not unload, returned to the yard.',
    photos: 2,
    at: 'Yesterday, 16:20',
    status: 'Acknowledged',
    response: 'Re-scheduled for the following morning with the site foreman.'
  }]
  );

  const permissions = useMemo(() => supplierPermissionsFor([activeRole]), [activeRole]);
  const { publish } = useExchange();

  const notify = useCallback((n: Omit<SupplierNotification, 'id' | 'read' | 'at'>) => {
    setNotifications((prev) => [
    { ...n, id: `sn-${Date.now()}${Math.round(Math.random() * 99)}`, at: 'Just now', read: false },
    ...prev]
    );
  }, []);

  /* ---------------------------------------------------------------- */
  /* Inbound — documents arriving from the connected builder           */
  /* ---------------------------------------------------------------- */

  useExchangeSubscription('supplier', (event: ExchangeEvent) => {
    switch (event.kind) {
      case 'rfq.issued':{
          const projectId = supplierProjectFor(event.builderProjectId);
          if (!projectId) break; /* Not a project this builder has shared with us. */
          const project = supplierProjects.find((p) => p.id === projectId);

          setRfqs((prev) => {
            if (prev.some((r) => r.builderRequestRef === event.requestId)) return prev;
            const record: Rfq = {
              id: nextId('RFQ', prev.map((r) => r.id)),
              customerId: PARTNERSHIP.supplierCustomerId,
              projectId,
              takeoffRef: event.takeoffRef ?? '—',
              planSet: event.takeoffRef ? 'Shared with the request' : 'Not supplied',
              revision: 'Current',
              sheets: 0,
              requestedBy: event.requestedBy,
              received: 'Just now',
              dueDate: event.requiredBy,
              requiredDelivery: event.requiredBy,
              status: 'New',
              notes: event.notes,
              attachments: event.takeoffRef ?
              [
              {
                name: `${event.takeoffRef} approved takeoff`,
                kind: 'Takeoff',
                meta: `${event.lines.length} lines · approved by ${event.requestedBy}`
              }] :

              [],
              lines: event.lines.map((l, i) => ({
                id: `il-${Date.now()}-${i}`,
                material: l.description,
                category: 'Inbound',
                builderQty: l.qty,
                unit: l.unit,
                sheet: '—',
                page: 0,
                confidence: 100,
                builderVerification: event.takeoffRef ? 'Approved' : 'Manually entered',
                decision: 'pending'
              })),
              builderRequestRef: event.requestId
            };
            return [record, ...prev];
          });

          notify({
            category: 'RFQ',
            title: `New RFQ from ${PARTNERSHIP.builderOrgName}`,
            body: `${event.lines.length} lines for ${project?.name ?? 'a shared project'} · required ${event.requiredBy}.`,
            to: 'Sales',
            permission: 'rfq.view'
          });
          break;
        }

      case 'quote.decided':{
          const outcome =
          event.decision === 'accepted' ?
          'Accepted' :
          event.decision === 'rejected' ?
          'Rejected' :
          'Revision Requested';

          setQuotes((prev) =>
          prev.map((q) =>
          q.id === event.supplierQuoteId ?
          {
            ...q,
            status: outcome,
            builderQuoteRef: event.builderQuoteId,
            builderDecision: { outcome, note: event.note, at: 'Just now' },
            revisionRequest:
            event.decision === 'revision' ?
            { note: event.note, by: PARTNERSHIP.builderOrgName, at: 'Just now' } :
            q.revisionRequest
          } :
          q
          )
          );

          if (event.decision === 'accepted') {
            const quote = quotes.find((q) => q.id === event.supplierQuoteId);
            if (quote) {
              const total =
              quote.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0) -
              quote.discount +
              quote.deliveryFee;
              setOrders((prev) => {
                if (prev.some((o) => o.quoteId === quote.id)) return prev;
                const record: SalesOrder = {
                  id: nextId('SO', prev.map((o) => o.id), 4),
                  quoteId: quote.id,
                  customerId: quote.customerId,
                  projectId: quote.projectId,
                  status: 'New',
                  placed: 'Just now',
                  requestedDate: event.requiredDate ?? 'To be agreed',
                  terms: quote.terms,
                  deliveryAddress: 'Per the builder’s project record',
                  siteContact: 'Per the builder’s project record',
                  lines: quote.lines.map((l) => ({
                    productId: l.productId,
                    description: l.description,
                    ordered: l.qty,
                    fulfilled: 0,
                    unit: l.unit,
                    unitPrice: l.unitPrice
                  })),
                  total: Math.round(total * (1 + quote.taxRate)),
                  builderOrderRef: event.builderOrderId
                };
                return [record, ...prev];
              });
              setRfqs((prev) =>
              prev.map((r) => r.id === quote.rfqId ? { ...r, status: 'Completed' } : r)
              );
            }
          }

          notify({
            category: 'Quote',
            title:
            event.decision === 'accepted' ?
            `${event.supplierQuoteId} accepted` :
            event.decision === 'rejected' ?
            `${event.supplierQuoteId} was not selected` :
            `${event.supplierQuoteId} — revision requested`,
            body: event.note || `${PARTNERSHIP.builderOrgName} returned their decision.`,
            to: 'Sales',
            permission: 'quote.view'
          });
          break;
        }

      case 'order.approved':{
          setOrders((prev) =>
          prev.map((o) =>
          o.builderOrderRef === event.builderOrderId || o.id === event.supplierOrderId ?
          {
            ...o,
            status: o.status === 'New' ? 'Confirmed' : o.status,
            builderOrderRef: event.builderOrderId,
            builderApprovedBy: event.approvedBy
          } :
          o
          )
          );
          notify({
            category: 'Order',
            title: `${event.builderOrderId} approved by the builder`,
            body: `Approved by ${event.approvedBy}. Clear to pick and schedule.`,
            to: 'Operations',
            permission: 'order.view'
          });
          break;
        }

      case 'delivery.receipted':{
          const hasException =
          event.shortage && !/^none/i.test(event.shortage) ||
          event.damage && !/^none/i.test(event.damage);

          setDeliveries((prev) =>
          prev.map((d) =>
          d.id === event.supplierDeliveryId ?
          {
            ...d,
            builderReceipt: {
              verifiedBy: event.verifiedBy,
              shortage: event.shortage,
              damage: event.damage,
              at: 'Just now'
            }
          } :
          d
          )
          );

          if (hasException) {
            setCases((prev) => {
              const delivery = deliveries.find((d) => d.id === event.supplierDeliveryId);
              const record: ServiceCase = {
                id: nextId('CS', prev.map((c) => c.id)),
                customerId: PARTNERSHIP.supplierCustomerId,
                orderId: delivery?.orderId,
                deliveryId: event.supplierDeliveryId,
                subject: `Receipt exception on ${event.supplierDeliveryId}`,
                category: /damag/i.test(event.damage) ? 'Damage' : 'Shortage',
                priority: 'High',
                status: 'Open',
                opened: 'Just now',
                owner: 'Unassigned',
                detail: `${PARTNERSHIP.builderOrgName} verified the load and raised an exception. Shortage: ${event.shortage}. Damage: ${event.damage}.`,
                timeline: [
                { label: 'Builder verified receipt against the POD', at: 'Just now', by: event.verifiedBy },
                { label: 'Case opened automatically', at: 'Just now', by: 'SM PRO' }]

              };
              return [record, ...prev];
            });
          }

          notify({
            category: hasException ? 'Service' : 'Delivery',
            title: hasException ?
            `Receipt exception on ${event.supplierDeliveryId}` :
            `${event.supplierDeliveryId} accepted on site`,
            body: hasException ?
            `${event.verifiedBy} reported: ${event.shortage} / ${event.damage}.` :
            `Verified by ${event.verifiedBy}. Clear to invoice.`,
            to: hasException ? 'Customer service' : 'Accounting',
            permission: hasException ? 'service.manage' : 'invoice.view'
          });
          break;
        }

      case 'payment.sent':{
          /* Guard against a re-delivered document creating a duplicate receipt —
             the builder's reference is unique per payment. */
          let duplicate = false;
          setPayments((prev) => {
            if (prev.some((p) => p.reference === event.reference)) {
              duplicate = true;
              return prev;
            }
            return [
            {
              id: nextId('PMT', prev.map((p) => p.id)),
              invoiceId: event.supplierInvoiceId,
              customerId: PARTNERSHIP.supplierCustomerId,
              amount: event.amount,
              method: event.method,
              date: 'Just now',
              reference: event.reference,
              status: 'Processing'
            },
            ...prev];

          });
          if (duplicate) break;
          setInvoices((prev) =>
          prev.map((i) => {
            if (i.id !== event.supplierInvoiceId) return i;
            const paid = i.paid + event.amount;
            return { ...i, paid, status: paid >= i.total ? 'Paid' : 'Partially Paid' };
          })
          );
          notify({
            category: 'Payment',
            title: `Payment received from ${PARTNERSHIP.builderOrgName}`,
            body: `${event.method} against ${event.supplierInvoiceId} · ${event.reference}.`,
            to: 'Accounting',
            permission: 'payment.view'
          });
          break;
        }

      default:
        break;
    }
  });

  /* ---------------------------------------------------------------- */
  /* Outbound — documents the yard sends to the builder                */
  /* ---------------------------------------------------------------- */

  const sendQuote = useCallback(
    (id: string) => {
      const quote = quotes.find((q) => q.id === id);
      if (!quote) return;
      setQuotes((prev) =>
      prev.map((q) => q.id === id ? { ...q, status: 'Sent', sentAt: 'Just now' } : q)
      );

      const rfq = rfqs.find((r) => r.id === quote.rfqId);
      if (!isPartnerCustomer(quote.customerId) || !rfq?.builderRequestRef) return;

      const project = supplierProjects.find((p) => p.id === quote.projectId);
      const builderProjectId = builderProjectFor(quote.projectId);
      if (!builderProjectId) return;

      const subtotal = quote.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
      const total = Math.round((subtotal - quote.discount + quote.deliveryFee) * (1 + quote.taxRate));

      publish({
        kind: 'quote.sent',
        origin: 'supplier',
        at: 'Just now',
        supplierQuoteId: quote.id,
        builderRequestId: rfq.builderRequestRef,
        builderProjectId,
        total,
        validUntil: quote.validUntil,
        leadTimeDays: 5,
        deliveryDate: rfq.requiredDelivery,
        terms: quote.terms,
        availability: `Priced by ${project?.estimator ?? 'the yard'} against ${rfq.takeoffRef}`,
        lines: quote.lines.map((l) => ({
          description: l.description,
          qty: l.qty,
          unit: l.unit,
          unitPrice: l.unitPrice
        })),
        version: quote.version
      });
    },
    [quotes, rfqs, publish]
  );

  const confirmOrder = useCallback(
    (id: string, promisedDate?: string) => {
      const order = orders.find((o) => o.id === id);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'Confirmed' } : o));
      if (order?.builderOrderRef) {
        publish({
          kind: 'order.confirmed',
          origin: 'supplier',
          at: 'Just now',
          builderOrderId: order.builderOrderRef,
          supplierOrderId: order.id,
          promisedDate: promisedDate ?? order.requestedDate
        });
      }
    },
    [orders, publish]
  );

  const emitDeliveryScheduled = useCallback(
    (delivery: SupplierDelivery, driverName: string, truck: string) => {
      const order = orders.find((o) => o.id === delivery.orderId);
      const builderProjectId = builderProjectFor(delivery.projectId);
      if (!order?.builderOrderRef || !builderProjectId) return;
      publish({
        kind: 'delivery.scheduled',
        origin: 'supplier',
        at: 'Just now',
        supplierDeliveryId: delivery.id,
        builderOrderId: order.builderOrderRef,
        builderProjectId,
        date: delivery.date,
        eta: delivery.eta,
        driver: driverName,
        truck,
        itemCount: delivery.items.length
      });
    },
    [orders, publish]
  );

  const reportDelay = useCallback(
    (id: string, reason: string) => {
      setDeliveries((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: 'Delayed', delayReason: reason } : d)
      );
      publish({
        kind: 'delivery.delayed',
        origin: 'supplier',
        at: 'Just now',
        supplierDeliveryId: id,
        reason
      });
    },
    [publish]
  );

  const noteRunAccepted = useCallback(
    (id: string, driverName: string) => {
      setAcceptedRuns((prev) => prev[id] ? prev : { ...prev, [id]: driverName });
      notify({
        category: 'Delivery',
        title: `${id} accepted by ${driverName}`,
        body: 'The driver has taken the load and is heading to the yard to load it.',
        to: '/supplier/deliveries',
        permission: 'delivery.dispatch'
      });
    },
    [notify]
  );

  const logDriverException = useCallback(
    (e: Omit<DriverException, 'id' | 'at' | 'status'>) => {
      setDriverExceptions((prev) => [
      { ...e, id: `dx-${Date.now()}`, at: 'Just now', status: 'Open' },
      ...prev]
      );
      notify({
        category: 'Delivery',
        title: `${e.kind}${e.deliveryId ? ` on ${e.deliveryId}` : ''}`,
        body: `${e.driverName} reported this from the field. Dispatch needs to resolve it.`,
        to: '/supplier/deliveries',
        permission: 'delivery.dispatch'
      });
    },
    [notify]
  );

  const respondToDriverException = useCallback((id: string, response: string) => {
    setDriverExceptions((prev) =>
    prev.map((e) => e.id === id ? { ...e, status: 'Acknowledged', response } : e)
    );
  }, []);

  const issueInvoice = useCallback(
    (id: string) => {
      const invoice = invoices.find((i) => i.id === id);
      setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: 'Sent' } : i));
      if (!invoice || !isPartnerCustomer(invoice.customerId)) return;
      const order = orders.find((o) => o.id === invoice.orderId);
      const builderProjectId = builderProjectFor(invoice.projectId);
      if (!order?.builderOrderRef || !builderProjectId) return;
      publish({
        kind: 'invoice.issued',
        origin: 'supplier',
        at: 'Just now',
        supplierInvoiceId: invoice.id,
        builderOrderId: order.builderOrderRef,
        builderProjectId,
        amount: invoice.total,
        due: invoice.due,
        matched: Boolean(invoice.deliveryId)
      });
    },
    [invoices, orders, publish]
  );

  const reconcilePayment = useCallback(
    (invoiceId: string, outcome: 'Cleared' | 'Failed', reason?: string) => {
      setPayments((prev) =>
      prev.map((p) =>
      p.invoiceId === invoiceId && (p.status === 'Processing' || p.status === 'Pending') ?
      { ...p, status: outcome, failureReason: outcome === 'Failed' ? reason : undefined } :
      p
      )
      );
      setInvoices((prev) =>
      prev.map((i) =>
      i.id === invoiceId ?
      {
        ...i,
        status: outcome === 'Failed' ? 'Failed' : i.paid >= i.total ? 'Paid' : 'Partially Paid',
        paid: outcome === 'Failed' ? Math.max(0, i.paid) : i.paid
      } :
      i
      )
      );
      publish({
        kind: 'payment.recorded',
        origin: 'supplier',
        at: 'Just now',
        supplierInvoiceId: invoiceId,
        status: outcome,
        reason
      });
    },
    [publish]
  );

  const value: SupplierState = {
    authed,
    signIn: () => setAuthed(true),
    signOut: () => setAuthed(false),

    org: supplierOrg,
    branches: supplierBranches,
    branchId,
    setBranchId,
    staff: supplierStaff,
    user,

    userRoles: user.roles,
    activeRole,
    setActiveRole,
    can: (p) => permissions.has(p),

    rfqs,
    setRfqStatus: (id, status) => setRfqs((prev) => prev.map((r) => r.id === id ? { ...r, status } : r)),
    assignEstimator: (id, staffId) =>
    setRfqs((prev) =>
    prev.map((r) =>
    r.id === id ?
    { ...r, estimatorId: staffId, status: r.status === 'New' ? 'In Review' : r.status } :
    r
    )
    ),
    decideLine: (rfqId, lineId, patch) =>
    setRfqs((prev) =>
    prev.map((r) =>
    r.id === rfqId ?
    {
      ...r,
      status: r.status === 'New' ? 'In Review' : r.status,
      lines: r.lines.map((l) => l.id === lineId ? { ...l, ...patch } : l)
    } :
    r
    )
    ),

    estimates,
    upsertEstimate: (estimate) =>
    setEstimates((prev) => {
      const exists = prev.some((e) => e.id === estimate.id);
      return exists ? prev.map((e) => e.id === estimate.id ? estimate : e) : [estimate, ...prev];
    }),

    quotes,
    setQuoteStatus: (id, status) =>
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q)),
    sendQuote,

    orders,
    setOrderStatus: (id, status) =>
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o)),
    confirmOrder,

    deliveries,
    assignDelivery: (id, driverId, truck) => {
      const delivery = deliveries.find((d) => d.id === id);
      setDeliveries((prev) =>
      prev.map((d) =>
      d.id === id ? { ...d, driverId, truck, status: d.status === 'Pending' ? 'Scheduled' : d.status } : d
      )
      );
      if (delivery) {
        emitDeliveryScheduled(delivery, drivers.find((dr) => dr.id === driverId)?.name ?? 'Assigned', truck);
      }
    },
    setDeliveryStatus: (id, status) => {
      const delivery = deliveries.find((d) => d.id === id);
      setDeliveries((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
      if (status === 'Out for Delivery' && delivery) {
        publish({
          kind: 'delivery.dispatched',
          origin: 'supplier',
          at: 'Just now',
          supplierDeliveryId: id,
          eta: delivery.eta,
          driver: drivers.find((dr) => dr.id === delivery.driverId)?.name ?? 'Yard driver',
          truck: delivery.truck ?? 'Assigned truck'
        });
      }
    },
    completeDelivery: (id, pod) => {
      setDeliveries((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: 'Delivered', pod } : d)
      );
      publish({
        kind: 'pod.signed',
        origin: 'supplier',
        at: 'Just now',
        supplierDeliveryId: id,
        receivedBy: pod.receivedBy,
        signedAt: pod.signedAt,
        photos: pod.photos,
        notes: pod.notes,
        exceptions: pod.exceptions
      });
    },
    reportDelay,
    acceptedRuns,
    noteRunAccepted,
    driverExceptions,
    logDriverException,
    respondToDriverException,

    invoices,
    setInvoiceStatus: (id, status) =>
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status } : i)),
    issueInvoice,
    payments,
    reconcilePayment,

    cases,
    setCaseStatus: (id, status, resolution) =>
    setCases((prev) => prev.map((c) => c.id === id ? { ...c, status, resolution: resolution ?? c.resolution } : c)),

    notifications,
    markRead: (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)),
    markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    unreadCount: notifications.filter((n) => !n.read).length,

    isConnectedCustomer: isPartnerCustomer,
    partnership: PARTNERSHIP,

    toast
  };

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>;
}

export function useSupplier(): SupplierState {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error('useSupplier must be used inside SupplierProvider');
  return ctx;
}