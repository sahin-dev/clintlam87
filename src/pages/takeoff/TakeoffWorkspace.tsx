import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  LockIcon,
  RedoIcon,
  SaveIcon,
  UndoIcon } from
'lucide-react';
import { BlueprintViewer, Sheet } from '../../components/smpro/BlueprintViewer';
import { SheetNavigator } from '../../components/takeoff/SheetNavigator';
import { QuantityPanel } from '../../components/takeoff/QuantityPanel';
import { WorkspaceDock } from '../../components/takeoff/WorkspaceDock';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Sheet';
import { ErrorState } from '../../components/ui/Feedback';
import { SpecLabel } from '../../components/smpro/Primitives';
import { useApp } from '../../contexts/AppContext';
import { projectName } from '../../data/projects';
import { runFor } from '../../data/takeoffEngine';
import { SheetDiscipline, TakeoffRun } from '../../types/takeoff';

/**
 * The AI Takeoff review workspace — the most important surface in the Builder
 * product, and deliberately not a dashboard. It is laid out like professional
 * takeoff software: drawing index on the left, the drawing itself in the
 * centre, structured quantities on the right, and the four review activities
 * that gate approval docked underneath.
 */
export function TakeoffWorkspace() {
  const { takeoffId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();

  const takeoff = app.takeoffs.find((t) => t.id === takeoffId);
  const seedRun = takeoff ? runFor(takeoff.id) : undefined;

  const [run, setRun] = useState<TakeoffRun | undefined>(seedRun);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [saved, setSaved] = useState(true);

  const canReview = app.can('takeoff.review');
  const canApprove = app.can('takeoff.approve');
  const approved = takeoff?.status === 'Approved';

  /* The viewer works in sheets with detection regions; objects supply them. */
  const viewerSheets: Sheet[] = useMemo(() => {
    if (!run) return [];
    return run.sheets.map((s) => ({
      id: s.id,
      code: s.code,
      title: s.title,
      image: s.image,
      markers: run.objects.
      filter((o) => o.sheetCode === s.code).
      map((o) => ({
        id: o.id,
        x: o.region.x,
        y: o.region.y,
        w: o.region.w,
        h: o.region.h,
        label: o.tag,
        confidence: Math.round(Math.min(...o.attributes.map((a) => a.confidence)))
      }))
    }));
  }, [run]);

  if (!takeoff || !run) {
    return (
      <div className="page-container flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="Takeoff not found"
          body="This run may have been superseded by a newer plan revision."
          action="Back to projects"
          onAction={() => navigate('/projects')} />
        
      </div>);

  }

  const focusSheet = (code: string) => {
    const idx = run.sheets.findIndex((s) => s.code === code);
    if (idx >= 0) {
      setSheetIndex(idx);
      setDockCollapsed(true);
    }
  };

  const focusObject = (objectId: string) => {
    const object = run.objects.find((o) => o.id === objectId);
    if (!object) return;
    setActiveObjectId(objectId);
    focusSheet(object.sheetCode);
  };

  const reclassify = (sheetId: string, discipline: SheetDiscipline) => {
    setRun((prev) =>
    prev ?
    {
      ...prev,
      sheets: prev.sheets.map((s) =>
      s.id === sheetId ?
      { ...s, discipline, classificationConfidence: 100, reclassifiedBy: app.user.name } :
      s
      )
    } :
    prev
    );
    setSaved(false);
    app.toast({ tone: 'success', title: 'Sheet reclassified', body: `Now treated as ${discipline}.` });
  };

  const resolveIssue = (issueId: string, choice: string, note: string) => {
    setRun((prev) =>
    prev ?
    {
      ...prev,
      issues: prev.issues.map((i) =>
      i.id === issueId ?
      {
        ...i,
        status: 'resolved',
        resolution: { choice, by: app.user.name, at: 'Just now', note }
      } :
      i
      ),
      gates: prev.gates.map((g) =>
      g.id === 'g-conf' &&
      prev.issues.filter((i) => i.status === 'open' && i.id !== issueId).length === 0 ?
      { ...g, state: 'pass', clearedBy: app.user.name, clearedAt: 'Just now' } :
      g
      )
    } :
    prev
    );
    setSaved(false);
    app.toast({ tone: 'success', title: 'Issue resolved', body: choice });
  };

  const resolveReconciliation = (id: string, note: string) => {
    setRun((prev) => {
      if (!prev) return prev;
      const reconciliations = prev.reconciliations.map((r) =>
      r.id === id ? { ...r, status: 'resolved' as const, note } : r
      );
      const allClear = reconciliations.every((r) => r.status !== 'mismatch');
      return {
        ...prev,
        reconciliations,
        gates: prev.gates.map((g) =>
        allClear && (g.id === 'g-recon' || g.id === 'g-cross') ?
        { ...g, state: 'pass' as const, clearedBy: app.user.name, clearedAt: 'Just now' } :
        g
        )
      };
    });
    setSaved(false);
    app.toast({ tone: 'success', title: 'Reconciled', body: 'Both source sheets now agree.' });
  };

  const openIssues = run.issues.filter((i) => i.status === 'open').length;
  const reviewedLines = takeoff.items.filter((i) => i.status !== 'pending').length;
  const humanReviewDone = reviewedLines === takeoff.items.length;

  const gates = run.gates.map((g) =>
  g.id === 'g-human' && humanReviewDone ?
  { ...g, state: 'pass' as const, clearedBy: app.user.name, clearedAt: 'Just now' } :
  g
  );
  const blocking = gates.filter((g) => g.required && g.state !== 'pass' && g.state !== 'attention');
  const readyToApprove = blocking.length === 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col bg-canvas">
      {/* Workspace title bar — the drawing record, always visible. */}
      <header className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b border-ink-200 bg-white px-4 py-2.5">
        <button
          onClick={() => navigate(`/projects/${takeoff.projectId}`)}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
          
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Project
        </button>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <Field label="Project" value={projectName(takeoff.projectId)} />
          <Field label="Plan set" value={run.planSetLabel} />
          <Field label="Revision" value={run.revision} mono />
          <Field label="Takeoff" value={`${takeoff.id} · ${run.takeoffType}`} mono />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={`spec-label rounded-[2px] px-2 py-1 ${
            approved ? 'bg-positive-600 text-white' : 'bg-caution-500 text-ink-900'}`
            }>
            
            {approved ? 'Approved' : 'AI takeoff — unverified'}
          </span>

          {!approved && canReview &&
          <div className="flex items-center rounded-[3px] border border-ink-200 bg-white">
              <button
              aria-label="Undo"
              className="px-2 py-1.5 text-ink-400 transition-colors duration-150 ease-smooth hover:text-ink-800">
              
                <UndoIcon className="h-3.5 w-3.5" />
              </button>
              <button
              aria-label="Redo"
              className="border-x border-ink-200 px-2 py-1.5 text-ink-400 transition-colors duration-150 ease-smooth hover:text-ink-800">
              
                <RedoIcon className="h-3.5 w-3.5" />
              </button>
              <button
              onClick={() => {
                setSaved(true);
                app.toast({ tone: 'success', title: 'Review saved' });
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-ink-600 transition-colors duration-150 ease-smooth hover:text-brand-600">
              
                <SaveIcon className="h-3.5 w-3.5" />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          }

          {approved ?
          <>
              <Button size="sm" variant="secondary" icon={<DownloadIcon className="h-3.5 w-3.5" />}>
                Export
              </Button>
              <Button
              size="sm"
              onClick={() => navigate('/procurement/requests/new')}
              icon={<ArrowRightIcon className="h-3.5 w-3.5" />}>
              
                Send for pricing
              </Button>
            </> :
          canApprove ?
          <Button
            size="sm"
            disabled={!readyToApprove}
            onClick={() => setApproveOpen(true)}
            icon={!readyToApprove ? <LockIcon className="h-3.5 w-3.5" /> : undefined}>
            
              {readyToApprove ? 'Approve takeoff' : `${blocking.length} gates open`}
            </Button> :
          null}
        </div>
      </header>

      {/* Review counters — the state of the run in four numbers. */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1.5 border-b border-ink-100 bg-ink-50/70 px-4 py-1.5">
        <Counter label="Sheets analysed" value={String(run.sheets.length)} />
        <Counter label="Objects detected" value={String(run.objects.length)} />
        <Counter
          label="Lines reviewed"
          value={`${reviewedLines}/${takeoff.items.length}`}
          tone={humanReviewDone ? 'positive' : 'caution'} />
        
        <Counter label="Open issues" value={String(openIssues)} tone={openIssues ? 'danger' : 'positive'} />
        <span className="measure ml-auto text-[10.5px] text-ink-400">
          {run.model} · {run.runRef} · {Math.round(run.durationSeconds / 60)} min run
        </span>
      </div>

      {/* Three-panel workspace. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)_336px]">
        <SheetNavigator
          sheets={run.sheets}
          activeIndex={sheetIndex}
          onSelect={(i) => {
            setSheetIndex(i);
            setActiveObjectId(null);
          }}
          onReclassify={reclassify}
          className="hidden lg:flex" />
        

        <div className="min-h-0 min-w-0">
          <BlueprintViewer
            sheets={viewerSheets}
            sheetIndex={sheetIndex}
            onSheetChange={(i) => {
              setSheetIndex(i);
              setActiveObjectId(null);
            }}
            activeMarkerId={activeObjectId}
            onMarkerSelect={(id) => {
              setActiveObjectId(id);
              const object = run.objects.find((o) => o.id === id);
              if (object?.contributesTo[0]) setSelectedLineId(object.contributesTo[0]);
            }}
            className="h-full border-0" />
          
        </div>

        <QuantityPanel
          takeoff={takeoff}
          run={run}
          selectedLineId={selectedLineId}
          onSelectLine={setSelectedLineId}
          onFocusObject={focusObject}
          locked={approved}
          canReview={canReview}
          className="min-h-0" />
        
      </div>

      <WorkspaceDock
        run={{ ...run, gates }}
        approved={approved}
        canReview={canReview}
        onResolveIssue={resolveIssue}
        onResolveReconciliation={resolveReconciliation}
        onFocusSheet={focusSheet}
        collapsed={dockCollapsed}
        onToggle={() => setDockCollapsed((c) => !c)} />
      

      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Approve this takeoff?"
        footer={
        <>
            <Button variant="secondary" className="flex-1" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
            className="flex-1"
            onClick={() => {
              app.approveTakeoff(takeoff.id);
              setApproveOpen(false);
              app.toast({
                tone: 'success',
                title: 'Takeoff approved',
                body: `${takeoff.id} is ready to price.`
              });
            }}>
            
              Approve
            </Button>
          </>
        }>
        
        <p className="text-[13.5px] leading-relaxed text-ink-600">
          {takeoff.items.length} lines against {run.revision} of {run.planSetLabel}. All required
          verification gates have cleared. Approved quantities become the purchasing baseline,
          are recorded against your name, and cannot be changed by a later model run.
        </p>
      </Modal>
    </div>);

}

function Field({ label, value, mono }: {label: string;value: string;mono?: boolean;}) {
  return (
    <div className="min-w-0">
      <SpecLabel>{label}</SpecLabel>
      <p
        className={`mt-0.5 truncate text-[12.5px] font-bold text-ink-900 ${mono ? 'measure' : ''}`}>
        
        {value}
      </p>
    </div>);

}

function Counter({
  label,
  value,
  tone = 'default'




}: {label: string;value: string;tone?: 'default' | 'positive' | 'caution' | 'danger';}) {
  const toneClass = {
    default: 'text-ink-900',
    positive: 'text-positive-700',
    caution: 'text-caution-800',
    danger: 'text-danger-600'
  }[tone];
  return (
    <span className="flex items-baseline gap-2">
      <span className="spec-label">{label}</span>
      <span className={`measure text-[13px] font-bold ${toneClass}`}>{value}</span>
    </span>);

}