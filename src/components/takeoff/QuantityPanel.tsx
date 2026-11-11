import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  XIcon } from
'lucide-react';
import { Takeoff, TakeoffItem } from '../../types';
import { TakeoffObject, TakeoffRun } from '../../types/takeoff';
import { ConfidenceMeter } from '../smpro/Confidence';
import { QuantityWhy } from '../smpro/QuantityWhy';
import { SourceTrace } from '../smpro/SourceTrace';
import { QuantityLadder } from '../smpro/QuantityLadder';
import { AttributeTable, VerificationChip } from '../smpro/Verification';
import { SpecLabel, TickRule } from '../smpro/Primitives';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Field';
import { useApp } from '../../contexts/AppContext';
import { qty } from '../../utils/format';
import { projectName } from '../../data/projects';

/**
 * The structured takeoff panel: every material line with its quantity,
 * confidence and verification state, and — when opened — the full evidence
 * chain behind that one number.
 */
export function QuantityPanel({
  takeoff,
  run,
  selectedLineId,
  onSelectLine,
  onFocusObject,
  locked,
  canReview,
  className









}: {takeoff: Takeoff;run: TakeoffRun;selectedLineId: string | null;onSelectLine: (lineId: string | null) => void;onFocusObject: (objectId: string) => void;locked: boolean;canReview: boolean;className?: string;}) {
  const [filter, setFilter] = useState<'all' | 'review' | 'low'>('all');
  const selected = takeoff.items.find((i) => i.id === selectedLineId) ?? null;

  if (selected) {
    return (
      <LineInspector
        item={selected}
        takeoff={takeoff}
        run={run}
        locked={locked}
        canReview={canReview}
        onBack={() => onSelectLine(null)}
        onFocusObject={onFocusObject}
        className={className} />);


  }

  const visible = takeoff.items.filter((i) => {
    if (filter === 'review') return i.status === 'pending';
    if (filter === 'low') return i.confidence < 75;
    return true;
  });
  const categories = Array.from(new Set(visible.map((i) => i.category)));

  return (
    <div className={twMerge('flex min-h-0 flex-col border-l border-ink-200 bg-white', className)}>
      <div className="border-b border-ink-100 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <SpecLabel>Structured takeoff</SpecLabel>
          <span className="measure text-[10.5px] text-ink-400">{takeoff.items.length} lines</span>
        </div>
        <div className="mt-2 flex gap-1">
          {(
          [
          ['all', 'All'],
          ['review', 'Needs review'],
          ['low', 'Low confidence']] as
          const).
          map(([key, label]) =>
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={twMerge(
              'flex-1 rounded-[3px] border px-1.5 py-1.5 text-[10.5px] font-bold transition-colors duration-150 ease-smooth',
              filter === key ?
              'border-ink-900 bg-ink-900 text-white' :
              'border-ink-200 bg-white text-ink-500 hover:border-ink-300'
            )}>
            
              {label}
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visible.length === 0 ?
        <p className="px-4 py-10 text-center text-[12.5px] text-ink-400">
            Nothing matches this filter.
          </p> :

        categories.map((category) =>
        <div key={category}>
              <div className="flex items-center justify-between gap-2 border-y border-ink-100 bg-ink-50/80 px-3 py-1.5">
                <SpecLabel>{category}</SpecLabel>
                <span className="measure text-[10px] text-ink-400">
                  {visible.filter((i) => i.category === category).length}
                </span>
              </div>
              <ul>
                {visible.
            filter((i) => i.category === category).
            map((item) =>
            <QuantityRow key={item.id} item={item} onSelect={() => onSelectLine(item.id)} />
            )}
              </ul>
            </div>
        )
        }
      </div>

      {!locked && canReview &&
      <div className="border-t border-ink-100 p-2.5">
          <button
          onClick={() => onSelectLine(null)}
          className="flex w-full items-center justify-center gap-1.5 rounded-[3px] border border-dashed border-ink-200 py-2 text-[12px] font-semibold text-ink-500 transition-colors duration-150 ease-smooth hover:border-brand-300 hover:text-brand-600">
          
            <PlusIcon className="h-3.5 w-3.5" />
            Add a material the AI missed
          </button>
        </div>
      }
    </div>);

}

function verificationOf(item: TakeoffItem) {
  if (item.status === 'edited') return 'human_corrected' as const;
  if (item.status === 'accepted') return 'verified' as const;
  if (item.status === 'added') return 'human_corrected' as const;
  if (item.status === 'rejected') return 'needs_review' as const;
  return item.confidence < 75 ? 'needs_review' as const : 'ai_generated' as const;
}

function QuantityRow({ item, onSelect }: {item: TakeoffItem;onSelect: () => void;}) {
  const final = item.correctedQuantity ?? item.aiQuantity;
  return (
    <li>
      <button
        onClick={onSelect}
        className="flex w-full items-center gap-2.5 border-b border-ink-100 px-3 py-2.5 text-left transition-colors duration-150 ease-smooth hover:bg-brand-50/40">
        
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-bold text-ink-900">{item.item}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="measure text-[10px] font-bold text-ink-400">{item.sheet}</span>
            <VerificationChip state={verificationOf(item)} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="measure text-[14px] font-bold leading-none text-ink-900">
            {qty(final)}
            <span className="ml-1 text-[9.5px] font-medium text-ink-400">{item.unit}</span>
          </p>
          <ConfidenceMeter value={item.confidence} size="sm" showLabel={false} className="mt-1.5" />
        </div>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-300" />
      </button>
    </li>);

}

/** Everything known about one quantity: objects, attributes, derivation, history. */
function LineInspector({
  item,
  takeoff,
  run,
  locked,
  canReview,
  onBack,
  onFocusObject,
  className









}: {item: TakeoffItem;takeoff: Takeoff;run: TakeoffRun;locked: boolean;canReview: boolean;onBack: () => void;onFocusObject: (objectId: string) => void;className?: string;}) {
  const { updateTakeoffItem, user, toast } = useApp();
  const [tab, setTab] = useState<'why' | 'objects' | 'history'>('why');
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(item.correctedQuantity ?? item.aiQuantity));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const final = item.correctedQuantity ?? item.aiQuantity;
  const derivation = run.derivations[item.id];
  const objects = run.objects.filter((o) => o.contributesTo.includes(item.id));
  const issues = run.issues.filter((i) => i.lineId === item.id && i.status === 'open');

  const save = () => {
    const num = Number(value);
    if (!value || Number.isNaN(num) || num <= 0) {
      setError('Enter a quantity greater than zero');
      return;
    }
    if (!reason.trim()) {
      setError('A reason is required so the correction stays auditable');
      return;
    }
    updateTakeoffItem(takeoff.id, item.id, {
      correctedQuantity: num,
      correctionReason: reason.trim(),
      correctedBy: user.name,
      correctedAt: 'Just now',
      status: 'edited'
    });
    toast({ tone: 'success', title: 'Correction recorded', body: `${item.item} · ${qty(num)} ${item.unit}` });
    setEditing(false);
    setReason('');
    setError('');
  };

  return (
    <div className={twMerge('flex min-h-0 flex-col border-l border-ink-200 bg-white', className)}>
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/70 px-3 py-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-[3px] px-1 py-0.5 text-[11px] font-bold text-ink-500 transition-colors duration-150 ease-smooth hover:text-brand-600">
          
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          All lines
        </button>
        <VerificationChip state={verificationOf(item)} className="ml-auto" />
      </div>

      <div className="border-b border-ink-100 px-3.5 py-3">
        <p className="text-[14px] font-bold leading-snug text-ink-900">{item.item}</p>
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <div>
            <SpecLabel>Current quantity</SpecLabel>
            <p className="measure mt-1 text-[24px] font-extrabold leading-none text-ink-900">
              {qty(final)}
              <span className="ml-1 text-[11px] font-medium text-ink-400">{item.unit}</span>
            </p>
          </div>
          <ConfidenceMeter value={item.confidence} />
        </div>
      </div>

      {issues.length > 0 &&
      <div className="border-b border-caution-100 bg-caution-50 px-3.5 py-2">
          <p className="text-[11.5px] font-semibold leading-snug text-caution-900">
            {issues.length} open {issues.length === 1 ? 'issue' : 'issues'} affect this line:{' '}
            {issues.map((i) => i.title).join('; ')}.
          </p>
        </div>
      }

      <div className="flex border-b border-ink-100">
        {(
        [
        ['why', 'Why?'],
        ['objects', `Objects ${objects.length}`],
        ['history', 'History']] as
        const).
        map(([key, label]) =>
        <button
          key={key}
          onClick={() => setTab(key)}
          aria-pressed={tab === key}
          className={twMerge(
            'flex-1 py-2 text-[12px] font-semibold transition-colors duration-150 ease-smooth',
            tab === key ?
            'border-b-2 border-brand-500 text-ink-900' :
            'text-ink-400 hover:text-ink-600'
          )}>
          
            {label}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
        {tab === 'why' && (
        derivation ?
        <QuantityWhy derivation={derivation} unit={item.unit} finalQuantity={final} /> :

        <p className="text-[12.5px] leading-relaxed text-ink-500">
              This line was entered by hand, so it has no model derivation. Its authority is the
              person who added it.
            </p>)
        }

        {tab === 'objects' &&
        <div className="space-y-3">
            {objects.length === 0 &&
          <p className="text-[12.5px] text-ink-500">No detected objects feed this line.</p>
          }
            {objects.map((o) =>
          <ObjectCard key={o.id} object={o} onFocus={() => onFocusObject(o.id)} />
          )}
          </div>
        }

        {tab === 'history' &&
        <div className="space-y-4">
            <SourceTrace
            source={{
              project: projectName(takeoff.projectId),
              planSet: run.planSetLabel,
              revision: run.revision,
              sheet: item.sheet,
              page: item.page,
              condition: item.category
            }} />
          
            <div>
              <SpecLabel className="mb-1.5">Chain of custody</SpecLabel>
              <QuantityLadder
              aiQuantity={item.aiQuantity}
              correctedQuantity={item.correctedQuantity}
              approvedQuantity={takeoff.status === 'Approved' ? final : null}
              unit={item.unit}
              correctedBy={item.correctedBy}
              correctedAt={item.correctedAt}
              reason={item.correctionReason} />
            
            </div>
            <div className="border-t border-ink-100 pt-3">
              <SpecLabel>Model run</SpecLabel>
              <p className="measure mt-1 text-[11.5px] text-ink-600">
                {run.model} · {run.runRef} · {run.startedAt}
              </p>
            </div>
          </div>
        }
      </div>

      {editing ?
      <div className="space-y-2.5 border-t border-brand-200 bg-brand-50/50 p-3.5">
          <Input
          label={`Corrected quantity (${item.unit})`}
          value={value}
          inputMode="numeric"
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }} />
        
          <TextArea
          label="Reason for the change"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError('');
          }}
          placeholder="Wall run remeasured from the revised dimension string on A1.01." />
        
          {error && <p className="text-[12px] font-medium text-danger-600">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" className="flex-1" onClick={save}>
              Save correction
            </Button>
          </div>
        </div> :

      <div className="flex flex-wrap gap-2 border-t border-ink-100 bg-ink-50/60 px-3.5 py-2.5">
          {locked ?
        <p className="text-[11.5px] font-semibold text-positive-700">
              Approved and locked — corrections create a new takeoff.
            </p> :
        !canReview ?
        <p className="text-[11.5px] text-ink-500">
              Your role can inspect this line but not change it.
            </p> :

        <>
              <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              updateTakeoffItem(takeoff.id, item.id, { status: 'rejected' });
              toast({ tone: 'info', title: 'Line rejected', body: 'It will not reach procurement.' });
            }}
            icon={<XIcon className="h-3.5 w-3.5" />}>
            
                Reject
              </Button>
              <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setValue(String(final));
              setEditing(true);
            }}
            icon={<PencilIcon className="h-3.5 w-3.5" />}>
            
                Correct
              </Button>
              <Button
            size="sm"
            className="ml-auto"
            onClick={() => {
              updateTakeoffItem(takeoff.id, item.id, { status: 'accepted' });
              toast({ tone: 'success', title: 'Quantity verified' });
            }}
            icon={<CheckIcon className="h-3.5 w-3.5" />}>
            
                Verify
              </Button>
            </>
        }
        </div>
      }
    </div>);

}

function ObjectCard({ object, onFocus }: {object: TakeoffObject;onFocus: () => void;}) {
  return (
    <div className="border border-ink-100">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/70 px-3 py-2">
        <div className="min-w-0">
          <SpecLabel>{object.type}</SpecLabel>
          <p className="mt-0.5 truncate text-[12.5px] font-bold text-ink-900">{object.tag}</p>
        </div>
        <button
          onClick={onFocus}
          className="measure shrink-0 rounded-[3px] border border-ink-200 bg-white px-2 py-1 text-[10px] font-bold text-ink-600 transition-colors duration-150 ease-smooth hover:border-brand-300 hover:text-brand-600">
          
          {object.sheetCode}
        </button>
      </div>
      <div className="px-3 py-2">
        <AttributeTable attributes={object.attributes} />
      </div>
      <TickRule />
      <div className="px-3 py-2">
        <VerificationChip state={object.verification} />
      </div>
    </div>);

}