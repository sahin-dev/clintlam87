import { SupplierPermission } from '../types/supplier';

/**
 * Contextual conversations. Every thread hangs off a record — a project, RFQ,
 * quote, order, load or invoice — so nobody has to guess what a message is about.
 */
export interface SupplierMessage {
  id: string;
  author: string;
  org: 'yard' | 'builder';
  body: string;
  at: string;
}

export interface SupplierThread {
  id: string;
  customerId: string;
  contextLabel: string;
  contextRef: string;
  contextPath?: string;
  subject: string;
  unread: number;
  last: string;
  messages: SupplierMessage[];
}

export const supplierThreads: SupplierThread[] = [
{
  id: 'th-1',
  customerId: 'cu-abc',
  contextLabel: 'RFQ',
  contextRef: 'RFQ-2041',
  contextPath: '/supplier/rfqs/RFQ-2041',
  subject: 'OSB thickness on the shear walls',
  unread: 2,
  last: '12 min ago',
  messages: [
  {
    id: 'm-1',
    author: 'Dana Kim · ABC Construction',
    org: 'builder',
    body: 'Sending over the approved takeoff for Oakwood. We need pricing back by Sep 03 to hold the framing crew.',
    at: '18 min ago'
  },
  {
    id: 'm-2',
    author: 'Miguel Ortiz',
    org: 'yard',
    body: 'Got it. One question before I price — sheet A2.01 calls for 7/16 OSB but the shear wall schedule on S4.02 specifies 15/32. Which governs?',
    at: '14 min ago'
  },
  {
    id: 'm-3',
    author: 'Dana Kim · ABC Construction',
    org: 'builder',
    body: 'Checking with the engineer now. Assume 15/32 on the shear walls and 7/16 elsewhere — I will confirm in writing today.',
    at: '12 min ago'
  }]

},
{
  id: 'th-2',
  customerId: 'cu-abc',
  contextLabel: 'Quote',
  contextRef: 'Q-10465',
  contextPath: '/supplier/quotes/Q-10465',
  subject: 'Revision requested on the truss line',
  unread: 1,
  last: 'Yesterday',
  messages: [
  {
    id: 'm-4',
    author: 'Dana Kim · ABC Construction',
    org: 'builder',
    body: 'Our engineer changed the span on four trusses to 30ft. Can you re-price that line?',
    at: 'Yesterday'
  },
  {
    id: 'm-5',
    author: 'Tanya Brooks',
    org: 'yard',
    body: 'Yes — the 30ft profile is a different SKU and a longer lead time. Revised quote will come back as v4 today.',
    at: 'Yesterday'
  }]

},
{
  id: 'th-3',
  customerId: 'cu-stonebridge',
  contextLabel: 'Load',
  contextRef: 'DL-552',
  contextPath: '/supplier/deliveries/DL-552',
  subject: 'Site access this morning',
  unread: 0,
  last: '1 hour ago',
  messages: [
  {
    id: 'm-6',
    author: 'Peter Lund · Stonebridge',
    org: 'builder',
    body: 'Use the north gate — the south entrance is blocked by the concrete pour.',
    at: '2 hours ago'
  },
  {
    id: 'm-7',
    author: 'Dana Whitmore',
    org: 'yard',
    body: 'Passed to the driver. ETA still 09:40.',
    at: '1 hour ago'
  }]

},
{
  id: 'th-4',
  customerId: 'cu-hillcrest',
  contextLabel: 'Invoice',
  contextRef: 'INV-8274',
  contextPath: '/supplier/invoices/INV-8274',
  subject: 'Duplicate delivery fee',
  unread: 0,
  last: '3 days ago',
  messages: [
  {
    id: 'm-8',
    author: 'Marta Reyes · Hillcrest Homes',
    org: 'builder',
    body: 'We were charged a delivery fee on both partial loads. Only one should apply.',
    at: '3 days ago'
  },
  {
    id: 'm-9',
    author: 'Priya Nair',
    org: 'yard',
    body: 'You are right — a credit for one fee is being raised. Case CS-1179 is tracking it.',
    at: '3 days ago'
  }]

}];


/* ------------------------------------------------------------------ */
/* Documents — versioned, and always attached to a record             */
/* ------------------------------------------------------------------ */

export interface SupplierDocument {
  id: string;
  name: string;
  category:
  'Drawings' |
  'Takeoffs' |
  'Quotes' |
  'Orders' |
  'PODs' |
  'Invoices' |
  'Contracts';
  customerId: string;
  projectId?: string;
  version: string;
  meta: string;
  addedBy: string;
  added: string;
  supersedes?: string;
  permission?: SupplierPermission;
}

export const supplierDocuments: SupplierDocument[] = [
{
  id: 'doc-1',
  name: 'Oakwood Residence · Architectural set',
  category: 'Drawings',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  version: 'Rev 04',
  meta: 'PDF · 24 sheets · 41.2 MB',
  addedBy: 'Shared by ABC Construction',
  added: 'Aug 21',
  supersedes: 'Rev 03'
},
{
  id: 'doc-2',
  name: 'Oakwood Residence · Approved takeoff TK-1024',
  category: 'Takeoffs',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  version: 'v1',
  meta: 'Framing · 7 material lines · from Rev 04',
  addedBy: 'Shared by ABC Construction',
  added: '18 min ago'
},
{
  id: 'doc-3',
  name: 'Quote Q-10465 · Maple Ridge Villas',
  category: 'Quotes',
  customerId: 'cu-abc',
  projectId: 'sp-maple',
  version: 'v3',
  meta: 'PDF · $18,974 · valid to Sep 12',
  addedBy: 'Tanya Brooks',
  added: 'Aug 28',
  supersedes: 'v2'
},
{
  id: 'doc-4',
  name: 'Sales order SO-9822 · Sunset Apartments',
  category: 'Orders',
  customerId: 'cu-stonebridge',
  projectId: 'sp-sunset',
  version: 'v1',
  meta: 'PDF · $60,294 · Net 45',
  addedBy: 'Tanya Brooks',
  added: 'Aug 26'
},
{
  id: 'doc-5',
  name: 'POD DL-540 · Oakwood Residence',
  category: 'PODs',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  version: 'Signed',
  meta: 'Signed by James Wilson · 4 photos',
  addedBy: 'John Alvarez',
  added: 'Aug 25',
  permission: 'delivery.view'
},
{
  id: 'doc-6',
  name: 'Invoice INV-8291 · Oakwood Residence',
  category: 'Invoices',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  version: 'v1',
  meta: 'PDF · $42,850 · due Sep 24',
  addedBy: 'Priya Nair',
  added: 'Aug 25',
  permission: 'invoice.view'
},
{
  id: 'doc-7',
  name: 'Supply agreement · Stonebridge Development',
  category: 'Contracts',
  customerId: 'cu-stonebridge',
  version: '2026',
  meta: 'PDF · contract tier A · Net 45',
  addedBy: 'Ray Coleman',
  added: 'Apr 01',
  permission: 'settings.manage'
}];