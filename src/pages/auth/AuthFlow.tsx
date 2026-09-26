import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, ScanSearchIcon, TruckIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { BranchStep, InviteStep, OrganizationStep, SuccessStep } from '../../components/auth/SetupSteps';
import { Button } from '../../components/ui/Button';
import { Checkbox, ErrorText, Input } from '../../components/ui/Field';
import { InlineAlert } from '../../components/ui/Feedback';
import { Logo } from '../../components/ui/Logo';
import { useApp } from '../../contexts/AppContext';
import { RoleId } from '../../types';
import { ROLES } from '../../utils/rbac';
import { useScreenInit } from '../../useScreenInit.js';
import { IMAGES } from '../../data/images';

type Step =
'splash' |
'welcome' |
'signin' |
'signup' |
'verify' |
'org' |
'branch' |
'invite' |
'success';

const HERO = IMAGES.aiAnalysis;

export function AuthFlow({ initialStep }: {initialStep?: Step;} = {}) {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const screenInit = useScreenInit();
  const [step, setStep] = useState<Step>(screenInit.step as Step ?? initialStep ?? 'signin');
  const [company, setCompany] = useState('ABC Construction');
  const [accountEmail, setAccountEmail] = useState('alex@abcconstruction.com');

  useEffect(() => {
    // Hold the step a Screens preview asked for instead of auto-advancing.
    if (step !== 'splash' || screenInit.step) return;
    const t = window.setTimeout(() => setStep('signin'), 1700);
    return () => window.clearTimeout(t);
  }, [step, screenInit.step]);

  if (step === 'splash') return <Splash />;
  if (step === 'welcome')
  return <Welcome onSignIn={() => setStep('signin')} onSignUp={() => setStep('signup')} />;
  if (step === 'signin')
  return (
    <SignIn
      onDone={signIn}
      onSignUp={() => setStep('signup')}
      onSupplier={() => navigate('/supplier/auth')}
      onAdmin={() => navigate('/admin/access')} />);
  if (step === 'signup')
  return <SignUp onDone={(email) => {setAccountEmail(email);setStep('verify');}} onBack={() => setStep('signin')} />;
  if (step === 'verify') return <Verify email={accountEmail} onDone={() => setStep('org')} onBack={() => setStep('signup')} />;
  if (step === 'org')
  return (
    <OrganizationStep
      onBack={() => setStep('verify')}
      onNext={(name) => {
        setCompany(name);
        setStep('branch');
      }} />);


  if (step === 'branch') return <BranchStep onBack={() => setStep('org')} onNext={() => setStep('invite')} />;
  if (step === 'invite')
  return <InviteStep onBack={() => setStep('branch')} onNext={() => setStep('success')} />;
  return <SuccessStep company={company} onFinish={() => signIn()} />;
}

function Splash() {
  return (
    <div className="hairline-grid flex min-h-screen flex-col items-center justify-center bg-ink-900 px-8 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
        
        <Logo size="xl" inverted />
      </motion.div>
      <p className="mt-5 max-w-[260px] text-[13px] leading-relaxed text-white/55">
        AI-powered construction procurement &amp; project management
      </p>
      <div className="mt-8 flex items-center gap-2 text-[12px] font-medium text-white/40">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-brand-500" />
        Checking your session…
      </div>
    </div>);

}

function Welcome({ onSignIn, onSignUp }: {onSignIn: () => void;onSignUp: () => void;}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-ink-100">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-6 lg:px-10">
          <Logo size="md" />
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" onClick={onSignIn}>
              Sign in
            </Button>
            <Button onClick={onSignUp}>Create organization</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1240px] px-6 pb-20 pt-12 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="max-w-[560px]">
            <h1 className="display-tight text-[44px] font-extrabold leading-[1.05] text-ink-900">
              From drawings to delivered materials — in one system.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-500">
              SM PRO reads your plan sets, generates traceable takeoffs, and runs the purchase all the way to
              proof of delivery and payment — with every role working from the same record.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={onSignUp} icon={<ArrowRightIcon className="h-4 w-4" />}>
                Create your organization
              </Button>
              <Button size="lg" variant="secondary" onClick={onSignIn}>
                Sign in to your account
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink-100 shadow-raised">
            <img
              src={HERO}
              alt="Construction drawings with an AI takeoff overlay"
              className="h-[380px] w-full object-cover" />
            
          </div>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {[
          { icon: ScanSearchIcon, title: 'Traceable AI takeoffs', body: 'Every quantity links back to its sheet, page and confidence score before anything is ordered.' },
          { icon: LockIcon, title: 'Secure by design', body: 'One protected workspace keeps your projects, purchasing and finance connected.' },
          { icon: TruckIcon, title: 'Procurement to payment', body: 'Requests, quotes, orders, deliveries, PODs and invoices stay connected end to end.' }].
          map(({ icon: Icon, title, body }) =>
          <li key={title} className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[15px] font-bold text-ink-900">{title}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{body}</p>
            </li>
          )}
        </ul>

        <section aria-labelledby="flow-heading" className="mt-16 rounded-2xl border border-ink-100 bg-canvas p-8">
          <h2 id="flow-heading" className="display-tight text-[20px] font-bold text-ink-900">
            One connected record, from plan set to payment
          </h2>
          <p className="mt-1.5 max-w-[620px] text-[13.5px] leading-relaxed text-ink-500">
            Nothing is re-entered between stages. Each step inherits the approved data from the one before it,
            so any quantity, price or delivery can be traced back to its source.
          </p>
          <ol className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4 lg:grid-cols-7">
            {[
            'Plan set',
            'AI takeoff',
            'Human review',
            'Material request',
            'Supplier quote',
            'Purchase order',
            'Delivery & payment'].
            map((label, i) =>
            <li key={label} className="flex min-w-0 flex-col">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="h-px flex-1 bg-ink-200" aria-hidden />
                </span>
                <span className="mt-2.5 text-[13px] font-semibold leading-snug text-ink-800">{label}</span>
              </li>
            )}
          </ol>
        </section>
      </div>

      <footer className="mt-auto border-t border-ink-100 bg-canvas">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-7 lg:px-10">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-[12.5px] text-ink-400">
              AI-powered construction procurement &amp; project management
            </span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-5 text-[12.5px] font-semibold text-ink-500">
            <button onClick={onSignIn} className="transition-colors duration-150 ease-smooth hover:text-brand-600">
              Sign in
            </button>
            <button onClick={onSignUp} className="transition-colors duration-150 ease-smooth hover:text-brand-600">
              Create organization
            </button>
            <span className="font-medium text-ink-400">© 2026 SM PRO</span>
          </nav>
        </div>
      </footer>
    </div>);

}

