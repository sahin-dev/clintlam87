import { Delivery, Issue, Task } from '../types';

export const deliveries: Delivery[] = [
{
  id: 'DL-1018',
  orderId: 'PO-1018',
  projectId: 'pr-1031',
  supplierId: 'sp-1',
  status: 'Out for Delivery',
  date: 'Aug 20, 2026',
  eta: '10:30 AM',
  driver: 'John Carter',
  truck: 'TRK-18',
  itemCount: 2,
  pod: null
},
{
  id: 'DL-1024',
  orderId: 'PO-1024',
  projectId: 'pr-1024',
  supplierId: 'sp-1',
  status: 'Scheduled',
  date: 'Aug 24, 2026',
  eta: '8:00 AM',
  driver: 'Unassigned',
  truck: 'Unassigned',
  itemCount: 4,
  pod: null
},
{
  id: 'DL-1011',
  orderId: 'PO-1009',
  projectId: 'pr-1042',
  supplierId: 'sp-3',
  status: 'Delayed',
  date: 'Aug 20, 2026',
  eta: 'Rescheduled to Aug 22',
  driver: 'Luis Ortega',
  truck: 'TRK-04',
  itemCount: 1,
  pod: null
},
{
  id: 'DL-1009',
  orderId: 'PO-1009',
  projectId: 'pr-1042',
  supplierId: 'sp-3',
  status: 'Delivered',
  date: 'Aug 11, 2026',
  eta: 'Delivered 10:42 AM',
  driver: 'Luis Ortega',
  truck: 'TRK-04',
  itemCount: 2,
  pod: {
    deliveredAt: 'Aug 11, 2026 · 10:42 AM',
    receivedBy: 'James Wilson',
    signature: true,
    photos: 2,
    damage: 'None reported',
    shortage: 'None reported',
    notes: 'Staged at the east gate per superintendent instruction.',
    verifiedBy: 'Maria Delgado'
  }
},
{
  id: 'DL-0996',
  orderId: 'PO-0996',
  projectId: 'pr-1031',
  supplierId: 'sp-2',
  status: 'Delivered',
  date: 'Jul 30, 2026',
  eta: 'Delivered 2:15 PM',
  driver: 'Ana Beltran',
  truck: 'TRK-22',
  itemCount: 1,
  pod: {
    deliveredAt: 'Jul 30, 2026 · 2:15 PM',
    receivedBy: 'Maria Delgado',
    signature: true,
    photos: 3,
    damage: '1 beam with minor edge scuff — accepted',
    shortage: 'None reported',
    notes: 'Beams offloaded by supplier boom truck.',
    verifiedBy: 'Maria Delgado'
  }
}];


export function deliveryById(id: string): Delivery | undefined {
  return deliveries.find((d) => d.id === id);
}

export const tasks: Task[] = [
{
  id: 'TS-301',
  projectId: 'pr-1024',
  title: 'Confirm framing crew mobilization date',
  assignee: 'Maria Delgado',
  dueDate: 'Aug 21',
  priority: 'High',
  status: 'In Progress'
},
{
  id: 'TS-302',
  projectId: 'pr-1024',
  title: 'Review LVL beam takeoff with structural engineer',
  assignee: 'John Smith',
  dueDate: 'Aug 20',
  priority: 'High',
  status: 'Assigned'
},
{
  id: 'TS-303',
  projectId: 'pr-1031',
  title: 'Schedule crane for truss set',
  assignee: 'Maria Delgado',
  dueDate: 'Aug 26',
  priority: 'Medium',
  status: 'Created'
},
{
  id: 'TS-304',
  projectId: 'pr-1042',
  title: 'Update Level 3 pour sequence',
  assignee: 'Ethan Brooks',
  dueDate: 'Aug 18',
  priority: 'High',
  status: 'Completed'
}];


export const issues: Issue[] = [
{
  id: 'IS-204',
  projectId: 'pr-1042',
  title: 'Rebar shortage at Level 3 mat',
  category: 'Material',
  priority: 'High',
  status: 'Assigned',
  reportedBy: 'Maria Delgado',
  at: 'Aug 18 · 7:40 AM',
  photos: 3
},
{
  id: 'IS-205',
  projectId: 'pr-1024',
  title: 'Staging area blocked by dumpster',
  category: 'Schedule',
  priority: 'Medium',
  status: 'Open',
  reportedBy: 'Maria Delgado',
  at: 'Aug 19 · 6:52 AM',
  photos: 1
},
{
  id: 'IS-206',
  projectId: 'pr-1024',
  title: 'Damaged plywood bundle on last delivery',
  category: 'Quality',
  priority: 'Low',
  status: 'Resolved',
  reportedBy: 'James Wilson',
  at: 'Aug 14 · 11:20 AM',
  photos: 2
}];