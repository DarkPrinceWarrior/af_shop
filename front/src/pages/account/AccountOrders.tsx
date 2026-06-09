import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { ApiError, fetchMyOrders } from '@/api/client';
import type { OrderResponse } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { OrderStatusBadge } from '@/components/features/admin/OrderStatusBadge';

export default function AccountOrders() {
  const { token } = useAuth();
  const { language, t } = useShop();
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetchMyOrders(token)
      .then((r) => {
        if (cancelled) return;
        setOrders(r.data);
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
        {t('myOrders.title')}
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
      {!loading && !error && orders && orders.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          {t('myOrders.empty')}
        </div>
      )}
      {!loading && !error && orders && orders.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                to={`/account/orders/${o.id}`}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[var(--neutral-300)]"
              >
                <div className="min-w-0">
                  <div className="font-mono text-sm font-medium break-all">
                    {o.order_number}
                  </div>
                  {o.created_at && (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString(language)}
                    </div>
                  )}
                </div>
                <OrderStatusBadge status={o.status} />
                <span className="font-display text-lg font-medium tracking-tight tabular-nums">
                  {formatPrice(o.total, o.currency, language)}
                </span>
                <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
