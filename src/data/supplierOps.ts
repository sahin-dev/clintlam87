import {
  AuditEntry,
  ServiceCase,
  SupplierDelivery,
  SupplierInvoice,
  SupplierNotification,
  SupplierPayment,
  SyncEvent } from
'../types/supplier';

/* ------------------------------------------------------------------ */
/* Deliver loop                                                        */
/* ------------------------------------------------------------------ */

export const supplierDeliveries: SupplierDelivery[] = [
{
  id: 'DL-552',
  orderId: 'SO-9822',
  customerId: 'cu-stonebridge',
  projectId: 'sp-sunset',
  date: 'Today',
  window: '08:00 – 10:00',
  sequence: 1,
  driverId: 'dr-1',
  truck: 'TRK-18 · Flatbed',
  status: 'Out for Delivery',
  eta: '09:40',
  address: '1200 Sunset Ridge Dr, Austin, TX 78745',
  siteContact: 'Peter Lund · (512) 555-0229',
  partialOf: { deliveryNo: 2, ofTotal: 3, remaining: '400 sheets OSB on VPO-4465' },
  items: [
  { description: '2×4×92-5/8 Premium Stud', qty: 1740, unit: 'pcs', loaded: true },
  { description: '7/16 OSB Wall Sheathing', qty: 440, unit: 'sheets', loaded: true }]

},
{
  id: 'DL-553',
  orderId: 'SO-9814',
  customerId: 'cu-abc',
  projectId: 'sp-maple',
  date: 'Today',
  window: '10:30 – 12:00',
  sequence: 2,
  driverId: 'dr-2',
  truck: 'TRK-22 · Boom',
  status: 'Loading',
  eta: '10:30',
  address: '88 Maple Ridge Way, Cedar Park, TX 78613',
  siteContact: 'John Smith · (512) 555-0112',
  items: [
  { description: '2×4×92-5/8 Premium Stud', qty: 2140, unit: 'pcs', loaded: true },
  { description: '2×4×16 Treated Bottom Plate', qty: 180, unit: 'pcs', loaded: false },
  { description: 'Simpson LUS26 Joist Hanger', qty: 420, unit: 'ea', loaded: false }]

},
{
  id: 'DL-554',
  orderId: 'SO-9822',
  customerId: 'cu-stonebridge',
  projectId: 'sp-sunset',
  date: 'Today',
  window: '13:00 – 15:00',
  sequence: 3,
  status: 'Pending',
  eta: 'Needs a driver',
  address: '1200 Sunset Ridge Dr, Austin, TX 78745',
  siteContact: 'Peter Lund · (512) 555-0229',
  items: [{ description: '1-3/4 × 11-7/8 LVL Header', qty: 640, unit: 'lf', loaded: false }]
},
{
  /* Second run of John Alvarez's day — released by dispatch, not yet started. */
  id: 'DL-555',
  orderId: 'SO-9814',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  date: 'Today',
  window: '13:30 – 15:00',
  sequence: 4,
  driverId: 'dr-1',
  truck: 'TRK-18 · Flatbed',
  status: 'Scheduled',
  eta: '13:45',
  address: '1024 Oakwood Ln, Austin, TX 78704',
  siteContact: 'James Wilson · (512) 555-0121',
  items: [
  { description: '2×10×16 Floor Joist', qty: 96, unit: 'pcs', loaded: false },
  { description: 'Simpson LUS26 Joist Hanger', qty: 180, unit: 'ea', loaded: false },
  { description: '3/4 T&G Subfloor Sheathing', qty: 84, unit: 'sheets', loaded: false }]

},
{
  /* Already run and signed this morning — gives the driver a completed day. */
  id: 'DL-551',
  orderId: 'SO-9788',
  customerId: 'cu-hillcrest',
  projectId: 'sp-hill',
  date: 'Today',
  window: '06:30 – 07:30',
  sequence: 0,
  driverId: 'dr-1',
  truck: 'TRK-18 · Flatbed',
  status: 'Delivered',
  eta: 'Arrived 06:58',
  address: '14 Hillcrest Loop, Round Rock, TX 78664',
  siteContact: 'Marta Reyes · (512) 555-0224',
  items: [{ description: '2×6×92-5/8 Stud', qty: 320, unit: 'pcs', loaded: true }],
  pod: {
    receivedBy: 'Marta Reyes · Site Superintendent',
    signedAt: 'Today, 06:58',
    location: '30.5083, -97.6789 · at delivery address',
    photos: 3,
    notes: 'Staged inside the gate on the gravel pad.',
    exceptions: 'None reported'
  }
},
{
  id: 'DL-556',
  orderId: 'SO-9801',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  date: 'Tomorrow',
  window: '09:00 – 11:00',
  sequence: 2,
  driverId: 'dr-1',
  truck: 'TRK-18 · Flatbed',
  status: 'Scheduled',
  eta: '09:15',
  address: '1024 Oakwood Ln, Austin, TX 78704',
  siteContact: 'James Wilson · (512) 555-0121',
  items: [
  { description: '1-3/4 × 11-7/8 LVL Header', qty: 220, unit: 'lf', loaded: false },
  { description: '7/16 OSB Wall Sheathing', qty: 160, unit: 'sheets', loaded: false }]

},
{
  id: 'DL-549',
  orderId: 'SO-9788',
  customerId: 'cu-hillcrest',
  projectId: 'sp-hill',
  date: 'Tomorrow',
  window: '07:30 – 09:30',
  sequence: 1,
  driverId: 'dr-3',
  truck: 'TRK-07 · Flatbed',
  status: 'Scheduled',
  eta: '07:45',
  address: '14 Hillcrest Loop, Round Rock, TX 78664',
  siteContact: 'Marta Reyes · (512) 555-0224',
  items: [
  { description: '2×6×92-5/8 Stud', qty: 504, unit: 'pcs', loaded: false },
  { description: '7/16 OSB Wall Sheathing', qty: 151, unit: 'sheets', loaded: false }]

},
{
  id: 'DL-547',
  orderId: 'SO-9822',
  customerId: 'cu-stonebridge',
  projectId: 'sp-sunset',
  date: 'Yesterday',
  window: '14:00 – 16:00',
  sequence: 1,
  driverId: 'dr-4',
  truck: 'TRK-31 · Moffett',
  status: 'Delayed',
  eta: 'Rescheduled to Sep 04',
  address: '1200 Sunset Ridge Dr, Austin, TX 78745',
  siteContact: 'Peter Lund · (512) 555-0229',
  delayReason: 'Site crane occupied the drop zone until 17:00 — builder asked us to return',
  items: [{ description: '7/16 OSB Wall Sheathing', qty: 400, unit: 'sheets', loaded: true }]
},
{
  id: 'DL-540',
  orderId: 'SO-9801',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  date: 'Aug 25',
  window: '09:00 – 11:00',
  sequence: 1,
  driverId: 'dr-1',
  truck: 'TRK-18 · Flatbed',
  status: 'Delivered',
  eta: 'Arrived 10:42',
  address: '1024 Oakwood Ln, Austin, TX 78704',
  siteContact: 'James Wilson · (512) 555-0121',
  items: [
  { description: '2×4×92-5/8 Premium Stud', qty: 1180, unit: 'pcs', loaded: true },
  { description: '7/16 OSB Wall Sheathing', qty: 318, unit: 'sheets', loaded: true },
  { description: '1-3/4 × 11-7/8 LVL Header', qty: 148, unit: 'lf', loaded: true }],

  pod: {
    receivedBy: 'James Wilson · Superintendent',
    signedAt: 'Aug 25, 10:42',
    location: '30.2436, -97.7695 · at delivery address',
    photos: 4,
    notes: 'Dropped at the north stack pad. Builder counted with the driver.',
    exceptions: 'None reported'
  }
}];


