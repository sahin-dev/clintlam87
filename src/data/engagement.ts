import { ActivityEvent, Approval, MessageThread, Notification } from '../types';

export const approvals: Approval[] = [
{
  id: 'AP-501',
  type: 'Proposal',
  title: 'Framing package — ABC Lumber & Supply',
  projectId: 'pr-1024',
  amount: 42850,
  requesterId: 'u-4',
  createdAt: 'Aug 20 · 9:05 AM',
  priority: 'High',
  refId: 'PO-1024',
  summary: 'Quote Q-1024A selected from 3 supplier quotes. Delivery committed Aug 24.',
  requiredPermission: 'proposal.approve',
  status: 'pending'
},
{
  id: 'AP-502',
  type: 'Takeoff',
  title: 'AI Takeoff TK-1024 — 3 low-confidence items',
  projectId: 'pr-1024',
  amount: null,
  requesterId: 'u-2',
  createdAt: 'Aug 19 · 10:31 AM',
  priority: 'High',
  refId: 'TK-1024',
  summary: '7 items generated, 2 corrected by Project Manager, 3 below 75% confidence.',
  requiredPermission: 'takeoff.approve',
  status: 'pending'
},
{
  id: 'AP-503',
  type: 'Material Request',
  title: 'Urgent rebar request — Level 3 mat',
  projectId: 'pr-1042',
  amount: 3850,
  requesterId: 'u-3',
  createdAt: 'Aug 18 · 8:02 AM',
  priority: 'High',
  refId: 'MR-1042',
  summary: 'Field shortage reported. Needed on site by Aug 22 to protect the pour date.',
  requiredPermission: 'request.manage',
  status: 'pending'
},
{
  id: 'AP-504',
  type: 'Invoice',
  title: 'INV-1024 — matched to PO-1018',
  projectId: 'pr-1031',
  amount: 31240,
  requesterId: 'u-5',
  createdAt: 'Aug 19 · 4:20 PM',
  priority: 'Medium',
  refId: 'INV-1024',
  summary: 'Three-way match passed: PO, POD and invoice amounts agree.',
  requiredPermission: 'invoice.manage',
  status: 'pending'
},
{
  id: 'AP-505',
  type: 'Change Order',
  title: 'Window schedule revision — added transoms',
  projectId: 'pr-1031',
  amount: 18600,
  requesterId: 'u-2',
  createdAt: 'Aug 17 · 1:12 PM',
  priority: 'Low',
  refId: 'CO-112',
  summary: 'Client-requested transom windows on units 4–6. Affects framing and glazing.',
  requiredPermission: 'proposal.approve',
  status: 'pending'
}];


export const notifications: Notification[] = [
{
  id: 'nt-1',
  category: 'Approval',
  title: 'Approval required',
  body: 'Proposal PO-1024 for Oakwood Residence needs your approval — $42,850.',
  at: '9:06 AM',
  read: false,
  link: '/approvals',
  tone: 'critical'
},
{
  id: 'nt-2',
  category: 'AI Takeoff',
  title: 'AI Takeoff ready for review',
  body: 'TK-1024 generated 7 material lines from Plan Set V3. 3 items need review.',
  at: '9:41 AM',
  read: false,
  link: '/takeoff/TK-1024',
  tone: 'info'
},
{
  id: 'nt-3',
  category: 'Delivery',
  title: 'Delivery arriving today',
  body: 'DL-1018 for Maple Ridge Villas — TRK-18, ETA 10:30 AM.',
  at: '8:15 AM',
  read: false,
  link: '/deliveries/DL-1018',
  tone: 'warning'
},
{
  id: 'nt-4',
  category: 'Quote',
  title: 'Third quote received',
  body: 'Lone Star Yard Co. responded to MR-1024 — $44,320.',
  at: '8:05 AM',
  read: true,
  link: '/procurement/requests/MR-1024/compare',
  tone: 'info'
},
{
  id: 'nt-5',
  category: 'Delivery',
  title: 'Delivery delayed',
  body: 'DL-1011 for Sunset Apartments rescheduled to Aug 22 by the supplier.',
  at: 'Yesterday',
  read: true,
  link: '/deliveries/DL-1011',
  tone: 'warning'
},
{
  id: 'nt-6',
  category: 'Payment',
  title: 'Payment completed',
  body: 'INV-1007 paid to Hill Country Building Materials — $24,680.',
  at: 'Aug 8',
  read: true,
  link: '/accounting/payments',
  tone: 'success'
},
{
  id: 'nt-7',
  category: 'Team',
  title: 'Invite pending',
  body: 'Ethan Brooks has not accepted the Superintendent invite yet.',
  at: 'Aug 16',
  read: true,
  link: '/team',
  tone: 'info'
}];


