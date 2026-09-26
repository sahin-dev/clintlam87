/**
 * Supplier / Lumber Yard domain model.
 *
 * A supplier organization is a separate tenant from a builder organization.
 * The two are connected only through an explicit relationship, and every
 * record below carries the customer (builder) it belongs to so scope can be
 * enforced in the UI.
 */

export type SupplierRoleId =
'administrator' |
'management' |
'sales' |
'estimator' |
'dispatcher' |
'driver' |
'accounting' |
'service';

export type SupplierPermission =
'business.overview' |
'customers.view' |
'customers.manage' |
'projects.view' |
'takeoff.review' |
'takeoff.estimate' |
'rfq.view' |
'rfq.assign' |
'estimate.manage' |
'quote.view' |
'quote.create' |
'quote.approve' |
'order.view' |
'order.manage' |
'products.view' |
'products.manage' |
'pricing.view' |
'pricing.manage' |
'inventory.view' |
'inventory.manage' |
'purchasing.manage' |
'delivery.view' |
'delivery.dispatch' |
'delivery.drive' |
'invoice.view' |
'invoice.manage' |
'payment.view' |
'payment.manage' |
'service.manage' |
'reports.view' |
'team.manage' |
'integrations.manage' |
'audit.view' |
'settings.manage';

export interface SupplierRole {
  id: SupplierRoleId;
  label: string;
  short: string;
  focus: string;
  landing: string;
  permissions: SupplierPermission[];
}

export interface SupplierBranch {
  id: string;
  name: string;
  city: string;
  yard: string;
}

export interface SupplierStaff {
  id: string;
  name: string;
  email: string;
  roles: SupplierRoleId[];
  branchId: string;
  status: 'Active' | 'Invited' | 'Suspended';
}

/* ------------------------------------------------------------------ */
/* Customers — a customer is a builder ORGANIZATION, not a person.     */
/* ------------------------------------------------------------------ */

export type RelationshipStatus = 'Active' | 'Pending' | 'Invited' | 'Inactive';

export interface CustomerContact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface SupplierCustomer {
  id: string;
  name: string;
  city: string;
  branchId: string;
  status: RelationshipStatus;
  since: string;
  contacts: CustomerContact[];
  terms: string;
  creditLimit: number;
  creditUsed: number;
  pricingTier: string;
  activeProjects: number;
  openQuotes: number;
  openOrders: number;
  outstanding: number;
  lastActivity: string;
  /** Set when the builder has asked to connect and nobody has answered yet. */
  requestNote?: string;
}

export type SupplierProjectStatus =
'New' |
'Estimating' |
'Quoted' |
'Order in Progress' |
'Delivery in Progress' |
'Completed' |
'Archived';

export interface SupplierProject {
  id: string;
  name: string;
  number: string;
  customerId: string;
  city: string;
  status: SupplierProjectStatus;
  estimator: string;
  salesRep: string;
  value: number;
  lastActivity: string;
  image: string;
  /** Only what the builder chose to share reaches the supplier. */
  sharedScope: string[];
}

/* ------------------------------------------------------------------ */
/* Inbound takeoff / RFQ                                              */
/* ------------------------------------------------------------------ */

export type RfqStatus =
'New' |
'In Review' |
'Needs Clarification' |
'Estimating' |
'Ready for Pricing' |
'Quoted' |
'Completed';

export type LineDecision = 'pending' | 'accepted' | 'adjusted' | 'rejected' | 'clarify';

export interface InboundTakeoffLine {
  id: string;
  material: string;
  category: string;
  builderQty: number;
  unit: string;
  sheet: string;
  page: number;
  confidence: number;
  /** Verification state the builder approved this line at. */
  builderVerification: string;
  decision: LineDecision;
  supplierQty?: number;
  reason?: string;
  changedBy?: string;
  changedAt?: string;
  /** Product this line has been mapped to, once the estimator maps it. */
  productId?: string;
}

export interface Rfq {
  id: string;
  customerId: string;
  projectId: string;
  takeoffRef: string;
  planSet: string;
  revision: string;
  sheets: number;
  requestedBy: string;
  received: string;
  dueDate: string;
  requiredDelivery: string;
  status: RfqStatus;
  estimatorId?: string;
  notes?: string;
  attachments: {name: string;kind: string;meta: string;}[];
  lines: InboundTakeoffLine[];
  /** The builder's own material-request number this arrived as. */
  builderRequestRef?: string;
}

