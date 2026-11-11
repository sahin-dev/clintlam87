import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileTextIcon, ImageIcon, MessageSquareIcon, PaperclipIcon, SendIcon } from 'lucide-react';
import { ThreadMessage } from '../types';
import { PageHeader } from '../components/shell/PageHeader';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { SearchField, SegmentedControl } from '../components/ui/Field';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import { threads } from '../data/engagement';
import { projectName } from '../data/projects';

export function Messages() {
  const navigate = useNavigate();
  const [scope, setScope] = useState<'all' | 'project' | 'supplier'>('all');
  const [query, setQuery] = useState('');

  const list = threads.
  filter((t) => scope === 'all' ? true : t.scope === scope).
  filter((t) =>
  query.trim() ? `${t.subject} ${t.context}`.toLowerCase().includes(query.toLowerCase()) : true
  );

  return (
    <div>
      <PageHeader back={false} title="Messages" subtitle="Project and supplier conversations, in context" />
      <div className="mb-5 space-y-3">
        <div className="max-w-[420px]">
          <SearchField value={query} onChange={setQuery} placeholder="Search conversations" />
        </div>
        <SegmentedControl
          value={scope}
          onChange={setScope}
          options={[
          { value: 'all', label: 'All' },
          { value: 'project', label: 'Project chat' },
          { value: 'supplier', label: 'Suppliers' }]
          } />
        
      </div>
      <div>
        {list.length === 0 ?
        <EmptyState icon={<MessageSquareIcon className="h-5 w-5" />} title="No conversations" body="Messages started from a quote, order or delivery keep their context here." /> :

        <Card className="divide-y divide-ink-100">
            {list.map((t) =>
          <button
            key={t.id}
            onClick={() => navigate(`/messages/${t.id}`)}
            className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-smooth hover:bg-ink-50">
            
                <Avatar name={t.subject} size="md" tone={t.scope === 'supplier' ? 'brand' : 'ink'} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[14px] font-bold text-ink-900">{t.subject}</p>
                    <span className="shrink-0 text-[11px] text-ink-400">{t.updatedAt}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-ink-400">{t.context}</p>
                  <p className="mt-1 truncate text-[12.5px] text-ink-600">
                    {t.messages[t.messages.length - 1].body}
                  </p>
                </div>
                {t.unread > 0 &&
            <span className="tabular mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10.5px] font-bold text-white">
                    {t.unread}
                  </span>
            }
              </button>
          )}
          </Card>
        }
      </div>
    </div>);

}

export function MessageThreadPage() {
  const { threadId = '' } = useParams();
  const navigate = useNavigate();
  const thread = threads.find((t) => t.id === threadId);
  const [draft, setDraft] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  /* Anything sent in this session, appended to the thread on screen. */
  const [sent, setSent] = useState<ThreadMessage[]>([]);

  const send = (body: string, attachment?: ThreadMessage['attachment']) => {
    setSent((prev) => [
    ...prev,
    {
      id: `m-${Date.now()}`,
      author: 'You',
      at: 'Just now',
      body,
      self: true,
      ...(attachment ? { attachment } : {})
    }]
    );
    setDraft('');
  };

  if (!thread) {
    return (
      <div className="mx-auto w-full max-w-[560px] py-20">
        <ErrorState title="Conversation not found" body="It may have been archived." action="Back to messages" onAction={() => navigate('/messages')} />
      </div>);

  }

  return (
    <div className="detail-column">
      <PageHeader back backLabel="Messages" title={thread.subject} subtitle={`${thread.context} · ${projectName(thread.projectId)}`} />

      <div className="flex h-[calc(100vh-18rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-ink-100 bg-canvas">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
        {[...thread.messages, ...sent].map((m) =>
          m.system ?
          <p key={m.id} className="mx-auto max-w-[85%] rounded-xl bg-ink-100 px-3 py-2 text-center text-[12px] font-medium text-ink-500">
              {m.body} · {m.at}
            </p> :

          <div key={m.id} className={`flex gap-2.5 ${m.self ? 'flex-row-reverse' : ''}`}>
              {!m.self && <Avatar name={m.author} size="sm" />}
              <div className={`max-w-[78%] ${m.self ? 'items-end text-right' : ''}`}>
                <p className="mb-1 text-[11px] font-semibold text-ink-400">
                  {m.author} · {m.at}
                </p>
                <div
                className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                m.self ? 'bg-brand-500 text-white' : 'bg-white text-ink-800 shadow-card'}`
                }>
                
                  {m.body}
                </div>
                {m.attachment &&
              <div className="mt-1.5 inline-flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2">
                    {m.attachment.kind === 'pdf' ?
                <FileTextIcon className="h-4 w-4 text-danger-500" /> :

                <ImageIcon className="h-4 w-4 text-info-500" />
                }
                    <span className="text-[12px] font-semibold text-ink-700">{m.attachment.name}</span>
                  </div>
              }
              </div>
            </div>

          )}
        </div>

        <div className="flex shrink-0 items-end gap-2 border-t border-ink-100 bg-white px-3 py-3">
        <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              send(`Attached ${file.name}`, {
                name: file.name,
                kind: file.type.startsWith('image/') ? 'image' : 'pdf'
              });
              e.target.value = '';
            }} />
          
        <button
            aria-label="Attach file"
            onClick={() => fileInput.current?.click()}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-400 hover:bg-ink-100">
            
          <PaperclipIcon className="h-[18px] w-[18px]" />
        </button>
        <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) send(draft.trim());
            }}
            placeholder="Write a message"
            aria-label="Message"
            className="h-10 min-w-0 flex-1 rounded-xl border border-ink-200 px-3.5 text-[14px] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />
          
        <button
            aria-label="Send"
            disabled={!draft.trim()}
            onClick={() => send(draft.trim())}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors duration-150 ease-smooth hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ink-200">
            
          <SendIcon className="h-[18px] w-[18px]" />
        </button>
        </div>
      </div>
    </div>);

}