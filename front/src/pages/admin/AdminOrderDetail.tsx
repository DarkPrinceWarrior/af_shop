import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import {
  ApiError,
  cancelAdminOrder,
  completeAdminOrder,
  fetchAdminOrder,
  updateAdminOrderComment,
  updateAdminOrderStatus,
} from '@/api/client';
import type { LanguageCode, OrderItem, OrderResponseFull, OrderStatus } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatusBadge } from '@/components/features/admin/OrderStatusBadge';

const STATUSES: OrderStatus[] = [
  'new',
  'accepted',
  'preparing',
  'delivering',
  'completed',
  'cancelled',
];

function pickItemName(item: OrderItem, language: LanguageCode): string {
  if (language === 'ps') return item.product_name_ps || item.product_name_en;
  if (language === 'zh-CN') return item.product_name_zh_cn || item.product_name_en;
  return item.product_name_en;
}

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const { language, bootstrap, t } = useShop();
  const [order, setOrder] = useState<OrderResponseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [comment, setComment] = useState('');
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token || !orderId) return;
    let cancelled = false;
    setLoading(true);
    fetchAdminOrder(token, orderId)
      .then((o) => {
        if (cancelled) return;
        setOrder(o);
        setComment(o.admin_comment ?? '');
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
  }, [token, orderId]);

  const place = order
    ? bootstrap?.delivery_places.find((p) => p.id === order.delivery_place_id)
    : null;

  const wrap = async <T,>(promise: Promise<T>) => {
    setBusy(true);
    setActionErr(null);
    try {
      const result = await promise;
      return result;
    } catch (err) {
      setActionErr(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const onChangeStatus = async () => {
    if (!token || !orderId || !pendingStatus) return;
    const updated = await wrap(
      updateAdminOrderStatus(token, orderId, {
        status: pendingStatus,
        admin_comment: comment.trim() || null,
      }),
    );
    if (updated) {
      setOrder(updated);
      setPendingStatus(null);
    }
  };

  const onSaveComment = async () => {
    if (!token || !orderId) return;
    const updated = await wrap(
      updateAdminOrderComment(token, orderId, comment.trim() || null),
    );
    if (updated) setOrder(updated);
  };

  const onComplete = async () => {
    if (!token || !orderId) return;
    const updated = await wrap(
      completeAdminOrder(token, orderId, comment.trim() || null),
    );
    if (updated) setOrder(updated);
  };

  const onCancel = async () => {
    if (!token || !orderId) return;
    if (!window.confirm(t('admin.action.cancelOrder') + '?')) return;
    const updated = await wrap(cancelAdminOrder(token, orderId, comment.trim() || null));
    if (updated) setOrder(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        {t('common.loading')}
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }
  if (!order) return null;

  const isFinal = order.status === 'completed' || order.status === 'cancelled';

  return (
    <>
      <Button asChild variant="link" className="self-start px-0">
        <Link to="/admin/orders">
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {t('admin.orders')}
        </Link>
      </Button>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-sm font-medium break-all">{order.order_number}</div>
            {order.created_at && (
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleString(language)}
              </div>
            )}
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="m-0 mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          {t('admin.field.customer')}
        </h2>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <Field label={t('checkout.name')} value={order.customer_name} />
          <Field label={t('checkout.phone')} value={order.customer_phone} />
          {order.customer_telegram && (
            <Field label={t('checkout.telegram')} value={order.customer_telegram} />
          )}
          {place && <Field label={t('myOrders.deliveryTo')} value={place.name} />}
        </div>
        {order.customer_comment && (
          <div className="mt-3 rounded-xl bg-[var(--button-neutral-bg)] px-3 py-2 text-sm">
            <span className="text-xs text-muted-foreground">{t('myOrders.comment')}:&nbsp;</span>
            {order.customer_comment}
          </div>
        )}
      </section>

      {order.items && order.items.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="m-0 mb-3 text-xs uppercase tracking-wider text-muted-foreground">
            {t('myOrders.items')}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {pickItemName(item, language)}{' '}
                  <span className="text-muted-foreground">×&nbsp;{item.quantity}</span>
                </span>
                <span className="font-medium tabular-nums">
                  {formatPrice(item.line_total, order.currency, language)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">{t('myOrders.total')}</span>
            <span className="font-display text-xl font-medium tracking-tight">
              {formatPrice(order.total, order.currency, language)}
            </span>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="m-0 mb-3 font-display text-lg font-medium tracking-tight">
          {t('admin.action.changeStatus')}
        </h2>
        {actionErr && (
          <div className="mb-3 rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
            {actionErr}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Select
            value={pendingStatus ?? order.status}
            onValueChange={(v) => setPendingStatus(v as OrderStatus)}
          >
            <SelectTrigger aria-label={t('admin.filter.status')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={onChangeStatus}
            disabled={busy || !pendingStatus || pendingStatus === order.status || isFinal}
            className="rounded-full"
          >
            {t('admin.action.save')}
          </Button>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="admin_comment">
            {t('admin.field.adminComment')}
          </label>
          <Textarea
            id="admin_comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onSaveComment}
              disabled={busy}
              className="rounded-full"
            >
              {t('admin.action.save')}
            </Button>
            <Button
              type="button"
              onClick={onComplete}
              disabled={busy || isFinal}
              className="rounded-full"
            >
              {t('admin.action.complete')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={busy || isFinal}
              className="rounded-full text-destructive hover:bg-destructive-soft"
            >
              {t('admin.action.cancelOrder')}
            </Button>
          </div>
        </div>
      </section>

      {order.status_history && order.status_history.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="m-0 mb-3 text-xs uppercase tracking-wider text-muted-foreground">
            {t('admin.field.statusHistory')}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {order.status_history.map((evt) => (
              <li
                key={evt.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--button-neutral-bg)] px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <OrderStatusBadge status={evt.new_status} />
                  {evt.comment && (
                    <span className="text-muted-foreground">{evt.comment}</span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(evt.created_at).toLocaleString(language)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