/* ------------------------------------------------------------------ */
/* Estimate → quote                                                   */
/* ------------------------------------------------------------------ */

export type EstimateStatus =
'Draft' |
'In Review' |
'Needs Information' |
'Ready for Pricing' |
'Pricing Complete' |
'Ready for Quote';

export interface EstimateLine {
  id: string;
  takeoffLineId: string;
  material: string;
  productId: string;
  takeoffQty: number;
  wastePercent: number;
  sellQty: number;
  unit: string;
  unitCost: number;
  marginPercent: number;
  unitPrice: number;
}

export interface Estimate {
  id: string;
  rfqId: string;
  customerId: string;
  projectId: string;
  status: EstimateStatus;
  estimator: string;
  updated: string;
  lines: EstimateLine[];
}

export type QuoteStatus =
'Draft' |
'Pending Approval' |
'Sent' |
'Viewed' |
'Under Review' |
'Accepted' |
'Rejected' |
'Expired' |
'Revision Requested';

export interface QuoteRevision {
  version: number;
  total: number;
  changedBy: string;
  at: string;
  reason: string;
  status: 'Superseded' | 'Current' | 'Rejected';
}

export interface SupplierQuoteLine {
  productId: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

export interface SupplierQuote {
  id: string;
  rfqId: string;
  estimateId: string;
  customerId: string;
  projectId: string;
  version: number;
  status: QuoteStatus;
  createdBy: string;
  validUntil: string;
  sentAt?: string;
  viewedAt?: string;
  lines: SupplierQuoteLine[];
  discount: number;
  deliveryFee: number;
  taxRate: number;
  terms: string;
  revisions: QuoteRevision[];
  revisionRequest?: {note: string;by: string;at: string;};
  /** The builder's own quote reference, once they have logged it. */
  builderQuoteRef?: string;
  /** Set when the builder has rejected or asked for a revision. */
  builderDecision?: {outcome: 'Accepted' | 'Rejected' | 'Revision Requested';note: string;at: string;};
}

/* ------------------------------------------------------------------ */
/* Sales order → fulfilment                                           */
/* ------------------------------------------------------------------ */

export type SalesOrderStatus =
'New' |
'Confirmed' |
'Processing' |
'Partially Fulfilled' |
'Ready for Delivery' |
'Out for Delivery' |
'Delivered' |
'Completed' |
'Cancelled';

export interface SalesOrderLine {
  productId: string;
  description: string;
  ordered: number;
  fulfilled: number;
  unit: string;
  unitPrice: number;
  /** Short quantity that had to be bought in. */
  shortfall?: number;
}

export interface SalesOrder {
  id: string;
  quoteId: string;
  customerId: string;
  projectId: string;
  status: SalesOrderStatus;
  placed: string;
  requestedDate: string;
  terms: string;
  deliveryAddress: string;
  siteContact: string;
  lines: SalesOrderLine[];
  total: number;
  /** The builder's own purchase-order number. */
  builderOrderRef?: string;
  /** Stamped when the builder approves the PO on their side. */
  builderApprovedBy?: string;
}

/* ------------------------------------------------------------------ */
/* Catalog, pricing, inventory, buying                                */
/* ------------------------------------------------------------------ */

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  unit: string;
  cost: number;
  price: number;
  onHand: number;
  reserved: number;
  incoming: number;
  reorderLevel: number;
  status: 'Active' | 'Low Stock' | 'Backordered' | 'Discontinued';
}

export interface PricingRule {
  id: string;
  customerId: string;
  productId: string;
  standard: number;
  contract: number;
  volumeBreak: string;
  effective: string;
}

export type VendorPoStatus = 'Requested' | 'Ordered' | 'In Transit' | 'Received' | 'Cancelled';

export interface VendorPurchaseOrder {
  id: string;
  vendor: string;
  productId: string;
  qty: number;
  unit: string;
  cost: number;
  eta: string;
  status: VendorPoStatus;
  forOrderId?: string;
}

/* ------------------------------------------------------------------ */
/* Delivery, driver, POD                                              */
/* ------------------------------------------------------------------ */

