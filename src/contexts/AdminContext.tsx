import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  AdminNotification,
  AiConfig,
  AiIssue,
  AiJob,
  AuditEntry,
  FeatureFlag,
  FeatureId,
  Incident,
  IntegrationLink,
  Organization,
  OrgStatus,
  Plan,
  PlanId,
  PlatformUser,
  QueueJob,
  SupportCase,
  SupportSession,
  SyncError } from
'../types/admin';
import {
  FEATURE_FLAGS,
  FEATURE_LABEL,
  ORGANIZATIONS,
  PLANS,
  PLAN_BY_ID,
  PLATFORM_ADMIN,
  PLATFORM_USERS,
  featureEnabled } from
'../data/platform';
import {
  ADMIN_NOTIFICATIONS,
  AI_CONFIG,
  AI_ISSUES,
  AI_JOBS,
  AUDIT_LOG,
  INCIDENTS,
  INTEGRATIONS,
  QUEUE_JOBS,
  SUPPORT_CASES,
  SYNC_ERRORS } from
'../data/platformOps';

interface Toast {
  id: number;
  tone: 'success' | 'info' | 'danger';
  title: string;
  body?: string;
}

interface AdminState {
  authed: boolean;
  signIn: () => void;
  signOut: () => void;
  admin: typeof PLATFORM_ADMIN;

  organizations: Organization[];
  suppliers: Organization[];
  builders: Organization[];
  org: (id: string) => Organization | undefined;
  createSupplier: (draft: NewSupplierDraft) => string;
  setOrgStatus: (id: string, status: OrgStatus, reason: string, note: string) => void;
  setOrgPlan: (id: string, planId: PlanId, note: string) => void;
  setEntitlement: (id: string, feature: FeatureId, enabled: boolean | null, reason: string) => void;
  entitled: (org: Organization, feature: FeatureId) => boolean;

  plans: Plan[];
  users: PlatformUser[];
  setUserStatus: (id: string, status: PlatformUser['status']) => void;

  aiConfig: AiConfig;
  updateAiConfig: (next: Partial<AiConfig>, reason: string) => void;
  aiJobs: AiJob[];
  retryJob: (id: string) => void;
  cancelJob: (id: string) => void;
  aiIssues: AiIssue[];
  resolveIssue: (id: string, resolution: string) => void;

  integrations: IntegrationLink[];
  syncErrors: SyncError[];
  retrySync: (id: string) => void;
  reconcileSync: (id: string) => void;

  queue: QueueJob[];
  incidents: Incident[];
  setIncidentStatus: (id: string, status: Incident['status'], note: string) => void;

  cases: SupportCase[];
  setCaseStatus: (id: string, status: SupportCase['status'], note: string) => void;

  session: SupportSession | null;
  startSession: (orgId: string, reason: string, caseId?: string) => void;
  endSession: () => void;

  flags: FeatureFlag[];
  toggleFlag: (id: string) => void;

  audit: AuditEntry[];
  record: (entry: Omit<AuditEntry, 'id' | 'at' | 'actor'>) => void;

  notifications: AdminNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;

  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
}

export interface NewSupplierDraft {
  name: string;
  region: string;
  address: string;
  contact: string;
  contactEmail: string;
  adminName: string;
  adminEmail: string;
  branches: {name: string;location: string;}[];
  planId: PlanId;
  overrides: Partial<Record<FeatureId, boolean>>;
}

const AdminContext = createContext<AdminState | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}

let toastSeq = 0;

