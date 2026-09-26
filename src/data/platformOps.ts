import {
  AdminNotification,
  AiConfig,
  AiIssue,
  AiJob,
  AuditEntry,
  Incident,
  IntegrationLink,
  IsolationCheck,
  QueueJob,
  SecurityEvent,
  ServiceHealth,
  SupportCase,
  SyncError } from
'../types/admin';
import { ORGANIZATIONS, PLATFORM_ADMIN } from './platform';

/** Platform operations: what the control plane is actually running right now. */

export const AI_CONFIG: AiConfig = {
  model: 'smpro-vision-4.2 · framing',
  confidenceThreshold: 75,
  maxSheetsPerRun: 48,
  crossSheetValidation: true,
  ruleValidation: true,
  autoRetryFailures: true,
  monthlyCeiling: 40000
};

export const AI_JOBS: AiJob[] = [
{
  id: 'aj-9822',
  takeoffRef: 'TK-1024',
  orgId: 'bld-abc',
  project: 'Oakwood Residence',
  planSet: 'Architectural + Structural · Rev 04',
  sheets: 24,
  sheetsDone: 18,
  status: 'Processing',
  started: '10:32',
  duration: '4m 12s',
  model: 'smpro-vision-4.2'
},
{
  id: 'aj-9821',
  takeoffRef: 'TK-2210',
  orgId: 'sup-cascade',
  project: 'Harbour Row Phase 2',
  planSet: 'Architectural · Rev 07',
  sheets: 62,
  sheetsDone: 0,
  status: 'Queued',
  started: '10:36',
  duration: '—',
  model: 'smpro-vision-4.2'
},
{
  id: 'aj-9818',
  takeoffRef: 'TK-1044',
  orgId: 'bld-crestline',
  project: 'Bee Cave Duplexes',
  planSet: 'Architectural · Rev 02',
  sheets: 18,
  sheetsDone: 6,
  status: 'Failed',
  started: '10:04',
  duration: '1m 48s',
  model: 'smpro-vision-4.2',
  failure: 'Sheet A-107 rasterised below 900 px on its short edge — scale could not be established.'
},
{
  id: 'aj-9817',
  takeoffRef: 'TK-2208',
  orgId: 'sup-cascade',
  project: 'Alder Street Infill',
  planSet: 'Structural · Rev 03',
  sheets: 31,
  sheetsDone: 31,
  status: 'Completed',
  started: '09:41',
  duration: '7m 02s',
  model: 'smpro-vision-4.2'
},
{
  id: 'aj-9814',
  takeoffRef: 'TK-1602',
  orgId: 'bld-hallmark',
  project: 'Manor Grove Lot 14',
  planSet: 'Architectural · Rev 01',
  sheets: 12,
  sheetsDone: 4,
  status: 'Retrying',
  started: '09:58',
  duration: '2m 31s',
  model: 'smpro-vision-4.2',
  failure: 'Upstream vision service returned 503. Auto-retry 2 of 3.'
},
{
  id: 'aj-9809',
  takeoffRef: 'TK-1598',
  orgId: 'bld-hallmark',
  project: 'Manor Grove Lot 09',
  planSet: 'Architectural · Rev 04',
  sheets: 14,
  sheetsDone: 14,
  status: 'Completed',
  started: '09:12',
  duration: '3m 44s',
  model: 'smpro-vision-4.2'
},
{
  id: 'aj-9803',
  takeoffRef: 'TK-1041',
  orgId: 'bld-westline',
  project: 'Alder Court',
  planSet: 'Architectural · Rev 02',
  sheets: 22,
  sheetsDone: 0,
  status: 'Cancelled',
  started: '08:47',
  duration: '—',
  model: 'smpro-vision-4.2',
  failure: 'Cancelled by platform — AI Takeoff withdrawn from this organization pending review.'
}];


