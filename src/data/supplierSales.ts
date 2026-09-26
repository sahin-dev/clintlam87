import { Estimate, Rfq, SalesOrder, SupplierQuote } from '../types/supplier';

/**
 * The estimate → sell loop. An RFQ arrives carrying the builder's APPROVED
 * takeoff, so every inbound line keeps the sheet, page and confidence it was
 * approved at on the builder side.
 */
export const rfqs: Rfq[] = [
{
  id: 'RFQ-2041',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  builderRequestRef: 'MR-1024',
  takeoffRef: 'TK-1024',
  planSet: 'Architectural + Structural',
  revision: 'Rev 04',
  sheets: 24,
  requestedBy: 'Dana Kim · Purchasing Manager',
  received: '18 min ago',
  dueDate: 'Sep 03',
  requiredDelivery: 'Sep 12',
  status: 'New',
  notes:
  'Framing package for the full house. Please price trusses separately — we may hold that scope. Site has a 40ft boom restriction.',
  attachments: [
  { name: 'TK-1024 approved takeoff', kind: 'Takeoff', meta: '7 lines · approved by Dana Kim' },
  { name: 'Plan set Rev 04', kind: 'Drawings', meta: '24 sheets · PDF' },
  { name: 'Site logistics note', kind: 'Document', meta: '1 page' }],

  lines: [
  {
    id: 'il-1',
    material: '2×4 Stud · 92-5/8',
    category: 'Lumber',
    builderQty: 1180,
    unit: 'pcs',
    sheet: 'A1.01',
    page: 4,
    confidence: 96,
    builderVerification: 'Approved',
    decision: 'pending'
  },
  {
    id: 'il-2',
    material: '2×6 Stud · 92-5/8',
    category: 'Lumber',
    builderQty: 620,
    unit: 'pcs',
    sheet: 'A1.02',
    page: 5,
    confidence: 92,
    builderVerification: 'Approved',
    decision: 'pending'
  },
  {
    id: 'il-3',
    material: 'Treated bottom plate 2×4',
    category: 'Lumber',
    builderQty: 342,
    unit: 'pcs',
    sheet: 'S1.01',
    page: 21,
    confidence: 83,
    builderVerification: 'Human corrected',
    decision: 'pending'
  },
  {
    id: 'il-4',
    material: '7/16 OSB wall sheathing',
    category: 'Sheathing',
    builderQty: 318,
    unit: 'sheets',
    sheet: 'A2.01',
    page: 9,
    confidence: 91,
    builderVerification: 'Approved',
    decision: 'pending'
  },
  {
    id: 'il-5',
    material: 'LVL header 1-3/4 × 11-7/8',
    category: 'Engineered',
    builderQty: 148,
    unit: 'lf',
    sheet: 'S3.01',
    page: 8,
    confidence: 96,
    builderVerification: 'Approved',
    decision: 'pending'
  },
  {
    id: 'il-6',
    material: 'Roof truss · 28ft span',
    category: 'Trusses',
    builderQty: 24,
    unit: 'ea',
    sheet: 'S2.04',
    page: 24,
    confidence: 55,
    builderVerification: 'Human corrected',
    decision: 'pending'
  },
  {
    id: 'il-7',
    material: 'Joist hanger LUS26',
    category: 'Hardware',
    builderQty: 420,
    unit: 'ea',
    sheet: 'S3.02',
    page: 9,
    confidence: 92,
    builderVerification: 'Approved',
    decision: 'pending'
  }]

},
{
  id: 'RFQ-2038',
  customerId: 'cu-hillcrest',
  projectId: 'sp-hill',
  takeoffRef: 'TK-2210',
  planSet: 'Architectural',
  revision: 'Rev 01',
  sheets: 12,
  requestedBy: 'Marta Reyes · Owner',
  received: '2 days ago',
  dueDate: 'Sep 01',
  requiredDelivery: 'Sep 09',
  status: 'Quoted',
  estimatorId: 'ss-3',
  attachments: [{ name: 'TK-2210 approved takeoff', kind: 'Takeoff', meta: '4 lines' }],
  lines: [
  {
    id: 'il-h1',
    material: '2×6 Stud · 92-5/8',
    category: 'Lumber',
    builderQty: 480,
    unit: 'pcs',
    sheet: 'A1.01',
    page: 3,
    confidence: 94,
    builderVerification: 'Approved',
    decision: 'accepted'
  },
  {
    id: 'il-h2',
    material: '7/16 OSB wall sheathing',
    category: 'Sheathing',
    builderQty: 142,
    unit: 'sheets',
    sheet: 'A2.01',
    page: 6,
    confidence: 90,
    builderVerification: 'Approved',
    decision: 'accepted'
  },
  {
    id: 'il-h3',
    material: 'Tyvek HomeWrap',
    category: 'Weather barrier',
    builderQty: 6,
    unit: 'roll',
    sheet: 'A2.02',
    page: 7,
    confidence: 88,
    builderVerification: 'Approved',
    decision: 'adjusted',
    supplierQty: 7,
    reason: 'Roll coverage at this wall height leaves a short run on elevation D',
    changedBy: 'Miguel Ortiz',
    changedAt: 'Aug 31'
  },
  {
    id: 'il-h4',
    material: 'Joist hanger LUS26',
    category: 'Hardware',
    builderQty: 180,
    unit: 'ea',
    sheet: 'S2.01',
    page: 8,
    confidence: 93,
    builderVerification: 'Approved',
    decision: 'accepted'
  }]

},
{
  id: 'RFQ-2035',
  customerId: 'cu-stonebridge',
  projectId: 'sp-sunset',
  takeoffRef: 'TK-1042',
  planSet: 'Structural',
  revision: 'Rev 07',
  sheets: 46,
  requestedBy: 'Grace Hollis · VP Construction',
  received: '4 days ago',
  dueDate: 'Aug 30',
  requiredDelivery: 'Sep 05',
  status: 'Needs Clarification',
  estimatorId: 'ss-8',
  notes: 'Shear wall schedule on S4.02 conflicts with the plan sheet — asked the builder to confirm.',
  attachments: [{ name: 'TK-1042 approved takeoff', kind: 'Takeoff', meta: '19 lines' }],
  lines: [
  {
    id: 'il-s1',
    material: '2×4 Stud · 92-5/8',
    category: 'Lumber',
    builderQty: 4820,
    unit: 'pcs',
    sheet: 'S1.02',
    page: 12,
    confidence: 95,
    builderVerification: 'Approved',
    decision: 'accepted'
  },
  {
    id: 'il-s2',
    material: '7/16 OSB wall sheathing',
    category: 'Sheathing',
    builderQty: 1240,
    unit: 'sheets',
    sheet: 'S4.02',
    page: 31,
    confidence: 62,
    builderVerification: 'Approved',
    decision: 'clarify',
    reason: 'Shear wall schedule calls for 15/32 on lines 4–7; plan sheet shows 7/16',
    changedBy: 'Alicia Reyes',
    changedAt: 'Aug 30'
  }]

}];


