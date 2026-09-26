/**
 * Builder ↔ Supplier interoperability.
 *
 * The two platforms are separate tenants. They are joined ONLY through an
 * explicit relationship, so nothing here lets one side read the other's
 * records directly — it defines the shared identity crosswalk and the
 * business events the two organizations exchange across that boundary.
 *
 * Anything not present in a crosswalk belongs to a different trading partner
 * and must never resolve. That is the tenant boundary, expressed in code.
 */

/* ------------------------------------------------------------------ */
/* The relationship                                                    */
/* ------------------------------------------------------------------ */

export const PARTNERSHIP = {
  /** The builder organization, as the builder platform knows itself. */
  builderOrgId: 'org-1',
  builderOrgName: 'ABC Construction',
  /** The same builder, as the supplier's customer record. */
  supplierCustomerId: 'cu-abc',

  /** The supplier organization, as the supplier platform knows itself. */
  supplierOrgName: 'ABC Lumber & Supply',
  /** The same yard, as the builder's supplier record. */
  builderSupplierId: 'sp-1',

  since: 'Mar 2024',
  terms: 'Net 30'
} as const;

/** True when a supplier-side customer is the builder running the other platform. */
export function isPartnerCustomer(customerId: string): boolean {
  return customerId === PARTNERSHIP.supplierCustomerId;
}

/** True when a builder-side supplier is the yard running the other platform. */
export function isPartnerSupplier(supplierId: string): boolean {
  return supplierId === PARTNERSHIP.builderSupplierId;
}

/* ------------------------------------------------------------------ */
/* Project crosswalk                                                   */
/* ------------------------------------------------------------------ */

/**
 * Builder project → supplier project. Only projects the builder has actually
 * shared with this yard appear here; the yard's other customers' projects are
 * deliberately absent.
 */
const PROJECT_PAIRS: [builder: string, supplier: string][] = [
['pr-1024', 'sp-oakwood'],
['pr-1031', 'sp-maple']];


const TO_SUPPLIER_PROJECT = new Map(PROJECT_PAIRS);
const TO_BUILDER_PROJECT = new Map(PROJECT_PAIRS.map(([b, s]) => [s, b]));

export function supplierProjectFor(builderProjectId: string): string | undefined {
  return TO_SUPPLIER_PROJECT.get(builderProjectId);
}

export function builderProjectFor(supplierProjectId: string): string | undefined {
  return TO_BUILDER_PROJECT.get(supplierProjectId);
}

/** Projects this builder has shared with the yard. */
export function sharedProjectIds(): string[] {
  return PROJECT_PAIRS.map(([b]) => b);
}

/* ------------------------------------------------------------------ */
/* Id minting                                                          */
/* ------------------------------------------------------------------ */

/**
 * Mints the next sequential id for a prefix, based on ids already in play.
 * Both platforms number their own records, so a record crossing the boundary
 * gets a NEW local id plus a reference back to its counterpart.
 */
export function nextId(prefix: string, existing: string[], pad = 4): string {
  const highest = existing.reduce((max, id) => {
    if (!id.startsWith(`${prefix}-`)) return max;
    const n = Number.parseInt(id.slice(prefix.length + 1), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(pad, '0')}`;
}

/* ------------------------------------------------------------------ */
/* The exchanged events                                                */
/* ------------------------------------------------------------------ */

export interface ExchangeLine {
  description: string;
  qty: number;
  unit: string;
  unitPrice?: number;
}

interface Base {
  /** Which platform published it. The other platform consumes it. */
  origin: 'builder' | 'supplier';
  at: string;
}

export type ExchangeEvent =
/* Builder → Supplier ------------------------------------------------ */
(Base & {
  kind: 'rfq.issued';
  requestId: string;
  builderProjectId: string;
  takeoffRef: string | null;
  requestedBy: string;
  requiredBy: string;
  notes: string;
  lines: ExchangeLine[];
}) |
(Base & {
  kind: 'quote.decided';
  supplierQuoteId: string;
  builderQuoteId: string;
  decision: 'accepted' | 'rejected' | 'revision';
  note: string;
  /** Present when accepted — the PO the builder raised. */
  builderOrderId?: string;
  requiredDate?: string;
}) |
(Base & {
  kind: 'order.approved';
  builderOrderId: string;
  supplierOrderId: string;
  approvedBy: string;
}) |
(Base & {
  kind: 'delivery.receipted';
  supplierDeliveryId: string;
  verifiedBy: string;
  shortage: string;
  damage: string;
}) |
(Base & {
  kind: 'payment.sent';
  supplierInvoiceId: string;
  amount: number;
  method: string;
  reference: string;
})
/* Supplier → Builder ------------------------------------------------ */ |
(Base & {
  kind: 'quote.sent';
  supplierQuoteId: string;
  builderRequestId: string;
  builderProjectId: string;
  total: number;
  validUntil: string;
  leadTimeDays: number;
  deliveryDate: string;
  terms: string;
  availability: string;
  lines: ExchangeLine[];
  version: number;
}) |
(Base & {
  kind: 'order.confirmed';
  builderOrderId: string;
  supplierOrderId: string;
  promisedDate: string;
}) |
(Base & {
  kind: 'delivery.scheduled';
  supplierDeliveryId: string;
  builderOrderId: string;
  builderProjectId: string;
  date: string;
  eta: string;
  driver: string;
  truck: string;
  itemCount: number;
}) |
(Base & {
  kind: 'delivery.dispatched';
  supplierDeliveryId: string;
  eta: string;
  driver: string;
  truck: string;
}) |
(Base & {
  kind: 'delivery.delayed';
  supplierDeliveryId: string;
  reason: string;
}) |
(Base & {
  kind: 'pod.signed';
  supplierDeliveryId: string;
  receivedBy: string;
  signedAt: string;
  photos: number;
  notes: string;
  exceptions: string;
}) |
(Base & {
  kind: 'invoice.issued';
  supplierInvoiceId: string;
  builderOrderId: string;
  builderProjectId: string;
  amount: number;
  due: string;
  matched: boolean;
}) |
(Base & {
  kind: 'payment.recorded';
  supplierInvoiceId: string;
  status: 'Cleared' | 'Failed';
  reason?: string;
});

export type ExchangeKind = ExchangeEvent['kind'];

/** Human label for the exchange ledger. */
export const EXCHANGE_LABEL: Record<ExchangeKind, string> = {
  'rfq.issued': 'Request for quote issued',
  'quote.decided': 'Quote decision returned',
  'order.approved': 'Purchase order approved',
  'delivery.receipted': 'Delivery receipt verified',
  'payment.sent': 'Payment sent',
  'quote.sent': 'Quote sent to builder',
  'order.confirmed': 'Order confirmed by yard',
  'delivery.scheduled': 'Load scheduled',
  'delivery.dispatched': 'Load dispatched',
  'delivery.delayed': 'Load delayed',
  'pod.signed': 'Proof of delivery signed',
  'invoice.issued': 'Invoice issued',
  'payment.recorded': 'Payment reconciled'
};