/* ------------------------------------------------------------------ */
/* Get-paid loop                                                       */
/* ------------------------------------------------------------------ */

export const supplierInvoices: SupplierInvoice[] = [
{
  id: 'INV-8291',
  orderId: 'SO-9801',
  deliveryId: 'DL-540',
  customerId: 'cu-abc',
  projectId: 'sp-oakwood',
  issued: 'Aug 25',
  due: 'Sep 24',
  terms: 'Net 30',
  subtotal: 41200,
  discount: 0,
  deliveryFee: 380,
  tax: 3428,
  total: 42850,
  paid: 0,
  status: 'Pending'
},
{
  id: 'INV-8286',
  orderId: 'SO-9822',
  deliveryId: 'DL-547',
  customerId: 'cu-stonebridge',
  projectId: 'sp-sunset',
  issued: 'Aug 20',
  due: 'Aug 30',
  terms: 'Net 45',
  subtotal: 28400,
  discount: 900,
  deliveryFee: 640,
  tax: 2323,
  total: 30463,
  paid: 12000,
  status: 'Partially Paid'
},
{
  id: 'INV-8274',
  orderId: 'SO-9760',
  customerId: 'cu-hillcrest',
  projectId: 'sp-hill',
  issued: 'Jul 28',
  due: 'Aug 12',
  terms: 'Net 15',
  subtotal: 11600,
  discount: 0,
  deliveryFee: 285,
  tax: 981,
  total: 12866,
  paid: 0,
  status: 'Overdue'
},
{
  id: 'INV-8262',
  orderId: 'SO-9712',
  customerId: 'cu-stonebridge',
  projectId: 'sp-commerce',
  issued: 'Jul 14',
  due: 'Aug 28',
  terms: 'Net 45',
  subtotal: 54200,
  discount: 1200,
  deliveryFee: 480,
  tax: 4409,
  total: 57889,
  paid: 57889,
  status: 'Paid'
},
{
  id: 'INV-8255',
  orderId: 'SO-9698',
  customerId: 'cu-abc',
  projectId: 'sp-maple',
  issued: 'Jul 02',
  due: 'Aug 01',
  terms: 'Net 30',
  subtotal: 8900,
  discount: 0,
  deliveryFee: 240,
  tax: 754,
  total: 9894,
  paid: 0,
  status: 'Failed'
}];


