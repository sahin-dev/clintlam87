import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { SupplierProvider, useSupplier } from './contexts/SupplierContext';
import { AppShell } from './components/shell/AppShell';
import { SupplierShell } from './components/supplier/SupplierShell';
import { ToastHost } from './components/ui/Feedback';
import { Button } from './components/ui/Button';
import { ExchangeProvider } from './contexts/ExchangeContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { AdminShell } from './components/admin/AdminShell';
import { ErrorBoundary } from './components/app/ErrorBoundary';
import { lazyPage, RouteSuspense } from './components/app/RouteLoading';

/* Every screen is code-split; shells and providers load up front. */
const AuthFlow = lazyPage(() => import('./pages/auth/AuthFlow'), 'AuthFlow');
const ActivityLogPage = lazyPage(() => import('./pages/Home'), 'ActivityLogPage');
const Home = lazyPage(() => import('./pages/Home'), 'Home');
const Projects = lazyPage(() => import('./pages/Projects'), 'Projects');
const ProjectDetail = lazyPage(() => import('./pages/ProjectDetail'), 'ProjectDetail');
const NewTakeoff = lazyPage(() => import('./pages/takeoff/NewTakeoff'), 'NewTakeoff');
const TakeoffWorkspace = lazyPage(() => import('./pages/takeoff/TakeoffWorkspace'), 'TakeoffWorkspace');
const Procurement = lazyPage(() => import('./pages/procurement/Procurement'), 'Procurement');
const RequestDetail = lazyPage(() => import('./pages/procurement/RequestDetail'), 'RequestDetail');
const NewRequest = lazyPage(() => import('./pages/procurement/NewRequest'), 'NewRequest');
const QuoteCompare = lazyPage(() => import('./pages/procurement/QuoteCompare'), 'QuoteCompare');
const Orders = lazyPage(() => import('./pages/orders/Orders'), 'Orders');
const OrderDetail = lazyPage(() => import('./pages/orders/OrderDetail'), 'OrderDetail');
const Deliveries = lazyPage(() => import('./pages/deliveries/Deliveries'), 'Deliveries');
const DeliveryDetail = lazyPage(() => import('./pages/deliveries/DeliveryDetail'), 'DeliveryDetail');
const Accounting = lazyPage(() => import('./pages/accounting/Accounting'), 'Accounting');
const InvoiceDetail = lazyPage(() => import('./pages/accounting/InvoiceDetail'), 'InvoiceDetail');
const Payments = lazyPage(() => import('./pages/accounting/Payments'), 'Payments');
const Approvals = lazyPage(() => import('./pages/Approvals'), 'Approvals');
const Messages = lazyPage(() => import('./pages/Messages'), 'Messages');
const MessageThreadPage = lazyPage(() => import('./pages/Messages'), 'MessageThreadPage');
const Notifications = lazyPage(() => import('./pages/Notifications'), 'Notifications');
const Team = lazyPage(() => import('./pages/Team'), 'Team');
const Suppliers = lazyPage(() => import('./pages/Suppliers'), 'Suppliers');
const SupplierDetail = lazyPage(() => import('./pages/Suppliers'), 'SupplierDetail');
const Search = lazyPage(() => import('./pages/Search'), 'Search');
const Documents = lazyPage(() => import('./pages/Documents'), 'Documents');
const DocumentDetail = lazyPage(() => import('./pages/Documents'), 'DocumentDetail');
const Tasks = lazyPage(() => import('./pages/Tasks'), 'Tasks');
const Jobsite = lazyPage(() => import('./pages/Jobsite'), 'Jobsite');
const Profile = lazyPage(() => import('./pages/Profile'), 'Profile');
const SupplierAuth = lazyPage(() => import('./pages/supplier/SupplierAuth'), 'SupplierAuth');
const SupplierHome = lazyPage(() => import('./pages/supplier/SupplierHome'), 'SupplierHome');
const Customers = lazyPage(() => import('./pages/supplier/Customers'), 'Customers');
const CustomerDetail = lazyPage(() => import('./pages/supplier/Customers'), 'CustomerDetail');
const SupplierProjects = lazyPage(() => import('./pages/supplier/Projects'), 'SupplierProjects');
const SupplierProjectDetail = lazyPage(() => import('./pages/supplier/Projects'), 'SupplierProjectDetail');
const Rfqs = lazyPage(() => import('./pages/supplier/Rfqs'), 'Rfqs');
const RfqDetail = lazyPage(() => import('./pages/supplier/Rfqs'), 'RfqDetail');
const SupplierTakeoffReview = lazyPage(() => import('./pages/supplier/SupplierTakeoffReview'), 'SupplierTakeoffReview');
const TakeoffInbox = lazyPage(() => import('./pages/supplier/SupplierTakeoffReview'), 'TakeoffInbox');
const Estimates = lazyPage(() => import('./pages/supplier/Estimates'), 'Estimates');
const EstimateBuilder = lazyPage(() => import('./pages/supplier/Estimates'), 'EstimateBuilder');
const Quotes = lazyPage(() => import('./pages/supplier/Quotes'), 'Quotes');
const QuoteDetail = lazyPage(() => import('./pages/supplier/Quotes'), 'QuoteDetail');
const SupplierOrders = lazyPage(() => import('./pages/supplier/Orders'), 'SupplierOrders');
const SupplierOrderDetail = lazyPage(() => import('./pages/supplier/Orders'), 'SupplierOrderDetail');
const SupplierInventory = lazyPage(() => import('./pages/supplier/Inventory'), 'SupplierInventory');
const SupplierPurchasing = lazyPage(() => import('./pages/supplier/Inventory'), 'SupplierPurchasing');
const SupplierProducts = lazyPage(() => import('./pages/supplier/Catalog'), 'SupplierProducts');
const SupplierPricing = lazyPage(() => import('./pages/supplier/Catalog'), 'SupplierPricing');
const SupplierDeliveries = lazyPage(() => import('./pages/supplier/Deliveries'), 'SupplierDeliveries');
const SupplierDeliveryDetail = lazyPage(() => import('./pages/supplier/Deliveries'), 'SupplierDeliveryDetail');
const SupplierInvoices = lazyPage(() => import('./pages/supplier/Finance'), 'SupplierInvoices');
const SupplierInvoiceDetail = lazyPage(() => import('./pages/supplier/Finance'), 'SupplierInvoiceDetail');
const SupplierPayments = lazyPage(() => import('./pages/supplier/Finance'), 'SupplierPayments');
const SupplierService = lazyPage(() => import('./pages/supplier/Service'), 'SupplierService');
const SupplierCaseDetail = lazyPage(() => import('./pages/supplier/Service'), 'SupplierCaseDetail');
const SupplierMessages = lazyPage(() => import('./pages/supplier/Engagement'), 'SupplierMessages');
const SupplierNotifications = lazyPage(() => import('./pages/supplier/Engagement'), 'SupplierNotifications');
const SupplierDocuments = lazyPage(() => import('./pages/supplier/Engagement'), 'SupplierDocuments');
const SupplierSearch = lazyPage(() => import('./pages/supplier/Search'), 'SupplierSearch');
const SupplierReports = lazyPage(() => import('./pages/supplier/Reports'), 'SupplierReports');
const SupplierAuditLog = lazyPage(() => import('./pages/supplier/Admin'), 'SupplierAuditLog');
const SupplierIntegrations = lazyPage(() => import('./pages/supplier/Admin'), 'SupplierIntegrations');
const SupplierSettings = lazyPage(() => import('./pages/supplier/Admin'), 'SupplierSettings');
const SupplierTeam = lazyPage(() => import('./pages/supplier/Admin'), 'SupplierTeam');
const SupplierModulePending = lazyPage(() => import('./pages/supplier/ModulePending'), 'SupplierModulePending');
const SupplierOnboarding = lazyPage(() => import('./pages/supplier/SupplierOnboarding'), 'SupplierOnboarding');
const AdminAuth = lazyPage(() => import('./pages/admin/AdminAuth'), 'AdminAuth');
const AdminDashboard = lazyPage(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const PlatformOverview = lazyPage(() => import('./pages/admin/PlatformOverview'), 'PlatformOverview');
const SupplierDirectory = lazyPage(() => import('./pages/admin/Organizations'), 'SupplierDirectory');
const BuilderDirectory = lazyPage(() => import('./pages/admin/Organizations'), 'BuilderDirectory');
const OrganizationDetail = lazyPage(() => import('./pages/admin/Organizations'), 'OrganizationDetail');
const CreateSupplier = lazyPage(() => import('./pages/admin/Organizations'), 'CreateSupplier');
const PlatformUsers = lazyPage(() => import('./pages/admin/Organizations'), 'PlatformUsers');
const Plans = lazyPage(() => import('./pages/admin/Commercial'), 'Plans');
const Subscriptions = lazyPage(() => import('./pages/admin/Commercial'), 'Subscriptions');
const Entitlements = lazyPage(() => import('./pages/admin/Commercial'), 'Entitlements');
const AiOverview = lazyPage(() => import('./pages/admin/AiOps'), 'AiOverview');
const AiJobs = lazyPage(() => import('./pages/admin/AiOps'), 'AiJobs');
const AiIssues = lazyPage(() => import('./pages/admin/AiOps'), 'AiIssues');
const AiConfiguration = lazyPage(() => import('./pages/admin/AiOps'), 'AiConfiguration');
const Integrations = lazyPage(() => import('./pages/admin/PlatformOps'), 'Integrations');
const JobQueue = lazyPage(() => import('./pages/admin/PlatformOps'), 'JobQueue');
const SystemHealth = lazyPage(() => import('./pages/admin/PlatformOps'), 'SystemHealth');
const IncidentDetail = lazyPage(() => import('./pages/admin/PlatformOps'), 'IncidentDetail');
const Support = lazyPage(() => import('./pages/admin/Governance'), 'Support');
const SupportCaseDetail = lazyPage(() => import('./pages/admin/Governance'), 'SupportCaseDetail');
const Security = lazyPage(() => import('./pages/admin/Governance'), 'Security');
const AuditLog = lazyPage(() => import('./pages/admin/Governance'), 'AuditLog');
const Reports = lazyPage(() => import('./pages/admin/Governance'), 'Reports');
const FeatureFlags = lazyPage(() => import('./pages/admin/Governance'), 'FeatureFlags');
const AdminSettings = lazyPage(() => import('./pages/admin/Governance'), 'AdminSettings');
const AdminNotifications = lazyPage(() => import('./pages/admin/Governance'), 'AdminNotifications');
const AdminSearch = lazyPage(() => import('./pages/admin/Governance'), 'AdminSearch');

export function App() {
  return (
    <ErrorBoundary>
      <ExchangeProvider>
        <AppProvider>
          <BrowserRouter>
            <SupplierProvider>
              <AdminProvider>
                <RouteSuspense fullScreen>
                  <Session />
                </RouteSuspense>
                <ToastHost />
              </AdminProvider>
            </SupplierProvider>
          </BrowserRouter>
        </AppProvider>
      </ExchangeProvider>
    </ErrorBoundary>);

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
