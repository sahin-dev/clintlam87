import {
  BellIcon,
  BuildingIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  FileTextIcon,
  HardHatIcon,
  LayersIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MessageSquareIcon,
  PackageIcon,
  ReceiptIcon,
  ScanSearchIcon,
  ShoppingCartIcon,
  TruckIcon,
  UserIcon,
  UsersIcon } from
'lucide-react';
import { Permission, RoleId } from '../../types';

export interface NavModule {
  id: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboardIcon;
  permission?: Permission;
  description: string;
  /** Matches nested routes so the sidebar stays highlighted on detail screens. */
  match?: string[];
}

export interface NavGroup {
  id: string;
  label: string;
  modules: NavModule[];
}

export const NAV_GROUPS: NavGroup[] = [
{
  id: 'workspace',
  label: 'Workspace',
  modules: [
  {
    id: 'home',
    label: 'Dashboard',
    path: '/home',
    icon: LayoutDashboardIcon,
    description: 'Your daily action list'
  },
  {
    id: 'approvals',
    label: 'Approvals',
    path: '/approvals',
    icon: ClipboardCheckIcon,
    permission: 'proposal.approve',
    description: 'Spend and proposals waiting on you'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: ListChecksIcon,
    permission: 'project.manage',
    description: 'Project coordination'
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/messages',
    icon: MessageSquareIcon,
    description: 'Project and supplier conversations'
  }]

},
{
  id: 'delivery',
  label: 'Projects & plans',
  modules: [
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: BuildingIcon,
    permission: 'project.view',
    description: 'Progress, plans and procurement'
  },
  {
    id: 'takeoff',
    label: 'AI Takeoff',
    path: '/takeoff/new',
    icon: ScanSearchIcon,
    permission: 'takeoff.review',
    description: 'Upload drawings, get measured quantities',
    match: ['/takeoff']
  },
  {
    id: 'documents',
    label: 'Documents',
    path: '/documents',
    icon: FileTextIcon,
    permission: 'project.view',
    description: 'Plan sets, PODs and records'
  },
  {
    id: 'jobsite',
    label: 'Jobsite',
    path: '/jobsite',
    icon: HardHatIcon,
    permission: 'jobsite.manage',
    description: 'Field activity, receiving and issues'
  }]

},
{
  id: 'procurement',
  label: 'Procurement',
  modules: [
  {
    id: 'procurement',
    label: 'Requests & quotes',
    path: '/procurement',
    icon: LayersIcon,
    permission: 'request.create',
    description: 'Material requests and supplier pricing'
  },
  {
    id: 'orders',
    label: 'Purchase orders',
    path: '/orders',
    icon: ShoppingCartIcon,
    permission: 'order.view',
    description: 'Orders and supplier status'
  },
  {
    id: 'deliveries',
    label: 'Deliveries',
    path: '/deliveries',
    icon: TruckIcon,
    permission: 'delivery.view',
    description: 'Tracking, receiving and POD'
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    path: '/suppliers',
    icon: PackageIcon,
    permission: 'quote.view',
    description: 'Directory and relationships'
  }]

},
{
  id: 'finance',
  label: 'Finance',
  modules: [
  {
    id: 'invoices',
    label: 'Invoices',
    path: '/accounting',
    icon: ReceiptIcon,
    permission: 'invoice.view',
    description: 'Supplier billing and matching',
    match: ['/accounting/invoices']
  },
  {
    id: 'payments',
    label: 'Payments',
    path: '/accounting/payments',
    icon: CreditCardIcon,
    permission: 'payment.view',
    description: 'Balances, history and reconciliation'
  }]

},
{
  id: 'organization',
  label: 'Organization',
  modules: [
  {
    id: 'team',
    label: 'Team & roles',
    path: '/team',
    icon: UsersIcon,
    permission: 'team.manage',
    description: 'Members, roles and invites'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    icon: BellIcon,
    description: 'Alerts and preferences'
  },
  {
    id: 'profile',
    label: 'Settings',
    path: '/profile',
    icon: UserIcon,
    description: 'Account, roles and organization'
  }]

}];


/** Where each role lands after signing in. */
export const ROLE_LANDING: Record<RoleId, string> = {
  owner: '/home',
  project_manager: '/home',
  superintendent: '/home',
  purchasing_manager: '/home',
  accountant: '/home'
};

export const ALL_MODULES: NavModule[] = NAV_GROUPS.flatMap((g) => g.modules);

export function moduleById(id: string): NavModule | undefined {
  return ALL_MODULES.find((m) => m.id === id);
}