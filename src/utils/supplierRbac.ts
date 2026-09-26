import { SupplierPermission, SupplierRole, SupplierRoleId } from '../types/supplier';

/**
 * One supplier platform, eight role lenses. Navigation, dashboard content and
 * record actions are derived from these permission sets — the shell itself is
 * identical for every role.
 */
export const SUPPLIER_ROLES: Record<SupplierRoleId, SupplierRole> = {
  administrator: {
    id: 'administrator',
    label: 'Administrator',
    short: 'Admin',
    focus: 'Organization, users, branches, integrations and audit',
    landing: '/supplier/home',
    permissions: [
    'business.overview',
    'customers.view',
    'customers.manage',
    'projects.view',
    'rfq.view',
    'quote.view',
    'order.view',
    'products.view',
    'pricing.view',
    'inventory.view',
    'purchasing.manage',
    'delivery.view',
    'invoice.view',
    'payment.view',
    'reports.view',
    'team.manage',
    'integrations.manage',
    'audit.view',
    'settings.manage']

  },
  management: {
    id: 'management',
    label: 'Owner / Management',
    short: 'Management',
    focus: 'Business oversight, sales, margin and exceptions',
    landing: '/supplier/home',
    permissions: [
    'business.overview',
    'customers.view',
    'customers.manage',
    'projects.view',
    'rfq.view',
    'takeoff.review',
    'estimate.manage',
    'quote.view',
    'quote.approve',
    'order.view',
    'products.view',
    'pricing.view',
    'pricing.manage',
    'inventory.view',
    'purchasing.manage',
    'delivery.view',
    'invoice.view',
    'payment.view',
    'service.manage',
    'reports.view',
    'team.manage',
    'audit.view']

  },
  sales: {
    id: 'sales',
    label: 'Sales Representative',
    short: 'Sales',
    focus: 'Customers, RFQs, quotes and order follow-through',
    landing: '/supplier/home',
    permissions: [
    'customers.view',
    'customers.manage',
    'projects.view',
    'rfq.view',
    'rfq.assign',
    'takeoff.review',
    'quote.view',
    'quote.create',
    'order.view',
    'order.manage',
    'products.view',
    'pricing.view',
    'inventory.view',
    'delivery.view',
    'invoice.view',
    'reports.view']

  },
  estimator: {
    id: 'estimator',
    label: 'Estimator',
    short: 'Estimator',
    focus: 'Inbound takeoffs, quantities, product mapping and pricing',
    landing: '/supplier/takeoffs',
    permissions: [
    'customers.view',
    'projects.view',
    'rfq.view',
    'takeoff.review',
    'takeoff.estimate',
    'estimate.manage',
    'quote.view',
    'quote.create',
    'products.view',
    'pricing.view',
    'inventory.view',
    'order.view']

  },
  dispatcher: {
    id: 'dispatcher',
    label: 'Dispatcher',
    short: 'Dispatch',
    focus: 'Loads, drivers, trucks, routes and proof of delivery',
    landing: '/supplier/deliveries',
    permissions: [
    'customers.view',
    'projects.view',
    'order.view',
    'order.manage',
    'inventory.view',
    /* Dispatch covers a shortfall by raising a buy-in, so it needs purchasing. */
    'purchasing.manage',
    'delivery.view',
    'delivery.dispatch',
    'service.manage']

  },
  driver: {
    id: 'driver',
    label: 'Driver',
    short: 'Driver',
    focus: 'Delivery visibility and proof-of-delivery records',
    landing: '/supplier/deliveries',
    permissions: ['delivery.view', 'delivery.drive']
  },
  accounting: {
    id: 'accounting',
    label: 'Accounting',
    short: 'Accounting',
    focus: 'Invoicing, payments, aging and reconciliation',
    landing: '/supplier/invoices',
    permissions: [
    'customers.view',
    'projects.view',
    'order.view',
    'delivery.view',
    'invoice.view',
    'invoice.manage',
    'payment.view',
    'payment.manage',
    'reports.view',
    'audit.view']

  },
  service: {
    id: 'service',
    label: 'Customer Service',
    short: 'Service',
    focus: 'Cases, damage, returns and customer communication',
    landing: '/supplier/service',
    permissions: [
    'customers.view',
    'projects.view',
    'order.view',
    'delivery.view',
    'inventory.view',
    'service.manage',
    'invoice.view']

  }
};

export const SUPPLIER_ROLE_ORDER: SupplierRoleId[] = [
'administrator',
'management',
'sales',
'estimator',
'dispatcher',
'driver',
'accounting',
'service'];


export function supplierPermissionsFor(roles: SupplierRoleId[]): Set<SupplierPermission> {
  const set = new Set<SupplierPermission>();
  roles.forEach((r) => SUPPLIER_ROLES[r].permissions.forEach((p) => set.add(p)));
  return set;
}