const DEMO_PASSWORD = 'SmPro-Demo-2026';
const DEMO_ACCOUNTS: {role: RoleId;name: string;email: string;}[] = [
{ role: 'owner', name: 'Alex Whitfield', email: 'alex@abcconstruction.com' },
{ role: 'project_manager', name: 'John Smith', email: 'john@abcconstruction.com' },
{ role: 'superintendent', name: 'Maria Delgado', email: 'maria@abcconstruction.com' },
{ role: 'purchasing_manager', name: 'Dana Kim', email: 'dana@abcconstruction.com' },
{ role: 'accountant', name: 'Priya Raman', email: 'priya@abcconstruction.com' }];


function SignIn({
  onDone,
  onSignUp,
  onSupplier,
  onAdmin
}: {
  onDone: (options: {email: string;role: RoleId;remember: boolean;}) => void;
  onSignUp: () => void;
  onSupplier: () => void;
  onAdmin: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<RoleId>('owner');
  const [email, setEmail] = useState('alex@abcconstruction.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [errors, setErrors] = useState<{email?: string;password?: string;}>({});
  const timer = useRef<number>();
  const selectedAccount =
  DEMO_ACCOUNTS.find((account) => account.role === selectedRole) ?? DEMO_ACCOUNTS[0];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const chooseAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setRecoverySent(false);
  };

  const finish = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setLoading(true);
    timer.current = window.setTimeout(
      () => onDone({ email: account.email, role: account.role, remember }),
      450
    );
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    const account = DEMO_ACCOUNTS.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Enter a valid work email.';else
    if (!account) nextErrors.email = 'Choose one of the available demo accounts.';
    if (!password) nextErrors.password = 'Enter your password.';else
    if (password !== DEMO_PASSWORD) nextErrors.password = 'That password does not match the demo account.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !account) return;
    finish(account);
  };

  return (
    <AuthLayout
      title="Sign in to your workspace"
      body="Choose the job you want to preview. We will load the right demo account and permissions."
      footer={
      <div className="space-y-3 text-center">
          <p className="text-[13px] text-ink-500">
            New to SM PRO?{' '}
            <button onClick={onSignUp} className="font-bold text-brand-600">
              Create an organization
            </button>
          </p>
          <nav aria-label="Other sign-in options" className="flex items-center justify-center gap-3 text-[12px] font-semibold">
            <button onClick={onSupplier} className="text-ink-500 transition-colors hover:text-brand-600">
              Supplier sign in
            </button>
            <span className="text-ink-200" aria-hidden>•</span>
            <button onClick={onAdmin} className="text-ink-500 transition-colors hover:text-brand-600">
              Platform admin
            </button>
          </nav>
        </div>
      }>
      
      <form className="space-y-4" onSubmit={submit} noValidate>
        <fieldset>
          <legend className="mb-2 text-[13px] font-bold text-ink-700">Choose a demo role</legend>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => {
              const selected = account.role === selectedRole;
              return (
                <button
                  key={account.role}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseAccount(account)}
                  className={`min-w-0 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 ${
                  selected ?
                  'border-brand-500 bg-brand-50 shadow-[0_0_0_3px_rgba(249,99,23,0.08)]' :
                  'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50'}`
                  }>
                  <span className={`block truncate text-[12.5px] font-bold ${selected ? 'text-brand-700' : 'text-ink-800'}`}>
                    {ROLES[account.role].short}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-ink-400">{account.name}</span>
                </button>);
            })}
          </div>
        </fieldset>

        <InlineAlert
          tone="info"
          title={`Continue as ${selectedAccount.name}`}
          body={ROLES[selectedRole].focus} />

        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(e) => {
            const nextEmail = e.target.value;
            setEmail(nextEmail);
            const matchingAccount = DEMO_ACCOUNTS.find(
              (account) => account.email.toLowerCase() === nextEmail.trim().toLowerCase()
            );
            if (matchingAccount) setSelectedRole(matchingAccount.role);
            setErrors((prev) => ({ ...prev, email: undefined }));
            setRecoverySent(false);
          }} />
        
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          error={errors.password}
          suffix={
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((visible) => !visible)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink-50 hover:text-ink-700">
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }} />
        
        <div className="flex items-center justify-between">
          <Checkbox checked={remember} onChange={setRemember}>
            Remember me
          </Checkbox>
          <button
            type="button"
            onClick={() => setRecoverySent(true)}
            className="text-[13px] font-semibold text-brand-600">
            Forgot password?
          </button>
        </div>
        {recoverySent &&
        <InlineAlert
          tone="success"
          title="Reset link ready"
          body={`In production, password instructions would be sent to ${email}.`} />
        }
        <Button type="submit" block size="lg" loading={loading}>
          Continue as {ROLES[selectedRole].short}
        </Button>
        <Button type="button" block size="lg" variant="secondary" onClick={() => finish(selectedAccount)}>
          Use company SSO
        </Button>
      </form>
    </AuthLayout>);

}