export const supplierPayments: SupplierPayment[] = [
{
  id: 'PMT-5510',
  invoiceId: 'INV-8262',
  customerId: 'cu-stonebridge',
  amount: 57889,
  method: 'ACH transfer',
  date: 'Aug 12',
  reference: 'ACH ····4417',
  status: 'Cleared'
},
{
  id: 'PMT-5504',
  invoiceId: 'INV-8286',
  customerId: 'cu-stonebridge',
  amount: 12000,
  method: 'ACH transfer',
  date: 'Aug 28',
  reference: 'ACH ····4417',
  status: 'Cleared'
},
{
  id: 'PMT-5498',
  invoiceId: 'INV-8255',
  customerId: 'cu-abc',
  amount: 9894,
  method: 'Card on file',
  date: 'Aug 03',
  reference: 'Visa ····8842',
  status: 'Failed',
  failureReason: 'Issuer declined — card limit exceeded. Builder notified to retry with ACH.'
},
{
  id: 'PMT-5492',
  invoiceId: 'INV-8241',
  customerId: 'cu-hillcrest',
  amount: 4200,
  method: 'Check',
  date: 'Jul 30',
  reference: 'Check #10422',
  status: 'Cleared'
},
{
  id: 'PMT-5488',
  invoiceId: 'INV-8230',
  customerId: 'cu-abc',
  amount: 1850,
  method: 'ACH transfer',
  date: 'Jul 22',
  reference: 'ACH ····9021',
  status: 'Refunded'
}];


/* ------------------------------------------------------------------ */
/* Service                                                             */
/* ------------------------------------------------------------------ */

