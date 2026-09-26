import {
  ActivityIcon,
  AlertTriangleIcon,
  BuildingIcon,
  CpuIcon,
  FlagIcon,
  GaugeIcon,
  HeadsetIcon,
  KeyIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  PlugIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
  UsersIcon,
  WarehouseIcon } from
'lucide-react';

export interface AdminModule {
  id: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboardIcon;
  description: string;
  match?: string[];
}

export interface AdminNavGroup {
  id: string;
  label: string;
  modules: AdminModule[];
}

/**
 * The control plane's spine. Grouped by what the platform team is doing:
 * watching it, governing its tenants, licensing them, running the machinery,
 * and holding the record.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
{
  id: 'watch',
  label: 'Watch',
  modules: [
  {
    id: 'dashboard',
    label: 'Control centre',
    path: '/admin/dashboard',
    icon: LayoutDashboardIcon,
    description: 'What is happening across the platform right now'
  },
  {
    id: 'overview',
    label: 'Platform overview',
    path: '/admin/overview',
    icon: GaugeIcon,
    description: 'Volumes across every tenant'
  }]

},
{
  id: 'tenants',
  label: 'Tenants',
  modules: [
  {
    id: 'suppliers',
    label: 'Suppliers',
    path: '/admin/suppliers',
    icon: WarehouseIcon,
    description: 'Lumber yard organizations',
    match: ['/admin/suppliers']
  },
  {
    id: 'builders',
    label: 'Builders',
    path: '/admin/builders',
    icon: BuildingIcon,
    description: 'Construction organizations',
    match: ['/admin/builders']
  },
  {
    id: 'users',
    label: 'Users & access',
    path: '/admin/users',
    icon: UsersIcon,
    description: 'Platform-level account state'
  }]

},
{
  id: 'commercial',
  label: 'Commercial',
  modules: [
  {
    id: 'plans',
    label: 'Plans',
    path: '/admin/plans',
    icon: LayersIcon,
    description: 'Licensing tiers and limits'
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    path: '/admin/subscriptions',
    icon: TrendingUpIcon,
    description: 'Usage against every licence'
  },
  {
    id: 'entitlements',
    label: 'Entitlements',
    path: '/admin/entitlements',
    icon: KeyIcon,
    description: 'Feature access per organization'
  }]

},
{
  id: 'ai',
  label: 'AI',
  modules: [
  {
    id: 'ai-overview',
    label: 'AI management',
    path: '/admin/ai',
    icon: CpuIcon,
    description: 'Runs, accuracy and usage'
  },
  {
    id: 'ai-jobs',
    label: 'Run monitor',
    path: '/admin/ai/jobs',
    icon: ListChecksIcon,
    description: 'Every model run, live'
  },
  {
    id: 'ai-config',
    label: 'AI configuration',
    path: '/admin/ai/config',
    icon: SlidersHorizontalIcon,
    description: 'Model, thresholds and limits'
  },
  {
    id: 'ai-issues',
    label: 'AI issues',
    path: '/admin/ai/issues',
    icon: AlertTriangleIcon,
    description: 'Failures and low-confidence runs'
  }]

},
{
  id: 'ops',
  label: 'Operations',
  modules: [
  {
    id: 'integrations',
    label: 'Integrations',
    path: '/admin/integrations',
    icon: PlugIcon,
    description: 'Adapters, sync state and errors'
  },
  {
    id: 'queue',
    label: 'Jobs & queue',
    path: '/admin/queue',
    icon: ListChecksIcon,
    description: 'Everything running in the background'
  },
  {
    id: 'health',
    label: 'System health',
    path: '/admin/health',
    icon: ActivityIcon,
    description: 'Service state and incidents',
    match: ['/admin/health', '/admin/incidents']
  }]

},
{
  id: 'governance',
  label: 'Governance',
  modules: [
  {
    id: 'support',
    label: 'Support',
    path: '/admin/support',
    icon: HeadsetIcon,
    description: 'Cases and controlled access',
    match: ['/admin/support']
  },
  {
    id: 'security',
    label: 'Security',
    path: '/admin/security',
    icon: ShieldIcon,
    description: 'Events and tenant isolation'
  },
  {
    id: 'audit',
    label: 'Audit log',
    path: '/admin/audit',
    icon: ScrollTextIcon,
    description: 'Who changed what, with before and after'
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/admin/reports',
    icon: TrendingUpIcon,
    description: 'Organizations, usage, revenue, operations'
  },
  {
    id: 'flags',
    label: 'Feature flags',
    path: '/admin/flags',
    icon: FlagIcon,
    description: 'Rollout by global, plan or organization'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/admin/settings',
    icon: SettingsIcon,
    description: 'Platform configuration'
  }]

}];


export const ADMIN_MODULES = ADMIN_NAV.flatMap((g) => g.modules);