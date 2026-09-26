import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon } from 'lucide-react';
import { PageHeader } from '../../components/shell/PageHeader';
import { Card, SectionHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, TextArea } from '../../components/ui/Field';
import { EmptyState, InlineAlert } from '../../components/ui/Feedback';
import { MaterialLineRow } from '../../components/common/Rows';
import { useApp } from '../../contexts/AppContext';
import { qty } from '../../utils/format';

export function NewRequest() {
  const navigate = useNavigate();
  const app = useApp();
  const approved = app.takeoffs.filter((t) => t.status === 'Approved');
  const [takeoffId, setTakeoffId] = useState(approved[0]?.id ?? '');
  const [requiredBy, setRequiredBy] = useState('Aug 29, 2026');
  const [priority, setPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Normal');
  const [notes, setNotes] = useState('');
  const [excluded, setExcluded] = useState<string[]>([]);
  const [error, setError] = useState('');

  const takeoff = approved.find((t) => t.id === takeoffId);
  const lines = useMemo(
    () =>
    (takeoff?.items ?? []).
    filter((i) => i.status !== 'rejected').
    map((i) => ({ id: i.id, item: i.item, qty: i.correctedQuantity ?? i.aiQuantity, unit: i.unit })),
    [takeoff]
  );
  const included = lines.filter((l) => !excluded.includes(l.id));

  if (approved.length === 0) {
    return (
      <div>
        <PageHeader back title="New material request" />
        <div className="mx-auto w-full max-w-[560px] py-16">
          <EmptyState
            icon={<CheckIcon className="h-5 w-5" />}
            title="No approved takeoffs yet"
            body="A takeoff has to be reviewed and approved before its quantities can be requested."
            action="Go to takeoffs"
            onAction={() => navigate('/projects')} />
          
        </div>
      </div>);

  }

  const submit = () => {
    if (!included.length) {
      setError('Include at least one material line');
      return;
    }
    const id = `MR-${Math.floor(1050 + Math.random() * 40)}`;
    app.addRequest({
      id,
      projectId: takeoff!.projectId,
      takeoffId: takeoff!.id,
      requestedBy: app.user.name,
      requestedAt: 'Just now',
      requiredBy,
      priority,
      status: 'Submitted',
      notes,
      lines: included.map((l) => ({ item: l.item, qty: l.qty, unit: l.unit }))
    });
    app.toast({ tone: 'success', title: `${id} submitted`, body: 'Purchasing has been notified.' });
    navigate(`/procurement/requests/${id}`);
  };

  return (
    <div className="detail-column">
      <PageHeader back backLabel="Procurement" title="New material request" subtitle="Built from an approved takeoff" />
      <div className="space-y-6">
        <Card className="grid gap-4 p-5 md:grid-cols-2">
          <Select label="Approved takeoff" value={takeoffId} onChange={(e) => setTakeoffId(e.target.value)}>
            {approved.map((t) =>
            <option key={t.id} value={t.id}>
                {t.id} · {t.planSetLabel}
              </option>
            )}
          </Select>
          <Input label="Required on site" value={requiredBy} onChange={(e) => setRequiredBy(e.target.value)} />
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </Select>
          <TextArea
            label="Notes for purchasing"
            hint="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Framing crew mobilizes Aug 26. Stage on the north side of the lot." />
          
        </Card>

        <section>
          <SectionHeader title="Materials" hint={`${included.length} of ${lines.length} lines included`} />
          <Card className="divide-y divide-ink-100">
            {lines.map((line) => {
              const on = !excluded.includes(line.id);
              return (
                <MaterialLineRow
                  key={line.id}
                  item={line.item}
                  quantity={line.qty}
                  unit={line.unit}
                  right={
                  <button
                    onClick={() =>
                    setExcluded((prev) => on ? [...prev, line.id] : prev.filter((x) => x !== line.id))
                    }
                    className={`rounded-lg border px-2.5 py-1 text-[11.5px] font-bold transition-colors duration-150 ease-smooth ${
                    on ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-400'}`
                    }>
                    
                      {on ? 'Included' : 'Excluded'}
                    </button>
                  } />);


            })}
          </Card>
        </section>

        <InlineAlert
          tone="info"
          title="Quantities are traceable"
          body={`Every line carries its takeoff origin (${takeoff?.id}) and any human correction, so purchasing can see exactly where the number came from.`} />
        

        {error && <p className="text-[12.5px] font-medium text-danger-600">{error}</p>}

        <Button block size="lg" onClick={submit}>
          Submit request · {qty(included.length)} lines
        </Button>
      </div>
    </div>);

}