export function AdminProvider({ children }: {children: React.ReactNode;}) {
  const [authed, setAuthed] = useState(false);
  const [organizations, setOrganizations] = useState(ORGANIZATIONS);
  const [users, setUsers] = useState(PLATFORM_USERS);
  const [aiConfig, setAiConfig] = useState(AI_CONFIG);
  const [aiJobs, setAiJobs] = useState(AI_JOBS);
  const [aiIssues, setAiIssues] = useState(AI_ISSUES);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [syncErrors, setSyncErrors] = useState(SYNC_ERRORS);
  const [queue, setQueue] = useState(QUEUE_JOBS);
  const [incidents, setIncidents] = useState(INCIDENTS);
  const [cases, setCases] = useState(SUPPORT_CASES);
  const [session, setSession] = useState<SupportSession | null>(null);
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [audit, setAudit] = useState(AUDIT_LOG);
  const [notifications, setNotifications] = useState(ADMIN_NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  /** Every governing action lands in the audit log — that is the point of the control plane. */
  const record = useCallback((entry: Omit<AuditEntry, 'id' | 'at' | 'actor'>) => {
    setAudit((prev) => [
    {
      ...entry,
      id: `au-${4411 + prev.length}`,
      at: 'Just now',
      actor: PLATFORM_ADMIN.name
    },
    ...prev]
    );
  }, []);

  const org = useCallback(
    (id: string) => organizations.find((o) => o.id === id),
    [organizations]
  );

  const createSupplier = useCallback(
    (draft: NewSupplierDraft) => {
      /* Ids must stay unique — two organizations with similar names would
         otherwise collide and the second would be unreachable. */
      const base = `sup-${draft.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8) || 'new'}`;
      const taken = new Set(organizations.map((o) => o.id));
      let id = base;
      let n = 2;
      while (taken.has(id)) id = `${base}-${n++}`;
      const record_: Organization = {
        id,
        kind: 'supplier',
        name: draft.name,
        status: 'Pending',
        planId: draft.planId,
        region: draft.region,
        address: draft.address,
        contact: draft.contact,
        contactEmail: draft.contactEmail,
        admin: { name: draft.adminName, email: draft.adminEmail },
        created: 'Just now',
        lastActive: 'Never',
        projects: 0,
        usage: { builderCompanies: 0, branches: draft.branches.length, users: 1, storage: 0, aiSheets: 0 },
        partners: [],
        overrides: draft.overrides,
        erp: 'None',
        branches: draft.branches.map((b, i) => ({
          id: `${id}-br${i + 1}`,
          name: b.name,
          location: b.location,
          status: 'Active',
          users: i === 0 ? 1 : 0,
          orders30d: 0,
          deliveries30d: 0,
          created: 'Just now'
        }))
      };
      setOrganizations((prev) => [record_, ...prev]);
      record({
        action: 'Organization created',
        module: 'Organizations',
        orgId: id,
        object: draft.name,
        after: `Pending · ${PLAN_BY_ID[draft.planId].name}`,
        severity: 'Medium'
      });
      toast({
        tone: 'success',
        title: `${draft.name} created`,
        body: 'Pending until the administrator accepts their invitation.'
      });
      return id;
    },
    [organizations, record, toast]
  );

  const setOrgStatus = useCallback(
    (id: string, status: OrgStatus, reason: string, note: string) => {
      const before = organizations.find((o) => o.id === id);
      setOrganizations((prev) =>
      prev.map((o) =>
      o.id === id ?
      {
        ...o,
        status,
        statusReason:
        status === 'Active' ?
        undefined :
        { reason, note, by: PLATFORM_ADMIN.name, at: 'Just now' }
      } :
      o
      )
      );
      record({
        action: status === 'Active' ? 'Organization reactivated' : `Organization ${status.toLowerCase()}`,
        module: 'Organizations',
        orgId: id,
        object: before?.name ?? id,
        before: before?.status,
        after: status,
        reason,
        severity: status === 'Suspended' || status === 'Cancelled' ? 'Critical' : 'High'
      });
      toast({
        tone: status === 'Active' ? 'success' : 'danger',
        title: `${before?.name ?? 'Organization'} is now ${status}`,
        body: status === 'Active' ? 'Access restored across every module.' : reason
      });
    },
    [organizations, record, toast]
  );

  const setOrgPlan = useCallback(
    (id: string, planId: PlanId, note: string) => {
      const before = organizations.find((o) => o.id === id);
      setOrganizations((prev) =>
      prev.map((o) =>
      o.id === id ?
      {
        ...o,
        planId,
        subscription: o.subscription ?
        { ...o.subscription, mrr: PLAN_BY_ID[planId].price, seats: PLAN_BY_ID[planId].limits.users } :
        o.subscription
      } :
      o
      )
      );
      record({
        action: 'Subscription changed',
        module: 'Subscriptions',
        orgId: id,
        object: before?.name ?? id,
        before: before?.planId ? PLAN_BY_ID[before.planId].name : '—',
        after: PLAN_BY_ID[planId].name,
        reason: note,
        severity: 'High'
      });
      toast({ tone: 'success', title: `Moved to ${PLAN_BY_ID[planId].name}`, body: note });
    },
    [organizations, record, toast]
  );

  const setEntitlement = useCallback(
    (id: string, feature: FeatureId, enabled: boolean | null, reason: string) => {
      const target = organizations.find((o) => o.id === id);
      if (!target) return;
      const was = featureEnabled(target, feature);
      setOrganizations((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const overrides = { ...o.overrides };
        if (enabled === null) delete overrides[feature];else
        overrides[feature] = enabled;
        return { ...o, overrides };
      })
      );
      const now =
      enabled === null ?
      target.planId ?
      PLAN_BY_ID[target.planId].features.includes(feature) :
      false :
      enabled;
      record({
        action: enabled === null ? 'Entitlement override cleared' : `Feature entitlement ${now ? 'enabled' : 'disabled'}`,
        module: 'Entitlements',
        orgId: id,
        object: FEATURE_LABEL[feature],
        before: was ? 'Enabled' : 'Disabled',
        after: now ? 'Enabled' : 'Disabled',
        reason,
        severity: !now ? 'Critical' : 'Medium'
      });
      toast({
        tone: now ? 'success' : 'danger',
        title: `${FEATURE_LABEL[feature]} ${now ? 'enabled' : 'disabled'} for ${target.name}`,
        body: reason
      });
    },
    [organizations, record, toast]
  );

  const updateAiConfig = useCallback(
    (next: Partial<AiConfig>, reason: string) => {
      const changed = Object.entries(next).filter(
        ([k, v]) => aiConfig[k as keyof AiConfig] !== v
      ) as [keyof AiConfig, unknown][];
      setAiConfig((prev) => ({ ...prev, ...next }));
      changed.forEach(([key, value]) =>
      record({
        action: 'AI configuration updated',
        module: 'AI Management',
        object: String(key),
        before: String(aiConfig[key]),
        after: String(value),
        reason,
        severity: 'High'
      })
      );
      toast({
        tone: 'success',
        title: 'AI configuration applied',
        body: `${changed.length} setting${changed.length === 1 ? '' : 's'} changed platform-wide.`
      });
    },
    [aiConfig, record, toast]
  );

  const retryJob = useCallback(
    (id: string) => {
      setAiJobs((prev) =>
      prev.map((j) => j.id === id ? { ...j, status: 'Retrying', failure: undefined } : j)
      );
      setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status: 'Retrying', retries: q.retries + 1 } : q));
      record({ action: 'Job retried', module: 'Jobs & Queue', object: id, severity: 'Medium' });
      toast({ tone: 'info', title: `${id} re-queued`, body: 'It will not consume a second AI allowance.' });
    },
    [record, toast]
  );

  const cancelJob = useCallback(
    (id: string) => {
      setAiJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: 'Cancelled' } : j));
      setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status: 'Cancelled' } : q));
      record({ action: 'Job cancelled', module: 'Jobs & Queue', object: id, severity: 'High' });
      toast({ tone: 'danger', title: `${id} cancelled` });
    },
    [record, toast]
  );

  const resolveIssue = useCallback(
    (id: string, resolution: string) => {
      setAiIssues((prev) =>
      prev.map((i) => i.id === id ? { ...i, status: 'Resolved', resolution } : i)
      );
      record({ action: 'AI issue resolved', module: 'AI Management', object: id, reason: resolution, severity: 'Medium' });
      toast({ tone: 'success', title: `${id} resolved` });
    },
    [record, toast]
  );

  const retrySync = useCallback(
    (id: string) => {
      const err = syncErrors.find((e) => e.id === id);
      setSyncErrors((prev) =>
      prev.map((e) => e.id === id ? { ...e, status: 'Retrying', retries: e.retries + 1 } : e)
      );
      if (err) {
        setIntegrations((prev) =>
        prev.map((i) => i.orgId === err.orgId && i.adapter === err.adapter ? { ...i, status: 'Retrying' } : i)
        );
      }
      record({ action: 'Sync retried', module: 'Integrations', orgId: err?.orgId, object: id, severity: 'Medium' });
      toast({ tone: 'info', title: `Retrying ${err?.entity ?? id}`, body: 'Writes stay idempotent — no duplicates.' });
    },
    [syncErrors, record, toast]
  );

  const reconcileSync = useCallback(
    (id: string) => {
      const err = syncErrors.find((e) => e.id === id);
      setSyncErrors((prev) => prev.map((e) => e.id === id ? { ...e, status: 'Resolved' } : e));
      record({
        action: 'Sync conflict reconciled',
        module: 'Integrations',
        orgId: err?.orgId,
        object: id,
        reason: 'SM PRO record kept as source of truth',
        severity: 'High'
      });
      toast({ tone: 'success', title: 'Conflict reconciled', body: 'SM PRO record kept; adapter re-pointed.' });
    },
    [syncErrors, record, toast]
  );

  const setIncidentStatus = useCallback(
    (id: string, status: Incident['status'], note: string) => {
      setIncidents((prev) =>
      prev.map((i) =>
      i.id === id ?
      {
        ...i,
        status,
        resolution: status === 'Resolved' ? note : i.resolution,
        timeline: [...i.timeline, { at: 'Just now', label: note, by: PLATFORM_ADMIN.name }]
      } :
      i
      )
      );
      record({ action: `Incident ${status.toLowerCase()}`, module: 'Incidents', object: id, reason: note, severity: 'High' });
      toast({ tone: status === 'Resolved' ? 'success' : 'info', title: `${id} · ${status}` });
    },
    [record, toast]
  );

  const setCaseStatus = useCallback(
    (id: string, status: SupportCase['status'], note: string) => {
      setCases((prev) =>
      prev.map((c) =>
      c.id === id ?
      {
        ...c,
        status,
        timeline: [...c.timeline, { at: 'Just now', label: note, by: PLATFORM_ADMIN.name }]
      } :
      c
      )
      );
      record({ action: `Support case ${status.toLowerCase()}`, module: 'Support', object: id, reason: note, severity: 'Medium' });
      toast({ tone: 'success', title: `${id} · ${status}` });
    },
    [record, toast]
  );

  const startSession = useCallback(
    (orgId: string, reason: string, caseId?: string) => {
      setSession({ orgId, reason, caseId, startedAt: 'Just now', by: PLATFORM_ADMIN.name });
      record({
        action: 'Support session started',
        module: 'Support',
        orgId,
        object: caseId ?? 'Controlled access',
        reason,
        severity: 'Critical'
      });
      toast({
        tone: 'info',
        title: 'Support session active',
        body: 'Every action you take is attributed to you and recorded.'
      });
    },
    [record, toast]
  );

  const endSession = useCallback(() => {
    if (!session) return;
    record({
      action: 'Support session ended',
      module: 'Support',
      orgId: session.orgId,
      object: session.caseId ?? 'Controlled access',
      reason: session.reason,
      severity: 'High'
    });
    setSession(null);
    toast({ tone: 'success', title: 'Support session ended' });
  }, [session, record, toast]);

  const toggleFlag = useCallback(
    (id: string) => {
      const flag = flags.find((f) => f.id === id);
      setFlags((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f));
      if (flag) {
        record({
          action: 'Feature flag toggled',
          module: 'Settings',
          object: flag.label,
          before: flag.enabled ? 'On' : 'Off',
          after: flag.enabled ? 'Off' : 'On',
          severity: 'High'
        });
        toast({ tone: 'info', title: `${flag.label} ${flag.enabled ? 'off' : 'on'}`, body: `Scope: ${flag.scope}` });
      }
    },
    [flags, record, toast]
  );

  const setUserStatus = useCallback(
    (id: string, status: PlatformUser['status']) => {
      const user = users.find((u) => u.id === id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
      record({
        action: 'Account state changed',
        module: 'Users & Access',
        orgId: user?.orgId,
        object: user?.email ?? id,
        before: user?.status,
        after: status,
        severity: status === 'Disabled' ? 'High' : 'Medium'
      });
      toast({ tone: status === 'Active' ? 'success' : 'danger', title: `${user?.name ?? id} · ${status}` });
    },
    [users, record, toast]
  );

  const suppliers = useMemo(() => organizations.filter((o) => o.kind === 'supplier'), [organizations]);
  const builders = useMemo(() => organizations.filter((o) => o.kind === 'builder'), [organizations]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: AdminState = {
    authed,
    signIn: () => setAuthed(true),
    signOut: () => setAuthed(false),
    admin: PLATFORM_ADMIN,

    organizations,
    suppliers,
    builders,
    org,
    createSupplier,
    setOrgStatus,
    setOrgPlan,
    setEntitlement,
    entitled: featureEnabled,

    plans: PLANS,
    users,
    setUserStatus,

    aiConfig,
    updateAiConfig,
    aiJobs,
    retryJob,
    cancelJob,
    aiIssues,
    resolveIssue,

    integrations,
    syncErrors,
    retrySync,
    reconcileSync,

    queue,
    incidents,
    setIncidentStatus,

    cases,
    setCaseStatus,

    session,
    startSession,
    endSession,

    flags,
    toggleFlag,

    audit,
    record,

    notifications,
    unreadCount,
    markRead: (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)),
    markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),

    toasts,
    toast,
    dismissToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id))
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}