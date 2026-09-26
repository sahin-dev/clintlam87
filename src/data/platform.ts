import {
  FeatureDef,
  FeatureFlag,
  FeatureId,
  Organization,
  Plan,
  PlatformUser } from
'../types/admin';
import { PARTNERSHIP } from './interop';

/**
 * The platform's own record of its tenants, licensing and entitlements.
 *
 * `org-1` (ABC Construction) and `sup-abc` (ABC Lumber & Supply) are the two
 * organizations the Builder and Supplier platforms run as, so anything the
 * Super Admin does to them is visibly the same tenant.
 */

export const PLATFORM_ADMIN = {
  name: 'Hasnain Rahman',
  email: 'hasnain@smpro.build',
  role: 'Platform Administrator'
};

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

export const FEATURES: FeatureDef[] = [
{
  id: 'ai_takeoff',
  label: 'AI Takeoff',
  description: 'Drawing analysis producing measured quantities with source traceability.',
  disruptive: true
},
{
  id: 'ai_advanced_review',
  label: 'Advanced AI Review',
  description: 'Attribute-level confidence, cross-sheet reconciliation and the verification centre.',
  disruptive: true
},
{
  id: 'ai_assistant',
  label: 'AI Assistant',
  description: 'Conversational lookup across projects, takeoffs, quotes and invoices.',
  disruptive: false
},
{
  id: 'erp_integration',
  label: 'ERP Integration',
  description: 'ECI Spruce and other adapters for products, stock, orders and invoices.',
  disruptive: true
},
{
  id: 'multi_branch',
  label: 'Multi-Branch',
  description: 'More than one yard or branch, each with its own stock and dispatch scope.',
  disruptive: true
},
{
  id: 'advanced_pricing',
  label: 'Advanced Pricing',
  description: 'Customer contract pricing, volume breaks and margin rules.',
  disruptive: false
},
{
  id: 'advanced_reporting',
  label: 'Advanced Reporting',
  description: 'Estimating accuracy, fulfilment performance and financial aging.',
  disruptive: false
},
{
  id: 'delivery_tracking',
  label: 'Delivery Tracking',
  description: 'Dispatch board, driver runs and proof of delivery.',
  disruptive: true
},
{
  id: 'payments',
  label: 'Payments',
  description: 'Card and ACH collection against issued invoices.',
  disruptive: true
}];


export const FEATURE_LABEL: Record<FeatureId, string> = FEATURES.reduce(
  (acc, f) => ({ ...acc, [f.id]: f.label }),
  {} as Record<FeatureId, string>
);

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */

export const PLANS: Plan[] = [
{
  id: 'starter',
  name: 'Starter',
  price: 490,
  limits: { builderCompanies: 5, branches: 1, users: 10, storage: 50, aiSheets: 400 },
  features: ['ai_takeoff', 'delivery_tracking'],
  support: 'Standard'
},
{
  id: 'growth',
  name: 'Growth',
  price: 1250,
  limits: { builderCompanies: 12, branches: 3, users: 25, storage: 200, aiSheets: 1500 },
  features: ['ai_takeoff', 'delivery_tracking', 'payments', 'multi_branch', 'advanced_pricing'],
  support: 'Standard'
},
{
  id: 'professional',
  name: 'Professional',
  price: 2900,
  limits: { builderCompanies: 25, branches: 10, users: 50, storage: 500, aiSheets: 4000 },
  features: [
  'ai_takeoff',
  'ai_advanced_review',
  'ai_assistant',
  'delivery_tracking',
  'payments',
  'multi_branch',
  'advanced_pricing',
  'advanced_reporting',
  'erp_integration'],

  support: 'Priority'
},
{
  id: 'enterprise',
  name: 'Enterprise',
  price: 6400,
  limits: { builderCompanies: 100, branches: 40, users: 250, storage: 2000, aiSheets: 18000 },
  features: FEATURES.map((f) => f.id),
  support: 'Dedicated'
}];


export const PLAN_BY_ID = PLANS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<string, Plan>
);

/* ------------------------------------------------------------------ */
/* Organizations                                                       */
/* ------------------------------------------------------------------ */

