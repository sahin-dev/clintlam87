export type RoleId =
'owner' |
'project_manager' |
'superintendent' |
'purchasing_manager' |
'accountant';

export type Permission =
'business.overview' |
'project.create' |
'project.manage' |
'project.view' |
'plans.upload' |
'takeoff.review' |
'takeoff.approve' |
'request.create' |
'request.manage' |
'quote.manage' |
'quote.view' |
'proposal.create' |
'proposal.approve' |
'order.manage' |
'order.view' |
'delivery.verify' |
'delivery.view' |
'invoice.manage' |
'invoice.view' |
'payment.manage' |
'payment.view' |
'team.manage' |
'jobsite.manage' |
'issue.create';

export interface Role {
  id: RoleId;
  label: string;
  short: string;
  focus: string;
  permissions: Permission[];
}

export interface Branch {
  id: string;
  name: string;
  city: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string;
  branches: Branch[];
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  roles: RoleId[];
  branchId: string;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
}

export type ProjectStatus = 'In Progress' | 'At Risk' | 'Planning' | 'Completed';

export interface Project {
  id: string;
  number: string;
  name: string;
  address: string;
  image: string;
  status: ProjectStatus;
  progress: number;
  procurement: number;
  value: number;
  spend: number;
  managerId: string;
  branchId: string;
  startDate: string;
  targetDate: string;
  nextMilestone: string;
  nextMilestoneDate: string;
  openIssues: number;
  pendingActions: number;
  supplierIds: string[];
  lastActivity: string;
  description: string;
}

/** A single drawing file stored inside a plan set. */
export interface PlanFile {
  name: string;
  kind: 'pdf' | 'cad' | 'image';
  sheets: number;
  sizeMb: number;
  previewUrl?: string;
}

export interface PlanSet {
  id: string;
  projectId: string;
  name: string;
  version: number;
  isCurrent: boolean;
  uploadedBy: string;
  uploadedAt: string;
  sheets: number;
  sizeMb: number;
  note: string;
  /** Discipline the set covers, used to scope the AI models that run on it. */
  discipline?: string;
  files?: PlanFile[];
}

export type TakeoffStatus =
'Processing' |
'Review Required' |
'In Review' |
'Approved' |
'Failed';

export interface TakeoffItem {
  id: string;
  category: string;
  item: string;
  unit: string;
  aiQuantity: number;
  correctedQuantity: number | null;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
  confidence: number;
  sheet: string;
  page: number;
  status: 'pending' | 'accepted' | 'edited' | 'rejected' | 'added';
}

export interface Takeoff {
  id: string;
  projectId: string;
  planSetId: string;
  planSetLabel: string;
  status: TakeoffStatus;
  createdAt: string;
  model: string;
  runRef: string;
  approvedBy?: string;
  approvedAt?: string;
  items: TakeoffItem[];
}

export type RequestStatus =
'Draft' |
'Submitted' |
'Under Review' |
'Pricing' |
'Quote Received' |
'Approved' |
'Ordered';

export interface MaterialRequest {
  id: string;
  projectId: string;
  takeoffId: string | null;
  requestedBy: string;
  requestedAt: string;
  requiredBy: string;
  priority: 'Low' | 'Normal' | 'Urgent';
  status: RequestStatus;
  notes: string;
  lines: {item: string;qty: number;unit: string;}[];
  /** RFQ this request became on the connected supplier's platform. */
  rfqRef?: string;
}

export interface Supplier {
  id: string;
  name: string;
  image: string;
  city: string;
  category: string;
  rating: number;
  onTimeRate: number;
  relationship: 'Preferred' | 'Active' | 'Prospect';
  contact: string;
  phone: string;
  openOrders: number;
  terms: string;
}

export type QuoteStatus = 'Pending' | 'Received' | 'Selected' | 'Rejected' | 'Expired';

