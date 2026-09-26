import { Permission, Role, RoleId } from '../types';

export const ROLES: Record<RoleId, Role> = {
  owner: {
    id: 'owner',
    label: 'Owner / Administrator',
    short: 'Owner',
    focus: 'Business oversight, major approvals, team and organization',
    permissions: [
    'business.overview',
    'project.create',
    'project.manage',
    'project.view',
    'plans.upload',
    'takeoff.review',
    'takeoff.approve',
    'request.manage',
    'quote.view',
    'proposal.approve',
    'order.view',
    'delivery.view',
    'invoice.view',
    'payment.view',
    'team.manage',
    'issue.create']

  },
  project_manager: {
    id: 'project_manager',
    label: 'Project Manager',
    short: 'Project Mgr',
    focus: 'Projects, plans, coordination and material requests',
    permissions: [
    'project.create',
    'project.manage',
    'project.view',
    'plans.upload',
    'takeoff.review',
    'request.create',
    'quote.view',
    'order.view',
    'delivery.view',
    'invoice.view',
    'issue.create']

  },
  superintendent: {
    id: 'superintendent',
    label: 'Superintendent',
    short: 'Superintendent',
    focus: 'Jobsite, material receiving, deliveries and issues',
    permissions: [
    'project.view',
    'request.create',
    'order.view',
    'delivery.view',
    'delivery.verify',
    'jobsite.manage',
    'issue.create']

  },
  purchasing_manager: {
    id: 'purchasing_manager',
    label: 'Purchasing Manager',
    short: 'Purchasing',
    focus: 'Takeoff review, quotes, proposals and purchase orders',
    permissions: [
    'project.view',
    'takeoff.review',
    'takeoff.approve',
    'request.manage',
    'quote.manage',
    'quote.view',
    'proposal.create',
    'order.manage',
    'order.view',
    'delivery.view',
    'invoice.view',
    'issue.create']

  },
  accountant: {
    id: 'accountant',
    label: 'Accountant',
    short: 'Accountant',
    focus: 'Invoices, payments, reconciliation and financial records',
    permissions: [
    'project.view',
    'quote.view',
    'order.view',
    'delivery.view',
    'invoice.view',
    'invoice.manage',
    'payment.view',
    'payment.manage']

  }
};

export const ROLE_ORDER: RoleId[] = [
'owner',
'project_manager',
'superintendent',
'purchasing_manager',
'accountant'];


export function permissionsFor(roles: RoleId[]): Set<Permission> {
  const set = new Set<Permission>();
  roles.forEach((role) => ROLES[role].permissions.forEach((p) => set.add(p)));
  return set;
}