function SignUp({ onDone, onBack }: {onDone: (email: string) => void;onBack: () => void;}) {
  const [form, setForm] = useState({
    first: 'Alex',
    last: 'Whitfield',
    email: 'alex@abcconstruction.com',
    phone: '(512) 555-0101',
    password: 'SmPro-Demo-2026',
    confirm: 'SmPro-Demo-2026'
  });
  const [accepted, setAccepted] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | 'accepted', string>>>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = () => {
    const nextErrors: typeof errors = {};
    if (!form.first.trim()) nextErrors.first = 'Enter your first name.';
    if (!form.last.trim()) nextErrors.last = 'Enter your last name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid work email.';
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) nextErrors.confirm = 'Passwords do not match.';
    if (!accepted) nextErrors.accepted = 'Accept the terms to create your account.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onDone(form.email.trim());
  };

  return (
    <AuthLayout
      step={1}
      totalSteps={6}
      title="Create your SM PRO account"
      body="Create your account, then set up your company workspace."
      onBack={onBack}
      footer={
      <Button block size="lg" onClick={submit}>
          Create account
        </Button>
      }>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" autoComplete="given-name" value={form.first} error={errors.first} onChange={set('first')} />
          <Input label="Last name" autoComplete="family-name" value={form.last} error={errors.last} onChange={set('last')} />
        </div>
        <Input label="Work email" type="email" autoComplete="email" value={form.email} error={errors.email} onChange={set('email')} />
        <Input label="Phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} />
        <Input
          label="Password"
          type="password"
          hint="8+ characters"
          autoComplete="new-password"
          value={form.password}
          error={errors.password}
          onChange={set('password')} />
        
        <Input label="Confirm password" type="password" autoComplete="new-password" value={form.confirm} error={errors.confirm} onChange={set('confirm')} />
        <Checkbox checked={accepted} onChange={(value) => {
          setAccepted(value);
          setErrors((prev) => ({ ...prev, accepted: undefined }));
        }}>
          I agree to the SM PRO Terms of Service and Privacy Policy.
        </Checkbox>
        {errors.accepted && <ErrorText>{errors.accepted}</ErrorText>}
      </div>
    </AuthLayout>);

}

function Verify({ email, onDone, onBack }: {email: string;onDone: () => void;onBack: () => void;}) {
  /* Demo build: the emailed code is already applied. */
  const [code, setCode] = useState(['4', '8', '2', '9', '1', '3']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    setCode((prev) => prev.map((c, idx) => idx === i ? digit : c));
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <AuthLayout
      step={2}
      totalSteps={6}
      title="Verify your email"
      body={`We sent a 6-digit code to ${email} — it is already filled in for this demo.`}
      onBack={onBack}
      footer={
      <Button block size="lg" disabled={code.some((digit) => !digit)} onClick={onDone}>
          Verify email
        </Button>
      }>
      
      <div className="grid w-full grid-cols-6 gap-2">
        {code.map((c, i) =>
        <input
          key={i}
          ref={(el) => refs.current[i] = el}
          value={c}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className="tabular h-14 w-full min-w-0 rounded-xl border border-ink-200 px-0 text-center text-[20px] font-bold text-ink-900 transition-[border-color,box-shadow] duration-150 ease-smooth focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10" />

        )}
      </div>
      <p className="mt-5 text-[13px] text-ink-500">
        Didn&apos;t get it?{' '}
        <button className="font-bold text-brand-600">Resend code</button>
      </p>
    </AuthLayout>);

}
