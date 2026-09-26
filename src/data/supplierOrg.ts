import { IMAGES } from './images';
import {
  Driver,
  SupplierBranch,
  SupplierCustomer,
  SupplierProject,
  SupplierStaff } from
'../types/supplier';

export const supplierOrg = {
  id: 'sup-abc',
  name: 'ABC Lumber & Supply',
  type: 'Lumber yard / building materials',
  address: '4820 Industrial Blvd, Austin, TX 78744',
  phone: '(512) 555-0140',
  website: 'abclumber.com',
  hours: 'Mon–Fri 6:00–17:00 · Sat 7:00–12:00',
  yardImage: IMAGES.lumberYard
};

export const supplierBranches: SupplierBranch[] = [
{ id: 'sb-austin', name: 'Austin Yard', city: 'Austin, TX', yard: 'Yard 1 · 14 acres' },
{ id: 'sb-round', name: 'Round Rock Yard', city: 'Round Rock, TX', yard: 'Yard 2 · 6 acres' },
{ id: 'sb-sanmarcos', name: 'San Marcos Yard', city: 'San Marcos, TX', yard: 'Yard 3 · 4 acres' }];


export const supplierCurrentUserId = 'ss-1';

export const supplierStaff: SupplierStaff[] = [
{
  id: 'ss-1',
  name: 'Ray Coleman',
  email: 'ray@abclumber.com',
  roles: ['management', 'sales', 'estimator', 'dispatcher', 'accounting', 'administrator', 'service', 'driver'],
  branchId: 'sb-austin',
  status: 'Active'
},
{
  id: 'ss-2',
  name: 'Tanya Brooks',
  email: 'tanya@abclumber.com',
  roles: ['sales'],
  branchId: 'sb-austin',
  status: 'Active'
},
{
  id: 'ss-3',
  name: 'Miguel Ortiz',
  email: 'miguel@abclumber.com',
  roles: ['estimator'],
  branchId: 'sb-austin',
  status: 'Active'
},
{
  id: 'ss-4',
  name: 'Dana Whitmore',
  email: 'dana@abclumber.com',
  roles: ['dispatcher'],
  branchId: 'sb-austin',
  status: 'Active'
},
{
  id: 'ss-5',
  name: 'John Alvarez',
  email: 'john.d@abclumber.com',
  roles: ['driver'],
  branchId: 'sb-austin',
  status: 'Active'
},
{
  id: 'ss-6',
  name: 'Priya Nair',
  email: 'priya@abclumber.com',
  roles: ['accounting'],
  branchId: 'sb-austin',
  status: 'Active'
},
{
  id: 'ss-7',
  name: 'Chris Bell',
  email: 'chris@abclumber.com',
  roles: ['service'],
  branchId: 'sb-round',
  status: 'Active'
},
{
  id: 'ss-8',
  name: 'Alicia Reyes',
  email: 'alicia@abclumber.com',
  roles: ['estimator', 'sales'],
  branchId: 'sb-round',
  status: 'Invited'
}];


export const drivers: Driver[] = [
{ id: 'dr-1', name: 'John Alvarez', phone: '(512) 555-0182', truck: 'TRK-18 · Flatbed', status: 'On Route', runsToday: 3 },
{ id: 'dr-2', name: 'Mike Sowell', phone: '(512) 555-0166', truck: 'TRK-22 · Boom', status: 'Loading', runsToday: 2 },
{ id: 'dr-3', name: 'David Pham', phone: '(512) 555-0171', truck: 'TRK-07 · Flatbed', status: 'Available', runsToday: 1 },
{ id: 'dr-4', name: 'Leon Barrett', phone: '(512) 555-0193', truck: 'TRK-31 · Moffett', status: 'Off Duty', runsToday: 0 }];


/* ------------------------------------------------------------------ */
/* Customers — builder organizations connected to this yard.           */
/* ------------------------------------------------------------------ */