export const estimates: Estimate[] = [
{
  id: 'EST-3312',
  rfqId: 'RFQ-2041',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  status: 'Draft',
  estimator: 'Miguel Ortiz',
  updated: 'Not started',
  lines: []
},
{
  id: 'EST-3309',
  rfqId: 'RFQ-2038',
  customerId: 'cu-hillcrest',
  projectId: 'sp-hill',
  status: 'Ready for Quote',
  estimator: 'Miguel Ortiz',
  updated: 'Aug 31',
  lines: [
  {
    id: 'el-1',
    takeoffLineId: 'il-h1',
    material: '2×6 Stud · 92-5/8',
    productId: 'pd-stud26',
    takeoffQty: 480,
    wastePercent: 5,
    sellQty: 504,
    unit: 'pcs',
    unitCost: 5.9,
    marginPercent: 22,
    unitPrice: 7.35
  },
  {
    id: 'el-2',
    takeoffLineId: 'il-h2',
    material: '7/16 OSB wall sheathing',
    productId: 'pd-osb',
    takeoffQty: 142,
    wastePercent: 6,
    sellQty: 151,
    unit: 'sheets',
    unitCost: 18.2,
    marginPercent: 24,
    unitPrice: 23.95
  },
  {
    id: 'el-3',
    takeoffLineId: 'il-h3',
    material: 'Tyvek HomeWrap',
    productId: 'pd-housewrap',
    takeoffQty: 7,
    wastePercent: 0,
    sellQty: 7,
    unit: 'roll',
    unitCost: 142,
    marginPercent: 23,
    unitPrice: 186
  },
  {
    id: 'el-4',
    takeoffLineId: 'il-h4',
    material: 'Joist hanger LUS26',
    productId: 'pd-joisthanger',
    takeoffQty: 180,
    wastePercent: 3,
    sellQty: 186,
    unit: 'ea',
    unitCost: 1.12,
    marginPercent: 33,
    unitPrice: 1.68
  }]

}];


