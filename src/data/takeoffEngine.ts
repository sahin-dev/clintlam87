import { TakeoffRun } from '../types/takeoff';
import { drawingFor } from './images';

/**
 * Engineering detail behind the AI runs: the drawing index, the pre-flight
 * validation, the detected objects with per-attribute confidence, how each
 * quantity was derived, the open issues, the cross-sheet reconciliations,
 * the verification gates and the revision delta.
 *
 * Keyed by takeoff id so a workspace can load its own run.
 */


const oakwood: TakeoffRun = {
  takeoffId: 'TK-1024',
  planSetLabel: 'Oakwood — Architectural + Structural',
  revision: 'Rev 04',
  previousRevision: 'Rev 03',
  takeoffType: 'Framing takeoff',
  model: 'SM Vision 2.4',
  runRef: 'run_8f31c7',
  startedAt: 'Aug 19, 2026 · 9:41 AM',
  durationSeconds: 412,

  sheets: [
  {
    id: 'sh-1',
    code: 'A1.01',
    title: 'First Floor Plan',
    page: 4,
    discipline: 'Floor Plan',
    classificationConfidence: 99,
    scale: '1/4" = 1\'-0"',
    image: drawingFor('A1.01'),
    reviewed: true,
    issueCount: 0,
    objectIds: ['ob-w14', 'ob-w15']
  },
  {
    id: 'sh-2',
    code: 'A1.02',
    title: 'Second Floor Plan',
    page: 5,
    discipline: 'Floor Plan',
    classificationConfidence: 98,
    scale: '1/4" = 1\'-0"',
    image: drawingFor('A1.02'),
    reviewed: true,
    issueCount: 1,
    objectIds: ['ob-w22']
  },
  {
    id: 'sh-3',
    code: 'A2.01',
    title: 'Exterior Elevations',
    page: 8,
    discipline: 'Elevation',
    classificationConfidence: 96,
    scale: '1/4" = 1\'-0"',
    image: drawingFor('A2.01'),
    reviewed: false,
    issueCount: 1,
    objectIds: ['ob-wall-ht']
  },
  {
    id: 'sh-4',
    code: 'S1.01',
    title: 'Foundation & Framing Plan',
    page: 21,
    discipline: 'Structural',
    classificationConfidence: 97,
    scale: '1/4" = 1\'-0"',
    image: drawingFor('S1.01'),
    reviewed: false,
    issueCount: 2,
    objectIds: ['ob-hdr-3', 'ob-floor-1']
  },
  {
    id: 'sh-5',
    code: 'S2.04',
    title: 'Roof Framing Plan',
    page: 24,
    discipline: 'Roof',
    classificationConfidence: 94,
    scale: '3/16" = 1\'-0"',
    image: drawingFor('S2.04'),
    reviewed: false,
    issueCount: 2,
    objectIds: ['ob-roof-1']
  },
  {
    id: 'sh-6',
    code: 'S2.10',
    title: 'Beam & Header Schedule',
    page: 27,
    discipline: 'Schedule',
    classificationConfidence: 91,
    scale: 'N/A — schedule',
    image: drawingFor('S2.10'),
    reviewed: false,
    issueCount: 1,
    objectIds: ['ob-sched-lvl']
  },
  {
    id: 'sh-7',
    code: 'A6.01',
    title: 'Door Schedule',
    page: 31,
    discipline: 'Schedule',
    classificationConfidence: 99,
    scale: 'N/A — schedule',
    image: drawingFor('A6.01'),
    reviewed: true,
    issueCount: 0,
    objectIds: []
  },
  {
    id: 'sh-8',
    code: 'A7.01',
    title: 'Window Schedule',
    page: 32,
    discipline: 'Schedule',
    classificationConfidence: 72,
    reclassifiedBy: 'John Smith',
    scale: 'N/A — schedule',
    image: drawingFor('A7.01'),
    reviewed: false,
    issueCount: 1,
    objectIds: ['ob-sched-win']
  }],


  validation: [
  {
    id: 'v-read',
    label: 'File readability',
    state: 'pass',
    detail: 'All 42 sheets rasterised at 300 dpi or better.',
    blocking: true
  },
  {
    id: 'v-required',
    label: 'Required sheets present',
    state: 'pass',
    detail: 'Floor plans, elevations, structural and schedules all found.',
    blocking: true
  },
  {
    id: 'v-scale',
    label: 'Scale detection',
    state: 'warn',
    detail: 'S2.04 is drawn at 3/16" while the set is 1/4". Confirmed from the title block.',
    blocking: false
  },
  {
    id: 'v-rev',
    label: 'Revision identifiable',
    state: 'pass',
    detail: 'Rev 04 read from every title block, dated Aug 19 2026.',
    blocking: true
  },
  {
    id: 'v-dupe',
    label: 'Duplicate sheets',
    state: 'warn',
    detail: 'A1.02 appears twice; the later stamp was kept and the earlier ignored.',
    blocking: false
  },
  {
    id: 'v-missing',
    label: 'Missing pages',
    state: 'pass',
    detail: 'Sheet index matches the 42 pages supplied — no gaps.',
    blocking: true
  },
  {
    id: 'v-integrity',
    label: 'Document integrity',
    state: 'pass',
    detail: 'No encryption, no damaged page streams.',
    blocking: true
  }],


  objects: [
  {
    id: 'ob-w14',
    sheetCode: 'A1.01',
    type: 'Wall',
    tag: 'W14 — Exterior bearing',
    region: { x: 16, y: 22, w: 30, h: 13 },
    attributes: [
    { attribute: 'Wall existence', value: 'Detected', confidence: 99.7 },
    { attribute: 'Wall length', value: "42'-6\"", confidence: 99.1 },
    { attribute: 'Wall type', value: '2×6 exterior bearing', confidence: 97.2 },
    { attribute: 'Wall height', value: "9'-1⅛\"", confidence: 84.3 },
    { attribute: 'Stud spacing', value: '16" o.c.', confidence: 61.8 }],

    verification: 'needs_review',
    contributesTo: ['ti-2']
  },
  {
    id: 'ob-w15',
    sheetCode: 'A1.01',
    type: 'Wall',
    tag: 'W15 — Interior partition',
    region: { x: 52, y: 30, w: 22, h: 10 },
    attributes: [
    { attribute: 'Wall existence', value: 'Detected', confidence: 99.4 },
    { attribute: 'Wall length', value: "18'-0\"", confidence: 98.6 },
    { attribute: 'Wall type', value: '2×4 non-bearing', confidence: 96.1 },
    { attribute: 'Wall height', value: "8'-1⅛\"", confidence: 93.5 },
    { attribute: 'Stud spacing', value: '16" o.c.', confidence: 88.2 }],

    verification: 'human_corrected',
    contributesTo: ['ti-1']
  },
  {
    id: 'ob-w22',
    sheetCode: 'A1.02',
    type: 'Wall',
    tag: 'W22 — Stair wall',
    region: { x: 30, y: 48, w: 18, h: 16 },
    attributes: [
    { attribute: 'Wall existence', value: 'Detected', confidence: 98.9 },
    { attribute: 'Wall length', value: "12'-4\"", confidence: 94.0 },
    { attribute: 'Wall type', value: '2×4 non-bearing', confidence: 91.7 },
    { attribute: 'Wall height', value: 'Varies — raked', confidence: 58.4 }],

    verification: 'needs_review',
    contributesTo: ['ti-1']
  },
  {
    id: 'ob-wall-ht',
    sheetCode: 'A2.01',
    type: 'Wall',
    tag: 'Plate height datum — North',
    region: { x: 12, y: 34, w: 62, h: 12 },
    attributes: [
    { attribute: 'Datum found', value: 'Detected', confidence: 97.5 },
    { attribute: 'Plate height', value: "9'-1⅛\"", confidence: 89.2 },
    { attribute: 'Agrees with plan', value: 'Conflict on A1.01', confidence: 54.1 }],

    verification: 'needs_review',
    contributesTo: ['ti-2']
  },
  {
    id: 'ob-hdr-3',
    sheetCode: 'S1.01',
    type: 'Header',
    tag: 'H3 — Garage opening',
    region: { x: 22, y: 58, w: 26, h: 9 },
    attributes: [
    { attribute: 'Header existence', value: 'Detected', confidence: 99.2 },
    { attribute: 'Span', value: "16'-0\"", confidence: 97.8 },
    { attribute: 'Member', value: 'LVL 1¾×11⅞ (3 ply)', confidence: 76.4 },
    { attribute: 'Bearing', value: '3 jack studs each end', confidence: 68.9 }],

    verification: 'needs_review',
    contributesTo: ['ti-5']
  },
  {
    id: 'ob-floor-1',
    sheetCode: 'S1.01',
    type: 'Floor system',
    tag: 'Level 1 deck',
    region: { x: 55, y: 20, w: 32, h: 30 },
    attributes: [
    { attribute: 'Area', value: '1,842 sf', confidence: 98.1 },
    { attribute: 'Sheathing spec', value: '¾" T&G', confidence: 95.4 },
    { attribute: 'Joist direction', value: 'North–south', confidence: 92.0 }],

    verification: 'verified',
    contributesTo: ['ti-3']
  },
  {
    id: 'ob-roof-1',
    sheetCode: 'S2.04',
    type: 'Roof plane',
    tag: 'Roof planes A–D',
    region: { x: 18, y: 18, w: 55, h: 42 },
    attributes: [
    { attribute: 'Plane count', value: '4 planes', confidence: 96.6 },
    { attribute: 'Sloped area', value: '3,410 sf', confidence: 81.5 },
    { attribute: 'Pitch', value: '6:12', confidence: 74.2 },
    { attribute: 'Scale applied', value: '3/16" = 1\'-0"', confidence: 69.7 }],

    verification: 'needs_review',
    contributesTo: ['ti-4']
  },
  {
    id: 'ob-sched-lvl',
    sheetCode: 'S2.10',
    type: 'Schedule row',
    tag: 'Beam schedule — 9 rows',
    region: { x: 20, y: 26, w: 58, h: 34 },
    attributes: [
    { attribute: 'Rows read', value: '9 of 9', confidence: 98.8 },
    { attribute: 'Member sizes', value: 'LVL / PSL mix', confidence: 84.7 },
    { attribute: 'Total length', value: '148 lf', confidence: 63.2 }],

    verification: 'needs_review',
    contributesTo: ['ti-5']
  },
  {
    id: 'ob-sched-win',
    sheetCode: 'A7.01',
    type: 'Schedule row',
    tag: 'Window schedule — 24 rows',
    region: { x: 18, y: 24, w: 60, h: 40 },
    attributes: [
    { attribute: 'Rows read', value: '24 of 24', confidence: 97.1 },
    { attribute: 'Matches floor plans', value: '23 located', confidence: 51.6 }],

    verification: 'needs_review',
    contributesTo: ['ti-1']
  }],


  derivations: {
    'ti-1': {
      components: [
      { label: 'Field studs', value: 962, note: '16" o.c. across 1,283 lf of 2×4 partition' },
      { label: 'Corner studs', value: 96, note: '32 corners × 3' },
      { label: 'Wall intersections', value: 63, note: '21 tees × 3' },
      { label: 'Door jambs & cripples', value: 54, note: '18 openings' },
      { label: 'Window jambs & cripples', value: 68, note: '17 openings' },
      { label: 'Blocking & backing', value: 41, note: 'Cabinet and handrail backing' }],

      wastePercent: 5,
      rule: 'IRC R602.3 stud spacing with 5% cut waste on 8 ft studs.',
      sourceSheets: ['A1.01', 'A1.02', 'A6.01', 'A7.01']
    },
    'ti-2': {
      components: [
      { label: 'Field studs', value: 468, note: '16" o.c. across 624 lf of exterior wall' },
      { label: 'Corner studs', value: 48, note: '16 corners × 3' },
      { label: 'Openings framing', value: 62, note: 'Jambs, cripples and sills' },
      { label: 'Plates (double top, single bottom)', value: 0, note: 'Counted separately as plate stock' }],

      wastePercent: 5,
      rule: 'Exterior bearing walls at 16" o.c., plate height 9\'-1⅛".',
      sourceSheets: ['A1.01', 'A2.01', 'S1.01']
    },
    'ti-3': {
      components: [
      { label: 'Level 1 deck', value: 178, note: '1,842 sf ÷ 32 sf per sheet' },
      { label: 'Level 2 deck', value: 121, note: '1,254 sf ÷ 32 sf per sheet' },
      { label: 'Stair landings', value: 6 }],

      wastePercent: 5,
      rule: 'Area ÷ 32 sf per 4×8 sheet, rounded up per plane.',
      sourceSheets: ['S1.01']
    },
    'ti-4': {
      components: [
      { label: 'Roof planes A–D', value: 107, note: '3,410 sf sloped ÷ 32 sf' },
      { label: 'Porch roof', value: 12 },
      { label: 'Overframing at dormers', value: 8 }],

      wastePercent: 8,
      rule: 'Sloped area ÷ 32 sf with 8% waste for hip and valley cuts.',
      sourceSheets: ['S2.04', 'A2.01']
    },
    'ti-5': {
      components: [
      { label: 'Garage header H3', value: 48, note: "16'-0\" × 3 ply" },
      { label: 'Great room beam B2', value: 62, note: "20'-8\" × 3 ply" },
      { label: 'Openings O4–O7', value: 38 }],

      wastePercent: 0,
      rule: 'Schedule lengths taken as-drawn; no waste applied to engineered lumber.',
      sourceSheets: ['S1.01', 'S2.10']
    },
    'ti-6': {
      components: [
      { label: 'Wall framing', value: 16, note: '~1 box per 120 studs' },
      { label: 'Sheathing attachment', value: 6 },
      { label: 'Blocking & misc', value: 2 }],

      wastePercent: 0,
      rule: 'Consumption model from framing member and sheathing counts.',
      sourceSheets: ['S1.01']
    },
    'ti-7': {
      components: [
      { label: 'Truss/rafter to plate', value: 342, note: 'One per bearing point' },
      { label: 'Gable end framing', value: 48 },
      { label: 'Spare allowance', value: 20 }],

      wastePercent: 0,
      rule: 'One tie per bearing connection per S2.12 nailing schedule.',
      sourceSheets: ['S2.04', 'S2.12']
    }
  },

  issues: [
  {
    id: 'is-1',
    severity: 'critical',
    kind: 'schedule_mismatch',
    title: 'Window schedule and floor plans disagree',
    detail:
    'The window schedule on A7.01 lists 24 units. Only 23 windows were located across A1.01 and A1.02. One scheduled unit has no home on the plans.',
    sheetCodes: ['A7.01', 'A1.01', 'A1.02'],
    objectId: 'ob-sched-win',
    lineId: 'ti-1',
    status: 'open'
  },
  {
    id: 'is-2',
    severity: 'critical',
    kind: 'quantity_disagreement',
    title: 'Exterior wall length disagreement',
    detail:
    'The vision model measured the north exterior run at 168 lf. The geometry engine, tracing the same polyline, returned 171 lf. A 3 lf difference changes the stud count by 3.',
    sheetCodes: ['A1.01'],
    objectId: 'ob-w14',
    lineId: 'ti-2',
    disagreement: {
      measure: 'North exterior wall run',
      unit: 'lf',
      aiValue: 168,
      engineValue: 171,
      engineName: 'Geometry engine'
    },
    status: 'open'
  },
  {
    id: 'is-3',
    severity: 'high',
    kind: 'low_confidence',
    title: 'Stud spacing uncertain on W14',
    detail:
    'Stud spacing read at 61.8% confidence. The plan note is partially obscured by a dimension string, so 16" o.c. was assumed from the wall type.',
    sheetCodes: ['A1.01'],
    objectId: 'ob-w14',
    lineId: 'ti-2',
    status: 'open'
  },
  {
    id: 'is-4',
    severity: 'high',
    kind: 'drawing_conflict',
    title: 'Plate height conflicts between plan and elevation',
    detail:
    'A1.01 general notes call for 9\'-0". The north elevation on A2.01 dimensions 9\'-1⅛". The taller figure was used, which adds material.',
    sheetCodes: ['A1.01', 'A2.01'],
    objectId: 'ob-wall-ht',
    lineId: 'ti-2',
    status: 'open'
  },
  {
    id: 'is-5',
    severity: 'high',
    kind: 'scale',
    title: 'Roof plan drawn at a different scale',
    detail:
    'S2.04 is 3/16" = 1\'-0" while the rest of the set is 1/4". Sloped area was recalculated at the sheet scale; confirm before ordering sheathing.',
    sheetCodes: ['S2.04'],
    objectId: 'ob-roof-1',
    lineId: 'ti-4',
    status: 'open'
  },
  {
    id: 'is-6',
    severity: 'medium',
    kind: 'low_confidence',
    title: 'Beam schedule total length uncertain',
    detail: 'Row lengths read cleanly but three rows use ditto marks, so the 148 lf total is inferred.',
    sheetCodes: ['S2.10'],
    objectId: 'ob-sched-lvl',
    lineId: 'ti-5',
    status: 'open'
  },
  {
    id: 'is-7',
    severity: 'medium',
    kind: 'low_confidence',
    title: 'Hurricane tie count driven by inferred bearing points',
    detail: 'Truss bearing points were inferred from the roof plan rather than a fastening schedule.',
    sheetCodes: ['S2.04'],
    lineId: 'ti-7',
    status: 'open'
  },
  {
    id: 'is-8',
    severity: 'medium',
    kind: 'geometry',
    title: 'Raked wall height on W22 not resolvable',
    detail: 'The stair wall follows the stringer. Height varies, so an average of 10\'-2" was applied.',
    sheetCodes: ['A1.02'],
    objectId: 'ob-w22',
    lineId: 'ti-1',
    status: 'open'
  },
  {
    id: 'is-9',
    severity: 'medium',
    kind: 'missing_object',
    title: 'Header not found over opening O9',
    detail: 'A 6\'-0" opening on A1.02 has no header called out on either plan or schedule.',
    sheetCodes: ['A1.02', 'S2.10'],
    lineId: 'ti-5',
    status: 'open'
  },
  {
    id: 'is-10',
    severity: 'low',
    kind: 'drawing_conflict',
    title: 'Duplicate A1.02 sheet in the upload',
    detail: 'Two copies of A1.02 were supplied. The Aug 19 stamp was used; the earlier copy was ignored.',
    sheetCodes: ['A1.02'],
    status: 'resolved',
    resolution: {
      choice: 'Kept the later stamped sheet',
      by: 'System',
      at: 'Aug 19 · 9:43 AM',
      note: 'Revision stamp comparison — no human input required.'
    }
  },
  {
    id: 'is-11',
    severity: 'low',
    kind: 'low_confidence',
    title: 'Window schedule sheet initially misclassified',
    detail: 'A7.01 was classified as a Detail sheet at 72% confidence and reclassified by hand.',
    sheetCodes: ['A7.01'],
    status: 'resolved',
    resolution: {
      choice: 'Reclassified as Schedule',
      by: 'John Smith',
      at: 'Aug 19 · 9:58 AM',
      note: 'Sheet is a tabular window schedule, not a detail.'
    }
  },
  {
    id: 'is-12',
    severity: 'low',
    kind: 'geometry',
    title: 'Porch roof overlaps main roof plane',
    detail: 'A 42 sf overlap was subtracted once so the area is not double counted.',
    sheetCodes: ['S2.04'],
    lineId: 'ti-4',
    status: 'resolved',
    resolution: {
      choice: 'Overlap subtracted',
      by: 'Geometry engine',
      at: 'Aug 19 · 9:46 AM',
      note: 'Boolean subtraction on the roof plane set.'
    }
  }],


  reconciliations: [
  {
    id: 'rc-1',
    subject: 'Windows',
    left: { sheetCode: 'A1.01 + A1.02', label: 'Located on floor plans', count: 23 },
    right: { sheetCode: 'A7.01', label: 'Listed in window schedule', count: 24 },
    status: 'mismatch',
    note: 'One scheduled unit (W-12, 3068 fixed) has no plan location.'
  },
  {
    id: 'rc-2',
    subject: 'Doors',
    left: { sheetCode: 'A1.01 + A1.02', label: 'Located on floor plans', count: 18 },
    right: { sheetCode: 'A6.01', label: 'Listed in door schedule', count: 18 },
    status: 'matched',
    note: 'Every scheduled door has a plan location.'
  },
  {
    id: 'rc-3',
    subject: 'Headers & beams',
    left: { sheetCode: 'S1.01', label: 'Called out on framing plan', count: 8 },
    right: { sheetCode: 'S2.10', label: 'Listed in beam schedule', count: 9 },
    status: 'mismatch',
    note: 'Schedule row B7 is not called out on the framing plan.'
  },
  {
    id: 'rc-4',
    subject: 'Plate height',
    left: { sheetCode: 'A1.01', label: 'General notes', count: 9 },
    right: { sheetCode: 'A2.01', label: 'North elevation dimension', count: 9 },
    status: 'mismatch',
    note: "9'-0\" on plan versus 9'-1⅛\" on elevation."
  },
  {
    id: 'rc-5',
    subject: 'Roof planes',
    left: { sheetCode: 'S2.04', label: 'Framing plan planes', count: 4 },
    right: { sheetCode: 'A2.01', label: 'Visible in elevations', count: 4 },
    status: 'resolved',
    note: 'Porch overlap reconciled; plane count agrees.'
  }],


  gates: [
  {
    id: 'g-sheets',
    label: 'Required sheets',
    detail: 'Floor plans, elevations, structural and schedules all present.',
    state: 'pass',
    required: true,
    clearedBy: 'System',
    clearedAt: 'Aug 19 · 9:42 AM'
  },
  {
    id: 'g-scale',
    label: 'Scale validation',
    detail: 'S2.04 differs from the set; recalculated at sheet scale and confirmed.',
    state: 'attention',
    required: true
  },
  {
    id: 'g-rev',
    label: 'Revision validation',
    detail: 'Rev 04 read consistently across every title block.',
    state: 'pass',
    required: true,
    clearedBy: 'System',
    clearedAt: 'Aug 19 · 9:42 AM'
  },
  {
    id: 'g-extract',
    label: 'Object extraction',
    detail: '9 construction objects extracted across 8 analysed sheets.',
    state: 'pass',
    required: true,
    clearedBy: 'SM Vision 2.4',
    clearedAt: 'Aug 19 · 9:47 AM'
  },
  {
    id: 'g-recon',
    label: 'Schedule reconciliation',
    detail: '3 of 5 reconciliations still disagree.',
    state: 'fail',
    required: true
  },
  {
    id: 'g-geom',
    label: 'Geometry validation',
    detail: 'Closed polylines on every wall run; porch overlap subtracted.',
    state: 'pass',
    required: true,
    clearedBy: 'Geometry engine',
    clearedAt: 'Aug 19 · 9:46 AM'
  },
  {
    id: 'g-cross',
    label: 'Cross-sheet validation',
    detail: 'Plate height conflict between A1.01 and A2.01 unresolved.',
    state: 'fail',
    required: true
  },
  {
    id: 'g-rules',
    label: 'Construction rule validation',
    detail: 'IRC stud spacing, header spans and bearing checks passed.',
    state: 'pass',
    required: true,
    clearedBy: 'Rule engine',
    clearedAt: 'Aug 19 · 9:48 AM'
  },
  {
    id: 'g-conf',
    label: 'Low confidence review',
    detail: '4 attributes below 75% still need a human decision.',
    state: 'pending',
    required: true
  },
  {
    id: 'g-human',
    label: 'Human review',
    detail: 'Every takeoff line must carry an explicit human decision.',
    state: 'pending',
    required: true
  }],


  revisionDeltas: [
  {
    lineId: 'ti-2',
    item: '2×6 SPF — 10 ft',
    unit: 'ea',
    previousQuantity: 596,
    currentQuantity: 640,
    driver: 'Plate height raised to 9\'-1⅛" on the north elevation',
    sheetCode: 'A2.01',
    change: 'increased'
  },
  {
    lineId: 'ti-1',
    item: '2×4 SPF Stud — 8 ft',
    unit: 'ea',
    previousQuantity: 1284,
    currentQuantity: 1240,
    driver: 'Two interior partitions removed from the second floor plan',
    sheetCode: 'A1.02',
    change: 'decreased'
  },
  {
    lineId: 'ti-5',
    item: 'LVL Beam 1¾×11⅞',
    unit: 'lf',
    previousQuantity: 110,
    currentQuantity: 148,
    driver: 'Garage opening widened from 12\'-0" to 16\'-0"',
    sheetCode: 'S1.01',
    change: 'increased'
  },
  {
    lineId: 'ti-4',
    item: '⅝" OSB Roof Sheathing',
    unit: 'sheet',
    previousQuantity: 186,
    currentQuantity: 186,
    driver: 'Roof geometry unchanged between revisions',
    sheetCode: 'S2.04',
    change: 'unchanged'
  },
  {
    lineId: 'ti-7',
    item: 'Simpson H2.5A Hurricane Tie',
    unit: 'ea',
    previousQuantity: 0,
    currentQuantity: 410,
    driver: 'Fastening schedule S2.12 added at Rev 04',
    sheetCode: 'S2.12',
    change: 'added'
  }]

};

