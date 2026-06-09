import { cn } from '@/lib/utils';

const TONE: Record<string, string> = {
  new: 'bg-[var(--primary-soft)] text-primary',
  accepted: 'bg-[var(--primary-soft)] text-primary',
  preparing: 'bg-warning-soft text-warning',
  delivering: 'bg-warning-soft text-warning',
  completed: 'bg-[var(--button-neutral-bg)] text-foreground',
  cancelled: 'bg-destructive-soft text-destructive',
};

export function OrderStatusBadge({ status }: { status: string }) {
  const tone = TONE[status] ?? TONE.new;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider',
        tone,
      )}
    >
      {status}
    </span>
  );
}