export const ORGANIZATIONS: Organization[] = [
{
  /* The tenant the Supplier platform runs as. */
  id: 'sup-abc',
  kind: 'supplier',
  name: PARTNERSHIP.supplierOrgName,
  status: 'Active',
  planId: 'professional',
  region: 'Texas',
  address: '4820 Industrial Blvd, Austin, TX 78744',
  contact: 'Ray Delgado',
  contactEmail: 'ray@abclumber.com',
  admin: { name: 'Ray Delgado', email: 'ray@abclumber.com' },
  created: 'Mar 2024',
  lastActive: '4 min ago',
  /* These counts mirror what the Supplier tenant actually holds — five shared
     projects, five builder customers, eight staff across three yards. */
  projects: 5,
  usage: { builderCompanies: 5, branches: 3, users: 8, storage: 318, aiSheets: 2880 },
  partners: ['bld-abc', 'bld-hallmark', 'bld-crestline'],
  overrides: {},
  subscription: { started: '12 Mar 2024', renews: '12 Mar 2027', mrr: 2900, seats: 50 },
  erp: 'ECI Spruce',
  branches: [
  {
    id: 'br-austin',
    name: 'Austin Main Yard',
    location: 'Austin, TX',
    status: 'Active',
    users: 5,
    orders30d: 148,
    deliveries30d: 212,
    created: 'Mar 2024'
  },
  {
    id: 'br-roundrock',
    name: 'Round Rock',
    location: 'Round Rock, TX',
    status: 'Active',
    users: 2,
    orders30d: 61,
    deliveries30d: 88,
    created: 'Aug 2024'
  },
  {
    id: 'br-sanmarcos',
    name: 'San Marcos',
    location: 'San Marcos, TX',
    status: 'Active',
    users: 1,
    orders30d: 34,
    deliveries30d: 47,
    created: 'Feb 2025'
  }]

},
{
  id: 'sup-hillcountry',
  kind: 'supplier',
  name: 'Hill Country Building Supply',
  status: 'Active',
  planId: 'growth',
  region: 'Texas',
  address: '1180 Ranch Road 12, San Marcos, TX',
  contact: 'Denise Park',
  contactEmail: 'denise@hillcountrybs.com',
  admin: { name: 'Denise Park', email: 'denise@hillcountrybs.com' },
  created: 'Jun 2024',
  lastActive: '22 min ago',
  projects: 19,
  usage: { builderCompanies: 11, branches: 2, users: 21, storage: 142, aiSheets: 1410 },
  partners: ['bld-hallmark', 'bld-crestline'],
  overrides: { advanced_reporting: true },
  subscription: { started: '02 Jun 2024', renews: '02 Jun 2026', mrr: 1250, seats: 25 },
  erp: 'ECI Spruce',
  branches: [
  {
    id: 'hc-main',
    name: 'San Marcos Yard',
    location: 'San Marcos, TX',
    status: 'Active',
    users: 14,
    orders30d: 72,
    deliveries30d: 96,
    created: 'Jun 2024'
  },
  {
    id: 'hc-kyle',
    name: 'Kyle Depot',
    location: 'Kyle, TX',
    status: 'Active',
    users: 7,
    orders30d: 28,
    deliveries30d: 41,
    created: 'Jan 2025'
  }]

},
{
  id: 'sup-gulf',
  kind: 'supplier',
  name: 'Gulf Coast Truss & Component',
  status: 'Trial',
  planId: 'starter',
  region: 'Texas Gulf',
  address: '900 Port Rd, Houston, TX',
  contact: 'Marcus Oyelaran',
  contactEmail: 'marcus@gulfcoasttruss.com',
  admin: { name: 'Marcus Oyelaran', email: 'marcus@gulfcoasttruss.com' },
  created: '3 weeks ago',
  lastActive: '2 hours ago',
  projects: 4,
  usage: { builderCompanies: 3, branches: 1, users: 6, storage: 18, aiSheets: 214 },
  partners: ['bld-crestline'],
  overrides: { ai_advanced_review: true },
  subscription: { started: '11 Aug 2026', renews: '11 Sep 2026', mrr: 0, seats: 10 },
  erp: 'None',
  branches: [
  {
    id: 'gc-main',
    name: 'Houston Plant',
    location: 'Houston, TX',
    status: 'Active',
    users: 6,
    orders30d: 9,
    deliveries30d: 12,
    created: '3 weeks ago'
  }]

},
{
  id: 'sup-northstar',
  kind: 'supplier',
  name: 'Northstar Lumber Co.',
  status: 'Suspended',
  planId: 'growth',
  region: 'Oklahoma',
  address: '77 Mill St, Tulsa, OK',
  contact: 'Priya Venkat',
  contactEmail: 'priya@northstarlumber.com',
  admin: { name: 'Priya Venkat', email: 'priya@northstarlumber.com' },
  created: 'Nov 2024',
  lastActive: '9 days ago',
  projects: 12,
  usage: { builderCompanies: 7, branches: 2, users: 15, storage: 96, aiSheets: 0 },
  partners: [],
  overrides: {},
  subscription: { started: '04 Nov 2024', renews: '04 Nov 2026', mrr: 1250, seats: 25 },
  statusReason: {
    reason: 'Non-payment',
    note: 'Three consecutive failed collections on the Nov renewal. Accounts contacted 9 days ago; no response.',
    by: PLATFORM_ADMIN.name,
    at: '9 days ago'
  },
  erp: 'None',
  branches: [
  {
    id: 'ns-tulsa',
    name: 'Tulsa Yard',
    location: 'Tulsa, OK',
    status: 'Suspended',
    users: 11,
    orders30d: 0,
    deliveries30d: 0,
    created: 'Nov 2024'
  },
  {
    id: 'ns-broken',
    name: 'Broken Arrow',
    location: 'Broken Arrow, OK',
    status: 'Suspended',
    users: 4,
    orders30d: 0,
    deliveries30d: 0,
    created: 'Mar 2025'
  }]

},
{
  id: 'sup-cascade',
  kind: 'supplier',
  name: 'Cascade Materials Group',
  status: 'Active',
  planId: 'enterprise',
  region: 'Pacific Northwest',
  address: '2100 Harbour Way, Portland, OR',
  contact: 'Ellen Boothe',
  contactEmail: 'ellen@cascadematerials.com',
  admin: { name: 'Ellen Boothe', email: 'ellen@cascadematerials.com' },
  created: 'Jan 2024',
  lastActive: '11 min ago',
  projects: 88,
  usage: { builderCompanies: 46, branches: 3, users: 83, storage: 1180, aiSheets: 11400 },
  partners: ['bld-westline'],
  overrides: {},
  subscription: { started: '18 Jan 2024', renews: '18 Jan 2027', mrr: 6400, seats: 250 },
  erp: 'ECI Spruce',
  branches: [
  {
    id: 'cm-portland',
    name: 'Portland Central',
    location: 'Portland, OR',
    status: 'Active',
    users: 52,
    orders30d: 412,
    deliveries30d: 580,
    created: 'Jan 2024'
  },
  {
    id: 'cm-salem',
    name: 'Salem',
    location: 'Salem, OR',
    status: 'Active',
    users: 31,
    orders30d: 208,
    deliveries30d: 290,
    created: 'Apr 2024'
  },
  {
    id: 'cm-vancouver',
    name: 'Vancouver WA',
    location: 'Vancouver, WA',
    status: 'Archived',
    users: 0,
    orders30d: 0,
    deliveries30d: 0,
    created: 'Jul 2024'
  }]

},
{
  id: 'sup-redriver',
  kind: 'supplier',
  name: 'Red River Supply',
  status: 'Pending',
  planId: 'starter',
  region: 'Louisiana',
  address: '450 Levee Rd, Shreveport, LA',
  contact: 'Andre Fontenot',
  contactEmail: 'andre@redriversupply.com',
  admin: { name: 'Andre Fontenot', email: 'andre@redriversupply.com' },
  created: '2 days ago',
  lastActive: 'Never',
  projects: 0,
  usage: { builderCompanies: 0, branches: 1, users: 1, storage: 0, aiSheets: 0 },
  partners: [],
  overrides: {},
  erp: 'None',
  branches: [
  {
    id: 'rr-main',
    name: 'Shreveport Yard',
    location: 'Shreveport, LA',
    status: 'Active',
    users: 1,
    orders30d: 0,
    deliveries30d: 0,
    created: '2 days ago'
  }]

},

/* Builder organizations. Licensed through the supplier relationship, so they
   carry no plan of their own. */
{
  id: 'bld-abc',
  kind: 'builder',
  name: PARTNERSHIP.builderOrgName,
  status: 'Active',
  region: 'Texas',
  address: '1420 Congress Ave, Austin, TX 78701',
  contact: 'Alex Whitfield',
  contactEmail: 'alex@abcconstruction.com',
  admin: { name: 'Alex Whitfield', email: 'alex@abcconstruction.com' },
  created: 'Mar 2024',
  lastActive: '2 min ago',
  /* Mirrors the Builder tenant: four projects, six people, two offices. */
  projects: 4,
  usage: { builderCompanies: 0, branches: 2, users: 6, storage: 74, aiSheets: 486 },
  partners: ['sup-abc'],
  overrides: {},
  erp: 'None',
  branches: [
  {
    id: 'bab-austin',
    name: 'Austin Office',
    location: 'Austin, TX',
    status: 'Active',
    users: 4,
    orders30d: 14,
    deliveries30d: 22,
    created: 'Mar 2024'
  },
  {
    id: 'bab-sa',
    name: 'San Antonio',
    location: 'San Antonio, TX',
    status: 'Active',
    users: 2,
    orders30d: 4,
    deliveries30d: 6,
    created: 'Oct 2024'
  }]

},
{
  id: 'bld-hallmark',
  kind: 'builder',
  name: 'Hallmark Homes',
  status: 'Active',
  region: 'Texas',
  address: '55 Congress Ave, Austin, TX',
  contact: 'Wei Tan',
  contactEmail: 'wei@hallmarkhomes.com',
  admin: { name: 'Wei Tan', email: 'wei@hallmarkhomes.com' },
  created: 'May 2024',
  lastActive: '1 hour ago',
  projects: 9,
  usage: { builderCompanies: 0, branches: 1, users: 21, storage: 138, aiSheets: 1104 },
  partners: ['sup-abc', 'sup-hillcountry'],
  overrides: {},
  erp: 'None',
  branches: [
  {
    id: 'hh-main',
    name: 'Austin HQ',
    location: 'Austin, TX',
    status: 'Active',
    users: 21,
    orders30d: 32,
    deliveries30d: 44,
    created: 'May 2024'
  }]

},
{
  id: 'bld-crestline',
  kind: 'builder',
  name: 'Crestline Development',
  status: 'Active',
  region: 'Texas',
  address: '2200 Bee Cave Rd, West Lake Hills, TX',
  contact: 'Nora Sandoval',
  contactEmail: 'nora@crestlinedev.com',
  admin: { name: 'Nora Sandoval', email: 'nora@crestlinedev.com' },
  created: 'Sep 2024',
  lastActive: '3 hours ago',
  projects: 14,
  usage: { builderCompanies: 0, branches: 2, users: 28, storage: 194, aiSheets: 1620 },
  partners: ['sup-abc', 'sup-hillcountry', 'sup-gulf'],
  overrides: {},
  erp: 'None',
  branches: [
  {
    id: 'cd-main',
    name: 'West Lake Hills',
    location: 'West Lake Hills, TX',
    status: 'Active',
    users: 20,
    orders30d: 41,
    deliveries30d: 58,
    created: 'Sep 2024'
  },
  {
    id: 'cd-nb',
    name: 'New Braunfels',
    location: 'New Braunfels, TX',
    status: 'Active',
    users: 8,
    orders30d: 12,
    deliveries30d: 19,
    created: 'Feb 2025'
  }]

},
{
  id: 'bld-westline',
  kind: 'builder',
  name: 'Westline Residential',
  status: 'Restricted',
  region: 'Oregon',
  address: '810 SW Alder St, Portland, OR',
  contact: 'Tom Aldridge',
  contactEmail: 'tom@westlineres.com',
  admin: { name: 'Tom Aldridge', email: 'tom@westlineres.com' },
  created: 'Feb 2025',
  lastActive: '2 days ago',
  projects: 6,
  usage: { builderCompanies: 0, branches: 1, users: 9, storage: 41, aiSheets: 302 },
  partners: ['sup-cascade'],
  overrides: { ai_takeoff: false },
  statusReason: {
    reason: 'Usage investigation',
    note: 'Unusual volume of takeoff runs against duplicate plan sets. AI Takeoff withdrawn while the pattern is reviewed.',
    by: PLATFORM_ADMIN.name,
    at: '2 days ago'
  },
  erp: 'None',
  branches: [
  {
    id: 'wl-main',
    name: 'Portland Office',
    location: 'Portland, OR',
    status: 'Active',
    users: 9,
    orders30d: 7,
    deliveries30d: 11,
    created: 'Feb 2025'
  }]

}];


