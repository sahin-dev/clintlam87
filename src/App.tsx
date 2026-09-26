import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { SupplierProvider, useSupplier } from './contexts/SupplierContext';
import { AppShell } from './components/shell/AppShell';
import { SupplierShell } from './components/supplier/SupplierShell';
import { ToastHost } from './components/ui/Feedback';
import { Button } from './components/ui/Button';
import { AuthFlow } from './pages/auth/AuthFlow';
import { ActivityLogPage, Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { NewTakeoff } from './pages/takeoff/NewTakeoff';
import { TakeoffWorkspace } from './pages/takeoff/TakeoffWorkspace';
import { Procurement } from './pages/procurement/Procurement';
import { RequestDetail } from './pages/procurement/RequestDetail';
import { NewRequest } from './pages/procurement/NewRequest';
import { QuoteCompare } from './pages/procurement/QuoteCompare';
import { Orders } from './pages/orders/Orders';
import { OrderDetail } from './pages/orders/OrderDetail';
import { Deliveries } from './pages/deliveries/Deliveries';
import { DeliveryDetail } from './pages/deliveries/DeliveryDetail';
import { Accounting } from './pages/accounting/Accounting';
import { InvoiceDetail } from './pages/accounting/InvoiceDetail';
import { Payments } from './pages/accounting/Payments';
import { Approvals } from './pages/Approvals';
import { Messages, MessageThreadPage } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { Team } from './pages/Team';
import { Suppliers, SupplierDetail } from './pages/Suppliers';
import { Search } from './pages/Search';
import { Documents, DocumentDetail } from './pages/Documents';
import { Tasks } from './pages/Tasks';
import { Jobsite } from './pages/Jobsite';
import { Profile } from './pages/Profile';
import { SupplierAuth } from './pages/supplier/SupplierAuth';
import { SupplierHome } from './pages/supplier/SupplierHome';
import { Customers, CustomerDetail } from './pages/supplier/Customers';
import { SupplierProjects, SupplierProjectDetail } from './pages/supplier/Projects';
import { Rfqs, RfqDetail } from './pages/supplier/Rfqs';
import { SupplierTakeoffReview, TakeoffInbox } from './pages/supplier/SupplierTakeoffReview';
import { Estimates, EstimateBuilder } from './pages/supplier/Estimates';
import { Quotes, QuoteDetail } from './pages/supplier/Quotes';
import { SupplierOrders, SupplierOrderDetail } from './pages/supplier/Orders';
import { SupplierInventory, SupplierPurchasing } from './pages/supplier/Inventory';
import { SupplierProducts, SupplierPricing } from './pages/supplier/Catalog';
import { SupplierDeliveries, SupplierDeliveryDetail } from './pages/supplier/Deliveries';
import { SupplierInvoices, SupplierInvoiceDetail, SupplierPayments } from './pages/supplier/Finance';
import { SupplierService, SupplierCaseDetail } from './pages/supplier/Service';
import { SupplierMessages, SupplierNotifications, SupplierDocuments } from './pages/supplier/Engagement';
import { SupplierSearch } from './pages/supplier/Search';
import { SupplierReports } from './pages/supplier/Reports';
import {
  SupplierAuditLog,
  SupplierIntegrations,
  SupplierSettings,
  SupplierTeam } from
'./pages/supplier/Admin';
import { SupplierModulePending } from './pages/supplier/ModulePending';
import { ExchangeProvider } from './contexts/ExchangeContext';
import { SupplierOnboarding } from './pages/supplier/SupplierOnboarding';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { AdminShell } from './components/admin/AdminShell';
import { AdminAuth } from './pages/admin/AdminAuth';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PlatformOverview } from './pages/admin/PlatformOverview';
import {
  SupplierDirectory,
  BuilderDirectory,
  OrganizationDetail,
  CreateSupplier,
  PlatformUsers } from
'./pages/admin/Organizations';
import { Plans, Subscriptions, Entitlements } from './pages/admin/Commercial';
import { AiOverview, AiJobs, AiIssues, AiConfiguration } from './pages/admin/AiOps';
import { Integrations, JobQueue, SystemHealth, IncidentDetail } from './pages/admin/PlatformOps';
import {
  Support,
  SupportCaseDetail,
  Security,
  AuditLog,
  Reports,
  FeatureFlags,
  AdminSettings,
  AdminNotifications,
  AdminSearch } from