export const AI_ISSUES: AiIssue[] = [
{
  id: 'ai-401',
  orgId: 'bld-crestline',
  project: 'Bee Cave Duplexes',
  takeoffRef: 'TK-1044',
  kind: 'Document error',
  severity: 'High',
  status: 'Open',
  detail:
  'Sheet A-107 is a scanned page at 210 DPI. Scale detection failed, so the run stopped before quantity calculation.',
  created: '10:06'
},
{
  id: 'ai-399',
  orgId: 'bld-hallmark',
  project: 'Manor Grove Lot 14',
  takeoffRef: 'TK-1602',
  kind: 'System error',
  severity: 'Critical',
  status: 'Investigating',
  detail: 'Vision service returned 503 across three organizations between 09:52 and 10:04.',
  created: '09:59'
},
{
  id: 'ai-396',
  orgId: 'sup-cascade',
  project: 'Harbour Row Phase 2',
  takeoffRef: 'TK-2209',
  kind: 'Low confidence',
  severity: 'Medium',
  status: 'Open',
  detail:
  'Stud spacing confidence averaged 58% across 11 sheets — below the 75% platform threshold. Flagged review-required to the tenant.',
  created: '08:34'
},
{
  id: 'ai-392',
  orgId: 'bld-abc',
  project: 'Oakwood Residence',
  takeoffRef: 'TK-1024',
  kind: 'Unexpected result',
  severity: 'Low',
  status: 'Resolved',
  detail: 'Window count disagreed with the schedule by one unit. Reconciled by the tenant during review.',
  created: 'Yesterday',
  resolution: 'Tenant resolved through cross-sheet reconciliation. No platform action required.'
}];


/* ------------------------------------------------------------------ */

export const INTEGRATIONS: IntegrationLink[] = [
{
  id: 'int-1',
  orgId: 'sup-abc',
  adapter: 'ECI Spruce',
  status: 'Connected',
  lastSync: '10:42',
  errors: 0,
  entities: [
  { name: 'Products', status: 'Connected', records: 4820 },
  { name: 'Inventory', status: 'Connected', records: 4820 },
  { name: 'Customers', status: 'Connected', records: 18 },
  { name: 'Orders', status: 'Connected', records: 312 },
  { name: 'Invoices', status: 'Connected', records: 286 }]

},
{
  id: 'int-2',
  orgId: 'sup-hillcountry',
  adapter: 'ECI Spruce',
  status: 'Failed',
  lastSync: '06:15',
  errors: 3,
  entities: [
  { name: 'Products', status: 'Connected', records: 2140 },
  { name: 'Inventory', status: 'Failed', records: 0 },
  { name: 'Customers', status: 'Connected', records: 11 },
  { name: 'Orders', status: 'Conflict', records: 148 },
  { name: 'Invoices', status: 'Connected', records: 131 }]

},
{
  id: 'int-3',
  orgId: 'sup-cascade',
  adapter: 'ECI Spruce',
  status: 'Syncing',
  lastSync: '10:44',
  errors: 0,
  entities: [
  { name: 'Products', status: 'Syncing', records: 18400 },
  { name: 'Inventory', status: 'Connected', records: 18400 },
  { name: 'Customers', status: 'Connected', records: 46 },
  { name: 'Orders', status: 'Connected', records: 1841 },
  { name: 'Invoices', status: 'Connected', records: 1620 }]

},
{
  id: 'int-4',
  orgId: 'sup-abc',
  adapter: 'Stripe Connect',
  status: 'Connected',
  lastSync: '10:40',
  errors: 0,
  entities: [
  { name: 'Payments', status: 'Connected', records: 214 },
  { name: 'Payouts', status: 'Connected', records: 48 }]

},
{
  id: 'int-5',
  orgId: 'sup-gulf',
  adapter: 'ECI Spruce',
  status: 'Disconnected',
  lastSync: 'Never',
  errors: 0,
  entities: []
}];


