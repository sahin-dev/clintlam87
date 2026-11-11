/**
 * Single source of truth for every photographic asset in the product.
 * Keeping them here means an image is never referenced from more than one place
 * and a broken URL can be fixed once. Files live in `public/images/`.
 */
export const IMAGES = {
  projectResidence: '/images/project-residence.webp',
  projectVillas: '/images/project-villas.webp',
  projectApartments: '/images/project-apartments.webp',
  projectCommercial: '/images/project-commercial.webp',
  blueprint: '/images/plans-on-desk.webp',
  aiAnalysis: '/images/plans-on-tablet.webp',
  lumberYard: '/images/lumber-yard.webp',
  deliveryTruck: '/images/delivery-truck.webp',
  jobsite: '/images/jobsite.webp',
  materialsStaged: '/images/materials-staged.webp'
} as const;

/**
 * Vector construction sheets used by the takeoff viewers, one per sheet code.
 * They stand in for the rasterised PDF pages a real plan set would supply;
 * codes without a dedicated sheet fall back to the closest discipline.
 */
const DRAWING_SHEETS = new Set([
  'A1.01', 'A1.02', 'A2.01', 'A6.01', 'A7.01', 'S1.01', 'S2.04', 'S2.10', 'S3.01', 'S3.02'
]);
const DISCIPLINE_FALLBACK: Record<string, string> = {
  A1: 'A1.01', A2: 'A2.01', A6: 'A6.01', A7: 'A7.01', S1: 'S1.01', S2: 'S2.04', S3: 'S3.01', S4: 'S2.10'
};

export function drawingFor(sheetCode: string): string {
  const code = DRAWING_SHEETS.has(sheetCode) ?
  sheetCode :
  DISCIPLINE_FALLBACK[sheetCode.slice(0, 2)] ?? 'A1.01';
  return `/drawings/${code.replace('.', '-')}.svg`;
}