export type SupplierDeliveryStatus =
'Pending' |
'Scheduled' |
'Loading' |
'Out for Delivery' |
'Arrived' |
'Delivered' |
'Delayed' |
'Cancelled';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  truck: string;
  status: 'Available' | 'On Route' | 'Loading' | 'Off Duty';
  runsToday: number;
}

export interface SupplierPod {
  receivedBy: string;
  signedAt: string;
  location: string;
  photos: number;
  notes: string;
  exceptions: string;
}

/**
 * Something a driver hit in the field that the yard has to resolve — a short
 * or damaged load, a site they could not get into, a truck fault. Drivers
 * raise these; dispatch owns them. Held on the yard side so the dispatch board
 * and delivery operations read the same record rather than two copies.
 */
export type DriverExceptionStage = 'Loading' | 'On site' | 'Vehicle';

export interface DriverException {
  id: string;
  /** The run it happened on. Absent for a truck fault between runs. */
  deliveryId?: string;
  driverId: string;
  driverName: string;
  kind: string;
  stage: DriverExceptionStage;
  detail: string;
  photos: number;
  at: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  /** What dispatch did about it, once they have. */
  response?: string;
}

export interface SupplierDelivery {
  id: string;
  orderId: string;
  customerId: string;
  projectId: string;
  date: string;
  window: string;
  sequence: number;
  driverId?: string;
  truck?: string;
  status: SupplierDeliveryStatus;
  eta: string;
  address: string;
  siteContact: string;
  items: {description: string;qty: number;unit: string;loaded: boolean;}[];
  /** Set when this run only covers part of the order. */
  partialOf?: {deliveryNo: number;ofTotal: number;remaining: string;};
  pod?: SupplierPod;
  delayReason?: string;
  /** The builder's own delivery reference for this load. */
  builderDeliveryRef?: string;
  /** Set once the builder's site team has verified receipt against the POD. */
  builderReceipt?: {verifiedBy: string;shortage: string;damage: string;at: string;};
}

/* ------------------------------------------------------------------ */
/* Finance                                                            */
/* ------------------------------------------------------------------ */

export type SupplierInvoiceStatus =
'Draft' |
'Sent' |
'Pending' |
'Partially Paid' |
'Paid' |
'Overdue' |
'Failed' |
'Refunded';

export interface SupplierInvoice {
  id: string;
  orderId: string;
  deliveryId?: string;
  customerId: string;
  projectId: string;
  issued: string;
  due: string;
  terms: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paid: number;
  status: SupplierInvoiceStatus;
  /** The builder's own invoice reference, once they have booked it. */
  builderInvoiceRef?: string;
}

export interface SupplierPayment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: string;
  date: string;
  reference: string;
  status: 'Pending' | 'Processing' | 'Cleared' | 'Failed' | 'Refunded';
  failureReason?: string;
}

/* ------------------------------------------------------------------ */
/* Customer service                                                   */
/* ------------------------------------------------------------------ */

export type CaseStatus = 'Open' | 'Investigating' | 'Awaiting Customer' | 'Resolved' | 'Closed';

export interface ServiceCase {
  id: string;
  customerId: string;
  orderId?: string;
  deliveryId?: string;
  subject: string;
  category: 'Damage' | 'Shortage' | 'Wrong Item' | 'Delivery' | 'Billing' | 'Other';
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  status: CaseStatus;
  opened: string;
  owner: string;
  detail: string;
  resolution?: string;
  timeline: {label: string;at: string;by: string;}[];
}

/* ------------------------------------------------------------------ */
/* Engagement, audit, integration                                     */
/* ------------------------------------------------------------------ */

export interface SupplierNotification {
  id: string;
  category: 'RFQ' | 'Takeoff' | 'Quote' | 'Order' | 'Delivery' | 'Invoice' | 'Payment' | 'Service';
  title: string;
  body: string;
  at: string;
  read: boolean;
  to: string;
  permission?: SupplierPermission;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  record: string;
  at: string;
  branch: string;
  customer?: string;
  before?: string;
  after?: string;
}

export interface SyncEvent {
  id: string;
  entity: string;
  direction: 'Inbound' | 'Outbound';
  records: number;
  at: string;
  status: 'Synced' | 'Syncing' | 'Failed' | 'Retrying' | 'Conflict';
  detail?: string;
}