'./pages/admin/Governance';

export function App() {
  return (
    <ExchangeProvider>
      <AppProvider>
        <BrowserRouter>
          <SupplierProvider>
            <AdminProvider>
              <Session />
              <ToastHost />
            </AdminProvider>
          </SupplierProvider>
        </BrowserRouter>
      </AppProvider>
    </ExchangeProvider>);

}

function Session() {
  const { authed } = useApp();
  const supplier = useSupplier();
  const admin = useAdmin();

  return (
    <Routes>
      {/* A single account entry replaces the former role/experience chooser. */}
      <Route path="/experience" element={<Navigate to="/signin" replace />} />
      <Route
        path="/signin"
        element={authed ? <Navigate to="/home" replace /> : <AuthFlow initialStep="signin" />} />
      <Route
        path="/signup"
        element={authed ? <Navigate to="/home" replace /> : <AuthFlow initialStep="signup" />} />

      {/* Keep the old builder URLs working for existing bookmarks. */}
      <Route
        path="/builder/signin"
        element={<Navigate to="/signin" replace />} />
      
      <Route
        path="/create/builder"
        element={<Navigate to="/signup" replace />} />
      
      <Route
        path="/create/supplier"
        element={
        supplier.authed ? <Navigate to="/supplier/home" replace /> : <SupplierOnboarding />
        } />
      

      {/* Supplier / lumber yard platform */}
      <Route
        path="/supplier/auth"
        element={supplier.authed ? <Navigate to="/supplier/home" replace /> : <SupplierAuth />} />
      
      {supplier.authed ?
      <Route element={<SupplierShell />}>
          <Route path="/supplier" element={<Navigate to="/supplier/home" replace />} />
          <Route path="/supplier/home" element={<SupplierHome />} />
          <Route path="/supplier/customers" element={<Customers />} />
          <Route path="/supplier/customers/:customerId" element={<CustomerDetail />} />
          <Route path="/supplier/projects" element={<SupplierProjects />} />
          <Route path="/supplier/projects/:projectId" element={<SupplierProjectDetail />} />
          <Route path="/supplier/rfqs" element={<Rfqs />} />
          <Route path="/supplier/rfqs/:rfqId" element={<RfqDetail />} />
          <Route path="/supplier/takeoffs" element={<TakeoffInbox />} />
          <Route path="/supplier/takeoffs/:rfqId" element={<SupplierTakeoffReview />} />
          <Route path="/supplier/estimates" element={<Estimates />} />
          <Route path="/supplier/estimates/new" element={<EstimateBuilder />} />
          <Route path="/supplier/estimates/:estimateId" element={<EstimateBuilder />} />
          <Route path="/supplier/quotes" element={<Quotes />} />
          <Route path="/supplier/quotes/:quoteId" element={<QuoteDetail />} />
          <Route path="/supplier/orders" element={<SupplierOrders />} />
          <Route path="/supplier/orders/:orderId" element={<SupplierOrderDetail />} />
          <Route path="/supplier/inventory" element={<SupplierInventory />} />
          <Route path="/supplier/purchasing" element={<SupplierPurchasing />} />
          <Route path="/supplier/products" element={<SupplierProducts />} />
          <Route path="/supplier/pricing" element={<SupplierPricing />} />
          <Route path="/supplier/deliveries" element={<SupplierDeliveries />} />
          <Route path="/supplier/deliveries/:deliveryId" element={<SupplierDeliveryDetail />} />
          <Route path="/supplier/invoices" element={<SupplierInvoices />} />
          <Route path="/supplier/invoices/:invoiceId" element={<SupplierInvoiceDetail />} />
          <Route path="/supplier/payments" element={<SupplierPayments />} />
          <Route path="/supplier/service" element={<SupplierService />} />
          <Route path="/supplier/service/:caseId" element={<SupplierCaseDetail />} />
          <Route path="/supplier/messages" element={<SupplierMessages />} />
          <Route path="/supplier/notifications" element={<SupplierNotifications />} />
          <Route path="/supplier/documents" element={<SupplierDocuments />} />
          <Route path="/supplier/reports" element={<SupplierReports />} />
          <Route path="/supplier/team" element={<SupplierTeam />} />
          <Route path="/supplier/integrations" element={<SupplierIntegrations />} />
          <Route path="/supplier/audit" element={<SupplierAuditLog />} />
          <Route path="/supplier/settings" element={<SupplierSettings />} />
          <Route path="/supplier/search" element={<SupplierSearch />} />
          <Route path="/supplier/*" element={<SupplierModulePending />} />
        </Route> :

      <Route path="/supplier/*" element={<Navigate to="/supplier/auth" replace />} />
      }

      {/* The standalone Driver App has been retired from this product surface. */}
      <Route path="/driver/*" element={<Navigate to="/signin" replace />} />

      {/* Super Admin — platform control plane. Its own security boundary: a
           separate credential, and no builder or supplier session grants it. */}
      <Route
        path="/admin/access"
        element={admin.authed ? <Navigate to="/admin/dashboard" replace /> : <AdminAuth />} />
      
      {admin.authed ?
      <Route element={<AdminShell />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/overview" element={<PlatformOverview />} />
          <Route path="/admin/suppliers" element={<SupplierDirectory />} />
          <Route path="/admin/suppliers/new" element={<CreateSupplier />} />
          <Route path="/admin/builders" element={<BuilderDirectory />} />
          <Route path="/admin/org/:orgId" element={<OrganizationDetail />} />
          <Route path="/admin/users" element={<PlatformUsers />} />
          <Route path="/admin/plans" element={<Plans />} />
          <Route path="/admin/subscriptions" element={<Subscriptions />} />
          <Route path="/admin/entitlements" element={<Entitlements />} />
          <Route path="/admin/ai" element={<AiOverview />} />
          <Route path="/admin/ai/jobs" element={<AiJobs />} />
          <Route path="/admin/ai/issues" element={<AiIssues />} />
          <Route path="/admin/ai/config" element={<AiConfiguration />} />
          <Route path="/admin/integrations" element={<Integrations />} />
          <Route path="/admin/queue" element={<JobQueue />} />
          <Route path="/admin/health" element={<SystemHealth />} />
          <Route path="/admin/incidents/:id" element={<IncidentDetail />} />
          <Route path="/admin/support" element={<Support />} />
          <Route path="/admin/support/:id" element={<SupportCaseDetail />} />
          <Route path="/admin/security" element={<Security />} />
          <Route path="/admin/audit" element={<AuditLog />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/flags" element={<FeatureFlags />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/search" element={<AdminSearch />} />
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route> :

      <Route path="/admin/*" element={<Navigate to="/admin/access" replace />} />
      }

      {/* Builder platform */}
      {authed ?
      <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/activity" element={<ActivityLogPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/takeoff/new" element={<NewTakeoff />} />
          <Route path="/takeoff/:takeoffId" element={<TakeoffWorkspace />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/procurement/requests/new" element={<NewRequest />} />
          <Route path="/procurement/requests/:requestId" element={<RequestDetail />} />
          <Route path="/procurement/requests/:requestId/compare" element={<QuoteCompare />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/deliveries/:deliveryId" element={<DeliveryDetail />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/accounting/payments" element={<Payments />} />
          <Route path="/accounting/invoices/:invoiceId" element={<InvoiceDetail />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:threadId" element={<MessageThreadPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/team" element={<Team />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:supplierId" element={<SupplierDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:docId" element={<DocumentDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/jobsite" element={<Jobsite />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route> :

      <Route path="*" element={<AuthFlow initialStep="signin" />} />
      }
    </Routes>);

}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center px-6 py-24 text-center">
      <p className="display-tight text-[52px] font-bold text-ink-200">404</p>
      <h1 className="display-tight mt-2 text-[20px] font-bold text-ink-900">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-[340px] text-[13.5px] leading-relaxed text-ink-400">
        The link may be out of date, or the record was moved to another project.
      </p>
      <Button className="mt-6" onClick={() => navigate('/home')}>
        Back to dashboard
      </Button>
    </div>);

}
