import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { ApiError, fetchAdminDashboard } from '@/api/client';
import type { AdminDashboard as DashboardData } from '@/api/types';

export default function AdminDashboard() {
  const { token } = useAuth();
  const { t } = useShop();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetchAdminDashboard(token)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('admin.dashboard')}
      </h1>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          {t('common.loading')}
        </div>
      )}
      {error && !loading && (
        <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {data && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Metric label={t('admin.metric.products')} value={data.products_count} />
          <Metric label={t('admin.metric.activeProducts')} value={data.active_products_count} />
          <Metric
            label={t('admin.metric.lowStock')}
            value={data.low_stock_products_count}
            tone={data.low_stock_products_count > 0 ? 'warning' : undefined}
          />
          <Metric
            label={t('admin.metric.deliveryPlaces')}
            value={data.delivery_places_count}
          />
          <Metric
            label={t('admin.metric.activeDeliveryPlaces')}
            value={data.active_delivery_places_count}
          />
          <Metric
            label={t('admin.metric.newOrders')}
            value={data.new_orders_count}
            tone={data.new_orders_count > 0 ? 'primary' : undefined}
          />
          <Metric label={t('admin.metric.activeOrders')} value={data.active_orders_count} />
        </div>
      )}
    </>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'primary' | 'warning';
}) {
  const accent =
    tone === 'primary'
      ? 'text-primary'
      : tone === 'warning'
        ? 'text-warning'
        : 'text-foreground';
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-2 font-display text-3xl font-medium tracking-tighter ${accent}`}>
        {value}
      </div>
    </div>
  );
}
