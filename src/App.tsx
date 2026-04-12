import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import PageSkeleton from "@/components/ui/PageSkeleton";

import ClientLayout from "@/components/layout/ClientLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const LoginPage = React.lazy(() => import("@/pages/LoginPage"));
const ClientDashboard = React.lazy(() => import("@/pages/client/ClientDashboard"));
const AccountsPage = React.lazy(() => import("@/pages/client/AccountsPage"));
const TransactionsPage = React.lazy(() => import("@/pages/client/TransactionsPage"));
const TransferPage = React.lazy(() => import("@/pages/client/TransferPage"));
const BeneficiariesPage = React.lazy(() => import("@/pages/client/BeneficiariesPage"));
const InstrumentsPage = React.lazy(() => import("@/pages/client/InstrumentsPage"));
const SupportPage = React.lazy(() => import("@/pages/client/SupportPage"));
const FundingPage = React.lazy(() => import("@/pages/client/FundingPage"));
const SettingsPage = React.lazy(() => import("@/pages/client/SettingsPage"));
const ClientLoansPage = React.lazy(() => import("@/pages/client/LoansPage"));
const ClientServicesPage = React.lazy(() => import("@/pages/client/ServicesPage"));

const AdminDashboard = React.lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminCustomersPage = React.lazy(() => import("@/pages/admin/CustomersPage"));
const AdminAccountsPage = React.lazy(() => import("@/pages/admin/AccountsPage"));
const AdminTransactionsPage = React.lazy(() => import("@/pages/admin/TransactionsPage"));
const AdminDepositsPage = React.lazy(() => import("@/pages/admin/DepositsPage"));
const AdminHoldsPage = React.lazy(() => import("@/pages/admin/HoldsPage"));
const AdminProductsPage = React.lazy(() => import("@/pages/admin/ProductsPage"));
const AdminSettingsPage = React.lazy(() => import("@/pages/admin/SettingsPage"));
const AdminReportsPage = React.lazy(() => import("@/pages/admin/ReportsPage"));
const AdminLoansPage = React.lazy(() => import("@/pages/admin/LoansPage"));

const NotFound = React.lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage />} />

          <Route element={<ProtectedRoute requiredRole="client"><ClientLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/:id" element={<AccountsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/beneficiaries" element={<BeneficiariesPage />} />
            <Route path="/instruments" element={<InstrumentsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/funding" element={<FundingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/loans" element={<ClientLoansPage />} />
            <Route path="/services" element={<ClientServicesPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/customers/new" element={<AdminCustomersPage />} />
            <Route path="/admin/customers/:id" element={<AdminCustomersPage />} />
            <Route path="/admin/accounts" element={<AdminAccountsPage />} />
            <Route path="/admin/accounts/new" element={<AdminAccountsPage />} />
            <Route path="/admin/accounts/:id" element={<AdminAccountsPage />} />
            <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
            <Route path="/admin/transfers" element={<AdminTransactionsPage />} />
            <Route path="/admin/deposits" element={<AdminDepositsPage />} />
            <Route path="/admin/holds" element={<AdminHoldsPage />} />
            <Route path="/admin/loans" element={<AdminLoansPage />} />
            <Route path="/admin/products/:type" element={<AdminProductsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/settings/:section" element={<AdminSettingsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/reports/:type" element={<AdminReportsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