export const ORG_BY_ID = ORGANIZATIONS.reduce(
  (acc, o) => ({ ...acc, [o.id]: o }),
  {} as Record<string, Organization>
);

export const orgName = (id?: string) => id ? ORG_BY_ID[id]?.name ?? id : '—';

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export const PLATFORM_USERS: PlatformUser[] = [
{
  id: 'pu-1',
  name: 'Ray Delgado',
  email: 'ray@abclumber.com',
  orgId: 'sup-abc',
  branch: 'Austin Main Yard',
  roles: ['Administrator', 'Owner / Management'],
  status: 'Active',
  lastActive: '4 min ago',
  created: 'Mar 2024'
},
{
  id: 'pu-2',
  name: 'Miguel Santos',
  email: 'miguel@abclumber.com',
  orgId: 'sup-abc',
  branch: 'Austin Main Yard',
  roles: ['Estimator'],
  status: 'Active',
  lastActive: '18 min ago',
  created: 'Apr 2024'
},
{
  id: 'pu-3',
  name: 'Karen Osei',
  email: 'karen@abclumber.com',
  orgId: 'sup-abc',
  branch: 'Austin Main Yard',
  roles: ['Dispatcher'],
  status: 'Active',
  lastActive: '6 min ago',
  created: 'Apr 2024'
},
{
  id: 'pu-4',
  name: 'Alex Whitfield',
  email: 'alex@abcconstruction.com',
  orgId: 'bld-abc',
  branch: 'Austin Office',
  roles: ['Owner', 'Purchasing Manager', 'Accountant'],
  status: 'Active',
  lastActive: '2 min ago',
  created: 'Mar 2024'
},
{
  id: 'pu-5',
  name: 'Priya Venkat',
  email: 'priya@northstarlumber.com',
  orgId: 'sup-northstar',
  branch: 'Tulsa Yard',
  roles: ['Administrator'],
  status: 'Disabled',
  lastActive: '9 days ago',
  created: 'Nov 2024'
},
{
  id: 'pu-6',
  name: 'Tom Aldridge',
  email: 'tom@westlineres.com',
  orgId: 'bld-westline',
  branch: 'Portland Office',
  roles: ['Owner'],
  status: 'Locked',
  lastActive: '2 days ago',
  created: 'Feb 2025'
},
{
  id: 'pu-7',
  name: 'Ellen Boothe',
  email: 'ellen@cascadematerials.com',
  orgId: 'sup-cascade',
  branch: 'Portland Central',
  roles: ['Administrator', 'Owner / Management'],
  status: 'Active',
  lastActive: '11 min ago',
  created: 'Jan 2024'
},
{
  id: 'pu-8',
  name: 'Andre Fontenot',
  email: 'andre@redriversupply.com',
  orgId: 'sup-redriver',
  branch: 'Shreveport Yard',
  roles: ['Administrator'],
  status: 'Invited',
  lastActive: 'Never',
  created: '2 days ago'
},
{
  id: 'pu-9',
  name: 'Denise Park',
  email: 'denise@hillcountrybs.com',
  orgId: 'sup-hillcountry',
  branch: 'San Marcos Yard',
  roles: ['Administrator', 'Sales Representative'],
  status: 'Active',
  lastActive: '22 min ago',
  created: 'Jun 2024'
},
{
  id: 'pu-10',
  name: 'Nora Sandoval',
  email: 'nora@crestlinedev.com',
  orgId: 'bld-crestline',
  branch: 'West Lake Hills',
  roles: ['Owner', 'Project Manager'],
  status: 'Active',
  lastActive: '3 hours ago',
  created: 'Sep 2024'
}];


