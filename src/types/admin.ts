/**
 * Platform-level types for the SM PRO Super Admin control plane.
 *
 * These describe the platform ABOUT the tenants — organizations, licensing,
 * entitlements, AI operations, integrations, system health, support, security
 * and audit. They deliberately do not model a tenant's internal commercial
 * data: the Super Admin governs the platform, it does not run a yard or a
 * jobsite.
 */

export type OrgKind = 'supplier' | 'builder';

export type OrgStatus = 'Pending' | 'Trial' | 'Active' | 'Restricted' | 'Suspended' | 'Cancelled';

export type PlanId = 'starter' | 'growth' | 'professional' | 'enterprise';

export interface PlanLimits {
  /** Primary licensing basis for suppliers: how many builder companies they may trade with. */
  builderCompanies: number;
  branches: number;
  users: number;
  /** GB. */
  storage: number;
  /** AI takeoff sheets per month. */
  aiSheets: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** Names are placeholders and editable — the id is what the platform keys on. */
  price: number;
  limits: PlanLimits;
  features: FeatureId[];
  support: 'Standard' | 'Priority' | 'Dedicated';
  archived?: boolean;
}

export type FeatureId =
'ai_takeoff' |
'ai_advanced_review' |
'ai_assistant' |
'erp_integration' |
'multi_branch' |
'advanced_pricing' |
'advanced_reporting' |
'delivery_tracking' |
'payments';

export interface FeatureDef {
  id: FeatureId;
  label: string;
  description: string;
  /** Turning this off stops work that is already in flight. */
  disruptive: boolean;
}

export interface Usage {
  builderCompanies: number;
  branches: number;
  users: number;
  storage: number;
  aiSheets: number;
}

export interface Organization {
  id: string;
  kind: OrgKind;
  name: string;
  status: OrgStatus;
  /** Suppliers carry a subscription. Builders are licensed through the supplier they trade with. */
  planId?: PlanId;
  region: string;
  address: string;
  contact: string;
  contactEmail: string;
  admin: {name: string;email: string;};
  created: string;
  lastActive: string;
  projects: number;
  usage: Usage;
  branches: OrgBranch[];
  /** Supplier: builder orgs they trade with. Builder: supplier orgs they buy from. */
  partners: string[];
  /** Feature overrides applied on top of the plan. */
  overrides: Partial<Record<FeatureId, boolean>>;
  subscription?: {
    started: string;
    renews: string;
    mrr: number;
    seats: number;
  };
  statusReason?: {reason: string;note: string;by: string;at: string;};
  erp?: 'ECI Spruce' | 'None';
}

export interface OrgBranch {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Suspended' | 'Archived';
  users: number;
  orders30d: number;
  deliveries30d: number;
  created: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  orgId: string;
  branch: string;
  roles: string[];
  status: 'Active' | 'Invited' | 'Locked' | 'Disabled';
  lastActive: string;
  created: string;
}

/* ---------------------------------------------------------------- */
/* AI operations                                                      */
/* ---------------------------------------------------------------- */

export type JobStatus = 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Retrying' | 'Cancelled';

export interface AiJob {
  id: string;
  takeoffRef: string;
  orgId: string;
  project: string;
  planSet: string;
  sheets: number;
  sheetsDone: number;
  status: JobStatus;
  started: string;
  duration: string;
  model: string;
  failure?: string;
}

export interface AiIssue {
  id: string;
  orgId: string;
  project: string;
  takeoffRef: string;
  kind:
  'Processing failure' |
  'Low confidence' |
  'Model error' |
  'Document error' |
  'Unexpected result' |
  'System error';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Resolved';
  detail: string;
  created: string;
  resolution?: string;
}

export interface AiConfig {
  model: string;
  /** Below this an attribute is marked review-required on the tenant side. */
  confidenceThreshold: number;
  /** Sheets a single run may contain before it is split. */
  maxSheetsPerRun: number;
  crossSheetValidation: boolean;
  ruleValidation: boolean;
  autoRetryFailures: boolean;
  /** Platform-wide monthly ceiling, in sheets. */
  monthlyCeiling: number;
}

/* ---------------------------------------------------------------- */
/* Integrations, jobs, health                                        */
/* ---------------------------------------------------------------- */

export type SyncStatus = 'Connected' | 'Syncing' | 'Failed' | 'Retrying' | 'Conflict' | 'Disconnected';

export interface IntegrationLink {
  id: string;
  orgId: string;
  adapter: 'ECI Spruce' | 'Stripe Connect' | 'Vision AI' | 'Twilio Notify';
  status: SyncStatus;
  lastSync: string;
  entities: {name: string;status: SyncStatus;records: number;}[];
  errors: number;
}

export interface SyncError {
  id: string;
  orgId: string;
  adapter: string;
  entity: string;
  message: string;
  at: string;
  retries: number;
  status: 'Open' | 'Retrying' | 'Resolved';
}

export interface QueueJob {
  id: string;
  type:
  'Blueprint analysis' |
  'Document processing' |
  'AI takeoff' |
  'ERP sync' |
  'Notification' |
  'Payment processing';
  orgId: string;
  status: JobStatus;
  started: string;
  duration: string;
  retries: number;
  detail: string;
}

export type ServiceState = 'Operational' | 'Degraded' | 'Down';

export interface ServiceHealth {
  id: string;
  name: string;
  state: ServiceState;
  responseMs: number;
  errorRate: number;
  checked: string;
  note: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  service: string;
  status: 'Investigating' | 'Identified' | 'Monitoring' | 'Resolved';
  started: string;
  affectedOrgs: string[];
  description: string;
  timeline: {at: string;label: string;by: string;}[];
  resolution?: string;
}

/* ---------------------------------------------------------------- */
/* Support, security, audit                                          */
/* ---------------------------------------------------------------- */

export interface SupportCase {
  id: string;
  orgId: string;
  subject: string;
  detail: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'New' | 'Assigned' | 'Investigating' | 'Waiting' | 'Escalated' | 'Resolved' | 'Closed';
  assignee: string;
  reporter: string;
  created: string;
  related?: {label: string;value: string;}[];
  timeline: {at: string;label: string;by: string;}[];
}

export interface SupportSession {
  orgId: string;
  reason: string;
  caseId?: string;
  startedAt: string;
  by: string;
}

export interface SecurityEvent {
  id: string;
  kind:
  'Failed login' |
  'Permission change' |
  'Account lock' |
  'Organization suspended' |
  'Support session' |
  'API security event' |
  'Cross-tenant access attempt';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  orgId: string;
  actor: string;
  detail: string;
  at: string;
  outcome: 'Blocked' | 'Allowed' | 'Recorded';
}

export interface IsolationCheck {
  orgId: string;
  status: 'Isolated' | 'Violation' | 'Under test';
  lastTest: string;
  blockedRequests: number;
  violations: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  module: string;
  orgId?: string;
  object: string;
  before?: string;
  after?: string;
  reason?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface AdminNotification {
  id: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  body: string;
  at: string;
  read: boolean;
  to?: string;
}

export interface FeatureFlag {
  id: string;
  label: string;
  description: string;
  scope: 'Global' | 'Plan' | 'Organization';
  enabled: boolean;
  /** Org ids the flag is switched on for when scope is Organization. */
  targets: string[];
}