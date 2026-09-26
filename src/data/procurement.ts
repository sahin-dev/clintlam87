import { MaterialRequest, PurchaseOrder, Quote, Supplier } from '../types';
import { IMAGES } from './images';

export const suppliers: Supplier[] = [
{
  id: 'sp-1',
  name: 'ABC Lumber & Supply',
  image: IMAGES.lumberYard,
  city: 'Austin, TX',
  category: 'Lumber · Sheathing · Hardware',
  rating: 4.8,
  onTimeRate: 96,
  relationship: 'Preferred',
  contact: 'Rick Alvarez',
  phone: '(512) 555-0190',
  openOrders: 4,
  terms: 'Net 30'
},
{
  id: 'sp-2',
  name: 'Hill Country Building Materials',
  image: IMAGES.materialsStaged,
  city: 'New Braunfels, TX',
  category: 'Engineered lumber · Trusses',
  rating: 4.5,
  onTimeRate: 89,
  relationship: 'Active',
  contact: 'Sheila Monroe',
  phone: '(830) 555-0177',
  openOrders: 3,
  terms: 'Net 45'
},
{
  id: 'sp-3',
  name: 'Lone Star Yard Co.',
  image: IMAGES.deliveryTruck,
  city: 'San Antonio, TX',
  category: 'Concrete · Rebar · Lumber',
  rating: 4.2,
  onTimeRate: 82,
  relationship: 'Active',
  contact: 'Tom Reyes',
  phone: '(210) 555-0122',
  openOrders: 2,
  terms: 'Net 30'
}];


