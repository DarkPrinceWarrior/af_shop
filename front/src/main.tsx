import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { ShopProvider } from '@/state/store';
import { AuthProvider } from '@/state/auth';
import Layout from '@/Layout';
import CatalogPage from '@/pages/CatalogPage';
import CheckoutPage from '@/pages/CheckoutPage';
import SuccessPage from '@/pages/SuccessPage';
import LoginPage from '@/pages/LoginPage';
import AccountLayout from '@/layouts/AccountLayout';
import AccountHome from '@/pages/account/AccountHome';
import AccountOrders from '@/pages/account/AccountOrders';
import AccountOrderDetail from '@/pages/account/AccountOrderDetail';
import AccountProfile from '@/pages/account/AccountProfile';
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminDeliveryPlaces from '@/pages/admin/AdminDeliveryPlaces';
import AdminUsers from '@/pages/admin/AdminUsers';
import './styles/globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: CatalogPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'login', Component: LoginPage },
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
    <AuthProvider>
      <ShopProvider>
        <RouterProvider router={router} />
      </ShopProvider>
    </AuthProvider>
  </StrictMode>,
);
