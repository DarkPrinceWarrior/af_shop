import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { ApiError, fetchMyOrder } from '@/api/client';
import type { LanguageCode, OrderItem, OrderResponseFull } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/features/admin/OrderStatusBadge';

function pickItemName(item: OrderItem, language: LanguageCode): string {
  if (language === 'ps') return item.product_name_ps || item.product_name_en;
  if (language === 'zh-CN') return item.product_name_zh_cn || item.product_name_en;
  return item.product_name_en;
}

export default function AccountOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const { language, bootstrap, t } = useShop();
  const [order, setOrder] = useState<OrderResponseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !orderId) return;
    let cancelled = false;
    setLoading(true);
    fetchMyOrder(token, orderId)
      .then((o) => {
        if (cancelled) return;
        setOrder(o);
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

  return (
    <>
      <Button asChild variant="link" className="self-start px-0">
        <Link to="/account/orders">
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {t('myOrders.title')}
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
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="m-0 mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          {t('admin.field.customer')}
        </h2>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">{t('checkout.name')}</div>
            <div className="font-medium">{order.customer_name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t('checkout.phone')}</div>
            <div className="font-medium">{order.customer_phone}</div>
          </div>
          {order.customer_telegram && (
            <div>
              <div className="text-xs text-muted-foreground">{t('checkout.telegram')}</div>
              <div className="font-medium">{order.customer_telegram}</div>
            </div>
          )}
          {place && (
            <div>
              <div className="text-xs text-muted-foreground">{t('myOrders.deliveryTo')}</div>
              <div className="font-medium">{place.name}</div>
            </div>
          )}
        </div>
        {order.customer_comment && (
          <div className="mt-3 rounded-xl bg-[var(--button-neutral-bg)] px-3 py-2 text-sm">
            <span className="text-xs text-muted-foreground">{t('myOrders.comment')}:&nbsp;</span>
            {order.customer_comment}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">{t('myOrders.subtotal')}</span>
          <span className="font-medium tabular-nums">
            {formatPrice(order.subtotal, order.currency, language)}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">{t('myOrders.deliveryFee')}</span>
          <span className="font-medium tabular-nums">
            {formatPrice(order.delivery_fee, order.currency, language)}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">{t('myOrders.total')}</span>
          <span className="font-display text-xl font-medium tracking-tight">
            {formatPrice(order.total, order.currency, language)}
          </span>
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
                <span>
                  <OrderStatusBadge status={evt.new_status} />
                  {evt.comment && (
                    <span className="ms-2 text-muted-foreground">{evt.comment}</span>
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
