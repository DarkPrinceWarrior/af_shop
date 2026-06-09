import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import {
  ApiError,
  createAdminDeliveryPlace,
  deleteAdminDeliveryPlace,
  fetchAdminDeliveryPlaces,
  updateAdminDeliveryPlace,
  uploadMedia,
} from '@/api/client';
import type {
  AdminDeliveryPlace,
  AdminDeliveryPlacePayload,
} from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const EMPTY: AdminDeliveryPlacePayload = {
  name_en: '',
  name_ps: '',
  name_zh_cn: '',
  description_en: '',
  description_ps: '',
  description_zh_cn: '',
  image_path: null,
  fee_afn: '0',
  fee_cny: '0',
  fee_usd: '0',
  sort_order: 0,
  is_active: true,
};

export default function AdminDeliveryPlaces() {
  const { token } = useAuth();
  const { t } = useShop();
  const [items, setItems] = useState<AdminDeliveryPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminDeliveryPlace | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetchAdminDeliveryPlaces(token);
      setItems(r.data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onDelete = async (id: string) => {
    if (!token || !window.confirm(t('admin.confirmDelete'))) return;
    try {
      await deleteAdminDeliveryPlace(token, id);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
          {t('admin.deliveryPlaces')}
        </h1>
        <Button type="button" onClick={() => setCreating(true)} className="rounded-full">
          <Plus className="size-4" /> {t('admin.action.create')}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" /> {t('common.loading')}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {items.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="font-medium">{p.name_en}</div>
                <div className="truncate text-xs text-muted-foreground">
                  AFN {p.fee_afn} · #{p.sort_order}
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? 'bg-[var(--primary-soft)] text-primary' : 'bg-[var(--button-neutral-bg)] text-muted-foreground'}`}
              >
                {p.is_active ? t('admin.field.active') : '—'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditing(p)}
                aria-label={t('admin.action.edit')}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void onDelete(p.id)}
                aria-label={t('admin.action.delete')}
                className="text-destructive hover:bg-destructive-soft"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <PlaceForm
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        initial={editing ?? EMPTY}
        onSubmit={async (payload) => {
          if (!token) return;
          if (editing) {
            await updateAdminDeliveryPlace(token, editing.id, payload);
          } else {
            await createAdminDeliveryPlace(token, payload);
          }
          await reload();
          setEditing(null);
          setCreating(false);
        }}
      />
    </>
  );
}

function PlaceForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: AdminDeliveryPlacePayload | AdminDeliveryPlace;
  onSubmit: (p: AdminDeliveryPlacePayload) => Promise<void>;
}) {
  const { token } = useAuth();
  const { t } = useShop();
  const [form, setForm] = useState<AdminDeliveryPlacePayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      name_en: initial.name_en,
      name_ps: initial.name_ps,
      name_zh_cn: initial.name_zh_cn,
      description_en: initial.description_en ?? '',
      description_ps: initial.description_ps ?? '',
      description_zh_cn: initial.description_zh_cn ?? '',
      image_path: initial.image_path ?? null,
      fee_afn: initial.fee_afn ?? '0',
      fee_cny: initial.fee_cny ?? '0',
      fee_usd: initial.fee_usd ?? '0',
      sort_order: initial.sort_order ?? 0,
      is_active: initial.is_active ?? true,
    });
    setError(null);
  }, [initial, open]);

  const onUpload = async (file: File) => {
    if (!token) return;
    try {
      const r = await uploadMedia(token, file);
      setForm((f) => ({ ...f, image_path: r.image_path }));
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    }
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-[min(560px,100%)]">
        <SheetHeader>
          <SheetTitle className="font-display tracking-tight">
            {t('admin.deliveryPlaces')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-2">
            <Field htmlFor="d_n_en" label="Name (en)">
              <Input
                id="d_n_en"
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              />
            </Field>
            <Field htmlFor="d_n_ps" label="Name (ps)">
              <Input
                id="d_n_ps"
                value={form.name_ps}
                onChange={(e) => setForm({ ...form, name_ps: e.target.value })}
              />
            </Field>
            <Field htmlFor="d_n_zh" label="Name (zh-CN)">
              <Input
                id="d_n_zh"
                value={form.name_zh_cn}
                onChange={(e) => setForm({ ...form, name_zh_cn: e.target.value })}
              />
            </Field>
          </div>
          <Field htmlFor="d_desc_en" label="Description (en)">
            <Textarea
              id="d_desc_en"
              value={form.description_en ?? ''}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field htmlFor="d_afn" label="Fee AFN">
              <Input
                id="d_afn"
                value={form.fee_afn}
                onChange={(e) => setForm({ ...form, fee_afn: e.target.value })}
              />
            </Field>
            <Field htmlFor="d_cny" label="Fee CNY">
              <Input
                id="d_cny"
                value={form.fee_cny}
                onChange={(e) => setForm({ ...form, fee_cny: e.target.value })}
              />
            </Field>
            <Field htmlFor="d_usd" label="Fee USD">
              <Input
                id="d_usd"
                value={form.fee_usd}
                onChange={(e) => setForm({ ...form, fee_usd: e.target.value })}
              />
            </Field>
          </div>
          <Field htmlFor="d_sort" label={t('admin.field.sortOrder')}>
            <Input
              id="d_sort"
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) })
              }
            />
          </Field>
          <Field htmlFor="d_image" label={t('admin.field.image')}>
            <input
              id="d_image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
              }}
              className="text-sm"
            />
            {form.image_path && (
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {form.image_path}
              </div>
            )}
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            {t('admin.field.active')}
          </label>
          {error && (
            <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
        <SheetFooter>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={saving}
            className="w-full rounded-full"
          >
            {t('admin.action.save')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full"
          >
            {t('admin.action.cancel')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={htmlFor} className="text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
