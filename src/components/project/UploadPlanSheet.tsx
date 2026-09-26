import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon } from 'lucide-react';
import { BottomSheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Input, Select, TextArea } from '../ui/Field';
import { InlineAlert } from '../ui/Feedback';
import { Progress } from '../ui/Card';
import { DrawingDropzone } from '../upload/DrawingDropzone';
import { DrawingFileRow } from '../upload/DrawingFileRow';
import { useDrawingUpload } from '../../hooks/useDrawingUpload';
import { useApp } from '../../contexts/AppContext';
import { MAX_FILES, formatMb } from '../../utils/upload';
import { PlanFile, Project } from '../../types';

type Phase = 'select' | 'uploading' | 'done';

const DISCIPLINES = [
'Architectural',
'Structural',
'Framing',
'Civil / Sitework',
'Mechanical, Electrical & Plumbing',
'Mixed set'];


/**
 * Plan-set upload used by both the project Plans tab and the AI Takeoff flow.
 * Drawings are read in the browser first — sheet counts, resolution and
 * unreadable files surface before anything is committed — then transferred as a
 * new version. Earlier versions are never overwritten.
 */
export function UploadPlanSheet({
  open,
  onClose,
  project,
  onUploaded






}: {open: boolean;onClose: () => void;project: Project; /** Provided by the takeoff flow so the new set can be selected immediately. */onUploaded?: (planSetId: string) => void;}) {
  const navigate = useNavigate();
  const { planSets, addPlanSet, user, toast } = useApp();
  const upload = useDrawingUpload();

  const existing = useMemo(
    () => planSets.filter((p) => p.projectId === project.id).sort((a, b) => b.version - a.version),
    [planSets, project.id]
  );
  const nextVersion = (existing[0]?.version ?? 0) + 1;

  const [phase, setPhase] = useState<Phase>('select');
  const [name, setName] = useState(existing[0]?.name ?? `${project.name} — Architectural Set`);
  const [discipline, setDiscipline] = useState(DISCIPLINES[0]);
  const [note, setNote] = useState('');
  const [nameError, setNameError] = useState('');
  const [newPlanId, setNewPlanId] = useState('');

  const { totals, files } = upload;
  const canStart = totals.transferable > 0 && !totals.reading;

  const reset = () => {
    upload.clear();
    setPhase('select');
    setNote('');
    setNameError('');
    setNewPlanId('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const begin = () => {
    if (!name.trim()) {
      setNameError('Give this plan set a name so the version history stays readable.');
      return;
    }
    setNameError('');
    setPhase('uploading');
    upload.startUpload();
  };

  const commit = () => {
    const stored: PlanFile[] = files.
    filter((f) => f.status === 'uploaded').
    map((f) => ({
      name: f.name,
      kind: f.kind,
      sheets: f.sheets,
      sizeMb: Number(f.sizeMb.toFixed(1))
    }));
    const id = `ps-${Date.now()}`;
    addPlanSet({
      id,
      projectId: project.id,
      name: name.trim(),
      version: nextVersion,
      isCurrent: true,
      uploadedBy: user.name,
      uploadedAt: 'Just now',
      sheets: stored.reduce((sum, f) => sum + f.sheets, 0),
      sizeMb: Number(stored.reduce((sum, f) => sum + f.sizeMb, 0).toFixed(1)),
      note: note.trim() || 'New issue.',
      discipline,
      files: stored
    });
    setNewPlanId(id);
    setPhase('done');
    toast({
      tone: 'success',
      title: `Version ${nextVersion} uploaded`,
      body: `${stored.length} ${stored.length === 1 ? 'file' : 'files'} · ${stored.reduce((s, f) => s + f.sheets, 0)} sheets. Earlier versions are preserved.`
    });
  };

  const footer =
  phase === 'select' ?
  <Button block size="lg" disabled={!canStart} onClick={begin}>
        {totals.reading ?
    'Reading drawings…' :
    totals.transferable === 0 ?
    'Add drawings to continue' :
    `Upload ${totals.transferable} ${totals.transferable === 1 ? 'file' : 'files'} as Version ${nextVersion}`}
      </Button> :
  phase === 'uploading' ?
  <Button block size="lg" disabled={!totals.complete} onClick={commit}>
        {totals.complete ? `Save as Version ${nextVersion}` : 'Transferring…'}
      </Button> :

  <div className="flex gap-2.5">
        <Button variant="secondary" size="lg" className="flex-1" onClick={close}>
          Done
        </Button>
        <Button
      size="lg"
      className="flex-1"
      icon={<SparklesIcon className="h-4 w-4" />}
      onClick={() => {
        const id = newPlanId;
        reset();
        onClose();
        if (onUploaded) onUploaded(id);else
        navigate(`/takeoff/new?project=${project.id}&plan=${id}`);
      }}>
      
          Start AI takeoff
        </Button>
      </div>;


  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="Upload construction drawings"
      description={`${project.name} · saved as Version ${nextVersion}`}
      footer={footer}>
      
      {phase === 'select' &&
      <div className="space-y-4">
          <DrawingDropzone onFiles={upload.addFiles} remaining={MAX_FILES - files.length} />

          {files.length > 0 &&
        <div className="rounded-xl border border-ink-100">
              <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-2.5">
                <p className="tabular text-[12px] font-semibold text-ink-500">
                  {totals.count} {totals.count === 1 ? 'file' : 'files'} · {totals.sheets} sheets ·{' '}
                  {formatMb(totals.sizeMb)}
                </p>
                <button
              onClick={upload.clear}
              className="text-[12px] font-semibold text-ink-400 transition-colors duration-150 ease-smooth hover:text-danger-600">
              
                  Clear all
                </button>
              </div>
              <ul className="divide-y divide-ink-100">
                {files.map((f) =>
            <DrawingFileRow
              key={f.id}
              upload={f}
              onRemove={() => upload.remove(f.id)}
              onCancel={() => upload.cancel(f.id)}
              onRetry={() => upload.retry(f.id)} />

            )}
              </ul>
            </div>
        }

          {totals.invalid > 0 &&
        <InlineAlert
          tone="danger"
          title={`${totals.invalid} ${totals.invalid === 1 ? 'file was' : 'files were'} rejected`}
          body="Rejected files are not uploaded. Remove them or replace them with a readable copy." />

        }
          {totals.warnings > 0 &&
        <InlineAlert
          tone="warning"
          title={`${totals.warnings} ${totals.warnings === 1 ? 'sheet needs' : 'sheets need'} attention`}
          body="These will upload, but low-resolution scans reduce takeoff confidence and may need manual correction." />

        }

          <Input
          label="Plan set name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError} />
        
          <Select label="Discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)} hint="Scopes the AI models">
            {DISCIPLINES.map((d) =>
          <option key={d} value={d}>
                {d}
              </option>
          )}
          </Select>
          <Input label="Version" value={`V${nextVersion}`} readOnly hint="Assigned automatically" />
          <TextArea
          label="What changed"
          hint="Recommended"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Revised framing plan after structural review." />
        
        </div>
      }

      {phase === 'uploading' &&
      <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[14px] font-bold text-ink-900">
                {totals.complete ? 'Transfer complete' : 'Uploading drawings…'}
              </p>
              <p className="tabular text-[12px] font-semibold text-ink-500">
                {totals.uploaded} of {totals.count}
              </p>
            </div>
            <Progress
            value={totals.complete ? 100 : totals.progress}
            tone={totals.complete ? 'positive' : 'brand'}
            className="mt-3" />
          
            <p className="mt-2 text-[12px] text-ink-400">
              {totals.complete ?
            `${totals.sheets} sheets ready. Save the version to make it available for takeoff.` :
            'Keep this panel open until every file finishes. Nothing is saved until the transfer completes.'}
            </p>
          </div>

          <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100">
            {files.map((f) =>
          <DrawingFileRow
            key={f.id}
            upload={f}
            onRemove={() => upload.remove(f.id)}
            onCancel={() => upload.cancel(f.id)}
            onRetry={() => upload.retry(f.id)} />

          )}
          </ul>
        </div>
      }

      {phase === 'done' &&
      <div className="space-y-4">
          <InlineAlert
          tone="success"
          title={`Version ${nextVersion} is now current`}
          body={
          nextVersion > 1 ?
          `Version ${nextVersion - 1} and earlier remain available in the version history.` :
          'This is the first version of this plan set.'
          } />
        
          <div className="rounded-xl border border-ink-100 px-4 py-3.5">
            <p className="text-[13px] font-semibold text-ink-900">{name}</p>
            <p className="tabular mt-1 text-[12px] text-ink-400">
              {discipline} · {totals.uploaded} {totals.uploaded === 1 ? 'file' : 'files'} · {totals.sheets} sheets ·{' '}
              {formatMb(totals.sizeMb)}
            </p>
          </div>
        </div>
      }
    </BottomSheet>);

}