export const SYNC_ERRORS: SyncError[] = [
{
  id: 'se-88',
  orgId: 'sup-hillcountry',
  adapter: 'ECI Spruce',
  entity: 'Inventory',
  message: 'Adapter timed out after 30s reading warehouse 02. Partial page discarded — no records written.',
  at: '06:15',
  retries: 3,
  status: 'Open'
},
{
  id: 'se-87',
  orgId: 'sup-hillcountry',
  adapter: 'ECI Spruce',
  entity: 'Orders',
  message:
  'Order SO-4471 exists in both systems with different totals. Held for reconciliation rather than overwritten.',
  at: '06:15',
  retries: 0,
  status: 'Open'
},
{
  id: 'se-84',
  orgId: 'sup-hillcountry',
  adapter: 'ECI Spruce',
  entity: 'Inventory',
  message: 'Duplicate SKU HC-2X6-16 returned twice in one page. Second occurrence ignored (idempotent write).',
  at: '05:15',
  retries: 1,
  status: 'Resolved'
},
{
  id: 'se-81',
  orgId: 'sup-cascade',
  adapter: 'ECI Spruce',
  entity: 'Products',
  message: 'Rate limit reached at 18,000 records. Resuming from cursor on the next window.',
  at: '04:02',
  retries: 1,
  status: 'Resolved'
}];


export const QUEUE_JOBS: QueueJob[] = [
{
  id: 'q-5512',
  type: 'AI takeoff',
  orgId: 'bld-abc',
  status: 'Processing',
  started: '10:32',
  duration: '4m 12s',
  retries: 0,
  detail: 'TK-1024 · 18 of 24 sheets'
},
{
  id: 'q-5511',
  type: 'Blueprint analysis',
  orgId: 'sup-cascade',
  status: 'Queued',
  started: '10:36',
  duration: '—',
  retries: 0,
  detail: 'TK-2210 · 62 sheets pending capacity'
},
{
  id: 'q-5509',
  type: 'ERP sync',
  orgId: 'sup-hillcountry',
  status: 'Failed',
  started: '06:15',
  duration: '30s',
  retries: 3,
  detail: 'Inventory pull timed out'
},
{
  id: 'q-5508',
  type: 'ERP sync',
  orgId: 'sup-cascade',
  status: 'Processing',
  started: '10:44',
  duration: '52s',
  retries: 0,
  detail: 'Product catalogue page 4 of 9'
},
{
  id: 'q-5504',
  type: 'Payment processing',
  orgId: 'sup-abc',
  status: 'Completed',
  started: '10:12',
  duration: '3s',
  retries: 0,
  detail: 'ACH capture · INV-4471'
},
{
  id: 'q-5501',
  type: 'Notification',
  orgId: 'bld-hallmark',
  status: 'Retrying',
  started: '09:58',
  duration: '1m 04s',
  retries: 2,
  detail: 'Delivery dispatched · SMS provider 5xx'
},
{
  id: 'q-5498',
  type: 'Document processing',
  orgId: 'bld-crestline',
  status: 'Completed',
  started: '09:31',
  duration: '18s',
  retries: 0,
  detail: 'POD PDF generated · DL-3308'
}];


export const SERVICES: ServiceHealth[] = [
{ id: 'api', name: 'API', state: 'Operational', responseMs: 118, errorRate: 0.02, checked: '30s ago', note: 'All regions responding' },
{ id: 'db', name: 'Database', state: 'Operational', responseMs: 9, errorRate: 0, checked: '30s ago', note: 'Primary + 2 replicas healthy' },
{ id: 'storage', name: 'Storage', state: 'Operational', responseMs: 62, errorRate: 0, checked: '30s ago', note: 'Drawing store at 61% capacity' },
{ id: 'ai', name: 'AI Processing', state: 'Degraded', responseMs: 4120, errorRate: 6.4, checked: '30s ago', note: 'Vision service intermittently returning 503' },
{ id: 'erp', name: 'ERP Integrations', state: 'Degraded', responseMs: 980, errorRate: 3.1, checked: '2 min ago', note: '1 of 4 Spruce connections failing' },
{ id: 'payments', name: 'Payments', state: 'Operational', responseMs: 240, errorRate: 0.1, checked: '1 min ago', note: 'Card and ACH both settling' },
{ id: 'notifications', name: 'Notifications', state: 'Degraded', responseMs: 1400, errorRate: 4.8, checked: '1 min ago', note: 'SMS provider elevated 5xx; email unaffected' },
{ id: 'jobs', name: 'Background Jobs', state: 'Operational', responseMs: 0, errorRate: 1.2, checked: '30s ago', note: '2 queued, 3 processing' }];


