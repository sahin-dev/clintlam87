import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  Approval,
  Delivery,
  Invoice,
  MaterialRequest,
  Notification,
  Payment,
  Permission,
  Pod,
  Project,
  PurchaseOrder,
  Quote,
  RoleId,
  Takeoff,
  TakeoffItem } from
'../types';
import { permissionsFor } from '../utils/rbac';
import { useExchange, useExchangeSubscription } from './ExchangeContext';
import { ExchangeEvent, PARTNERSHIP, isPartnerSupplier, nextId } from '../data/interop';
import { useScreenInit } from '../useScreenInit.js';
import { organization, team, currentUserId } from '../data/organization';
import { projects as seedProjects, planSets as seedPlans, takeoffs as seedTakeoffs } from '../data/projects';
import {
  materialRequests as seedRequests,
  purchaseOrders as seedOrders,
  quotes as seedQuotes } from
'../data/procurement';
import { deliveries as seedDeliveries } from '../data/operations';
import { invoices as seedInvoices, payments as seedPayments } from '../data/finance';
import { approvals as seedApprovals, notifications as seedNotifications } from '../data/engagement';

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'success' | 'info' | 'error';
}

interface AppState {
  authed: boolean;
  signIn: (options?: {email?: string;role?: RoleId;remember?: boolean;}) => void;
  signOut: () => void;
  onboarded: boolean;
  completeOnboarding: () => void;

  user: (typeof team)[number];
  organization: typeof organization;
  branchId: string;
  setBranchId: (id: string) => void;

  /** Roles the signed-in user holds. */
  userRoles: RoleId[];
  /** The role lens currently applied to the shell. */
  activeRole: RoleId;
  setActiveRole: (role: RoleId) => void;
  can: (permission: Permission) => boolean;

  projects: Project[];
  planSets: typeof seedPlans;
  addProject: (project: Project) => void;
  addPlanSet: (plan: (typeof seedPlans)[number]) => void;

  takeoffs: Takeoff[];
  updateTakeoffItem: (takeoffId: string, itemId: string, patch: Partial<TakeoffItem>) => void;
  addTakeoffItem: (takeoffId: string, item: TakeoffItem) => void;
  approveTakeoff: (takeoffId: string) => void;

  requests: MaterialRequest[];
  addRequest: (request: MaterialRequest) => void;
  setRequestStatus: (id: string, status: MaterialRequest['status']) => void;
  /** Issues the request to the connected yard as an RFQ. */
  sendForPricing: (requestId: string) => void;

  quotes: Quote[];
  selectQuote: (quoteId: string) => void;
  /** Returns the builder's decision to the yard that sent the quote. */
  decideQuote: (
  quoteId: string,
  decision: 'accepted' | 'rejected' | 'revision',
  note: string)
  => PurchaseOrder | undefined;

  orders: PurchaseOrder[];
  setOrderStatus: (id: string, status: PurchaseOrder['status']) => void;
  /** Approves the PO and tells the yard to start fulfilling it. */
  approveOrder: (id: string) => void;

  deliveries: Delivery[];
  confirmDelivery: (id: string, pod: Pod) => void;

  invoices: Invoice[];
  setInvoiceStatus: (id: string, status: Invoice['status']) => void;
  payments: Payment[];
  addPayment: (payment: Payment) => void;
  /** Pays a supplier invoice and notifies the yard's accounting team. */
  payInvoice: (invoiceId: string, amount: number, method: string) => void;

  approvals: Approval[];
  resolveApproval: (id: string, status: Approval['status']) => void;

  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;

