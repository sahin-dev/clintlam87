import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MailPlusIcon,
  PlugZapIcon,
  PlusIcon,
  Trash2Icon } from
'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { Checkbox, Input, Select } from '../../components/ui/Field';
import { InlineAlert } from '../../components/ui/Feedback';
import { Panel, SpecLabel, TickRule } from '../../components/smpro/Primitives';
import { useSupplier } from '../../contexts/SupplierContext';
import { SUPPLIER_ROLES, SUPPLIER_ROLE_ORDER } from '../../utils/supplierRbac';
import { SupplierRoleId } from '../../types/supplier';
import { IMAGES } from '../../data/images';
import { DEMO_MODE } from '../../config';

type Step = 'account' | 'verify' | 'organization' | 'yards' | 'team' | 'integration' | 'done';

const STEPS: {id: Step;label: string;heading: string;body: string;}[] = [
{
  id: 'account',
  label: 'Administrator',
  heading: 'Create your yard administrator',
  body: 'You become the first administrator of the supplier organization and can hand the role on later.'
},
{
  id: 'verify',
  label: 'Verification',
  heading: 'Verify this account',
  body: 'Yard accounts carry pricing and payment data, so every new organization is verified once at sign-up.'
},
{
  id: 'organization',
  label: 'Organization',
  heading: 'Register the supplier organization',
  body: 'This is the trading entity builders connect to. It owns your catalogue, pricing and payment terms.'
},
{
  id: 'yards',
  label: 'Yards',
  heading: 'Add your yards',
  body: 'Stock, dispatch and delivery are scoped per yard. Add each location that ships material.'
},
{
  id: 'team',
  label: 'Team',
  heading: 'Invite your team',
  body: 'One shared platform; each role sees the work it owns. A person can hold more than one role.'
},
{
  id: 'integration',
  label: 'Integrations',
  heading: 'Connect your ERP',
  body: 'Optional. SM PRO runs standalone — an ERP link only keeps products, stock and invoices in step.'
}];


interface Yard {
  name: string;
  city: string;
  capability: string;
  primary: boolean;
}

interface Invite {
  email: string;
  roles: SupplierRoleId[];
}

/**
 * Supplier / lumber yard registration.
 *
 * Deliberately separate from the builder's sign-up: a yard registers a trading
 * entity, its physical yards, an eight-role team and an optional ERP link —
 * none of which a builder organization has. The two remain separate tenants.
 */