export const INCIDENTS: Incident[] = [
{
  id: 'inc-118',
  title: 'Vision service returning intermittent 503s',
  severity: 'High',
  service: 'AI Processing',
  status: 'Investigating',
  started: '09:52',
  affectedOrgs: ['bld-hallmark', 'bld-crestline', 'sup-cascade'],
  description:
  'The upstream vision provider began returning 503 on roughly 6% of sheet requests. Affected runs auto-retry up to three times; two runs have failed outright.',
  timeline: [
  { at: '09:52', label: 'Error rate crossed 5% — incident opened automatically', by: 'SM PRO' },
  { at: '09:58', label: 'Auto-retry engaged on affected runs', by: 'SM PRO' },
  { at: '10:07', label: 'Provider acknowledged degraded capacity in us-central', by: PLATFORM_ADMIN.name },
  { at: '10:20', label: 'Queued runs held rather than failed, to avoid burning tenant AI allowance', by: PLATFORM_ADMIN.name }]

},
{
  id: 'inc-117',
  title: 'SMS notification provider elevated failures',
  severity: 'Medium',
  service: 'Notifications',
  status: 'Monitoring',
  started: '09:40',
  affectedOrgs: ['bld-hallmark'],
  description: 'Delivery-dispatch SMS failing for one carrier. Email and in-app notifications unaffected.',
  timeline: [
  { at: '09:40', label: 'Failure rate crossed threshold', by: 'SM PRO' },
  { at: '09:47', label: 'Failover to secondary provider enabled', by: PLATFORM_ADMIN.name },
  { at: '10:15', label: 'Failure rate falling — monitoring', by: PLATFORM_ADMIN.name }]

},
{
  id: 'inc-114',
  title: 'Spruce adapter timeout for Hill Country',
  severity: 'Medium',
  service: 'ERP Integrations',
  status: 'Identified',
  started: '06:15',
  affectedOrgs: ['sup-hillcountry'],
  description:
  "The tenant's Spruce instance is not responding to inventory reads within the adapter timeout. No partial writes occurred.",
  timeline: [
  { at: '06:15', label: 'Third consecutive inventory sync failed', by: 'SM PRO' },
  { at: '07:02', label: 'Traced to tenant-side ERP maintenance window', by: PLATFORM_ADMIN.name },
  { at: '08:30', label: 'Tenant notified; sync paused rather than retried indefinitely', by: PLATFORM_ADMIN.name }]

},
{
  id: 'inc-109',
  title: 'Elevated API latency in us-east',
  severity: 'Low',
  service: 'API',
  status: 'Resolved',
  started: 'Yesterday 14:20',
  affectedOrgs: [],
  description: 'P95 latency reached 900ms for 40 minutes during a deploy.',
  timeline: [
  { at: '14:20', label: 'Latency alarm raised', by: 'SM PRO' },
  { at: '14:31', label: 'Rollout paused', by: PLATFORM_ADMIN.name },
  { at: '15:00', label: 'Latency normalised, rollout resumed', by: PLATFORM_ADMIN.name }],

  resolution: 'Connection pool sizing corrected in the release. No tenant data affected.'
}];


