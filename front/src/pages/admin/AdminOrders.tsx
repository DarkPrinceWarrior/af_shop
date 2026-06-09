import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { ApiError, fetchAdminOrders } from '@/api/client';
import type { OrderResponse, OrderStatus } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatusBadge } from '@/components/features/admin/OrderStatusBadge';

const ALL = '__all__';
const STATUSES: OrderStatus[] = [
  'new',
  'accepted',
  'preparing',
  'delivering',
  'completed',
  'cancelled',
];

export default function AdminOrders() {
  const { token } = useAuth();
  const { language, t } = useShop();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<string>(ALL);
  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filters = useMemo(
    () => ({
      status: status === ALL ? undefined : (status as OrderStatus),
      q: q.trim() || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [status, q, dateFrom, dateTo],
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoading(true);
      fetchAdminOrders(token, filters)
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
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [token, filters]);

  return (
    <>
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('admin.orders')}
      </h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label={t('admin.filter.status')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('common.all')}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('admin.filter.search')}
            aria-label={t('admin.filter.search')}
            className="ps-12"
          />
        </div>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label={t('admin.filter.dateFrom')}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label={t('admin.filter.dateTo')}
        />
      </div>
      {(status !== ALL || q || dateFrom || dateTo) && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="self-start px-0"
          onClick={() => {
            setStatus(ALL);
            setQ('');
            setDateFrom('');
            setDateTo('');
          }}
        >
          {t('admin.filter.reset')}
        </Button>
      )}

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
      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          {t('common.empty')}
        </div>
      )}
      {!loading && !error && orders.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                to={`/admin/orders/${o.id}`}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[var(--neutral-300)]"
              >
                <div className="min-w-0">
                  <div className="font-mono text-sm font-medium break-all">
                    {o.order_number}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {o.customer_name} · {o.customer_phone}
                  </div>
                  {o.created_at && (
                    <div className="text-xs text-muted-foreground">
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