export const supplierQuotes: SupplierQuote[] = [
{
  id: 'Q-10488',
  rfqId: 'RFQ-2038',
  estimateId: 'EST-3309',
  customerId: 'cu-hillcrest',
  projectId: 'sp-hill',
  version: 2,
  status: 'Sent',
  createdBy: 'Tanya Brooks',
  validUntil: 'Sep 07',
  sentAt: '2 hours ago',
  viewedAt: '41 min ago',
  discount: 420,
  deliveryFee: 285,
  taxRate: 8.25,
  terms: 'Net 15 · Prices held to Sep 07 · Delivery within 20 miles of Round Rock yard',
  lines: [
  { productId: 'pd-stud26', description: '2×6×92-5/8 Stud · SPF #2', qty: 504, unit: 'pcs', unitPrice: 7.35 },
  { productId: 'pd-osb', description: '7/16 OSB Wall Sheathing 4×8', qty: 151, unit: 'sheets', unitPrice: 23.95 },
  { productId: 'pd-housewrap', description: 'Tyvek HomeWrap 9ft × 150ft', qty: 7, unit: 'roll', unitPrice: 186 },
  { productId: 'pd-joisthanger', description: 'Simpson LUS26 Joist Hanger', qty: 186, unit: 'ea', unitPrice: 1.68 }],

  revisions: [
  {
    version: 1,
    total: 8412,
    changedBy: 'Tanya Brooks',
    at: 'Aug 30',
    reason: 'Original pricing at standard tier',
    status: 'Superseded'
  },
  {
    version: 2,
    total: 8118,
    changedBy: 'Tanya Brooks',
    at: '2 hours ago',
    reason: 'Builder asked for volume pricing on the 2×6 stud line; applied 500+ break',
    status: 'Current'
  }]

},
{
  id: 'Q-10472',
  rfqId: 'RFQ-2035',
  estimateId: 'EST-3301',
  customerId: 'cu-stonebridge',
  projectId: 'sp-sunset',
  version: 1,
  status: 'Accepted',
  createdBy: 'Tanya Brooks',
  validUntil: 'Sep 02',
  sentAt: 'Aug 24',
  viewedAt: 'Aug 24',
  discount: 1850,
  deliveryFee: 640,
  taxRate: 8.25,
  terms: 'Net 45 · Contract tier A pricing · Staged delivery by floor',
  lines: [
  { productId: 'pd-stud24', description: '2×4×92-5/8 Premium Stud · SPF', qty: 4980, unit: 'pcs', unitPrice: 4.58 },
  { productId: 'pd-osb', description: '7/16 OSB Wall Sheathing 4×8', qty: 1290, unit: 'sheets', unitPrice: 22.8 },
  { productId: 'pd-lvl', description: '1-3/4 × 11-7/8 LVL Header', qty: 640, unit: 'lf', unitPrice: 12.6 }],

  revisions: [
  {
    version: 1,
    total: 60294,
    changedBy: 'Tanya Brooks',
    at: 'Aug 24',
    reason: 'Initial quote against Rev 07',
    status: 'Current'
  }]

},
{
  id: 'Q-10465',
  rfqId: 'RFQ-2030',
  estimateId: 'EST-3294',
  customerId: 'cu-abc',
  projectId: 'sp-maple',
  version: 3,
  status: 'Revision Requested',
  createdBy: 'Tanya Brooks',
  validUntil: 'Sep 04',
  sentAt: 'Aug 28',
  viewedAt: 'Aug 29',
  discount: 0,
  deliveryFee: 420,
  taxRate: 8.25,
  terms: 'Net 30 · Contract tier B pricing',
  lines: [
  { productId: 'pd-stud24', description: '2×4×92-5/8 Premium Stud · SPF', qty: 2140, unit: 'pcs', unitPrice: 4.82 },
  { productId: 'pd-truss', description: 'Engineered Roof Truss · 28ft span', qty: 36, unit: 'ea', unitPrice: 232 }],

  revisionRequest: {
    note: 'Can you re-price the truss line? Our engineer changed the span on four trusses to 30ft.',
    by: 'Dana Kim · ABC Construction',
    at: 'Yesterday'
  },
  revisions: [
  { version: 1, total: 19240, changedBy: 'Tanya Brooks', at: 'Aug 22', reason: 'Initial quote', status: 'Superseded' },
  {
    version: 2,
    total: 18760,
    changedBy: 'Tanya Brooks',
    at: 'Aug 26',
    reason: 'Removed housewrap at builder request',
    status: 'Superseded'
  },
  {
    version: 3,
    total: 18974,
    changedBy: 'Tanya Brooks',
    at: 'Aug 28',
    reason: 'Truss count corrected to 36 after revised roof plan',
    status: 'Current'
  }]

},
{
  id: 'Q-10455',
  rfqId: 'RFQ-2022',
  estimateId: 'EST-3280',
  customerId: 'cu-stonebridge',
  projectId: 'sp-commerce',
  version: 1,
  status: 'Expired',
  createdBy: 'Tanya Brooks',
  validUntil: 'Aug 20',
  sentAt: 'Aug 06',
  discount: 0,
  deliveryFee: 380,
  taxRate: 8.25,
  terms: 'Net 45',
  lines: [
  { productId: 'pd-plate', description: '2×4×16 Treated Bottom Plate', qty: 210, unit: 'pcs', unitPrice: 15.4 }],

  revisions: [
  { version: 1, total: 3894, changedBy: 'Tanya Brooks', at: 'Aug 06', reason: 'Initial quote', status: 'Superseded' }]

}];


