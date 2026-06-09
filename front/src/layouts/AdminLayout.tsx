import { Outlet } from 'react-router';
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Tag,
  MapPin,
  Users,
  Send,
} from 'lucide-react';
import { useShop } from '@/state/useShop';
import { RequireSuperuser } from '@/components/RouteGuards';
import { SidebarNav } from '@/components/features/admin/SidebarNav';

export default function AdminLayout() {
  const { t } = useShop();
  return (
    <RequireSuperuser>
      <div className="col-span-full grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        <SidebarNav
          items={[
            { to: '/admin', icon: LayoutDashboard, label: t('admin.dashboard'), end: true },
            { to: '/admin/orders', icon: Receipt, label: t('admin.orders') },
            { to: '/admin/products', icon: Boxes, label: t('admin.products') },
            { to: '/admin/categories', icon: Tag, label: t('admin.categories') },
            { to: '/admin/delivery-places', icon: MapPin, label: t('admin.deliveryPlaces') },
            { to: '/admin/users', icon: Users, label: t('admin.users') },
            { to: '/admin/telegram', icon: Send, label: t('admin.telegram') },
          ]}
        />
        <div className="flex min-w-0 flex-col gap-4">
          <Outlet />
        </div>
      </div>
    </RequireSuperuser>
  );
}
