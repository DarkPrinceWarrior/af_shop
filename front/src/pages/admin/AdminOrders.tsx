import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import {
  ApiError,
  fetchAdminOrders,
  openAdminOrdersSocket,
} from '@/api/client';
import type { OrderCreatedEvent, OrderResponse, OrderStatus } from '@/api/types';
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
const PAGE_SIZE = 20;
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
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<string>(ALL);
  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [reloadTick, setReloadTick] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [live, setLive] = useState(false);

  const filters = useMemo(
    () => ({
      status: status === ALL ? undefined : (status as OrderStatus),
      q: q.trim() || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [status, q, dateFrom, dateTo],
  );

  // Reset to the first page whenever the filters change.
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Fetch orders (debounced for search typing).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const handle = setTimeout(() => {
      setLoading(true);
      fetchAdminOrders(token, { ...filters, skip: page * PAGE_SIZE, limit: PAGE_SIZE })
        .then((r) => {
          if (cancelled) return;
          setOrders(r.data);
          setCount(r.count);
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
  }, [token, filters, page, reloadTick]);

  // Live order stream over WebSocket with auto-reconnect.
  useEffect(() => {
    if (!token) return;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closedByCleanup = false;

    const connect = () => {
      socket = openAdminOrdersSocket(token);
      socket.onopen = () => setLive(true);
      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(String(event.data)) as Partial<OrderCreatedEvent>;
          if (data.type === 'order.created') setNewCount((n) => n + 1);
        } catch {
          /* ignore malformed frames */
        }
      };
      socket.onclose = () => {
        setLive(false);
        if (!closedByCleanup) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
      socket.onerror = () => socket?.close();
    };
    connect();

    return () => {
      closedByCleanup = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [token]);

  const refreshNew = () => {
    setNewCount(0);
    setPage(0);
    setReloadTick((n) => n + 1);
  };

  const hasFilters = status !== ALL || q || dateFrom || dateTo;
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const rangeFrom = count === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeTo = Math.min((page + 1) * PAGE_SIZE, count);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
          {t('admin.orders')}
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
            live
              ? 'bg-[var(--primary-soft)] text-primary'
              : 'bg-[var(--button-neutral-bg)] text-muted-foreground'
          }`}
        >
          <span
            className={`size-2 rounded-full ${live ? 'bg-primary' : 'bg-[var(--neutral-400)]'}`}
            aria-hidden="true"
          />
          {live ? t('admin.live') : t('admin.offline')}
        </span>
      </div>

      {newCount > 0 && (
        <button
          type="button"
          onClick={refreshNew}
          className="flex items-center gap-2 self-start rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-medium text-primary transition-colors hover:brightness-95"
        >
          <Bell className="size-4" aria-hidden="true" />
          {t('admin.newOrders', { count: newCount })}
        </button>
      )}

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
      {hasFilters && (
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

      {!loading && !error && count > 0 && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-muted-foreground tabular-nums">
            {t('admin.page.range', { from: rangeFrom, to: rangeTo, total: count })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-4" /> {t('admin.page.prev')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('admin.page.next')} <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