export function SupplierOnboarding() {
  const navigate = useNavigate();
  const { signIn, setActiveRole } = useSupplier();

  const [step, setStep] = useState<Step>('account');

  /* Demo build: everything is pre-filled and nothing is required. */
  const [account, setAccount] = useState({
    first: 'Ray',
    last: 'Delgado',
    email: 'ray@abclumber.com',
    phone: '(512) 555-0310',
    password: 'SmPro-Demo-2026',
    confirm: 'SmPro-Demo-2026'
  });
  const [accepted, setAccepted] = useState(true);
  const [code, setCode] = useState(['7', '1', '4', '2', '6', '9']);
  const [org, setOrg] = useState({
    name: 'ABC Lumber & Supply',
    type: 'lumber',
    address: '4200 Industrial Blvd, Austin, TX 78744',
    phone: '(512) 555-0300',
    taxId: '74-2938471',
    terms: 'net30'
  });
  const [yards, setYards] = useState<Yard[]>([
  { name: 'Austin Main Yard', city: 'Austin, TX', capability: 'Lumber, sheathing, EWP · 6 trucks', primary: true },
  { name: 'Round Rock', city: 'Round Rock, TX', capability: 'Lumber, hardware · 3 trucks', primary: false },
  { name: 'San Marcos', city: 'San Marcos, TX', capability: 'Trusses, EWP · 2 trucks', primary: false }]
  );
  const [invites, setInvites] = useState<Invite[]>([
  { email: 'dana@abclumber.com', roles: ['sales'] },
  { email: 'miguel@abclumber.com', roles: ['estimator'] },
  { email: 'karen@abclumber.com', roles: ['dispatcher'] },
  { email: 'tom@abclumber.com', roles: ['driver'] },
  { email: 'lena@abclumber.com', roles: ['accounting', 'service'] }]
  );
  const [inviteEmail, setInviteEmail] = useState('');
  const [erp, setErp] = useState<'spruce' | 'later'>('spruce');

  const index = Math.max(0, STEPS.findIndex((s) => s.id === step));
  const meta = STEPS[index];

  const go = (next: Step) => setStep(next);
  const back = () => {
    if (index > 0) go(STEPS[index - 1].id);else
    navigate('/signin');
  };

  const setField =
  <T,>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof T) =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  setter((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleRole = (idx: number, role: SupplierRoleId) =>
  setInvites((prev) =>
  prev.map((inv, i) =>
  i === idx ?
  {
    ...inv,
    roles: inv.roles.includes(role) ?
    inv.roles.filter((r) => r !== role) :
    [...inv.roles, role]
  } :
  inv
  )
  );

  const finish = () => {
    setActiveRole('management');
    signIn();
    navigate(SUPPLIER_ROLES.management.landing);
  };

  if (step === 'done') {
    return (
      <SupplierDone
        org={org.name}
        yards={yards.length}
        invites={invites.length}
        erp={erp === 'spruce'}
        onFinish={finish} />);


  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="relative hidden w-[42%] max-w-[520px] shrink-0 overflow-hidden bg-ink-900 lg:block">
        <img src={IMAGES.lumberYard} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-ink-900/60" />
        <div className="relative flex h-full flex-col justify-between p-9">
          <div>
            <Logo size="md" inverted />
            <p className="spec-label mt-3 text-brand-400">New supplier organization</p>
          </div>
          <div>
            <h2 className="display-tight text-[26px] font-bold leading-tight text-white">
              Register the yard once — then price, fulfil, deliver and bill from the same record.
            </h2>
            <ol className="mt-6 space-y-2.5">
              {STEPS.map((s, i) =>
              <li
                key={s.id}
                className={`flex items-start gap-2.5 text-[13px] leading-snug ${
                i <= index ? 'text-white' : 'text-white/45'}`
                }>
                
                  <span
                  className={`measure mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] text-[10px] font-semibold ${
                  i < index ?
                  'bg-brand-500 text-white' :
                  i === index ?
                  'bg-white text-ink-900' :
                  'bg-white/15 text-white/60'}`
                  }>
                  
                    {i < index ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : i + 1}
                  </span>
                  {s.label}
                </li>
              )}
            </ol>
          </div>
          <p className="measure text-[10.5px] text-white/40">Separate tenant from any builder organization</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 items-start justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[520px]">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <div className="mt-6 flex min-h-[132px] flex-col justify-end lg:mt-0">
            <ol className="mb-4 flex items-center gap-1.5">
              {STEPS.map((s, i) =>
              <li
                key={s.id}
                className={`h-[3px] flex-1 rounded-[1px] ${i <= index ? 'bg-brand-500' : 'bg-ink-200'}`}
                aria-current={s.id === step ? 'step' : undefined} />

              )}
            </ol>
            <SpecLabel>{`Step ${index + 1} of ${STEPS.length} · ${meta.label}`}</SpecLabel>
            <h1 className="display-tight mt-1.5 text-[24px] font-bold leading-tight text-ink-900">
              {meta.heading}
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{meta.body}</p>
          </div>

          <div className="mt-7">
            {step === 'account' &&
            <div className="space-y-4">
                {DEMO_MODE &&
                <InlineAlert
                tone="info"
                title="Demo build"
                body="Every field is pre-filled and nothing is required — continue straight through." />
                }
              
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First name" value={account.first} onChange={setField(setAccount, 'first')} />
                  <Input label="Last name" value={account.last} onChange={setField(setAccount, 'last')} />
                </div>
                <Input label="Work email" type="email" value={account.email} onChange={setField(setAccount, 'email')} />
                <Input label="Phone" value={account.phone} onChange={setField(setAccount, 'phone')} />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                  label="Password"
                  type="password"
                  value={account.password}
                  onChange={setField(setAccount, 'password')} />
                
                  <Input
                  label="Confirm"
                  type="password"
                  value={account.confirm}
                  onChange={setField(setAccount, 'confirm')} />
                
                </div>
                <Checkbox checked={accepted} onChange={setAccepted}>
                  I agree to the SM PRO Supplier Terms and Privacy Policy.
                </Checkbox>
              </div>
            }

            {step === 'verify' &&
            <div>
                <p className="text-[13px] leading-relaxed text-ink-500">
                  We sent a six-digit code to{' '}
                  <span className="font-semibold text-ink-800">{account.email}</span>.
                  {DEMO_MODE && ' It has been filled in for this demo workspace.'}
                </p>
                <div className="mt-5 grid grid-cols-6 gap-2">
                  {code.map((digit, i) =>
                <input
                  key={i}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) =>
                  setCode((prev) =>
                  prev.map((c, idx) => idx === i ? e.target.value.replace(/\D/g, '') : c)
                  )
                  }
                  className="measure h-12 w-full min-w-0 rounded-[3px] border border-ink-200 bg-white text-center text-[17px] font-semibold text-ink-900 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />

                )}
                </div>
                <button className="mt-3 text-[12.5px] font-semibold text-brand-600">Resend code</button>
              </div>
            }

            {step === 'organization' &&
            <div className="space-y-4">
                <Input label="Legal business name" value={org.name} onChange={setField(setOrg, 'name')} />
                <Select label="Business type" value={org.type} onChange={setField(setOrg, 'type')}>
                  <option value="lumber">Lumber yard</option>
                  <option value="building">Building materials dealer</option>
                  <option value="truss">Truss &amp; component manufacturer</option>
                  <option value="specialty">Specialty supplier</option>
                </Select>
                <Input label="Head office address" value={org.address} onChange={setField(setOrg, 'address')} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Phone" value={org.phone} onChange={setField(setOrg, 'phone')} />
                  <Input label="Tax ID / EIN" value={org.taxId} onChange={setField(setOrg, 'taxId')} />
                </div>
                <Select label="Default payment terms offered to builders" value={org.terms} onChange={setField(setOrg, 'terms')}>
                  <option value="net30">Net 30</option>
                  <option value="net15">Net 15</option>
                  <option value="net45">Net 45</option>
                  <option value="cod">Cash on delivery</option>
                </Select>
                <p className="text-[12px] leading-relaxed text-ink-400">
                  Terms can be overridden per builder once a trading relationship is established.
                </p>
              </div>
            }

            {step === 'yards' &&
            <div>
                <ul className="space-y-2">
                  {yards.map((y, i) =>
                <li
                  key={y.name}
                  className="flex items-start gap-3 rounded-[3px] border border-ink-200 bg-white px-4 py-3">
                  
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-semibold text-ink-900">{y.name}</p>
                        <p className="text-[12px] text-ink-400">{y.city}</p>
                        <p className="mt-1 text-[12px] text-ink-500">{y.capability}</p>
                      </div>
                      {y.primary ?
                  <span className="rounded-[2px] border border-brand-500 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                          Primary
                        </span> :

                  <button
                    aria-label={`Remove ${y.name}`}
                    onClick={() => setYards((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-ink-300 transition-colors duration-150 ease-smooth hover:text-danger-600">
                    
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                  }
                    </li>
                )}
                </ul>
                <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                icon={<PlusIcon className="h-4 w-4" />}
                onClick={() =>
                setYards((prev) => [
                ...prev,
                {
                  name: `Yard ${prev.length + 1}`,
                  city: 'Texas',
                  capability: 'General materials · 1 truck',
                  primary: false
                }]
                )
                }>
                
                  Add yard
                </Button>
              </div>
            }

            {step === 'team' &&
            <div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                    placeholder="name@abclumber.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)} />
                  
                  </div>
                  <Button
                  variant="secondary"
                  className="h-12 shrink-0"
                  icon={<MailPlusIcon className="h-4 w-4" />}
                  onClick={() => {
                    const email = inviteEmail.trim() || `teammate${invites.length + 1}@abclumber.com`;
                    setInvites((prev) => [...prev, { email, roles: ['sales'] }]);
                    setInviteEmail('');
                  }}>
                  
                    Add
                  </Button>
                </div>

                <ul className="mt-4 space-y-2.5">
                  {invites.map((inv, idx) =>
                <li key={inv.email} className="rounded-[3px] border border-ink-200 bg-white p-3.5">
                      <div className="flex items-center gap-2.5">
                        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-900">
                          {inv.email}
                        </p>
                        <button
                      aria-label={`Remove ${inv.email}`}
                      onClick={() => setInvites((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-ink-300 transition-colors duration-150 ease-smooth hover:text-danger-600">
                      
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {SUPPLIER_ROLE_ORDER.filter((r) => r !== 'administrator').map((role) => {
                      const on = inv.roles.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => toggleRole(idx, role)}
                          aria-pressed={on}
                          className={`rounded-[2px] border px-2 py-1 text-[11px] font-medium transition-colors duration-150 ease-smooth ${
                          on ?
                          'border-brand-500 bg-brand-50 text-brand-700' :
                          'border-ink-200 text-ink-500 hover:bg-ink-50'}`
                          }>
                          
                              {SUPPLIER_ROLES[role].label}
                            </button>);

                    })}
                      </div>
                    </li>
                )}
                </ul>

                <div className="mt-4">
                  <InlineAlert
                  tone="info"
                  title="Roles decide the interface"
                  body="Estimators see inbound takeoffs and pricing; dispatchers see the load board; drivers see today's runs and POD only." />
                
                </div>
              </div>
            }

            {step === 'integration' &&
            <div className="space-y-3">
                {[
              {
                id: 'spruce' as const,
                title: 'Connect ECI Spruce',
                body: 'Sync products, inventory, customers, orders and invoices through the Spruce adapter. Conflicts are surfaced for review, never applied silently.'
              },
              {
                id: 'later' as const,
                title: 'Run standalone for now',
                body: 'SM PRO holds its own catalogue, stock and invoicing. You can connect an ERP later from Settings → Integrations.'
              }].
              map((opt) =>
              <button
                key={opt.id}
                onClick={() => setErp(opt.id)}
                aria-pressed={erp === opt.id}
                className={`flex w-full items-start gap-3 rounded-[3px] border px-4 py-3.5 text-left transition-colors duration-150 ease-smooth ${
                erp === opt.id ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 bg-white hover:border-ink-300'}`
                }>
                
                    <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] ${
                  erp === opt.id ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500'}`
                  }>
                  
                      <PlugZapIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-semibold text-ink-900">{opt.title}</span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-ink-500">{opt.body}</span>
                    </span>
                    {erp === opt.id && <CheckIcon className="ml-auto h-4 w-4 shrink-0 text-brand-600" strokeWidth={3} />}
                  </button>
              )}
              </div>
            }
          </div>

          <div className="mt-7 flex items-center gap-3">
            <Button variant="ghost" onClick={back} icon={<ArrowLeftIcon className="h-4 w-4" />}>
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1"
              icon={<ArrowRightIcon className="h-4 w-4" />}
              onClick={() => go(index === STEPS.length - 1 ? 'done' : STEPS[index + 1].id)}>
              
              {index === STEPS.length - 1 ? 'Create supplier organization' : 'Continue'}
            </Button>
          </div>
        </div>
      </main>
    </div>);

}

function SupplierDone({
  org,
  yards,
  invites,
  erp,
  onFinish






}: {org: string;yards: number;invites: number;erp: boolean;onFinish: () => void;}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-[520px]">
        <Panel className="overflow-hidden">
          <div className="px-6 py-7">
            <span className="flex h-14 w-14 items-center justify-center rounded-[3px] bg-positive-50 text-positive-600">
              <CheckIcon className="h-7 w-7" strokeWidth={3} />
            </span>
            <SpecLabel className="mt-5">Supplier organization created</SpecLabel>
            <h1 className="display-tight mt-1.5 text-[26px] font-bold leading-tight text-ink-900">
              {org} is ready to trade
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
              Builders can now connect to your organization, send RFQs against approved takeoffs, and receive
              your priced quotes.
            </p>
          </div>
          <TickRule />
          <ul className="grid gap-2 px-6 py-5">
            {[
            'Trading entity registered with default payment terms',
            `${yards} yards configured for stock and dispatch`,
            'Administrator and Owner / Management assigned to you',
            `${invites} team invitations sent across the eight yard roles`,
            erp ? 'ECI Spruce adapter connected — first sync queued' : 'Running standalone; ERP can be connected later'].
            map((line) =>
            <li key={line} className="flex items-start gap-2.5 rounded-[2px] bg-ink-50 px-3.5 py-2.5">
                <CheckIcon className="mt-[2px] h-4 w-4 shrink-0 text-positive-600" strokeWidth={3} />
                <span className="text-[12.5px] leading-snug text-ink-700">{line}</span>
              </li>
            )}
          </ul>
          <TickRule />
          <div className="px-6 py-5">
            <Button size="lg" block onClick={onFinish} icon={<ArrowRightIcon className="h-4 w-4" />}>
              Enter supplier platform
            </Button>
            <p className="mt-2.5 text-center text-[12px] text-ink-400">
              You will start in Owner / Management. Change lens any time from the sidebar.
            </p>
          </div>
        </Panel>
      </div>
    </div>);

}
