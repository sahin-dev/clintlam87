import {
  BarChart3Icon,
  BellIcon,
  BuildingIcon,
  ClipboardListIcon,
  CreditCardIcon,
  DatabaseIcon,
  FileTextIcon,
  HeadsetIcon,
  LayoutDashboardIcon,
  LayersIcon,
  MessageSquareIcon,
  PackageIcon,
  PlugIcon,
  ReceiptIcon,
  ScanSearchIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShoppingCartIcon,
  TagIcon,
  TruckIcon,
  UsersIcon,
  WarehouseIcon } from
'lucide-react';
import { SupplierPermission } from '../../types/supplier';

export interface SupplierModule {
  id: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboardIcon;
  permission?: SupplierPermission;
  description: string;
  match?: string[];
}

export interface SupplierNavGroup {
  id: string;
  label: string;
  modules: SupplierModule[];
}

/**
 * One navigation spine for the whole yard. Every role sees the same structure;
 * permissions decide which modules appear inside it.
 */
export const SUPPLIER_NAV: SupplierNavGroup[] = [
{
  id: 'today',
  label: 'Today',
  modules: [
  {
    id: 'home',
    label: 'Home',
    path: '/supplier/home',
    icon: LayoutDashboardIcon,
    description: 'What needs attention across the yard'
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/supplier/messages',
    icon: MessageSquareIcon,
    description: 'Builder conversations in record context'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/supplier/notifications',
    icon: BellIcon,
    description: 'Alerts scoped to your role'
  }]

},
{
  id: 'sell',
  label: 'Estimate & sell',
  modules: [
  {
    id: 'customers',
    label: 'Customers',
    path: '/supplier/customers',
    icon: BuildingIcon,
    permission: 'customers.view',
    description: 'Builder organizations and relationships',
    match: ['/supplier/customers']
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/supplier/projects',
    icon: LayersIcon,
    permission: 'projects.view',
    description: 'Shared builder project workspaces',
    match: ['/supplier/projects']
  },
  {
    id: 'rfqs',
    label: 'RFQs',
    path: '/supplier/rfqs',
    icon: ClipboardListIcon,
    permission: 'rfq.view',
    description: 'Inbound pricing requests',
    match: ['/supplier/rfqs']
  },
  {
    id: 'takeoffs',
    label: 'Takeoffs',
    path: '/supplier/takeoffs',
    icon: ScanSearchIcon,
    permission: 'takeoff.review',
    description: 'Review builder AI quantities',
    match: ['/supplier/takeoffs']
  },
  {
    id: 'estimates',
    label: 'Estimates',
    path: '/supplier/estimates',
    icon: FileTextIcon,
    permission: 'estimate.manage',
    description: 'Product mapping, waste and margin',
    match: ['/supplier/estimates']
  },
  {
    id: 'quotes',
    label: 'Quotes',
    path: '/supplier/quotes',
    icon: TagIcon,
    permission: 'quote.view',
    description: 'Versions, approvals and revisions',
    match: ['/supplier/quotes']
  }]

},
{
  id: 'fulfil',
  label: 'Sell & deliver',
  modules: [
  {
    id: 'orders',
    label: 'Sales orders',
    path: '/supplier/orders',
    icon: ShoppingCartIcon,
    permission: 'order.view',
    description: 'Fulfilment and shortfalls',
    match: ['/supplier/orders']
  },
  {
    id: 'inventory',
    label: 'Inventory',
    path: '/supplier/inventory',
    icon: WarehouseIcon,
    permission: 'inventory.view',
    description: 'On hand, reserved and incoming'
  },
  {
    id: 'purchasing',
    label: 'Buy-ins',
    path: '/supplier/purchasing',
    icon: DatabaseIcon,
    permission: 'purchasing.manage',
    description: 'Vendor POs covering shortfalls'
  },
  {
    id: 'products',
    label: 'Products',
    path: '/supplier/products',
    icon: PackageIcon,
    permission: 'products.view',
    description: 'Catalog, SKUs and units'
  },
  {
    id: 'pricing',
    label: 'Pricing',
    path: '/supplier/pricing',
    icon: TagIcon,
    permission: 'pricing.view',
    description: 'Customer contract pricing'
  },
  {
    id: 'deliveries',
    label: 'Deliveries',
    path: '/supplier/deliveries',
    icon: TruckIcon,
    permission: 'delivery.view',
    description: 'Dispatch board, routes and POD',
    match: ['/supplier/deliveries']
  }]

},
{
  id: 'paid',
  label: 'Deliver & get paid',
  modules: [
  {
    id: 'invoices',
    label: 'Invoices',
    path: '/supplier/invoices',
    icon: ReceiptIcon,
    permission: 'invoice.view',
    description: 'Billing against delivered loads',
    match: ['/supplier/invoices']
  },
  {
    id: 'payments',
    label: 'Payments',
    path: '/supplier/payments',
    icon: CreditCardIcon,
    permission: 'payment.view',
    description: 'Receipts, aging and failures'
  },
  {
    id: 'service',
    label: 'Customer service',
    path: '/supplier/service',
    icon: HeadsetIcon,
    permission: 'service.manage',
    description: 'Cases, damage and returns',
    match: ['/supplier/service']
  }]

},
{
  id: 'org',
  label: 'Organization',
  modules: [
  {
    id: 'documents',
    label: 'Documents',
    path: '/supplier/documents',
    icon: FileTextIcon,
    permission: 'projects.view',
    description: 'Drawings, quotes, PODs and invoices'
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/supplier/reports',
    icon: BarChart3Icon,
    permission: 'reports.view',
    description: 'Sales, fulfilment and estimating'
  },
  {
    id: 'team',
    label: 'Team & roles',
    path: '/supplier/team',
    icon: UsersIcon,
    permission: 'team.manage',
    description: 'Staff, roles, branches and invites'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    path: '/supplier/integrations',
    icon: PlugIcon,
    permission: 'integrations.manage',
    description: 'ECI Spruce adapter and sync health'
  },
  {
    id: 'audit',
    label: 'Audit log',
    path: '/supplier/audit',
    icon: ScrollTextIcon,
    permission: 'audit.view',
    description: 'Who changed what, with before and after'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/supplier/settings',
    icon: SettingsIcon,
    description: 'Organization, commerce and operations'
  }]

}];


export const SUPPLIER_MODULES = SUPPLIER_NAV.flatMap((g) => g.modules);