export const serviceCases: ServiceCase[] = [
{
  id: 'CS-1188',
  customerId: 'cu-abc',
  orderId: 'SO-9801',
  deliveryId: 'DL-540',
  subject: '3 LVL headers split at the end grain',
  category: 'Damage',
  priority: 'High',
  status: 'Investigating',
  opened: '2 hours ago',
  owner: 'Chris Bell',
  detail:
  'Superintendent reported three headers with end splits beyond spec after unloading. Photos attached to the POD show the damage before the truck left.',
  timeline: [
  { label: 'Case opened from POD exception', at: '2 hours ago', by: 'James Wilson · ABC Construction' },
  { label: 'Assigned to Chris Bell', at: '1 hour ago', by: 'Dana Whitmore' },
  { label: 'Photos reviewed — damage confirmed as mill defect', at: '38 min ago', by: 'Chris Bell' }]

},
{
  id: 'CS-1184',
  customerId: 'cu-stonebridge',
  orderId: 'SO-9822',
  deliveryId: 'DL-547',
  subject: 'Load turned away at site — crane blocking drop zone',
  category: 'Delivery',
  priority: 'Normal',
  status: 'Awaiting Customer',
  opened: 'Yesterday',
  owner: 'Chris Bell',
  detail: 'Driver waited 45 minutes. Builder asked us to return Sep 04. Re-delivery fee waived once.',
  timeline: [
  { label: 'Delay reported by driver', at: 'Yesterday 15:10', by: 'Leon Barrett' },
  { label: 'Re-delivery offered for Sep 04', at: 'Yesterday 16:02', by: 'Chris Bell' }]

},
{
  id: 'CS-1179',
  customerId: 'cu-hillcrest',
  orderId: 'SO-9760',
  subject: 'Invoice INV-8274 disputed — duplicate delivery fee',
  category: 'Billing',
  priority: 'Normal',
  status: 'Open',
  opened: '3 days ago',
  owner: 'Priya Nair',
  detail: 'Builder was charged a delivery fee on both partial loads. One fee should be credited.',
  timeline: [{ label: 'Case opened by customer', at: '3 days ago', by: 'Marta Reyes · Hillcrest Homes' }]
},
{
  id: 'CS-1171',
  customerId: 'cu-abc',
  orderId: 'SO-9698',
  subject: '18 studs short on the Maple Ridge load',
  category: 'Shortage',
  priority: 'Normal',
  status: 'Resolved',
  opened: 'Jul 08',
  owner: 'Chris Bell',
  detail: 'Count came up 18 short against the manifest.',
  resolution: 'Short quantity re-delivered Jul 10 at no charge; inventory adjusted against yard count.',
  timeline: [
  { label: 'Shortage reported on POD', at: 'Jul 08', by: 'John Smith · ABC Construction' },
  { label: 'Yard recount confirmed shortage', at: 'Jul 09', by: 'Dana Whitmore' },
  { label: 'Re-delivered and inventory adjusted', at: 'Jul 10', by: 'Chris Bell' }]

}];


/* ------------------------------------------------------------------ */
/* Engagement, audit, integration                                      */
/* ------------------------------------------------------------------ */

export const supplierNotifications: SupplierNotification[] = [
{
  id: 'sn-1',
  category: 'RFQ',
  title: 'New RFQ from ABC Construction',
  body: 'Oakwood Residence · approved takeoff TK-1024 · 7 material lines · quote due Sep 03',
  at: '18 min ago',
  read: false,
  to: '/supplier/rfqs/RFQ-2041',
  permission: 'rfq.view'
},
{
  id: 'sn-2',
  category: 'Takeoff',
  title: 'Takeoff line needs clarification',
  body: 'Sunset Apartments · OSB thickness conflict between plan sheet and shear wall schedule',
  at: '1 hour ago',
  read: false,
  to: '/supplier/takeoffs/RFQ-2035',
  permission: 'takeoff.review'
},
{
  id: 'sn-3',
  category: 'Quote',
  title: 'Revision requested on Q-10465',
  body: 'ABC Construction asked for re-pricing on the truss line',
  at: 'Yesterday',
  read: false,
  to: '/supplier/quotes/Q-10465',
  permission: 'quote.view'
},
{
  id: 'sn-4',
  category: 'Delivery',
  title: 'Load DL-554 has no driver',
  body: 'Scheduled 13:00 today · Sunset Apartments',
  at: '2 hours ago',
  read: false,
  to: '/supplier/deliveries',
  permission: 'delivery.dispatch'
},
{
  id: 'sn-5',
  category: 'Payment',
  title: 'Payment failed on INV-8255',
  body: 'Card declined for $9,894 · ABC Construction',
  at: 'Aug 03',
  read: true,
  to: '/supplier/payments',
  permission: 'payment.view'
},
{
  id: 'sn-6',
  category: 'Service',
  title: 'Damage case CS-1188 opened',
  body: '3 LVL headers reported split on the Oakwood delivery',
  at: '2 hours ago',
  read: true,
  to: '/supplier/service/CS-1188',
  permission: 'service.manage'
},
{
  id: 'sn-7',
  category: 'Order',
  title: 'Quote Q-10472 accepted',
  body: 'Stonebridge Development · sales order SO-9822 created',
  at: 'Aug 26',
  read: true,
  to: '/supplier/orders/SO-9822',
  permission: 'order.view'
}];


