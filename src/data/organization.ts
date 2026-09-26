import { Organization, TeamMember } from '../types';

export const organization: Organization = {
  id: 'org-1',
  name: 'ABC Construction',
  type: 'Residential Builder',
  address: '1420 Congress Ave, Austin, TX 78701',
  phone: '(512) 555-0148',
  website: 'abcconstruction.com',
  branches: [
  { id: 'br-1', name: 'Austin HQ', city: 'Austin, TX' },
  { id: 'br-2', name: 'San Antonio', city: 'San Antonio, TX' }]

};

export const team: TeamMember[] = [
{
  id: 'u-1',
  name: 'Alex Whitfield',
  initials: 'AW',
  email: 'alex@abcconstruction.com',
  phone: '(512) 555-0101',
  roles: ['owner', 'purchasing_manager', 'accountant'],
  branchId: 'br-1',
  status: 'active',
  lastActive: 'Now'
},
{
  id: 'u-2',
  name: 'John Smith',
  initials: 'JS',
  email: 'john@abcconstruction.com',
  phone: '(512) 555-0112',
  roles: ['project_manager'],
  branchId: 'br-1',
  status: 'active',
  lastActive: '8 min ago'
},
{
  id: 'u-3',
  name: 'Maria Delgado',
  initials: 'MD',
  email: 'maria@abcconstruction.com',
  phone: '(512) 555-0133',
  roles: ['superintendent'],
  branchId: 'br-1',
  status: 'active',
  lastActive: '25 min ago'
},
{
  id: 'u-4',
  name: 'Dana Kim',
  initials: 'DK',
  email: 'dana@abcconstruction.com',
  phone: '(512) 555-0144',
  roles: ['purchasing_manager'],
  branchId: 'br-1',
  status: 'active',
  lastActive: '1 hr ago'
},
{
  id: 'u-5',
  name: 'Priya Raman',
  initials: 'PR',
  email: 'priya@abcconstruction.com',
  phone: '(512) 555-0155',
  roles: ['accountant'],
  branchId: 'br-1',
  status: 'active',
  lastActive: 'Yesterday'
},
{
  id: 'u-6',
  name: 'Ethan Brooks',
  initials: 'EB',
  email: 'ethan@abcconstruction.com',
  phone: '(210) 555-0166',
  roles: ['superintendent', 'project_manager'],
  branchId: 'br-2',
  status: 'invited',
  lastActive: 'Invite sent Aug 16'
}];


export const currentUserId = 'u-1';

export function memberName(id: string): string {
  return team.find((m) => m.id === id)?.name ?? 'Unassigned';
}

export function member(id: string): TeamMember | undefined {
  return team.find((m) => m.id === id);
}