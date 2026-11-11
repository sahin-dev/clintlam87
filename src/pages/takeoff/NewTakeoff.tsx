import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckIcon,
  FileUpIcon,
  RotateCcwIcon,
  ScanSearchIcon,
  TriangleAlertIcon,
  XIcon } from
'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { InlineAlert } from '../../components/ui/Feedback';
import { UploadPlanSheet } from '../../components/project/UploadPlanSheet';
import {
  Measured,
  Panel,
  SpecLabel,
  TickRule,
  TitleBlock,
  WorkHeading } from
'../../components/smpro/Primitives';
import { useApp } from '../../contexts/AppContext';
import { formatMb } from '../../utils/upload';
import { runFor } from '../../data/takeoffEngine';
import { ProcessingStage, SheetDiscipline, ValidationCheck } from '../../types/takeoff';

/**
 * Starting a takeoff is four deliberate steps, not one button: choose the
 * drawing set and revision, clear pre-flight validation, confirm how the
 * sheets were classified, then watch the analysis actually work.
 */
type Phase = 'select' | 'validate' | 'classify' | 'running' | 'failed';

const PHASE_LABELS: Record<Phase, string> = {
  select: 'Drawing set',
  validate: 'Validation',
  classify: 'Classification',
  running: 'AI analysis',
  failed: 'AI analysis'
};

const STAGES: Omit<ProcessingStage, 'state'>[] = [
{ id: 'files', label: 'File processing', detail: 'Rasterising sheets at 300 dpi' },
{ id: 'sheets', label: 'Sheet recognition', detail: 'Reading title blocks and sheet numbers' },
{ id: 'scale', label: 'Scale detection', detail: 'Establishing drawing scale per sheet' },
{ id: 'objects', label: 'Object detection', detail: 'Locating walls, openings, headers and planes' },
{ id: 'quant', label: 'Quantity calculation', detail: 'Applying framing rules to detected geometry' },
{ id: 'cross', label: 'Cross-sheet validation', detail: 'Comparing plans against schedules' },
{ id: 'conf', label: 'Confidence analysis', detail: 'Scoring every attribute independently' },
{ id: 'rules', label: 'Rule validation', detail: 'Checking spans, spacing and bearing' }];