export const supplierAudit: AuditEntry[] = [
{
  id: 'au-1',
  actor: 'Tanya Brooks',
  action: 'Updated quote total',
  record: 'Q-10488 v2',
  at: '2 hours ago',
  branch: 'Round Rock Yard',
  customer: 'Hillcrest Homes',
  before: '$8,412',
  after: '$8,118'
},
{
  id: 'au-2',
  actor: 'Miguel Ortiz',
  action: 'Adjusted inbound takeoff quantity',
  record: 'RFQ-2038 · Tyvek HomeWrap',
  at: 'Aug 31',
  branch: 'Austin Yard',
  customer: 'Hillcrest Homes',
  before: '6 roll',
  after: '7 roll'
},
{
  id: 'au-3',
  actor: 'Dana Whitmore',
  action: 'Reassigned load to another driver',
  record: 'DL-547',
  at: 'Yesterday',
  branch: 'Austin Yard',
  customer: 'Stonebridge Development',
  before: 'Leon Barrett',
  after: 'Unassigned'
},
{
  id: 'au-4',
  actor: 'Priya Nair',
  action: 'Recorded partial payment',
  record: 'INV-8286',
  at: 'Aug 28',
  branch: 'Austin Yard',
  customer: 'Stonebridge Development',
  before: '$0 paid',
  after: '$12,000 paid'
},
{
  id: 'au-5',
  actor: 'Ray Coleman',
  action: 'Changed contract price',
  record: 'Pricing rule · 2×4 Premium Stud',
  at: 'Aug 20',
  branch: 'Austin Yard',
  customer: 'Stonebridge Development',
  before: '$4.72 / pcs',
  after: '$4.58 / pcs'
},
{
  id: 'au-6',
  actor: 'Ray Coleman',
  action: 'Granted role',
  record: 'Alicia Reyes',
  at: 'Aug 18',
  branch: 'Round Rock Yard',
  before: 'Estimator',
  after: 'Estimator, Sales Representative'
}];


export const syncEvents: SyncEvent[] = [
{ id: 'sy-1', entity: 'Products', direction: 'Inbound', records: 1842, at: '12 min ago', status: 'Synced' },
{ id: 'sy-2', entity: 'Inventory levels', direction: 'Inbound', records: 1842, at: '12 min ago', status: 'Synced' },
{ id: 'sy-3', entity: 'Customers', direction: 'Outbound', records: 5, at: '38 min ago', status: 'Synced' },
{
  id: 'sy-4',
  entity: 'Sales orders',
  direction: 'Outbound',
  records: 4,
  at: '1 hour ago',
  status: 'Conflict',
  detail: 'SO-9822 exists in Spruce with a different delivery date. Choose which record wins.'
},
{
  id: 'sy-5',
  entity: 'Invoices',
  direction: 'Outbound',
  records: 2,
  at: '2 hours ago',
  status: 'Retrying',
  detail: 'Spruce returned a 503. Attempt 2 of 5 scheduled in 4 minutes.'
},
{ id: 'sy-6', entity: 'Payments', direction: 'Inbound', records: 3, at: 'Yesterday', status: 'Synced' }];


export const supplierActivity = [
{ id: 'sa-1', actor: 'ABC Construction', action: 'sent RFQ-2041 with approved takeoff TK-1024', at: '18 min ago' },
{ id: 'sa-2', actor: 'Hillcrest Homes', action: 'viewed quote Q-10488', at: '41 min ago' },
{ id: 'sa-3', actor: 'John Alvarez', action: 'departed the yard on load DL-552', at: '1 hour ago' },
{ id: 'sa-4', actor: 'Miguel Ortiz', action: 'completed estimate EST-3309', at: 'Aug 31' },
{ id: 'sa-5', actor: 'Stonebridge Development', action: 'paid $12,000 against INV-8286', at: 'Aug 28' },
{ id: 'sa-6', actor: 'Tanya Brooks', action: 'created sales order SO-9822 from Q-10472', at: 'Aug 26' }];