export function supplierById(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function supplierName(id: string): string {
  return supplierById(id)?.name ?? 'Unknown supplier';
}

export const materialRequests: MaterialRequest[] = [
{
  id: 'MR-1024',
  projectId: 'pr-1024',
  takeoffId: 'TK-1024',
  requestedBy: 'John Smith',
  requestedAt: 'Aug 19, 2026 · 10:42 AM',
  requiredBy: 'Aug 25, 2026',
  priority: 'Normal',
  status: 'Pricing',
  rfqRef: 'RFQ-2041',
  notes: 'Framing crew mobilizes Aug 26. Stage on the north side of the lot.',
  lines: [
  { item: '2×4 SPF Stud — 8 ft', qty: 1180, unit: 'ea' },
  { item: '2×6 SPF — 10 ft', qty: 620, unit: 'ea' },
  { item: '½" CDX Plywood 4×8', qty: 320, unit: 'sheet' },
  { item: '16d Framing Nails — 50 lb', qty: 24, unit: 'box' }]

},
{
  id: 'MR-1031',
  projectId: 'pr-1031',
  takeoffId: 'TK-1031',
  requestedBy: 'John Smith',
  requestedAt: 'Aug 18, 2026 · 2:15 PM',
  requiredBy: 'Aug 29, 2026',
  priority: 'Urgent',
  status: 'Pricing',
  notes: 'Building C roof package. Crane scheduled Aug 31.',
  lines: [
  { item: 'Truss T1 — 28 ft span', qty: 44, unit: 'ea' },
  { item: '⅝" OSB Roof Sheathing', qty: 210, unit: 'sheet' }]

},
{
  id: 'MR-1042',
  projectId: 'pr-1042',
  takeoffId: null,
  requestedBy: 'Maria Delgado',
  requestedAt: 'Aug 18, 2026 · 7:55 AM',
  requiredBy: 'Aug 22, 2026',
  priority: 'Urgent',
  status: 'Under Review',
  notes: 'Rebar shortage found during Level 3 prep — see issue IS-204.',
  lines: [{ item: '#5 Rebar — 20 ft', qty: 180, unit: 'ea' }]
},
{
  id: 'MR-1049',
  projectId: 'pr-1049',
  takeoffId: null,
  requestedBy: 'Ethan Brooks',
  requestedAt: 'Aug 17, 2026 · 4:30 PM',
  requiredBy: 'Sep 8, 2026',
  priority: 'Low',
  status: 'Draft',
  notes: 'Preliminary shell allowance pricing only.',
  lines: [{ item: 'Tilt-up form lumber package', qty: 1, unit: 'lot' }]
}];


export function requestById(id: string): MaterialRequest | undefined {
  return materialRequests.find((r) => r.id === id);
}

export const quotes: Quote[] = [
{
  id: 'Q-1024A',
  requestId: 'MR-1024',
  projectId: 'pr-1024',
  supplierId: 'sp-1',
  total: 42850,
  status: 'Pending',
  receivedAt: 'Awaiting price',
  validUntil: 'Aug 25, 2026',
  leadTimeDays: 5,
  deliveryDate: 'Aug 24, 2026',
  terms: 'Net 30 · Free delivery over $10k',
  availability: 'Being priced by the yard against RFQ-2041',
  lines: [
  { item: '2×4 SPF Stud — 8 ft', qty: 1180, unit: 'ea', unitPrice: 8.42 },
  { item: '2×6 SPF — 10 ft', qty: 620, unit: 'ea', unitPrice: 16.9 },
  { item: '½" CDX Plywood 4×8', qty: 320, unit: 'sheet', unitPrice: 52.4 },
  { item: '16d Framing Nails — 50 lb', qty: 24, unit: 'box', unitPrice: 68.0 }]

},
{
  id: 'Q-1024B',
  requestId: 'MR-1024',
  projectId: 'pr-1024',
  supplierId: 'sp-2',
  total: 41190,
  status: 'Received',
  receivedAt: 'Aug 19 · 4:48 PM',
  validUntil: 'Aug 23, 2026',
  leadTimeDays: 9,
  deliveryDate: 'Aug 28, 2026',
  terms: 'Net 45 · $450 delivery fee',
  availability: 'Partial — 2 items backordered',
  lines: [
  { item: '2×4 SPF Stud — 8 ft', qty: 1180, unit: 'ea', unitPrice: 8.05 },
  { item: '2×6 SPF — 10 ft', qty: 620, unit: 'ea', unitPrice: 16.4 },
  { item: '½" CDX Plywood 4×8', qty: 320, unit: 'sheet', unitPrice: 51.2 },
  { item: '16d Framing Nails — 50 lb', qty: 24, unit: 'box', unitPrice: 71.5 }]

},
{
  id: 'Q-1024C',
  requestId: 'MR-1024',
  projectId: 'pr-1024',
  supplierId: 'sp-3',
  total: 44320,
  status: 'Received',
  receivedAt: 'Aug 20 · 8:05 AM',
  validUntil: 'Aug 27, 2026',
  leadTimeDays: 4,
  deliveryDate: 'Aug 23, 2026',
  terms: 'Net 30 · Split delivery included',
  availability: 'All items in stock, split delivery',
  lines: [
  { item: '2×4 SPF Stud — 8 ft', qty: 1180, unit: 'ea', unitPrice: 8.75 },
  { item: '2×6 SPF — 10 ft', qty: 620, unit: 'ea', unitPrice: 17.1 },
  { item: '½" CDX Plywood 4×8', qty: 320, unit: 'sheet', unitPrice: 53.6 },
  { item: '16d Framing Nails — 50 lb', qty: 24, unit: 'box', unitPrice: 66.0 }]

},
{
  id: 'Q-1031A',
  requestId: 'MR-1031',
  projectId: 'pr-1031',
  supplierId: 'sp-2',
  total: 86400,
  status: 'Pending',
  receivedAt: '—',
  validUntil: '—',
  leadTimeDays: 0,
  deliveryDate: '—',
  terms: '—',
  availability: 'All items in stock',
  lines: []
}];


export function quotesForRequest(requestId: string): Quote[] {
  return quotes.filter((q) => q.requestId === requestId);
}

export const purchaseOrders: PurchaseOrder[] = [
{
  id: 'PO-1024',
  projectId: 'pr-1024',
  supplierId: 'sp-1',
  quoteId: 'Q-1024A',
  salesOrderRef: 'SO-9801',
  total: 42850,
  status: 'Pending Approval',
  createdAt: 'Aug 20, 2026 · 9:02 AM',
  createdBy: 'Dana Kim',
  deliveryDate: 'Aug 24, 2026',
  lines: [
  { item: '2×4 SPF Stud — 8 ft', qty: 1180, unit: 'ea', unitPrice: 8.42 },
  { item: '2×6 SPF — 10 ft', qty: 620, unit: 'ea', unitPrice: 16.9 },
  { item: '½" CDX Plywood 4×8', qty: 320, unit: 'sheet', unitPrice: 52.4 },
  { item: '16d Framing Nails — 50 lb', qty: 24, unit: 'box', unitPrice: 68.0 }]

},
{
  id: 'PO-1018',
  projectId: 'pr-1031',
  supplierId: 'sp-1',
  quoteId: 'Q-1018A',
  total: 31240,
  status: 'Dispatched',
  createdAt: 'Aug 12, 2026 · 11:40 AM',
  createdBy: 'Dana Kim',
  approvedBy: 'Alex Whitfield',
  deliveryDate: 'Aug 20, 2026',
  lines: [
  { item: '2×10 SPF Joist — 16 ft', qty: 240, unit: 'ea', unitPrice: 41.2 },
  { item: 'Joist Hanger LUS210', qty: 480, unit: 'ea', unitPrice: 2.85 }]

},
{
  id: 'PO-1009',
  projectId: 'pr-1042',
  supplierId: 'sp-3',
  quoteId: 'Q-1009A',
  total: 68900,
  status: 'Delivered',
  createdAt: 'Aug 2, 2026 · 8:15 AM',
  createdBy: 'Dana Kim',
  approvedBy: 'Alex Whitfield',
  deliveryDate: 'Aug 11, 2026',
  lines: [
  { item: 'Ready-mix Concrete 4000 psi', qty: 210, unit: 'cy', unitPrice: 172.0 },
  { item: '#5 Rebar — 20 ft', qty: 640, unit: 'ea', unitPrice: 21.4 }]

},
{
  id: 'PO-0996',
  projectId: 'pr-1031',
  supplierId: 'sp-2',
  quoteId: 'Q-0996A',
  total: 24680,
  status: 'Closed',
  createdAt: 'Jul 22, 2026 · 1:05 PM',
  createdBy: 'Dana Kim',
  approvedBy: 'Alex Whitfield',
  deliveryDate: 'Jul 30, 2026',
  lines: [{ item: 'LVL Beam 1¾×11⅞', qty: 320, unit: 'lf', unitPrice: 77.1 }]
}];


export function orderById(id: string): PurchaseOrder | undefined {
  return purchaseOrders.find((o) => o.id === id);
}