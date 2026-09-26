import { PricingRule, Product, VendorPurchaseOrder } from '../types/supplier';

/** The yard's own catalog. Builder takeoff lines are mapped onto these SKUs. */
export const products: Product[] = [
{
  id: 'pd-stud24',
  name: '2×4×92-5/8 Premium Stud · SPF',
  sku: 'LBR-2492-PREM',
  category: 'Dimensional lumber',
  brand: 'Cascade Mill',
  unit: 'pcs',
  cost: 3.64,
  price: 4.82,
  onHand: 4820,
  reserved: 1310,
  incoming: 0,
  reorderLevel: 1500,
  status: 'Active'
},
{
  id: 'pd-stud26',
  name: '2×6×92-5/8 Stud · SPF #2',
  sku: 'LBR-2692-STD',
  category: 'Dimensional lumber',
  brand: 'Cascade Mill',
  unit: 'pcs',
  cost: 5.90,
  price: 7.65,
  onHand: 1240,
  reserved: 640,
  incoming: 800,
  reorderLevel: 900,
  status: 'Low Stock'
},
{
  id: 'pd-plate',
  name: '2×4×16 Treated Bottom Plate',
  sku: 'LBR-2416-PT',
  category: 'Treated lumber',
  brand: 'SouthPine',
  unit: 'pcs',
  cost: 12.10,
  price: 15.40,
  onHand: 620,
  reserved: 180,
  incoming: 0,
  reorderLevel: 200,
  status: 'Active'
},
{
  id: 'pd-osb',
  name: '7/16 OSB Wall Sheathing 4×8',
  sku: 'SHT-OSB-716',
  category: 'Sheathing',
  brand: 'Norbord',
  unit: 'sheets',
  cost: 18.20,
  price: 23.95,
  onHand: 940,
  reserved: 318,
  incoming: 400,
  reorderLevel: 350,
  status: 'Active'
},
{
  id: 'pd-lvl',
  name: '1-3/4 × 11-7/8 LVL Header',
  sku: 'ENG-LVL-1178',
  category: 'Engineered lumber',
  brand: 'Weyerhaeuser',
  unit: 'lf',
  cost: 9.85,
  price: 13.20,
  onHand: 320,
  reserved: 148,
  incoming: 0,
  reorderLevel: 150,
  status: 'Active'
},
{
  id: 'pd-truss',
  name: 'Engineered Roof Truss · 28ft span',
  sku: 'TRS-28-ENG',
  category: 'Trusses',
  brand: 'Central Truss Co.',
  unit: 'ea',
  cost: 178.00,
  price: 232.00,
  onHand: 0,
  reserved: 0,
  incoming: 24,
  reorderLevel: 6,
  status: 'Backordered'
},
{
  id: 'pd-joisthanger',
  name: 'Simpson LUS26 Joist Hanger',
  sku: 'HDW-LUS26',
  category: 'Framing hardware',
  brand: 'Simpson Strong-Tie',
  unit: 'ea',
  cost: 1.12,
  price: 1.68,
  onHand: 3200,
  reserved: 420,
  incoming: 0,
  reorderLevel: 800,
  status: 'Active'
},
{
  id: 'pd-housewrap',
  name: 'Tyvek HomeWrap 9ft × 150ft',
  sku: 'WRP-TYV-9150',
  category: 'Weather barrier',
  brand: 'DuPont',
  unit: 'roll',
  cost: 142.00,
  price: 186.00,
  onHand: 46,
  reserved: 12,
  incoming: 0,
  reorderLevel: 20,
  status: 'Active'
}];


export function productById(id?: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function available(p: Product): number {
  return Math.max(0, p.onHand - p.reserved);
}

/**
 * Customer-specific pricing. This data is scoped to one builder relationship
 * and is never visible to another builder or another supplier.
 */
export const pricingRules: PricingRule[] = [
{
  id: 'pr-1',
  customerId: 'cu-abc',
  productId: 'pd-stud24',
  standard: 5.2,
  contract: 4.82,
  volumeBreak: '1,000+ pcs',
  effective: 'Jan 1 2026 – Dec 31 2026'
},
{
  id: 'pr-2',
  customerId: 'cu-abc',
  productId: 'pd-osb',
  standard: 25.4,
  contract: 23.95,
  volumeBreak: '250+ sheets',
  effective: 'Jan 1 2026 – Dec 31 2026'
},
{
  id: 'pr-3',
  customerId: 'cu-stonebridge',
  productId: 'pd-stud24',
  standard: 5.2,
  contract: 4.58,
  volumeBreak: '2,500+ pcs',
  effective: 'Apr 1 2026 – Mar 31 2027'
},
{
  id: 'pr-4',
  customerId: 'cu-stonebridge',
  productId: 'pd-truss',
  standard: 232,
  contract: 218,
  volumeBreak: '20+ ea',
  effective: 'Apr 1 2026 – Mar 31 2027'
},
{
  id: 'pr-5',
  customerId: 'cu-hillcrest',
  productId: 'pd-stud26',
  standard: 7.65,
  contract: 7.35,
  volumeBreak: '500+ pcs',
  effective: 'Aug 1 2026 – Jul 31 2027'
}];


/** Buy-ins raised when a sales order cannot be filled from the yard. */
export const vendorPurchaseOrders: VendorPurchaseOrder[] = [
{
  id: 'VPO-4471',
  vendor: 'Central Truss Co.',
  productId: 'pd-truss',
  qty: 24,
  unit: 'ea',
  cost: 178,
  eta: 'Sep 08',
  status: 'Ordered',
  forOrderId: 'SO-9822'
},
{
  id: 'VPO-4468',
  vendor: 'Cascade Mill',
  productId: 'pd-stud26',
  qty: 800,
  unit: 'pcs',
  cost: 5.9,
  eta: 'Sep 04',
  status: 'In Transit',
  forOrderId: 'SO-9822'
},
{
  id: 'VPO-4465',
  vendor: 'Norbord',
  productId: 'pd-osb',
  qty: 400,
  unit: 'sheets',
  cost: 18.2,
  eta: 'Sep 03',
  status: 'In Transit'
},
{
  id: 'VPO-4459',
  vendor: 'SouthPine',
  productId: 'pd-plate',
  qty: 300,
  unit: 'pcs',
  cost: 12.1,
  eta: 'Aug 28',
  status: 'Received'
}];