/* ------------------------------------------------------------------ */

export const SUPPORT_CASES: SupportCase[] = [
{
  id: 'SC-2201',
  orgId: 'sup-hillcountry',
  subject: 'Inventory has not synced since 06:15',
  detail:
  'Estimators are quoting against stale stock. Yard is asking whether they should stop quoting until the sync recovers.',
  priority: 'High',
  status: 'Investigating',
  assignee: PLATFORM_ADMIN.name,
  reporter: 'Denise Park · Hill Country Building Supply',
  created: '07:20',
  related: [
  { label: 'Incident', value: 'inc-114' },
  { label: 'Sync error', value: 'se-88' },
  { label: 'Integration', value: 'ECI Spruce' }],

  timeline: [
  { at: '07:20', label: 'Case opened by tenant administrator', by: 'Denise Park' },
  { at: '07:35', label: 'Linked to incident inc-114', by: PLATFORM_ADMIN.name },
  { at: '08:30', label: 'Advised tenant that quoting is safe; stock figures marked stale in the UI', by: PLATFORM_ADMIN.name }]

},
{
  id: 'SC-2199',
  orgId: 'bld-crestline',
  subject: 'Takeoff failed on a scanned sheet',
  detail: 'TK-1044 stopped at sheet A-107. Tenant asking whether they need to re-scan the whole set.',
  priority: 'Medium',
  status: 'Assigned',
  assignee: 'Sofia Marchetti',
  reporter: 'Nora Sandoval · Crestline Development',
  created: '10:11',
  related: [
  { label: 'AI job', value: 'aj-9818' },
  { label: 'AI issue', value: 'ai-401' },
  { label: 'Takeoff', value: 'TK-1044' }],

  timeline: [
  { at: '10:11', label: 'Case opened from the failure screen', by: 'Nora Sandoval' },
  { at: '10:18', label: 'Assigned to Sofia Marchetti', by: PLATFORM_ADMIN.name }]

},
{
  id: 'SC-2194',
  orgId: 'sup-northstar',
  subject: 'Requesting reactivation after payment',
  detail: 'Tenant states the November balance was settled by wire on Monday and is asking to be reinstated.',
  priority: 'High',
  status: 'Escalated',
  assignee: PLATFORM_ADMIN.name,
  reporter: 'Priya Venkat · Northstar Lumber Co.',
  created: 'Yesterday',
  related: [{ label: 'Organization status', value: 'Suspended — non-payment' }],
  timeline: [
  { at: 'Yesterday 15:40', label: 'Case opened', by: 'Priya Venkat' },
  { at: 'Yesterday 16:20', label: 'Escalated to platform admin — requires finance confirmation', by: 'Sofia Marchetti' }]

},
{
  id: 'SC-2190',
  orgId: 'bld-westline',
  subject: 'AI Takeoff no longer available',
  detail: 'Tenant asking why the takeoff module has disappeared for their organization.',
  priority: 'Medium',
  status: 'Waiting',
  assignee: 'Sofia Marchetti',
  reporter: 'Tom Aldridge · Westline Residential',
  created: '2 days ago',
  related: [{ label: 'Entitlement', value: 'ai_takeoff override → off' }],
  timeline: [
  { at: '2 days ago', label: 'Case opened', by: 'Tom Aldridge' },
  { at: '2 days ago', label: 'Holding response sent while the usage review completes', by: 'Sofia Marchetti' }]

},
{
  id: 'SC-2185',
  orgId: 'sup-abc',
  subject: 'Add a fourth yard to the subscription',
  detail: 'Tenant is opening a Georgetown yard next month and wants the branch limit confirmed.',
  priority: 'Low',
  status: 'Resolved',
  assignee: PLATFORM_ADMIN.name,
  reporter: 'Ray Delgado · ABC Lumber & Supply',
  created: '4 days ago',
  related: [{ label: 'Subscription', value: 'Professional · 3 of 10 branches' }],
  timeline: [
  { at: '4 days ago', label: 'Case opened', by: 'Ray Delgado' },
  { at: '4 days ago', label: 'Confirmed headroom within the Professional plan — no change needed', by: PLATFORM_ADMIN.name }]

}];


