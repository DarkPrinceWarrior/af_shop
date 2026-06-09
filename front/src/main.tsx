import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { ShopProvider } from '@/state/store';
import { AuthProvider } from '@/state/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Layout from '@/Layout';
import CatalogPage from '@/pages/CatalogPage';
import CheckoutPage from '@/pages/CheckoutPage';
import SuccessPage from '@/pages/SuccessPage';
import LoginPage from '@/pages/LoginPage';

// Auth recovery and the authenticated account/admin areas are code-split so they
// stay out of the initial storefront bundle.
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const AccountLayout = lazy(() => import('@/layouts/AccountLayout'));
const AccountHome = lazy(() => import('@/pages/account/AccountHome'));
const AccountOrders = lazy(() => import('@/pages/account/AccountOrders'));
const AccountOrderDetail = lazy(() => import('@/pages/account/AccountOrderDetail'));
const AccountProfile = lazy(() => import('@/pages/account/AccountProfile'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/AdminOrderDetail'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminDeliveryPlaces = lazy(() => import('@/pages/admin/AdminDeliveryPlaces'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminTelegram = lazy(() => import('@/pages/admin/AdminTelegram'));
import './styles/globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: CatalogPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'login', Component: LoginPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'reset-password', Component: ResetPasswordPage },
      { path: 'orders/me', element: <Navigate to="/account/orders" replace /> },
      { path: 'orders/:orderNumber/success', Component: SuccessPage },
      {
        path: 'account',
        Component: AccountLayout,
        children: [
          { index: true, Component: AccountHome },
          { path: 'orders', Component: AccountOrders },
          { path: 'orders/:orderId', Component: AccountOrderDetail },
          { path: 'profile', Component: AccountProfile },
        ],
      },
      {
        path: 'admin',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: 'orders', Component: AdminOrders },
          { path: 'orders/:orderId', Component: AdminOrderDetail },
          { path: 'products', Component: AdminProducts },
          { path: 'categories', Component: AdminCategories },
          { path: 'delivery-places', Component: AdminDeliveryPlaces },
          { path: 'users', Component: AdminUsers },
          { path: 'telegram', Component: AdminTelegram },
        ],
      },
    ],
  },
]);

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ShopProvider>
          <RouterProvider router={router} />
        </ShopProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