  /** True when this supplier is the yard running the connected platform. */
  isConnectedSupplier: (supplierId: string) => boolean;
  partnership: typeof PARTNERSHIP;

  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: {children: React.ReactNode;}) {
  const screenInit = useScreenInit();
  /* Screens previews of in-app routes start signed in unless the screen
     explicitly models an authentication step. */
  const previewing =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('mp_screen');
  const [authed, setAuthed] = useState(() => {
    if (typeof screenInit.authed === 'boolean') return screenInit.authed;
    if (previewing) return true;
    try {
      return window.localStorage.getItem('smpro.authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [onboarded, setOnboarded] = useState(false);
  const [branchId, setBranchId] = useState(organization.branches[0].id);
  const [userId, setUserId] = useState(() => {
    try {
      const storedId = window.localStorage.getItem('smpro.userId');
      if (storedId && team.some((member) => member.id === storedId && member.status === 'active')) return storedId;
    } catch {
      // Use the default demo account when storage is unavailable.
    }
    return currentUserId;
  });
  const user = team.find((member) => member.id === userId) ?? team[0];
  const [activeRole, setActiveRole] = useState<RoleId>(() => {
    try {
      const storedRole = window.localStorage.getItem('smpro.activeRole') as RoleId | null;
      if (storedRole && user.roles.includes(storedRole)) return storedRole;
    } catch {
      // Use the selected user's primary role when storage is unavailable.
    }
    return user.roles[0];
  });

  const [projects, setProjects] = useState(seedProjects);
  const [planSets, setPlanSets] = useState(seedPlans);
  const [takeoffs, setTakeoffs] = useState(seedTakeoffs);
  const [requests, setRequests] = useState(seedRequests);
  const [quotes, setQuotes] = useState(seedQuotes);
  const [orders, setOrders] = useState(seedOrders);
  const [deliveries, setDeliveries] = useState(seedDeliveries);
  const [invoices, setInvoices] = useState(seedInvoices);
  const [payments, setPayments] = useState(seedPayments);
  const [approvals, setApprovals] = useState(seedApprovals);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  const permissions = useMemo(() => permissionsFor([activeRole]), [activeRole]);
  const { publish } = useExchange();

  const notify = useCallback((n: Omit<Notification, 'id' | 'read' | 'at'>) => {
    setNotifications((prev) => [
    { ...n, id: `nt-${Date.now()}${Math.round(Math.random() * 99)}`, at: 'Just now', read: false },
    ...prev]
    );
  }, []);

  /* ---------------------------------------------------------------- */
  /* Inbound — documents arriving from the connected yard              */
  /* ---------------------------------------------------------------- */

  useExchangeSubscription('builder', (event: ExchangeEvent) => {
    switch (event.kind) {
      case 'quote.sent':{
          const projectId = event.builderProjectId;
          setQuotes((prev) => {
            /* A revision replaces the yard's previous quote on the same request
               rather than stacking a second one beside it. */
            const existing = prev.find(
              (q) =>
              q.requestId === event.builderRequestId && q.supplierId === PARTNERSHIP.builderSupplierId
            );
            const record: Quote = {
              id: existing?.id ?? nextId('Q', prev.map((q) => q.id)),
              requestId: event.builderRequestId,
              projectId,
              supplierId: PARTNERSHIP.builderSupplierId,
              total: event.total,
              status: 'Received',
              receivedAt: 'Just now',
              validUntil: event.validUntil,
              leadTimeDays: event.leadTimeDays,
              deliveryDate: event.deliveryDate,
              terms: event.terms,
              availability: event.availability,
              lines: event.lines.map((l) => ({
                item: l.description,
                qty: l.qty,
                unit: l.unit,
                unitPrice: l.unitPrice ?? 0
              })),
              supplierQuoteRef: event.supplierQuoteId,
              version: event.version
            };
            return existing ? prev.map((q) => q.id === existing.id ? record : q) : [record, ...prev];
          });
          setRequests((prev) =>
          prev.map((r) =>
          r.id === event.builderRequestId && r.status !== 'Ordered' ?
          { ...r, status: 'Quote Received' } :
          r
          )
          );
          notify({
            category: 'Quote',
            title: `${PARTNERSHIP.supplierOrgName} sent a quote`,
            body: `${event.supplierQuoteId} against ${event.builderRequestId}${
            event.version > 1 ? ` · revision ${event.version}` : ''}.`,

            link: `/procurement/requests/${event.builderRequestId}`,
            tone: 'info'
          });
          break;
        }

      case 'order.confirmed':{
          setOrders((prev) =>
          prev.map((o) =>
          o.id === event.builderOrderId ?
          {
            ...o,
            status: o.status === 'Pending Approval' ? o.status : 'In Production',
            salesOrderRef: event.supplierOrderId,
            deliveryDate: event.promisedDate
          } :
          o
          )
          );
          notify({
            category: 'Order',
            title: `${event.builderOrderId} confirmed by the yard`,
            body: `${PARTNERSHIP.supplierOrgName} accepted the order as ${event.supplierOrderId}, promised ${event.promisedDate}.`,
            link: `/orders/${event.builderOrderId}`,
            tone: 'success'
          });
          break;
        }

      case 'delivery.scheduled':{
          setDeliveries((prev) => {
            const existing = prev.find((d) => d.loadRef === event.supplierDeliveryId);
            const record: Delivery = {
              id: existing?.id ?? nextId('DL', prev.map((d) => d.id)),
              orderId: event.builderOrderId,
              projectId: event.builderProjectId,
              supplierId: PARTNERSHIP.builderSupplierId,
              status: 'Scheduled',
              date: event.date,
              eta: event.eta,
              driver: event.driver,
              truck: event.truck,
              itemCount: event.itemCount,
              pod: null,
              loadRef: event.supplierDeliveryId
            };
            return existing ? prev.map((d) => d.id === existing.id ? { ...d, ...record } : d) : [record, ...prev];
          });
          notify({
            category: 'Delivery',
            title: 'A load has been scheduled',
            body: `${event.itemCount} lines for ${event.builderOrderId} · ${event.date}, ${event.eta}.`,
            link: '/deliveries',
            tone: 'info'
          });
          break;
        }

      case 'delivery.dispatched':{
          setDeliveries((prev) =>
          prev.map((d) =>
          d.loadRef === event.supplierDeliveryId ?
          { ...d, status: 'Out for Delivery', eta: event.eta, driver: event.driver, truck: event.truck } :
          d
          )
          );
          notify({
            category: 'Delivery',
            title: 'Load is on the way',
            body: `${event.driver} left the yard · ETA ${event.eta}.`,
            link: '/deliveries',
            tone: 'info'
          });
          break;
        }

      case 'delivery.delayed':{
          setDeliveries((prev) =>
          prev.map((d) =>
          d.loadRef === event.supplierDeliveryId ?
          { ...d, status: 'Delayed', delayReason: event.reason } :
          d
          )
          );
          notify({
            category: 'Delivery',
            title: 'A delivery is delayed',
            body: event.reason,
            link: '/deliveries',
            tone: 'critical'
          });
          break;
        }

      case 'pod.signed':{
          setDeliveries((prev) =>
          prev.map((d) =>
          d.loadRef === event.supplierDeliveryId ?
          {
            ...d,
            status: 'Delivered',
            pod: {
              deliveredAt: event.signedAt,
              receivedBy: event.receivedBy,
              signature: true,
              photos: event.photos,
              damage: /damag/i.test(event.exceptions) ? event.exceptions : 'None reported',
              shortage: /short|missing/i.test(event.exceptions) ? event.exceptions : 'None reported',
              notes: event.notes
            }
          } :
          d
          )
          );
          notify({
            category: 'Delivery',
            title: 'Proof of delivery received',
            body: `Signed by ${event.receivedBy}. ${
            event.exceptions && event.exceptions !== 'None reported' ?
            `Exception noted: ${event.exceptions}` :
            'Accepted in full — verify on site.'}`,

            link: '/deliveries',
            tone: event.exceptions && event.exceptions !== 'None reported' ? 'warning' : 'success'
          });
          break;
        }

      case 'invoice.issued':{
          setInvoices((prev) => {
            if (prev.some((i) => i.supplierInvoiceRef === event.supplierInvoiceId)) return prev;
            const record: Invoice = {
              id: nextId('INV', prev.map((i) => i.id)),
              orderId: event.builderOrderId,
              projectId: event.builderProjectId,
              supplierId: PARTNERSHIP.builderSupplierId,
              amount: event.amount,
              paid: 0,
              status: 'Pending',
              receivedAt: 'Just now',
              dueDate: event.due,
              matched: event.matched,
              supplierInvoiceRef: event.supplierInvoiceId
            };
            return [record, ...prev];
          });
          notify({
            category: 'Invoice',
            title: `Invoice ${event.supplierInvoiceId} received`,
            body: `Against ${event.builderOrderId}, due ${event.due}. ${
            event.matched ? 'Matches the order and POD.' : 'Needs matching before approval.'}`,

            link: '/accounting',
            tone: event.matched ? 'info' : 'warning'
          });
          break;
        }

      case 'payment.recorded':{
          setInvoices((prev) =>
          prev.map((i) =>
          i.supplierInvoiceRef === event.supplierInvoiceId ?
          { ...i, status: event.status === 'Cleared' ? 'Paid' : 'Failed' } :
          i
          )
          );
          setPayments((prev) =>
          prev.map((p) =>
          p.reference === event.supplierInvoiceId ?
          { ...p, status: event.status === 'Cleared' ? 'Paid' : 'Failed' } :
          p
          )
          );
          if (event.status === 'Failed') {
            notify({
              category: 'Payment',
              title: 'Payment failed at the yard',
              body: event.reason ?? 'The yard could not reconcile this payment.',
              link: '/accounting/payments',
              tone: 'critical'
            });
          }
          break;
        }

      default:
        break;
    }
  });

  /* ---------------------------------------------------------------- */
  /* Outbound — documents the builder sends to the yard                */
  /* ---------------------------------------------------------------- */

  const sendForPricing = useCallback(
    (requestId: string) => {
      const request = requests.find((r) => r.id === requestId);
      if (!request) return;
      setRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: 'Pricing', rfqRef: r.rfqRef } : r)
      );
      publish({
        kind: 'rfq.issued',
        origin: 'builder',
        at: 'Just now',
        requestId,
        builderProjectId: request.projectId,
        takeoffRef: request.takeoffId,
        requestedBy: user.name,
        requiredBy: request.requiredBy,
        notes: request.notes,
        lines: request.lines.map((l) => ({ description: l.item, qty: l.qty, unit: l.unit }))
      });
    },
    [requests, publish, user.name]
  );

  const decideQuote = useCallback(
    (quoteId: string, decision: 'accepted' | 'rejected' | 'revision', note: string) => {
      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return undefined;

      let created: PurchaseOrder | undefined;

      if (decision === 'accepted') {
        setQuotes((prev) =>
        prev.map((q) =>
        q.requestId === quote.requestId ?
        {
          ...q,
          status:
          q.id === quoteId ? 'Selected' : q.status === 'Selected' ? 'Received' : q.status
        } :
        q
        )
        );
        setRequests((prev) =>
        prev.map((r) => r.id === quote.requestId ? { ...r, status: 'Ordered' } : r)
        );
        setOrders((prev) => {
          const existing = prev.find((o) => o.quoteId === quoteId);
          if (existing) {
            created = existing;
            return prev;
          }
          const record: PurchaseOrder = {
            id: nextId('PO', prev.map((o) => o.id)),
            projectId: quote.projectId,
            supplierId: quote.supplierId,
            quoteId,
            total: quote.total,
            status: 'Pending Approval',
            createdAt: 'Just now',
            createdBy: user.name,
            deliveryDate: quote.deliveryDate,
            lines: quote.lines
          };
          created = record;
          return [record, ...prev];
        });
      } else {
        setQuotes((prev) =>
        prev.map((q) => q.id === quoteId ? { ...q, status: decision === 'rejected' ? 'Rejected' : 'Pending' } : q)
        );
      }

      if (quote.supplierQuoteRef && isPartnerSupplier(quote.supplierId)) {
        publish({
          kind: 'quote.decided',
          origin: 'builder',
          at: 'Just now',
          supplierQuoteId: quote.supplierQuoteRef,
          builderQuoteId: quote.id,
          decision,
          note,
          builderOrderId: created?.id,
          requiredDate: quote.deliveryDate
        });
      }

      return created;
    },
    [quotes, publish, user.name]
  );

  const approveOrder = useCallback(
    (id: string) => {
      const order = orders.find((o) => o.id === id);
      setOrders((prev) =>
      prev.map((o) => o.id === id ? { ...o, status: 'Confirmed', approvedBy: user.name } : o)
      );
      if (order && isPartnerSupplier(order.supplierId)) {
        publish({
          kind: 'order.approved',
          origin: 'builder',
          at: 'Just now',
          builderOrderId: id,
          supplierOrderId: order.salesOrderRef ?? '',
          approvedBy: user.name
        });
      }
    },
    [orders, publish, user.name]
  );

  const verifyReceipt = useCallback(
    (id: string, pod: Pod) => {
      const delivery = deliveries.find((d) => d.id === id);
      setDeliveries((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: 'Delivered', pod } : d)
      );
      if (delivery?.loadRef) {
        publish({
          kind: 'delivery.receipted',
          origin: 'builder',
          at: 'Just now',
          supplierDeliveryId: delivery.loadRef,
          verifiedBy: pod.receivedBy,
          shortage: pod.shortage,
          damage: pod.damage
        });
      }
    },
    [deliveries, publish]
  );

  const payInvoice = useCallback(
    (invoiceId: string, amount: number, method: string) => {
      const invoice = invoices.find((i) => i.id === invoiceId);
      if (!invoice) return;
      const paid = invoice.paid + amount;
      setInvoices((prev) =>
      prev.map((i) =>
      i.id === invoiceId ?
      { ...i, paid, status: paid >= i.amount ? 'Paid' : 'Partially Paid' } :
      i
      )
      );
      setPayments((prev) => [
      {
        id: nextId('PAY', prev.map((p) => p.id)),
        invoiceId,
        projectId: invoice.projectId,
        supplierId: invoice.supplierId,
        amount,
        method,
        status: 'Processing',
        date: 'Just now',
        reference: invoice.supplierInvoiceRef ?? invoiceId
      },
      ...prev]
      );
      if (invoice.supplierInvoiceRef && isPartnerSupplier(invoice.supplierId)) {
        publish({
          kind: 'payment.sent',
          origin: 'builder',
          at: 'Just now',
          supplierInvoiceId: invoice.supplierInvoiceRef,
          amount,
          method,
          reference: `${invoiceId} · ${method}`
        });
      }
    },
    [invoices, publish]
  );

  const value: AppState = {
    authed,
    signIn: (options = {}) => {
      const signedInUser =
      team.find((member) => member.email.toLowerCase() === options.email?.toLowerCase() && member.status === 'active') ??
      user;
      const signedInRole =
      options.role && signedInUser.roles.includes(options.role) ? options.role : signedInUser.roles[0];

      setUserId(signedInUser.id);
      setActiveRole(signedInRole);
      setBranchId(signedInUser.branchId);
      try {
        if (options.remember === false) {
          window.localStorage.removeItem('smpro.authenticated');
          window.localStorage.removeItem('smpro.userId');
          window.localStorage.removeItem('smpro.activeRole');
        } else {
          window.localStorage.setItem('smpro.authenticated', 'true');
          window.localStorage.setItem('smpro.userId', signedInUser.id);
          window.localStorage.setItem('smpro.activeRole', signedInRole);
        }
      } catch {
        // Storage can be unavailable in privacy-restricted browser contexts.
      }
      setAuthed(true);
    },
    signOut: () => {
      try {
        window.localStorage.removeItem('smpro.authenticated');
        window.localStorage.removeItem('smpro.userId');
        window.localStorage.removeItem('smpro.activeRole');
      } catch {
        // The in-memory session can still be cleared when storage is unavailable.
      }
      setAuthed(false);
      setOnboarded(false);
    },
    onboarded,
    completeOnboarding: () => setOnboarded(true),

    user,
    organization,
    branchId,
    setBranchId,

    userRoles: user.roles,
    activeRole,
    setActiveRole,
    can: (permission) => permissions.has(permission),

    projects,
    planSets,
    addProject: (project) => setProjects((prev) => [project, ...prev]),
    addPlanSet: (plan) =>
    setPlanSets((prev) => [
    plan,
    ...prev.map((p) => p.projectId === plan.projectId ? { ...p, isCurrent: false } : p)]
    ),

    takeoffs,
    updateTakeoffItem: (takeoffId, itemId, patch) =>
    setTakeoffs((prev) =>
    prev.map((t) =>
    t.id === takeoffId ?
    {
      ...t,
      status: t.status === 'Review Required' ? 'In Review' : t.status,
      items: t.items.map((i) => i.id === itemId ? { ...i, ...patch } : i)
    } :
    t
    )
    ),
    addTakeoffItem: (takeoffId, item) =>
    setTakeoffs((prev) =>
    prev.map((t) => t.id === takeoffId ? { ...t, items: [...t.items, item] } : t)
    ),
    approveTakeoff: (takeoffId) =>
    setTakeoffs((prev) =>
    prev.map((t) =>
    t.id === takeoffId ?
    {
      ...t,
      status: 'Approved',
      approvedBy: user.name,
      approvedAt: 'Just now'
    } :
    t
    )
    ),

    requests,
    addRequest: (request) => setRequests((prev) => [request, ...prev]),
    setRequestStatus: (id, status) =>
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r)),
    sendForPricing,

    quotes,
    selectQuote: (quoteId) =>
    setQuotes((prev) => {
      const target = prev.find((q) => q.id === quoteId);
      return prev.map((q) =>
      q.requestId === target?.requestId ?
      { ...q, status: q.id === quoteId ? 'Selected' : q.status === 'Selected' ? 'Received' : q.status } :
      q
      );
    }),
    decideQuote,

    orders,
    setOrderStatus: (id, status) =>
    setOrders((prev) =>
    prev.map((o) =>
    o.id === id ? { ...o, status, approvedBy: status === 'Confirmed' ? user.name : o.approvedBy } : o
    )
    ),
    approveOrder,

    deliveries,
    confirmDelivery: verifyReceipt,

    invoices,
    setInvoiceStatus: (id, status) =>
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status } : i)),
    payments,
    addPayment: (payment) => setPayments((prev) => [payment, ...prev]),
    payInvoice,

    approvals,
    resolveApproval: (id, status) =>
    setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status } : a)),

    notifications,
    markRead: (id) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)),
    markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    unreadCount: notifications.filter((n) => !n.read).length,

    isConnectedSupplier: isPartnerSupplier,
    partnership: PARTNERSHIP,

    toasts,
    toast,
    dismissToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id))
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
