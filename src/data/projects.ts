import { PlanSet, Project, Takeoff } from '../types';
import { IMAGES } from './images';

export const projects: Project[] = [
{
  id: 'pr-1024',
  number: 'PR-1024',
  name: 'Oakwood Residence',
  address: '218 Oakwood Dr, Austin, TX',
  image: IMAGES.projectResidence,
  status: 'In Progress',
  progress: 64,
  procurement: 72,
  value: 850000,
  spend: 245800,
  managerId: 'u-2',
  branchId: 'br-1',
  startDate: 'Mar 4, 2026',
  targetDate: 'Dec 18, 2026',
  nextMilestone: 'Framing inspection',
  nextMilestoneDate: 'Aug 27',
  openIssues: 2,
  pendingActions: 4,
  supplierIds: ['sp-1', 'sp-2'],
  lastActivity: 'Quote received · 32 min ago',
  description:
  'Custom 4,200 sq ft two-story residence with detached garage. Framing package procurement in progress.'
},
{
  id: 'pr-1031',
  number: 'PR-1031',
  name: 'Maple Ridge Villas',
  address: '90 Maple Ridge Ln, Round Rock, TX',
  image: IMAGES.projectVillas,
  status: 'In Progress',
  progress: 78,
  procurement: 84,
  value: 2400000,
  spend: 1180400,
  managerId: 'u-2',
  branchId: 'br-1',
  startDate: 'Nov 12, 2025',
  targetDate: 'Oct 2, 2026',
  nextMilestone: 'Roof dry-in — Building C',
  nextMilestoneDate: 'Aug 24',
  openIssues: 1,
  pendingActions: 2,
  supplierIds: ['sp-1', 'sp-3'],
  lastActivity: 'Material request submitted · 2 hr ago',
  description:
  'Six-unit villa development delivered in three phases. Buildings A and B are closed in.'
},
{
  id: 'pr-1042',
  number: 'PR-1042',
  name: 'Sunset Apartments',
  address: '1150 Sunset Blvd, Austin, TX',
  image: IMAGES.projectApartments,
  status: 'At Risk',
  progress: 41,
  procurement: 51,
  value: 5600000,
  spend: 1842000,
  managerId: 'u-6',
  branchId: 'br-1',
  startDate: 'Jan 20, 2026',
  targetDate: 'Jun 30, 2027',
  nextMilestone: 'Level 3 deck pour',
  nextMilestoneDate: 'Aug 21',
  openIssues: 5,
  pendingActions: 3,
  supplierIds: ['sp-2', 'sp-3'],
  lastActivity: 'Delivery delayed · 4 hr ago',
  description:
  '48-unit mid-rise apartment building. Concrete schedule is two weeks behind baseline.'
},
{
  id: 'pr-1049',
  number: 'PR-1049',
  name: 'Birch Street Offices',
  address: '77 Birch St, San Antonio, TX',
  image: IMAGES.projectCommercial,
  status: 'Planning',
  progress: 8,
  procurement: 12,
  value: 1750000,
  spend: 96500,
  managerId: 'u-6',
  branchId: 'br-2',
  startDate: 'Jul 30, 2026',
  targetDate: 'Aug 14, 2027',
  nextMilestone: 'Permit issuance',
  nextMilestoneDate: 'Sep 3',
  openIssues: 0,
  pendingActions: 1,
  supplierIds: ['sp-3'],
  lastActivity: 'Plan set V1 uploaded · Yesterday',
  description:
  'Single-story tilt-up commercial office shell with tenant improvement allowance.'
}];


export function projectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function projectName(id: string): string {
  return projectById(id)?.name ?? 'Unknown project';
}

export const planSets: PlanSet[] = [
{
  id: 'ps-3',
  projectId: 'pr-1024',
  name: 'Oakwood — Architectural Set',
  version: 3,
  isCurrent: true,
  uploadedBy: 'John Smith',
  uploadedAt: 'Aug 19, 2026 · 9:12 AM',
  sheets: 42,
  sizeMb: 68.4,
  note: 'Revised framing plan after structural review.'
},
{
  id: 'ps-2',
  projectId: 'pr-1024',
  name: 'Oakwood — Architectural Set',
  version: 2,
  isCurrent: false,
  uploadedBy: 'John Smith',
  uploadedAt: 'Aug 12, 2026 · 4:40 PM',
  sheets: 40,
  sizeMb: 64.1,
  note: 'Window schedule corrections.'
},
{
  id: 'ps-1',
  projectId: 'pr-1024',
  name: 'Oakwood — Architectural Set',
  version: 1,
  isCurrent: false,
  uploadedBy: 'Alex Whitfield',
  uploadedAt: 'Aug 5, 2026 · 10:02 AM',
  sheets: 38,
  sizeMb: 61.8,
  note: 'Permit submission set.'
},
{
  id: 'ps-10',
  projectId: 'pr-1031',
  name: 'Maple Ridge — Building C',
  version: 2,
  isCurrent: true,
  uploadedBy: 'John Smith',
  uploadedAt: 'Aug 15, 2026 · 8:20 AM',
  sheets: 31,
  sizeMb: 44.2,
  note: 'Roof truss layout added.'
},
{
  id: 'ps-11',
  projectId: 'pr-1049',
  name: 'Birch Street — Shell Set',
  version: 1,
  isCurrent: true,
  uploadedBy: 'Ethan Brooks',
  uploadedAt: 'Aug 17, 2026 · 3:05 PM',
  sheets: 22,
  sizeMb: 29.7,
  note: 'Initial issue for pricing.'
}];