export function NewTakeoff() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { projects, planSets, can } = useApp();
  const [projectId, setProjectId] = useState(params.get('project') ?? 'pr-1024');
  const [planId, setPlanId] = useState(params.get('plan') ?? '');
  const [phase, setPhase] = useState<Phase>('select');
  const [stage, setStage] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, SheetDiscipline>>({});

  const project = projects.find((p) => p.id === projectId) ?? projects[0];
  const plans = planSets.
  filter((p) => p.projectId === projectId).
  sort((a, b) => b.version - a.version);
  const selectedPlan = plans.find((p) => p.id === planId) ?? plans[0];

  /* The pre-flight result and sheet index come from the analysed run. */
  const reference = runFor('TK-1024');
  const validation = reference?.validation ?? [];
  const sheets = reference?.sheets ?? [];
  const blocked = validation.some((v) => v.blocking && v.state === 'fail');
  const warnings = validation.filter((v) => v.state === 'warn');

  useEffect(() => {
    if (phase !== 'running') return;
    if (stage >= STAGES.length) {
      const t = window.setTimeout(() => navigate('/takeoff/TK-1024'), 700);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStage((s) => s + 1), 800);
    return () => window.clearTimeout(t);
  }, [phase, stage, navigate]);

  if (!can('takeoff.review')) {
    return (
      <div className="detail-column">
        <PageHeader back title="AI Takeoff" />
        <InlineAlert
          tone="warning"
          title="Permission needed"
          body="Your active role can view takeoffs but not run them. Project managers and purchasing managers can start a takeoff." />
        
      </div>);

  }

  const progress = Math.round(stage / STAGES.length * 100);

  return (
    <div className="detail-column">
      <PageHeader
        back
        title="New AI takeoff"
        subtitle={`${project?.name ?? 'Project'} · drawing set → validation → classification → analysis`} />
      

      {/* Step ribbon — the run is a sequence, not a modal. */}
      <ol className="mb-5 flex overflow-x-auto border border-ink-200 bg-white no-scrollbar">
        {(['select', 'validate', 'classify', 'running'] as Phase[]).map((p, i, all) => {
          const order = all.indexOf(phase === 'failed' ? 'running' : phase);
          const done = i < order;
          const active = i === order;
          return (
            <li
              key={p}
              className={`flex min-w-[150px] flex-1 items-center gap-2.5 border-r border-ink-100 px-3.5 py-2.5 last:border-r-0 ${
              active ? 'bg-brand-50' : ''}`
              }>
              
              <span
                className={`measure flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[2px] text-[10px] font-bold ${
                done ?
                'bg-positive-500 text-white' :
                active ?
                'bg-brand-500 text-white' :
                'border border-ink-200 bg-white text-ink-300'}`
                }>
                
                {done ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-[12px] font-bold ${active || done ? 'text-ink-900' : 'text-ink-400'}`}>
                {PHASE_LABELS[p]}
              </span>
            </li>);

        })}
      </ol>

      {phase === 'select' &&
      <div className="space-y-5">
          <Panel className="overflow-hidden">
            <TitleBlock label="Drawing set" title="What should the model read?" reference="SM Vision 2.4" />
            <div className="space-y-5 p-4">
              <Select
              label="Project"
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setPlanId('');
              }}>
              
                {projects.map((p) =>
              <option key={p.id} value={p.id}>
                    {p.name} · {p.number}
                  </option>
              )}
              </Select>

              <div>
                <div className="mb-2.5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <SpecLabel>Plan set &amp; revision</SpecLabel>
                    <p className="mt-1 text-[12.5px] text-ink-500">
                      Pick the revision to analyse, or add newer drawings first
                    </p>
                  </div>
                  {/* Adds a new revision to this project rather than replacing one,
                     so the label says exactly what pressing it does. */}
                  <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setUploadOpen(true)}
                  icon={<FileUpIcon className="h-4 w-4" />}>
                  
                    Add new revision
                  </Button>
                </div>

                {plans.length === 0 ?
              <button
                onClick={() => setUploadOpen(true)}
                className="flex w-full flex-col items-center border-2 border-dashed border-ink-200 bg-ink-50/60 px-4 py-7 text-center transition-colors duration-150 ease-smooth hover:border-brand-300 hover:bg-brand-50/40">
                
                    <FileUpIcon className="h-5 w-5 text-brand-600" />
                    <span className="mt-2 text-[13.5px] font-bold text-ink-900">
                      No drawings on this project yet
                    </span>
                    <span className="mt-1 text-[12px] text-ink-400">
                      Upload a PDF plan set, CAD files or scanned sheets to run a takeoff
                    </span>
                  </button> :

              <ul className="border border-ink-100">
                    {plans.map((plan) => {
                  const active = (selectedPlan?.id ?? '') === plan.id;
                  return (
                    <li key={plan.id} className="border-b border-ink-100 last:border-0">
                          <button
                        onClick={() => setPlanId(plan.id)}
                        aria-pressed={active}
                        className={`flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors duration-150 ease-smooth ${
                        active ? 'bg-brand-50/60 shadow-[inset_2px_0_0_0_#F96317]' : 'hover:bg-ink-50'}`
                        }>
                        
                            <span className="min-w-0">
                              <span className="block text-[13px] font-bold text-ink-900">
                                Revision {String(plan.version).padStart(2, '0')}
                                {plan.isCurrent && ' · Current'}
                              </span>
                              <span className="measure mt-0.5 block text-[11px] text-ink-400">
                                {plan.uploadedAt} · {plan.sheets} sheets · {formatMb(plan.sizeMb)}
                                {plan.discipline ? ` · ${plan.discipline}` : ''}
                              </span>
                            </span>
                            {active && <CheckIcon className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={3} />}
                          </button>
                        </li>);

                })}
                  </ul>
              }
              </div>

              <div>
                <SpecLabel className="mb-2">Takeoff type</SpecLabel>
                <div className="border border-ink-200 bg-ink-50/60 px-3.5 py-3">
                  <p className="text-[12.5px] font-bold text-ink-900">Framing takeoff</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink-500">
                    Studs, plates, headers, sheathing and framing hardware
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <InlineAlert
          tone="info"
          title="AI output is never final"
          body="Every quantity arrives with its source sheet, revision, derivation and per-attribute confidence. Nothing reaches purchasing until a person clears the verification gates and approves it." />
        

          <Button
          size="lg"
          disabled={!selectedPlan}
          onClick={() => setPhase('validate')}
          icon={<ScanSearchIcon className="h-4 w-4" />}>
          
            {selectedPlan ? `Validate ${selectedPlan.sheets} sheets` : 'Upload drawings to continue'}
          </Button>
        </div>
      }

      {phase === 'validate' &&
      <div className="space-y-5">
          <Panel className="overflow-hidden">
            <TitleBlock
            label="Pre-flight validation"
            title={blocked ? 'Drawing set cannot be analysed' : 'Drawing set validated'}
            reference={`${selectedPlan?.sheets ?? 0} sheets`} />
          
            <div className="grid grid-cols-2 gap-4 px-4 py-3.5 sm:grid-cols-4">
              <Measured label="Sheets" value={String(selectedPlan?.sheets ?? 0)} size="sm" />
              <Measured label="Scale" value="Confirmed" size="sm" tone="positive" />
              <Measured
              label="Revision"
              value={`Rev ${String(selectedPlan?.version ?? 1).padStart(2, '0')}`}
              size="sm" />
            
              <Measured
              label="Warnings"
              value={String(warnings.length)}
              size="sm"
              tone={warnings.length ? 'brand' : 'muted'} />
            
            </div>
            <TickRule />
            <ul className="divide-y divide-ink-100">
              {validation.map((v) =>
            <ValidationRow key={v.id} check={v} />
            )}
            </ul>
          </Panel>

          {warnings.length > 0 &&
        <InlineAlert
          tone="warning"
          title={`${warnings.length} advisory ${warnings.length === 1 ? 'finding' : 'findings'}`}
          body="Analysis can proceed, but these findings are carried into the takeoff as issues so a reviewer sees them beside the affected quantities." />

        }

          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={() => setPhase('select')}>
              Change drawing set
            </Button>
            <Button variant="secondary" icon={<FileUpIcon className="h-4 w-4" />} onClick={() => setUploadOpen(true)}>
              Replace a file
            </Button>
            <Button disabled={blocked} onClick={() => setPhase('classify')}>
              Continue to classification
            </Button>
          </div>
        </div>
      }

      {phase === 'classify' &&
      <div className="space-y-5">
          <WorkHeading
          label="Sheet classification"
          title="Confirm what each sheet is"
          count={`${sheets.length} sheets`} />
        
          <p className="-mt-2 max-w-[640px] text-[13px] leading-relaxed text-ink-500">
            The model scopes its detectors by sheet type, so a misclassified sheet produces the wrong
            quantities. Anything below 80% certainty is flagged for you to confirm.
          </p>

          <Panel className="overflow-hidden">
            <ul className="divide-y divide-ink-100">
              {sheets.map((s) => {
              const current = overrides[s.id] ?? s.discipline;
              const uncertain = s.classificationConfidence < 80 && !overrides[s.id];
              return (
                <li
                  key={s.id}
                  className={`spine flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${
                  uncertain ? 'text-caution-500' : 'text-positive-500'}`
                  }>
                  
                    <div className="min-w-[140px]">
                      <p className="measure text-[12.5px] font-bold text-ink-900">{s.code}</p>
                      <p className="truncate text-[11.5px] text-ink-400">{s.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="border border-ink-200 bg-white px-2 py-1 text-[11.5px] font-bold text-ink-800">
                        {current}
                      </span>
                      <span
                      className={`measure text-[11px] font-bold ${
                      uncertain ? 'text-caution-700' : 'text-ink-400'}`
                      }>
                      
                        {overrides[s.id] ? '100%' : `${s.classificationConfidence}%`}
                      </span>
                    </div>
                    {uncertain &&
                  <span className="spec-label flex items-center gap-1 text-caution-800">
                        <TriangleAlertIcon className="h-3 w-3" />
                        Confirm
                      </span>
                  }
                    <div className="ml-auto flex flex-wrap gap-1">
                      {(['Floor Plan', 'Elevation', 'Structural', 'Roof', 'Schedule', 'Detail'] as SheetDiscipline[]).map(
                      (d) =>
                      <button
                        key={d}
                        onClick={() => setOverrides((o) => ({ ...o, [s.id]: d }))}
                        className={`rounded-[2px] border px-1.5 py-[3px] text-[10.5px] font-semibold transition-colors duration-150 ease-smooth ${
                        current === d ?
                        'border-brand-400 bg-brand-500 text-white' :
                        'border-ink-200 bg-white text-ink-500 hover:border-brand-300'}`
                        }>
                        
                            {d}
                          </button>

                    )}
                    </div>
                  </li>);

            })}
            </ul>
          </Panel>

          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={() => setPhase('validate')}>
              Back to validation
            </Button>
            <Button
            onClick={() => {
              setStage(0);
              setPhase('running');
            }}
            icon={<ScanSearchIcon className="h-4 w-4" />}>
            
              Start AI analysis
            </Button>
          </div>
        </div>
      }

      {phase === 'running' &&
      <div className="space-y-5">
          <Panel className="overflow-hidden">
            <TitleBlock
            label="AI analysis in progress"
            title={`${selectedPlan?.name ?? 'Plan set'} · Rev ${String(selectedPlan?.version ?? 1).padStart(2, '0')}`}
            reference="RUN_8F31C7" />
          
            <div className="px-4 py-3.5">
              <div className="flex items-end justify-between gap-4">
                <Measured
                label="Current operation"
                value={STAGES[Math.min(stage, STAGES.length - 1)].label}
                size="sm" />
              
                <p className="measure text-[26px] font-extrabold leading-none text-ink-900">{progress}%</p>
              </div>
              <div className="mt-2.5 h-[5px] w-full bg-ink-100">
                <div
                className="h-full bg-brand-500 transition-[width] duration-300 ease-smooth"
                style={{ width: `${progress}%` }}
                aria-hidden />
              
              </div>
              <p className="measure mt-2 text-[11px] text-ink-400">
                {selectedPlan?.sheets ?? 0} sheets · about {Math.max(1, STAGES.length - stage)} min remaining
              </p>
            </div>
            <TickRule />
            <ol className="divide-y divide-ink-100">
              {STAGES.map((s, i) => {
              const state = i < stage ? 'done' : i === stage ? 'active' : 'queued';
              return (
                <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                    className={`measure flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[2px] text-[9.5px] font-bold ${
                    state === 'done' ?
                    'bg-positive-500 text-white' :
                    state === 'active' ?
                    'bg-brand-500 text-white' :
                    'border border-ink-200 bg-white text-ink-300'}`
                    }>
                    
                      {state === 'done' ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                      className={`text-[12.5px] font-bold ${
                      state === 'queued' ? 'text-ink-400' : 'text-ink-900'}`
                      }>
                      
                        {s.label}
                      </p>
                      <p className="truncate text-[11px] text-ink-400">{s.detail}</p>
                    </div>
                    {state === 'active' &&
                  <span className="spec-label shrink-0 text-brand-600">Running</span>
                  }
                  </li>);

            })}
            </ol>
          </Panel>

          <p className="text-[12.5px] text-ink-400">
            Analysis continues on our side if you leave — you will be notified when the takeoff is
            ready for review.
          </p>
        </div>
      }

      {phase === 'failed' &&
      <div className="space-y-5">
          <InlineAlert
          tone="danger"
          title="AI analysis failed at object detection"
          body="Sheets 18–24 could not be read — they are scanned below 150 dpi. Nothing was saved and no quantities were created." />
        
          <Panel className="overflow-hidden">
            <TitleBlock label="Recovery" title="What you can do next" />
            <ul className="divide-y divide-ink-100">
              {[
            'Re-upload sheets 18–24 at 300 dpi or higher as a new revision',
            'Run the takeoff on the previous plan revision instead',
            'Continue with a manual material request and skip the AI run'].
            map((s) =>
            <li key={s} className="px-4 py-3 text-[13px] text-ink-700">
                  {s}
                </li>
            )}
            </ul>
          </Panel>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={() => setPhase('select')} icon={<XIcon className="h-4 w-4" />}>
              Change drawing set
            </Button>
            <Button variant="secondary" icon={<FileUpIcon className="h-4 w-4" />} onClick={() => setUploadOpen(true)}>
              Re-upload sheets
            </Button>
            <Button
            onClick={() => {
              setStage(0);
              setPhase('running');
            }}
            icon={<RotateCcwIcon className="h-4 w-4" />}>
            
              Retry analysis
            </Button>
          </div>
        </div>
      }

      {project &&
      <UploadPlanSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        project={project}
        onUploaded={(id) => {
          setPlanId(id);
          setPhase('select');
          setStage(0);
        }} />

      }
    </div>);

}

function ValidationRow({ check }: {check: ValidationCheck;}) {
  const map = {
    pass: { label: 'Pass', spine: 'text-positive-500', text: 'text-positive-700' },
    warn: { label: 'Advisory', spine: 'text-caution-500', text: 'text-caution-800' },
    fail: { label: 'Fail', spine: 'text-danger-500', text: 'text-danger-700' }
  }[check.state];

  return (
    <li className={`spine flex items-start gap-3 px-4 py-3 ${map.spine}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="text-[12.5px] font-bold text-ink-900">{check.label}</p>
          {check.blocking && <span className="spec-label text-ink-300">blocking</span>}
        </div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{check.detail}</p>
      </div>
      <span className={`spec-label shrink-0 pt-0.5 ${map.text}`}>{map.label}</span>
    </li>);

}