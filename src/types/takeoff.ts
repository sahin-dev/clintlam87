/**
 * The AI takeoff engineering model.
 *
 * A takeoff is not a list of numbers — it is a chain of evidence. Every
 * quantity in SM Pro traces back to detected objects on a specific drawing
 * sheet of a specific plan revision, each object carries per-attribute
 * confidence, and nothing reaches "verified" because a model felt confident.
 * These types keep that chain explicit.
 */

export type SheetDiscipline =
'Floor Plan' |
'Elevation' |
'Section' |
'Foundation' |
'Roof' |
'Structural' |
'Schedule' |
'Detail' |
'Unclassified';

export interface DrawingSheet {
  id: string;
  code: string;
  title: string;
  page: number;
  /** What the classifier decided this sheet is. */
  discipline: SheetDiscipline;
  /** Classifier certainty for the discipline call. */
  classificationConfidence: number;
  /** Set when a human overrode the classifier. */
  reclassifiedBy?: string;
  scale: string;
  image: string;
  reviewed: boolean;
  issueCount: number;
  objectIds: string[];
}

export type ValidationState = 'pass' | 'warn' | 'fail';

/** One pre-flight check on the drawing set, run before any analysis. */
export interface ValidationCheck {
  id: string;
  label: string;
  state: ValidationState;
  detail: string;
  /** Blocks analysis from starting at all. */
  blocking: boolean;
}

export type ProcessingStageState = 'done' | 'active' | 'queued' | 'failed';

export interface ProcessingStage {
  id: string;
  label: string;
  detail: string;
  state: ProcessingStageState;
}

/**
 * Confidence is reported per attribute, never as a single headline score —
 * a wall can be certainly present and still have an uncertain stud spacing.
 */
export interface AttributeConfidence {
  attribute: string;
  value: string;
  confidence: number;
}

/**
 * How a quantity was arrived at. This is the "Why?" a purchasing manager
 * opens before trusting a number.
 */
export interface QuantityDerivation {
  /** Named contributions that sum toward the quantity. */
  components: {label: string;value: number;note?: string;}[];
  /** Waste allowance applied after the components, as a percentage. */
  wastePercent: number;
  rule: string;
  /** Sheets the derivation drew from. */
  sourceSheets: string[];
}

export type ObjectVerification =
'ai_generated' |
'needs_review' |
'human_corrected' |
'verified' |
'approved';

/** A construction object the model found on a drawing. */
export interface TakeoffObject {
  id: string;
  /** Sheet the object was detected on. */
  sheetCode: string;
  type: 'Wall' | 'Opening' | 'Header' | 'Roof plane' | 'Floor system' | 'Schedule row';
  tag: string;
  region: {x: number;y: number;w: number;h: number;};
  attributes: AttributeConfidence[];
  verification: ObjectVerification;
  /** Takeoff lines this object feeds. */
  contributesTo: string[];
}

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IssueKind =
'low_confidence' |
'schedule_mismatch' |
'quantity_disagreement' |
'missing_object' |
'geometry' |
'drawing_conflict' |
'scale';

export interface TakeoffIssue {
  id: string;
  severity: IssueSeverity;
  kind: IssueKind;
  title: string;
  detail: string;
  sheetCodes: string[];
  objectId?: string;
  lineId?: string;
  /** Present when two engines produced different numbers for one measure. */
  disagreement?: {
    measure: string;
    unit: string;
    aiValue: number;
    engineValue: number;
    engineName: string;
  };
  status: 'open' | 'resolved';
  resolution?: {choice: string;by: string;at: string;note: string;};
}

/** Two sheets that must agree about the same count. */
export interface Reconciliation {
  id: string;
  subject: string;
  left: {sheetCode: string;label: string;count: number;};
  right: {sheetCode: string;label: string;count: number;};
  status: 'matched' | 'mismatch' | 'resolved';
  note: string;
}

export type GateState = 'pass' | 'pending' | 'fail' | 'attention';

/** A gate that must clear before the takeoff can be approved. */
export interface VerificationGate {
  id: string;
  label: string;
  detail: string;
  state: GateState;
  /** A failing required gate keeps approval disabled. */
  required: boolean;
  clearedBy?: string;
  clearedAt?: string;
}

/** What changed for one material between two plan revisions. */
export interface RevisionDelta {
  lineId: string;
  item: string;
  unit: string;
  previousQuantity: number;
  currentQuantity: number;
  driver: string;
  sheetCode: string;
  change: 'added' | 'removed' | 'increased' | 'decreased' | 'unchanged';
}

/** Everything the workspace needs about one AI run, beyond the line items. */
export interface TakeoffRun {
  takeoffId: string;
  planSetLabel: string;
  revision: string;
  previousRevision: string;
  takeoffType: string;
  model: string;
  runRef: string;
  startedAt: string;
  durationSeconds: number;
  sheets: DrawingSheet[];
  validation: ValidationCheck[];
  objects: TakeoffObject[];
  derivations: Record<string, QuantityDerivation>;
  issues: TakeoffIssue[];
  reconciliations: Reconciliation[];
  gates: VerificationGate[];
  revisionDeltas: RevisionDelta[];
}