export const takeoffs: Takeoff[] = [
{
  id: 'TK-1024',
  projectId: 'pr-1024',
  planSetId: 'ps-3',
  planSetLabel: 'Architectural Set · V3',
  status: 'Review Required',
  createdAt: 'Aug 19, 2026 · 9:41 AM',
  model: 'SM Vision 2.4',
  runRef: 'run_8f31c7',
  items: [
  {
    id: 'ti-1',
    category: 'Framing Lumber',
    item: '2×4 SPF Stud — 8 ft',
    unit: 'ea',
    aiQuantity: 1240,
    correctedQuantity: 1180,
    correctionReason: 'Interior partition on A-102 was double counted.',
    correctedBy: 'John Smith',
    correctedAt: 'Aug 19 · 10:22 AM',
    confidence: 94,
    sheet: 'A1.01',
    page: 4,
    status: 'edited'
  },
  {
    id: 'ti-2',
    category: 'Framing Lumber',
    item: '2×6 SPF — 10 ft',
    unit: 'ea',
    aiQuantity: 640,
    correctedQuantity: 620,
    correctionReason: 'Exterior wall length adjusted to revised dimension.',
    correctedBy: 'John Smith',
    correctedAt: 'Aug 19 · 10:26 AM',
    confidence: 91,
    sheet: 'A2.01',
    page: 8,
    status: 'edited'
  },
  {
    id: 'ti-3',
    category: 'Sheathing',
    item: '½" CDX Plywood 4×8',
    unit: 'sheet',
    aiQuantity: 320,
    correctedQuantity: null,
    confidence: 88,
    sheet: 'S1.01',
    page: 21,
    status: 'accepted'
  },
  {
    id: 'ti-4',
    category: 'Sheathing',
    item: '⅝" OSB Roof Sheathing',
    unit: 'sheet',
    aiQuantity: 186,
    correctedQuantity: null,
    confidence: 72,
    sheet: 'S2.04',
    page: 24,
    status: 'pending'
  },
  {
    id: 'ti-5',
    category: 'Engineered Lumber',
    item: 'LVL Beam 1¾×11⅞',
    unit: 'lf',
    aiQuantity: 148,
    correctedQuantity: null,
    confidence: 61,
    sheet: 'S2.10',
    page: 27,
    status: 'pending'
  },
  {
    id: 'ti-6',
    category: 'Fasteners',
    item: '16d Framing Nails — 50 lb',
    unit: 'box',
    aiQuantity: 24,
    correctedQuantity: null,
    confidence: 83,
    sheet: 'S1.01',
    page: 21,
    status: 'pending'
  },
  {
    id: 'ti-7',
    category: 'Hardware',
    item: 'Simpson H2.5A Hurricane Tie',
    unit: 'ea',
    aiQuantity: 410,
    correctedQuantity: null,
    confidence: 55,
    sheet: 'S2.04',
    page: 24,
    status: 'pending'
  }]

},
{
  id: 'TK-1031',
  projectId: 'pr-1031',
  planSetId: 'ps-10',
  planSetLabel: 'Building C · V2',
  status: 'Approved',
  createdAt: 'Aug 15, 2026 · 11:05 AM',
  model: 'SM Vision 2.4',
  runRef: 'run_7ba412',
  approvedBy: 'Dana Kim',
  approvedAt: 'Aug 16, 2026 · 9:14 AM',
  items: [
  {
    id: 'tj-1',
    category: 'Roof Truss',
    item: 'Truss T1 — 28 ft span',
    unit: 'ea',
    aiQuantity: 46,
    correctedQuantity: 44,
    correctionReason: 'Gable end handled as stick frame.',
    correctedBy: 'Dana Kim',
    correctedAt: 'Aug 16 · 8:51 AM',
    confidence: 96,
    sheet: 'S3.01',
    page: 8,
    status: 'edited'
  },
  {
    id: 'tj-2',
    category: 'Sheathing',
    item: '⅝" OSB Roof Sheathing',
    unit: 'sheet',
    aiQuantity: 210,
    correctedQuantity: null,
    confidence: 92,
    sheet: 'S3.02',
    page: 9,
    status: 'accepted'
  }]

}];


export function takeoffById(id: string): Takeoff | undefined {
  return takeoffs.find((t) => t.id === id);
}

export function finalQty(item: {aiQuantity: number;correctedQuantity: number | null;}): number {
  return item.correctedQuantity ?? item.aiQuantity;
}