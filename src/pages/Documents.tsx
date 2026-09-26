import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DownloadIcon, FileTextIcon, Share2Icon } from 'lucide-react';
import { PageHeader } from '../components/shell/PageHeader';
import { Card, DataRow, SectionHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchField, SegmentedControl } from '../components/ui/Field';
import { EmptyState, ErrorState, InlineAlert } from '../components/ui/Feedback';
import { PlanRow } from '../components/common/Rows';
import { useApp } from '../contexts/AppContext';
import { currency } from '../utils/format';
import { projectName } from '../data/projects';
import { supplierName } from '../data/procurement';
import { IMAGES } from '../data/images';

type Kind = 'plans' | 'takeoffs' | 'procurement' | 'delivery' | 'finance';

const PLAN_PREVIEW = IMAGES.blueprint;

export function Documents() {
  const navigate = useNavigate();
  const app = useApp();
  const [kind, setKind] = useState<Kind>('plans');
  const [query, setQuery] = useState('');

  const match = (text: string) => query.trim() ? text.toLowerCase().includes(query.toLowerCase()) : true;

  return (
    <div>
      <PageHeader back={false} title="Documents" subtitle="Plans, takeoffs, orders, PODs and invoices" />
      <div className="mb-5 space-y-3">
        <div className="max-w-[420px]">
          <SearchField value={query} onChange={setQuery} placeholder="Search documents" />
        </div>
        <SegmentedControl
          value={kind}
          onChange={setKind}
          options={[
          { value: 'plans', label: 'Plan sets' },
          { value: 'takeoffs', label: 'AI takeoffs' },
          { value: 'procurement', label: 'Quotes & orders' },
          { value: 'delivery', label: 'Delivery & POD' },
          { value: 'finance', label: 'Invoices' }]
          } />
        
      </div>

      <div>
        {kind === 'plans' &&
        <>
            <InlineAlert tone="info" title="Full version history is kept" body="Every plan set version stays available with who uploaded it and when." />
            <Card className="mt-3 divide-y divide-ink-100">
              {app.planSets.
            filter((p) => match(`${p.name} ${projectName(p.projectId)}`)).
            map((p) =>
            <PlanRow key={p.id} plan={p} onOpen={() => navigate(`/documents/${p.id}`)} />
            )}
            </Card>
          </>
        }

        {kind === 'takeoffs' &&
        <Card className="divide-y divide-ink-100">
            {app.takeoffs.map((t) =>
          <button
            key={t.id}
            onClick={() => navigate(`/takeoff/${t.id}`)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50">
            
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-ink-900">{t.id} · {t.planSetLabel}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-400">
                    {projectName(t.projectId)} · {t.model} · {t.runRef}
                  </p>
                </div>
                <Badge tone="neutral" dot={false}>{t.items.length} lines</Badge>
              </button>
          )}
          </Card>
        }

        {kind === 'procurement' &&
        <Card className="divide-y divide-ink-100">
            {[...app.quotes.filter((q) => q.status !== 'Pending'), ...app.orders].map((doc) =>
          <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5">
                <FileTextIcon className="h-4 w-4 shrink-0 text-ink-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-ink-900">{doc.id}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-ink-400">
                    {supplierName(doc.supplierId)} · {projectName(doc.projectId)} · {currency(doc.total)}
                  </p>
                </div>
                <button
              aria-label={`Download ${doc.id}`}
              onClick={() =>
              app.toast({
                tone: 'success',
                title: `${doc.id} downloaded`,
                body: 'Saved as a PDF to your device.'
              })
              }
              className="text-ink-400 transition-colors duration-150 ease-smooth hover:text-ink-700">
              
                  <DownloadIcon className="h-4 w-4" />
                </button>
              </div>
          )}
          </Card>
        }

        {kind === 'delivery' &&
        <Card className="divide-y divide-ink-100">
            {app.deliveries.filter((d) => d.pod).length === 0 ?
          <EmptyState icon={<FileTextIcon className="h-5 w-5" />} title="No PODs yet" body="Proof of delivery documents appear once a delivery is verified." /> :

          app.deliveries.
          filter((d) => d.pod).
          map((d) =>
          <button
            key={d.id}
            onClick={() => navigate(`/deliveries/${d.id}`)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50">
            
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold text-ink-900">POD · {d.id}</p>
                      <p className="mt-0.5 truncate text-[11.5px] text-ink-400">
                        {projectName(d.projectId)} · received by {d.pod?.receivedBy} · {d.pod?.photos} photos
                      </p>
                    </div>
                    <Badge tone="positive" dot={false}>Signed</Badge>
                  </button>
          )
          }
          </Card>
        }

        {kind === 'finance' && (
        app.can('invoice.view') ?
        <Card className="divide-y divide-ink-100">
              {app.invoices.map((i) =>
          <button
            key={i.id}
            onClick={() => navigate(`/accounting/invoices/${i.id}`)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-ink-50">
            
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-ink-900">{i.id}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-400">
                      {supplierName(i.supplierId)} · {currency(i.amount)} · due {i.dueDate}
                    </p>
                  </div>
                  <Badge tone="neutral" dot={false}>{i.status}</Badge>
                </button>
          )}
            </Card> :

        <ErrorState variant="permission" title="Financial documents are restricted" body="Your active role does not include invoice access." />)
        }
      </div>
    </div>);

}

export function DocumentDetail() {
  const { docId = '' } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const plan = app.planSets.find((p) => p.id === docId);

  if (!plan) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState title="Document not found" body="It may have been removed from this project." action="Back" onAction={() => navigate('/documents')} />
      </div>);

  }

  const versions = app.planSets.
  filter((p) => p.projectId === plan.projectId && p.name === plan.name).
  sort((a, b) => b.version - a.version);

  return (
    <div className="detail-column">
      <PageHeader back backLabel="Documents" title={`${plan.name} · V${plan.version}`} subtitle={projectName(plan.projectId)} />
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <img src={PLAN_PREVIEW} alt={`Preview of ${plan.name} version ${plan.version}`} className="h-64 w-full object-cover" />
          <div className="flex gap-2 p-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              icon={<DownloadIcon className="h-3.5 w-3.5" />}
              onClick={() =>
              app.toast({
                tone: 'success',
                title: `${plan.name} downloaded`,
                body: `Version ${plan.version} saved to your device.`
              })
              }>
              
              Download
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              icon={<Share2Icon className="h-3.5 w-3.5" />}
              onClick={() => navigate('/messages')}>
              
              Share
            </Button>
          </div>
        </Card>

        <Card className="px-4 py-1">
          <dl className="divide-y divide-ink-100">
            <DataRow label="Version" value={plan.isCurrent ? `V${plan.version} · Current` : `V${plan.version} · Previous`} />
            <DataRow label="Uploaded by" value={plan.uploadedBy} />
            <DataRow label="Uploaded" value={plan.uploadedAt} />
            <DataRow label="Sheets" value={`${plan.sheets} sheets · ${plan.sizeMb} MB`} />
            {plan.discipline && <DataRow label="Discipline" value={plan.discipline} />}
            <DataRow label="What changed" value={plan.note} />
          </dl>
        </Card>

        {plan.files && plan.files.length > 0 &&
        <section>
            <SectionHeader title="Files in this set" hint={`${plan.files.length} uploaded`} />
            <Card className="divide-y divide-ink-100">
              {plan.files.map((f) =>
            <div key={f.name} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0 truncate text-[13px] font-semibold text-ink-800">{f.name}</span>
                  <span className="tabular shrink-0 text-[11.5px] text-ink-400">
                    {f.sheets} {f.sheets === 1 ? 'sheet' : 'sheets'} · {f.sizeMb} MB
                  </span>
                </div>
            )}
            </Card>
          </section>
        }

        <section>
          <SectionHeader title="Version history" hint="Nothing is ever overwritten" />
          <Card className="divide-y divide-ink-100">
            {versions.map((v) =>
            <PlanRow key={v.id} plan={v} onOpen={() => navigate(`/documents/${v.id}`)} />
            )}
          </Card>
        </section>
      </div>
    </div>);

}