export interface Quote {
  id: string;
  requestId: string;
  projectId: string;
  supplierId: string;
  total: number;
  status: QuoteStatus;
  receivedAt: string;
  validUntil: string;
  leadTimeDays: number;
  deliveryDate: string;
  terms: string;
  availability: string;
  lines: {item: string;qty: number;unit: string;unitPrice: number;}[];
  /** The supplier's own quote number, when it came from a connected yard. */
  supplierQuoteRef?: string;
  /** Revision number on the supplier's side. */
  version?: number;
}

export type ApprovalType = 'Proposal' | 'Takeoff' | 'Material Request' | 'Invoice' | 'Change Order';

export interface Approval {
  id: string;
  type: ApprovalType;
  title: string;
  projectId: string;
  amount: number | null;
  requesterId: string;
  createdAt: string;
  priority: 'High' | 'Medium' | 'Low';
  refId: string;
  summary: string;
  requiredPermission: Permission;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
}

export type OrderStatus =
'Pending Approval' |
'Confirmed' |
'In Production' |
'Dispatched' |
'Delivered' |
'Closed';

export interface PurchaseOrder {
  id: string;
  projectId: string;
  supplierId: string;
  quoteId: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  deliveryDate: string;
  lines: {item: string;qty: number;unit: string;unitPrice: number;}[];
  /** The sales order this became on the connected supplier's platform. */
  salesOrderRef?: string;
}

export type DeliveryStatus =
'Pending' |
'Scheduled' |
'Out for Delivery' |
'Delivered' |
'Delayed' |
'Cancelled';

export interface Delivery {
  id: string;
  orderId: string;
  projectId: string;
  supplierId: string;
  status: DeliveryStatus;
  date: string;
  eta: string;
  driver: string;
  truck: string;
  itemCount: number;
  pod: Pod | null;
  /** The load this is, on the connected supplier's dispatch board. */
  loadRef?: string;
  delayReason?: string;
}

export interface Pod {
  deliveredAt: string;
  receivedBy: string;
  signature: boolean;
  photos: number;
  damage: string;
  shortage: string;
  notes: string;
  verifiedBy?: string;
}

export type InvoiceStatus =
'Pending' |
'Approved' |
'Partially Paid' |
'Paid' |
'Overdue' |
'Failed';

export interface Invoice {
  id: string;
  orderId: string;
  projectId: string;
  supplierId: string;
  amount: number;
  paid: number;
  status: InvoiceStatus;
  receivedAt: string;
  dueDate: string;
  matched: boolean;
  /** The supplier's own invoice number. */
  supplierInvoiceRef?: string;
}

export type PaymentStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Partial' | 'Refunded';

export interface Payment {
  id: string;
  invoiceId: string;
  projectId: string;
  supplierId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  date: string;
  reference: string;
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  kind:
  'plan' |
  'takeoff' |
  'request' |
  'quote' |
  'order' |
  'delivery' |
  'invoice' |
  'payment' |
  'project' |
  'issue';
  before?: string;
  after?: string;
}

export interface Notification {
  id: string;
  category:
  'Approval' |
  'AI Takeoff' |
  'Quote' |
  'Order' |
  'Delivery' |
  'Invoice' |
  'Payment' |
  'Project' |
  'Team';
  title: string;
  body: string;
  at: string;
  read: boolean;
  link: string;
  tone: 'critical' | 'warning' | 'info' | 'success';
}

export interface ThreadMessage {
  id: string;
  author: string;
  self?: boolean;
  system?: boolean;
  at: string;
  body: string;
  attachment?: {name: string;kind: 'pdf' | 'image';};
}

export interface MessageThread {
  id: string;
  subject: string;
  context: string;
  projectId: string;
  participants: string[];
  unread: number;
  updatedAt: string;
  scope: 'project' | 'supplier';
  messages: ThreadMessage[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Created' | 'Assigned' | 'In Progress' | 'Completed';
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  category: 'Material' | 'Safety' | 'Schedule' | 'Quality';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  reportedBy: string;
  at: string;
  photos: number;
}