/* ------------------------------------------------------------------ */
/* Feature flags                                                       */
/* ------------------------------------------------------------------ */

export const FEATURE_FLAGS: FeatureFlag[] = [
{
  id: 'takeoff_v2',
  label: 'AI Takeoff v2',
  description: 'Second-generation detection model with per-attribute confidence on openings.',
  scope: 'Organization',
  enabled: true,
  targets: ['sup-cascade', 'sup-abc']
},
{
  id: 'advanced_reconciliation',
  label: 'Advanced reconciliation',
  description: 'Cross-sheet schedule matching beyond doors and windows.',
  scope: 'Global',
  enabled: true,
  targets: []
},
{
  id: 'pricing_engine_v2',
  label: 'New pricing engine',
  description: 'Volume-break and margin-floor evaluation moved server-side.',
  scope: 'Global',
  enabled: false,
  targets: []
},
{
  id: 'driver_offline',
  label: 'Offline driver runs',
  description: 'Drivers capture POD without connectivity and sync on return to coverage.',
  scope: 'Organization',
  enabled: true,
  targets: ['sup-cascade']
},
{
  id: 'builder_multi_supplier_rfq',
  label: 'Multi-supplier RFQ',
  description: 'Builders may issue one RFQ to several yards at once.',
  scope: 'Plan',
  enabled: true,
  targets: ['professional', 'enterprise']
}];


/** Resolves a feature for an organization: plan grant, then override. */
export function featureEnabled(org: Organization, feature: FeatureId): boolean {
  if (feature in org.overrides) return Boolean(org.overrides[feature]);
  if (!org.planId) return false;
  return PLAN_BY_ID[org.planId].features.includes(feature);
}