const mapleRidge: TakeoffRun = {
  takeoffId: 'TK-1031',
  planSetLabel: 'Maple Ridge — Building C',
  revision: 'Rev 02',
  previousRevision: 'Rev 01',
  takeoffType: 'Framing takeoff',
  model: 'SM Vision 2.4',
  runRef: 'run_7ba412',
  startedAt: 'Aug 15, 2026 · 11:05 AM',
  durationSeconds: 288,
  sheets: [
  {
    id: 'mh-1',
    code: 'S3.01',
    title: 'Roof Truss Layout',
    page: 8,
    discipline: 'Roof',
    classificationConfidence: 99,
    scale: '1/4" = 1\'-0"',
    image: drawingFor('S3.01'),
    reviewed: true,
    issueCount: 0,
    objectIds: ['mo-1']
  },
  {
    id: 'mh-2',
    code: 'S3.02',
    title: 'Roof Sheathing Plan',
    page: 9,
    discipline: 'Roof',
    classificationConfidence: 98,
    scale: '1/4" = 1\'-0"',
    image: drawingFor('S3.02'),
    reviewed: true,
    issueCount: 0,
    objectIds: ['mo-2']
  }],

  validation: [
  {
    id: 'mv-1',
    label: 'File readability',
    state: 'pass',
    detail: 'All 31 sheets rasterised cleanly.',
    blocking: true
  },
  {
    id: 'mv-2',
    label: 'Scale detection',
    state: 'pass',
    detail: 'Whole set at 1/4" = 1\'-0".',
    blocking: false
  },
  {
    id: 'mv-3',
    label: 'Revision identifiable',
    state: 'pass',
    detail: 'Rev 02 confirmed on every sheet.',
    blocking: true
  }],

  objects: [
  {
    id: 'mo-1',
    sheetCode: 'S3.01',
    type: 'Roof plane',
    tag: 'Truss run T1',
    region: { x: 20, y: 22, w: 52, h: 34 },
    attributes: [
    { attribute: 'Truss count', value: '44 trusses', confidence: 97.9 },
    { attribute: 'Span', value: "28'-0\"", confidence: 99.1 },
    { attribute: 'Spacing', value: '24" o.c.', confidence: 96.4 }],

    verification: 'approved',
    contributesTo: ['tj-1']
  },
  {
    id: 'mo-2',
    sheetCode: 'S3.02',
    type: 'Roof plane',
    tag: 'Sheathing planes',
    region: { x: 22, y: 20, w: 50, h: 40 },
    attributes: [
    { attribute: 'Sloped area', value: '6,690 sf', confidence: 95.2 },
    { attribute: 'Pitch', value: '5:12', confidence: 94.0 }],

    verification: 'approved',
    contributesTo: ['tj-2']
  }],

  derivations: {
    'tj-1': {
      components: [
      { label: 'Common trusses', value: 40, note: "24\" o.c. over 78'-0\" run" },
      { label: 'Girder trusses', value: 4 }],

      wastePercent: 0,
      rule: 'Gable ends stick framed, so excluded from the truss count.',
      sourceSheets: ['S3.01']
    },
    'tj-2': {
      components: [
      { label: 'Main roof planes', value: 196, note: '6,272 sf ÷ 32 sf' },
      { label: 'Dormers', value: 14 }],

      wastePercent: 6,
      rule: 'Sloped area ÷ 32 sf with 6% hip and valley waste.',
      sourceSheets: ['S3.02']
    }
  },
  issues: [],
  reconciliations: [
  {
    id: 'mrc-1',
    subject: 'Trusses',
    left: { sheetCode: 'S3.01', label: 'Laid out on plan', count: 44 },
    right: { sheetCode: 'S3.05', label: 'Listed in truss schedule', count: 44 },
    status: 'matched',
    note: 'Plan and schedule agree.'
  }],

  gates: [
  { id: 'mg-1', label: 'Required sheets', detail: 'Complete.', state: 'pass', required: true, clearedBy: 'System', clearedAt: 'Aug 15 · 11:06 AM' },
  { id: 'mg-2', label: 'Scale validation', detail: 'Uniform across the set.', state: 'pass', required: true, clearedBy: 'System', clearedAt: 'Aug 15 · 11:06 AM' },
  { id: 'mg-3', label: 'Revision validation', detail: 'Rev 02 confirmed.', state: 'pass', required: true, clearedBy: 'System', clearedAt: 'Aug 15 · 11:06 AM' },
  { id: 'mg-4', label: 'Object extraction', detail: '2 objects extracted.', state: 'pass', required: true, clearedBy: 'SM Vision 2.4', clearedAt: 'Aug 15 · 11:09 AM' },
  { id: 'mg-5', label: 'Schedule reconciliation', detail: 'All counts agree.', state: 'pass', required: true, clearedBy: 'System', clearedAt: 'Aug 15 · 11:10 AM' },
  { id: 'mg-6', label: 'Geometry validation', detail: 'Closed planes.', state: 'pass', required: true, clearedBy: 'Geometry engine', clearedAt: 'Aug 15 · 11:10 AM' },
  { id: 'mg-7', label: 'Cross-sheet validation', detail: 'No conflicts.', state: 'pass', required: true, clearedBy: 'System', clearedAt: 'Aug 15 · 11:11 AM' },
  { id: 'mg-8', label: 'Construction rule validation', detail: 'Truss spacing within span tables.', state: 'pass', required: true, clearedBy: 'Rule engine', clearedAt: 'Aug 15 · 11:11 AM' },
  { id: 'mg-9', label: 'Low confidence review', detail: 'No attribute below 90%.', state: 'pass', required: true, clearedBy: 'Dana Kim', clearedAt: 'Aug 16 · 8:55 AM' },
  { id: 'mg-10', label: 'Human review', detail: 'Every line decided by Dana Kim.', state: 'pass', required: true, clearedBy: 'Dana Kim', clearedAt: 'Aug 16 · 9:12 AM' }],

  revisionDeltas: [
  {
    lineId: 'tj-1',
    item: 'Truss T1 — 28 ft span',
    unit: 'ea',
    previousQuantity: 46,
    currentQuantity: 46,
    driver: 'Truss layout unchanged',
    sheetCode: 'S3.01',
    change: 'unchanged'
  },
  {
    lineId: 'tj-2',
    item: '⅝" OSB Roof Sheathing',
    unit: 'sheet',
    previousQuantity: 188,
    currentQuantity: 210,
    driver: 'Dormers added at Rev 02',
    sheetCode: 'S3.02',
    change: 'increased'
  }]

};

export const takeoffRuns: Record<string, TakeoffRun> = {
  'TK-1024': oakwood,
  'TK-1031': mapleRidge
};

export function runFor(takeoffId: string): TakeoffRun | undefined {
  return takeoffRuns[takeoffId];
}

/** Final quantity implied by a derivation, including waste. */
export function derivedTotal(d: {components: {value: number;}[];wastePercent: number;}): number {
  const base = d.components.reduce((sum, c) => sum + c.value, 0);
  return Math.round(base * (1 + d.wastePercent / 100));
}

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;