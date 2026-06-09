import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { ApiError, fetchMyOrders } from '@/api/client';
import type { OrderResponse } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/button';

export default function AccountHome() {
  const { token, user } = useAuth();
  const { language, t } = useShop();
  const [recent, setRecent] = useState<OrderResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMyOrders(token)
      .then((r) => {
        if (cancelled) return;
        setRecent(r.data.slice(0, 3));
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

  if (!user) return null;

  return (
    <>
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('account.welcome', { name: user.full_name || user.email })}
      </h1>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-sm text-muted-foreground">{user.email}</div>
        <div className="mt-1 font-display text-lg font-medium tracking-tight">
          {user.full_name || user.email}
        </div>
      </div>
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 font-display text-lg font-medium tracking-tight">
            {t('account.recentOrders')}
          </h2>
          <Button asChild variant="link" size="sm" className="px-0">
            <Link to="/account/orders">
              {t('account.viewAll')} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
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
        {!loading && !error && recent && recent.length === 0 && (
          <div className="text-sm text-muted-foreground">{t('myOrders.empty')}</div>
        )}
        {!loading && !error && recent && recent.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  to={`/account/orders/${o.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--button-neutral-bg)] px-3 py-2 text-sm transition-colors hover:bg-[var(--neutral-200)]"
                >
                  <span className="min-w-0 truncate font-mono">{o.order_number}</span>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium">
                    {o.status}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatPrice(o.total, o.currency, language)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