export const threads: MessageThread[] = [
{
  id: 'th-1',
  subject: 'ABC Lumber & Supply',
  context: 'Quote Q-1024A · Oakwood Residence',
  projectId: 'pr-1024',
  participants: ['Rick Alvarez', 'Dana Kim'],
  unread: 2,
  updatedAt: '9:22 AM',
  scope: 'supplier',
  messages: [
  {
    id: 'm1',
    author: 'System',
    system: true,
    at: 'Aug 19 · 3:12 PM',
    body: 'Quote Q-1024A received — $42,850, valid until Aug 25.'
  },
  {
    id: 'm2',
    author: 'Dana Kim',
    self: true,
    at: 'Aug 19 · 3:40 PM',
    body: 'Can you hold the plywood price if we push delivery to Aug 26?'
  },
  {
    id: 'm3',
    author: 'Rick Alvarez',
    at: 'Aug 20 · 9:20 AM',
    body: 'Yes — price holds through Aug 27. Revised confirmation attached.',
    attachment: { name: 'Q-1024A-revised.pdf', kind: 'pdf' }
  }]

},
{
  id: 'th-2',
  subject: 'Oakwood Residence — Field',
  context: 'Project chat · 4 participants',
  projectId: 'pr-1024',
  participants: ['John Smith', 'Maria Delgado', 'Alex Whitfield'],
  unread: 0,
  updatedAt: 'Yesterday',
  scope: 'project',
  messages: [
  {
    id: 'm4',
    author: 'Maria Delgado',
    at: 'Aug 19 · 6:55 AM',
    body: 'Staging area is blocked by the dumpster. Logged issue IS-205.',
    attachment: { name: 'jobsite-staging.jpg', kind: 'image' }
  },
  {
    id: 'm5',
    author: 'John Smith',
    at: 'Aug 19 · 7:10 AM',
    body: 'Haul-off is scheduled tomorrow morning, before the framing delivery.'
  }]

},
{
  id: 'th-3',
  subject: 'Lone Star Yard Co.',
  context: 'Delivery DL-1011 · Sunset Apartments',
  projectId: 'pr-1042',
  participants: ['Tom Reyes', 'Maria Delgado'],
  unread: 1,
  updatedAt: 'Yesterday',
  scope: 'supplier',
  messages: [
  {
    id: 'm6',
    author: 'Tom Reyes',
    at: 'Aug 19 · 4:02 PM',
    body: 'Plant shutdown pushed the rebar load. New window is Aug 22, 7–9 AM.'
  }]

}];


export const activity: ActivityEvent[] = [
{
  id: 'ac-1',
  projectId: 'pr-1024',
  actor: 'Dana Kim',
  action: 'created purchase proposal',
  target: 'PO-1024 · $42,850',
  at: 'Aug 20 · 9:05 AM',
  kind: 'order'
},
{
  id: 'ac-2',
  projectId: 'pr-1024',
  actor: 'Lone Star Yard Co.',
  action: 'submitted quote',
  target: 'Q-1024C · $44,320',
  at: 'Aug 20 · 8:05 AM',
  kind: 'quote'
},
{
  id: 'ac-3',
  projectId: 'pr-1024',
  actor: 'John Smith',
  action: 'submitted material request',
  target: 'MR-1024 · 4 lines',
  at: 'Aug 19 · 10:42 AM',
  kind: 'request'
},
{
  id: 'ac-4',
  projectId: 'pr-1024',
  actor: 'John Smith',
  action: 'corrected takeoff quantity',
  target: 'TK-1024 · 2×4 SPF Stud',
  at: 'Aug 19 · 10:22 AM',
  kind: 'takeoff',
  before: 'AI 1,240 ea',
  after: 'Human 1,180 ea'
},
{
  id: 'ac-5',
  projectId: 'pr-1024',
  actor: 'SM Vision 2.4',
  action: 'generated AI takeoff',
  target: 'TK-1024 · 7 lines · run_8f31c7',
  at: 'Aug 19 · 9:41 AM',
  kind: 'takeoff'
},
{
  id: 'ac-6',
  projectId: 'pr-1024',
  actor: 'John Smith',
  action: 'uploaded plan set',
  target: 'Architectural Set · V3',
  at: 'Aug 19 · 9:12 AM',
  kind: 'plan',
  before: 'V2 current',
  after: 'V3 current'
},
{
  id: 'ac-7',
  projectId: 'pr-1031',
  actor: 'Maria Delgado',
  action: 'verified delivery',
  target: 'DL-0996 · POD uploaded',
  at: 'Jul 30 · 2:20 PM',
  kind: 'delivery'
},
{
  id: 'ac-8',
  projectId: 'pr-1031',
  actor: 'Priya Raman',
  action: 'completed payment',
  target: 'INV-1007 · $24,680',
  at: 'Aug 8 · 11:02 AM',
  kind: 'payment'
},
{
  id: 'ac-9',
  projectId: 'pr-1042',
  actor: 'Lone Star Yard Co.',
  action: 'delayed delivery',
  target: 'DL-1011 · rescheduled',
  at: 'Aug 19 · 4:02 PM',
  kind: 'delivery',
  before: 'Aug 20',
  after: 'Aug 22'
}];