export const SECURITY_EVENTS: SecurityEvent[] = [
{
  id: 'sec-901',
  kind: 'Cross-tenant access attempt',
  severity: 'Critical',
  orgId: 'sup-hillcountry',
  actor: 'API key hc_live_…4f2a',
  detail:
  'Request read quote QT-4102 belonging to ABC Lumber & Supply. Tenant scope rejected the query before it reached data.',
  at: '08:14',
  outcome: 'Blocked'
},
{
  id: 'sec-898',
  kind: 'Failed login',
  severity: 'Medium',
  orgId: 'bld-westline',
  actor: 'tom@westlineres.com',
  detail: 'Five failed attempts in four minutes from a single address. Account locked automatically.',
  at: '2 days ago',
  outcome: 'Blocked'
},
{
  id: 'sec-896',
  kind: 'Organization suspended',
  severity: 'High',
  orgId: 'sup-northstar',
  actor: PLATFORM_ADMIN.name,
  detail: 'Suspended for non-payment after three failed collections.',
  at: '9 days ago',
  outcome: 'Recorded'
},
{
  id: 'sec-894',
  kind: 'Permission change',
  severity: 'Medium',
  orgId: 'sup-abc',
  actor: 'Ray Delgado',
  detail: 'Granted Accounting role to lena@abclumber.com in addition to Customer Service.',
  at: '3 days ago',
  outcome: 'Allowed'
},
{
  id: 'sec-890',
  kind: 'Support session',
  severity: 'High',
  orgId: 'sup-hillcountry',
  actor: PLATFORM_ADMIN.name,
  detail: 'Controlled support session opened for 14 minutes to inspect the failing Spruce connection.',
  at: 'Yesterday',
  outcome: 'Recorded'
},
{
  id: 'sec-887',
  kind: 'API security event',
  severity: 'Low',
  orgId: 'sup-cascade',
  actor: 'API key cm_live_…9b31',
  detail: 'Rate limit exceeded on the products endpoint. Throttled, not blocked.',
  at: 'Yesterday',
  outcome: 'Recorded'
}];


export const ISOLATION: IsolationCheck[] = ORGANIZATIONS.filter((o) => o.kind === 'supplier').map(
  (o) => ({
    orgId: o.id,
    status: o.id === 'sup-hillcountry' ? 'Violation' : 'Isolated',
    lastTest: o.id === 'sup-redriver' ? 'Pending first test' : '06:00 today',
    blockedRequests: o.id === 'sup-hillcountry' ? 1 : 0,
    violations: o.id === 'sup-hillcountry' ? 1 : 0
  })
);