export const salesOrders: SalesOrder[] = [
{
  id: 'SO-9822',
  quoteId: 'Q-10472',
  customerId: 'cu-stonebridge',
  projectId: 'sp-sunset',
  status: 'Partially Fulfilled',
  placed: 'Aug 26',
  requestedDate: 'Sep 05',
  terms: 'Net 45',
  deliveryAddress: '1200 Sunset Ridge Dr, Austin, TX 78745',
  siteContact: 'Peter Lund · (512) 555-0229',
  total: 60294,
  lines: [
  {
    productId: 'pd-stud24',
    description: '2×4×92-5/8 Premium Stud · SPF',
    ordered: 4980,
    fulfilled: 3480,
    unit: 'pcs',
    unitPrice: 4.58,
    shortfall: 0
  },
  {
    productId: 'pd-osb',
    description: '7/16 OSB Wall Sheathing 4×8',
    ordered: 1290,
    fulfilled: 890,
    unit: 'sheets',
    unitPrice: 22.8,
    shortfall: 400
  },
  {
    productId: 'pd-lvl',
    description: '1-3/4 × 11-7/8 LVL Header',
    ordered: 640,
    fulfilled: 640,
    unit: 'lf',
    unitPrice: 12.6
  }]

},
{
  id: 'SO-9814',
  quoteId: 'Q-10461',
  customerId: 'cu-abc',
  projectId: 'sp-maple',
  status: 'Ready for Delivery',
  placed: 'Aug 24',
  requestedDate: 'Sep 02',
  terms: 'Net 30',
  deliveryAddress: '88 Maple Ridge Way, Cedar Park, TX 78613',
  siteContact: 'John Smith · (512) 555-0112',
  total: 24680,
  lines: [
  { productId: 'pd-stud24', description: '2×4×92-5/8 Premium Stud · SPF', ordered: 2140, fulfilled: 0, unit: 'pcs', unitPrice: 4.82 },
  { productId: 'pd-plate', description: '2×4×16 Treated Bottom Plate', ordered: 180, fulfilled: 0, unit: 'pcs', unitPrice: 15.4 },
  { productId: 'pd-joisthanger', description: 'Simpson LUS26 Joist Hanger', ordered: 420, fulfilled: 0, unit: 'ea', unitPrice: 1.68 }]

},
{
  id: 'SO-9801',
  quoteId: 'Q-10440',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  builderOrderRef: 'PO-1024',
  builderApprovedBy: 'John Smith',
  status: 'Delivered',
  placed: 'Aug 12',
  requestedDate: 'Aug 20',
  terms: 'Net 30',
  deliveryAddress: '1024 Oakwood Ln, Austin, TX 78704',
  siteContact: 'James Wilson · (512) 555-0121',
  total: 42850,
  lines: [
  { productId: 'pd-stud24', description: '2×4×92-5/8 Premium Stud · SPF', ordered: 1180, fulfilled: 1180, unit: 'pcs', unitPrice: 4.82 },
  { productId: 'pd-osb', description: '7/16 OSB Wall Sheathing 4×8', ordered: 318, fulfilled: 318, unit: 'sheets', unitPrice: 23.95 },
  { productId: 'pd-lvl', description: '1-3/4 × 11-7/8 LVL Header', ordered: 148, fulfilled: 148, unit: 'lf', unitPrice: 13.2 }]

},
{
  id: 'SO-9788',
  quoteId: 'Q-10422',
  customerId: 'cu-hillcrest',
  projectId: 'sp-hill',
  status: 'New',
  placed: 'Today',
  requestedDate: 'Sep 09',
  terms: 'Net 15',
  deliveryAddress: '14 Hillcrest Loop, Round Rock, TX 78664',
  siteContact: 'Marta Reyes · (512) 555-0224',
  total: 8118,
  lines: [
  { productId: 'pd-stud26', description: '2×6×92-5/8 Stud · SPF #2', ordered: 504, fulfilled: 0, unit: 'pcs', unitPrice: 7.35 },
  { productId: 'pd-osb', description: '7/16 OSB Wall Sheathing 4×8', ordered: 151, fulfilled: 0, unit: 'sheets', unitPrice: 23.95 }]

}];


export function quoteSubtotal(q: SupplierQuote): number {
  return q.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
}

export function quoteTotal(q: SupplierQuote): number {
  const sub = quoteSubtotal(q) - q.discount + q.deliveryFee;
  return Math.round(sub * (1 + q.taxRate / 100));
}