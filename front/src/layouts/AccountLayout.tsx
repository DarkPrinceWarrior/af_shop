import { Outlet } from 'react-router';
import { LayoutDashboard, Receipt, User } from 'lucide-react';
import { useShop } from '@/state/useShop';
import { RequireAuth } from '@/components/RouteGuards';
import { SidebarNav } from '@/components/features/admin/SidebarNav';

export default function AccountLayout() {
  const { t } = useShop();
  return (
    <RequireAuth>
      <div className="col-span-full grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        <SidebarNav
          items={[
            { to: '/account', icon: LayoutDashboard, label: t('account.overview'), end: true },
            { to: '/account/orders', icon: Receipt, label: t('account.orders') },
            { to: '/account/profile', icon: User, label: t('account.profile') },
          ]}
        />
        <div className="flex flex-col gap-4">
          <Outlet />
        </div>
      </div>
    </RequireAuth>
  );
}