export const supplierCustomers: SupplierCustomer[] = [
{
  id: 'cu-abc',
  name: 'ABC Construction',
  city: 'Austin, TX',
  branchId: 'sb-austin',
  status: 'Active',
  since: 'Mar 2021',
  contacts: [
  { name: 'Alex Whitfield', title: 'Owner / Administrator', email: 'alex@abcconstruction.com', phone: '(512) 555-0110' },
  { name: 'John Smith', title: 'Project Manager', email: 'john@abcconstruction.com', phone: '(512) 555-0112' },
  { name: 'Dana Kim', title: 'Purchasing Manager', email: 'dana@abcconstruction.com', phone: '(512) 555-0118' }],

  terms: 'Net 30',
  creditLimit: 250000,
  creditUsed: 96420,
  pricingTier: 'Contract tier B',
  activeProjects: 3,
  openQuotes: 2,
  openOrders: 3,
  outstanding: 42850,
  lastActivity: '18 min ago'
},
{
  id: 'cu-hillcrest',
  name: 'Hillcrest Homes',
  city: 'Round Rock, TX',
  branchId: 'sb-round',
  status: 'Active',
  since: 'Aug 2022',
  contacts: [
  { name: 'Marta Reyes', title: 'Owner', email: 'marta@hillcresthomes.com', phone: '(512) 555-0224' },
  { name: 'Peter Lund', title: 'Superintendent', email: 'peter@hillcresthomes.com', phone: '(512) 555-0229' }],

  terms: 'Net 15',
  creditLimit: 120000,
  creditUsed: 31200,
  pricingTier: 'Standard',
  activeProjects: 2,
  openQuotes: 1,
  openOrders: 1,
  outstanding: 12480,
  lastActivity: '2 hours ago'
},
{
  id: 'cu-brightpath',
  name: 'Brightpath Builders',
  city: 'San Marcos, TX',
  branchId: 'sb-sanmarcos',
  status: 'Pending',
  since: 'Requested Aug 30',
  contacts: [
  { name: 'Owen Vance', title: 'Managing Partner', email: 'owen@brightpath.build', phone: '(512) 555-0338' }],

  terms: 'Not set',
  creditLimit: 0,
  creditUsed: 0,
  pricingTier: 'Not set',
  activeProjects: 0,
  openQuotes: 0,
  openOrders: 0,
  outstanding: 0,
  lastActivity: '1 day ago',
  requestNote:
  'We are starting two spec homes in Kyle and would like to price framing packages with your Austin yard.'
},
{
  id: 'cu-stonebridge',
  name: 'Stonebridge Development',
  city: 'Austin, TX',
  branchId: 'sb-austin',
  status: 'Active',
  since: 'Jan 2019',
  contacts: [
  { name: 'Grace Hollis', title: 'VP Construction', email: 'grace@stonebridge.dev', phone: '(512) 555-0441' }],

  terms: 'Net 45',
  creditLimit: 500000,
  creditUsed: 210500,
  pricingTier: 'Contract tier A',
  activeProjects: 4,
  openQuotes: 3,
  openOrders: 5,
  outstanding: 88600,
  lastActivity: 'Yesterday'
},
{
  id: 'cu-elmwood',
  name: 'Elmwood Contracting',
  city: 'Buda, TX',
  branchId: 'sb-sanmarcos',
  status: 'Inactive',
  since: 'Feb 2020',
  contacts: [
  { name: 'Sam Croft', title: 'Owner', email: 'sam@elmwoodco.com', phone: '(512) 555-0556' }],

  terms: 'Prepay',
  creditLimit: 40000,
  creditUsed: 0,
  pricingTier: 'Standard',
  activeProjects: 0,
  openQuotes: 0,
  openOrders: 0,
  outstanding: 0,
  lastActivity: '4 months ago'
}];


/* ------------------------------------------------------------------ */
/* Projects the supplier has been given access to.                     */
/* ------------------------------------------------------------------ */

export const supplierProjects: SupplierProject[] = [
{
  id: 'sp-oakwood',
  name: 'Oakwood Residence',
  number: 'PR-1024',
  customerId: 'cu-abc',
  city: 'Austin, TX',
  status: 'Estimating',
  estimator: 'Miguel Ortiz',
  salesRep: 'Tanya Brooks',
  value: 245800,
  lastActivity: 'RFQ received 18 min ago',
  image: IMAGES.projectResidence,
  sharedScope: ['Approved takeoff TK-1024', 'Plan set Rev 04 (24 sheets)', 'Delivery address & site contact']
},
{
  id: 'sp-maple',
  name: 'Maple Ridge Villas',
  number: 'PR-1031',
  customerId: 'cu-abc',
  city: 'Cedar Park, TX',
  status: 'Order in Progress',
  estimator: 'Miguel Ortiz',
  salesRep: 'Tanya Brooks',
  value: 418600,
  lastActivity: 'Order SO-9822 confirmed yesterday',
  image: IMAGES.projectVillas,
  sharedScope: ['Approved takeoff TK-1031', 'Plan set Rev 02', 'Delivery schedule']
},
{
  id: 'sp-sunset',
  name: 'Sunset Apartments',
  number: 'PR-1042',
  customerId: 'cu-stonebridge',
  city: 'Austin, TX',
  status: 'Delivery in Progress',
  estimator: 'Alicia Reyes',
  salesRep: 'Tanya Brooks',
  value: 962400,
  lastActivity: 'Load DL-552 out for delivery',
  image: IMAGES.projectApartments,
  sharedScope: ['Approved takeoff TK-1042', 'Plan set Rev 07', 'Site logistics plan']
},
{
  id: 'sp-hill',
  name: 'Hillcrest Lot 14',
  number: 'PR-2210',
  customerId: 'cu-hillcrest',
  city: 'Round Rock, TX',
  status: 'Quoted',
  estimator: 'Miguel Ortiz',
  salesRep: 'Tanya Brooks',
  value: 96500,
  lastActivity: 'Quote Q-10488 sent 2 hours ago',
  image: IMAGES.projectResidence,
  sharedScope: ['Approved takeoff TK-2210', 'Plan set Rev 01']
},
{
  id: 'sp-commerce',
  name: 'Commerce Park Building C',
  number: 'PR-1055',
  customerId: 'cu-stonebridge',
  city: 'Pflugerville, TX',
  status: 'Completed',
  estimator: 'Alicia Reyes',
  salesRep: 'Tanya Brooks',
  value: 1240000,
  lastActivity: 'Final payment cleared Aug 12',
  image: IMAGES.projectCommercial,
  sharedScope: ['Approved takeoff TK-1055', 'Plan set Rev 11', 'Closeout documents']
}];


export function customerName(id: string): string {
  return supplierCustomers.find((c) => c.id === id)?.name ?? 'Unknown builder';
}

export function supplierProjectName(id: string): string {
  return supplierProjects.find((p) => p.id === id)?.name ?? 'Unknown project';
}

export function branchName(id: string): string {
  return supplierBranches.find((b) => b.id === id)?.name ?? 'All branches';
}

export function driverName(id?: string): string {
  if (!id) return 'Unassigned';
  return drivers.find((d) => d.id === id)?.name ?? 'Unassigned';
}