export const AUDIT_LOG: AuditEntry[] = [
{
  id: 'au-4410',
  at: '10:20',
  actor: PLATFORM_ADMIN.name,
  action: 'Queue policy changed',
  module: 'AI Management',
  object: 'Vision failure handling',
  before: 'Fail after 3 retries',
  after: 'Hold in queue',
  reason: 'Avoid consuming tenant AI allowance during inc-118',
  severity: 'High'
},
{
  id: 'au-4408',
  at: '09:47',
  actor: PLATFORM_ADMIN.name,
  action: 'Integration failover enabled',
  module: 'Integrations',
  object: 'Twilio Notify → secondary provider',
  before: 'Primary only',
  after: 'Failover enabled',
  reason: 'inc-117',
  severity: 'Medium'
},
{
  id: 'au-4404',
  at: 'Yesterday 16:05',
  actor: PLATFORM_ADMIN.name,
  action: 'Support session ended',
  module: 'Support',
  orgId: 'sup-hillcountry',
  object: '14-minute controlled session',
  reason: 'SC-2201 — inventory sync investigation',
  severity: 'High'
},
{
  id: 'au-4400',
  at: '2 days ago',
  actor: PLATFORM_ADMIN.name,
  action: 'Feature entitlement disabled',
  module: 'Entitlements',
  orgId: 'bld-westline',
  object: 'AI Takeoff',
  before: 'Enabled',
  after: 'Disabled',
  reason: 'Usage investigation — duplicate plan-set runs',
  severity: 'Critical'
},
{
  id: 'au-4396',
  at: '3 days ago',
  actor: 'Ray Delgado',
  action: 'Role granted',
  module: 'Users & Access',
  orgId: 'sup-abc',
  object: 'lena@abclumber.com',
  before: 'Customer Service',
  after: 'Customer Service, Accounting',
  severity: 'Medium'
},
{
  id: 'au-4390',
  at: '9 days ago',
  actor: PLATFORM_ADMIN.name,
  action: 'Organization suspended',
  module: 'Organizations',
  orgId: 'sup-northstar',
  object: 'Northstar Lumber Co.',
  before: 'Active',
  after: 'Suspended',
  reason: 'Non-payment — three failed collections',
  severity: 'Critical'
},
{
  id: 'au-4381',
  at: '3 weeks ago',
  actor: PLATFORM_ADMIN.name,
  action: 'Organization created',
  module: 'Organizations',
  orgId: 'sup-gulf',
  object: 'Gulf Coast Truss & Component',
  after: 'Trial · Starter',
  severity: 'Medium'
}];


export const ADMIN_NOTIFICATIONS: AdminNotification[] = [
{
  id: 'an-1',
  priority: 'Critical',
  title: 'Cross-tenant access attempt blocked',
  body: 'Hill Country API key attempted to read an ABC Lumber quote. Scope rejected the query.',
  at: '08:14',
  read: false,
  to: 'Security'
},
{
  id: 'an-2',
  priority: 'High',
  title: 'AI processing degraded',
  body: 'Vision service returning 503 on ~6% of requests. Two runs failed, one retrying.',
  at: '09:52',
  read: false,
  to: 'Operations'
},
{
  id: 'an-3',
  priority: 'High',
  title: 'Spruce sync failing for Hill Country',
  body: 'Three consecutive inventory syncs timed out. No partial writes.',
  at: '06:15',
  read: false,
  to: 'Integrations'
},
{
  id: 'an-4',
  priority: 'High',
  title: 'Support case escalated',
  body: 'SC-2194 — Northstar requesting reactivation after payment.',
  at: 'Yesterday',
  read: false,
  to: 'Support'
},
{
  id: 'an-5',
  priority: 'Medium',
  title: 'Trial ending in 8 days',
  body: 'Gulf Coast Truss & Component is on a Starter trial with 214 sheets used.',
  at: 'Yesterday',
  read: true,
  to: 'Commercial'
},
{
  id: 'an-6',
  priority: 'Low',
  title: 'New organization created',
  body: 'Red River Supply registered and is awaiting administrator activation.',
  at: '2 days ago',
  read: true,
  to: 'Commercial'
}];


export const PLATFORM_ACTIVITY = [
{ at: '10:44', label: 'Cascade Materials Spruce sync started', org: 'sup-cascade' },
{ at: '10:32', label: 'AI takeoff TK-1024 began processing', org: 'bld-abc' },
{ at: '10:20', label: 'AI queue policy changed by platform admin', org: undefined },
{ at: '10:11', label: 'Support case SC-2199 opened', org: 'bld-crestline' },
{ at: '09:52', label: 'Incident inc-118 opened on AI Processing', org: undefined },
{ at: '08:14', label: 'Cross-tenant access attempt blocked', org: 'sup-hillcountry' },
{ at: '2 days ago', label: 'AI Takeoff withdrawn from Westline Residential', org: 'bld-westline' }];