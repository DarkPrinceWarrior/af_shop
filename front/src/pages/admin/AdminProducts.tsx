import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import {
  ApiError,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct,
  uploadMedia,
} from '@/api/client';
import type {
  AdminCategory,
  AdminProduct,
  AdminProductPayload,
} from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const EMPTY: AdminProductPayload = {
  category_id: '',
  sku: '',
  name_en: '',
  name_ps: '',
  name_zh_cn: '',
  description_en: '',
  description_ps: '',
  description_zh_cn: '',
  price_afn: '0',
  price_cny: '0',
  price_usd: '0',
  stock_quantity: 0,
  is_active: true,
  primary_image_path: null,
};

export default function AdminProducts() {
  const { token } = useAuth();
  const { t } = useShop();
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        fetchAdminProducts(token),
        fetchAdminCategories(token),
      ]);
      setItems(p.data);
      setCategories(c.data);
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
      await deleteAdminProduct(token, id);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
          {t('admin.products')}
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
                  {p.sku ?? '—'} · stock {p.stock_quantity}
                </div>
              </div>
              <span className="font-medium tabular-nums">AFN {p.price_afn}</span>
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

      <ProductForm
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        initial={editing ?? EMPTY}
        categories={categories}
        onSubmit={async (payload) => {
          if (!token) return;
          if (editing) {
            await updateAdminProduct(token, editing.id, payload);
          } else {
            await createAdminProduct(token, payload);
          }
          await reload();
          setEditing(null);
          setCreating(false);
        }}
      />
    </>
  );
}

function ProductForm({
  open,
  onOpenChange,
  initial,
  categories,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: AdminProductPayload | AdminProduct;
  categories: AdminCategory[];
  onSubmit: (p: AdminProductPayload) => Promise<void>;
}) {
  const { token } = useAuth();
  const { t } = useShop();
  const [form, setForm] = useState<AdminProductPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('id' in initial) {
      const p = initial as AdminProduct;
      setForm({
        category_id: p.category_id,
        sku: p.sku ?? '',
        name_en: p.name_en,
        name_ps: p.name_ps,
        name_zh_cn: p.name_zh_cn,
        description_en: p.description_en ?? '',
        description_ps: p.description_ps ?? '',
        description_zh_cn: p.description_zh_cn ?? '',
        price_afn: p.price_afn,
        price_cny: p.price_cny,
        price_usd: p.price_usd,
        stock_quantity: p.stock_quantity,
        is_active: p.is_active,
        primary_image_path: p.images[0]?.image_path ?? null,
      });
    } else {
      setForm({
        ...EMPTY,
        category_id: categories[0]?.id ?? '',
      });
    }
    setError(null);
  }, [initial, open, categories]);

  const onUpload = async (file: File) => {
    if (!token) return;
    try {
      const r = await uploadMedia(token, file);
      setForm((f) => ({ ...f, primary_image_path: r.image_path }));
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
            {t('admin.products')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <FieldSelect
            label="Category"
            value={form.category_id}
            onChange={(v) => setForm({ ...form, category_id: v })}
            options={categories.map((c) => ({ value: c.id, label: c.name_en }))}
          />
          <Field htmlFor="p_sku" label="SKU">
            <Input
              id="p_sku"
              value={form.sku ?? ''}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field htmlFor="p_name_en" label="Name (en)">
              <Input
                id="p_name_en"
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              />
            </Field>
            <Field htmlFor="p_name_ps" label="Name (ps)">
              <Input
                id="p_name_ps"
                value={form.name_ps}
                onChange={(e) => setForm({ ...form, name_ps: e.target.value })}
              />
            </Field>
            <Field htmlFor="p_name_zh" label="Name (zh-CN)">
              <Input
                id="p_name_zh"
                value={form.name_zh_cn}
                onChange={(e) => setForm({ ...form, name_zh_cn: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field htmlFor="p_desc_en" label="Description (en)">
              <Textarea
                id="p_desc_en"
                value={form.description_en ?? ''}
                onChange={(e) =>
                  setForm({ ...form, description_en: e.target.value })
                }
              />
            </Field>
            <Field htmlFor="p_desc_ps" label="Description (ps)">
              <Textarea
                id="p_desc_ps"
                value={form.description_ps ?? ''}
                onChange={(e) =>
                  setForm({ ...form, description_ps: e.target.value })
                }
              />
            </Field>
            <Field htmlFor="p_desc_zh" label="Description (zh-CN)">
              <Textarea
                id="p_desc_zh"
                value={form.description_zh_cn ?? ''}
                onChange={(e) =>
                  setForm({ ...form, description_zh_cn: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field htmlFor="p_afn" label="AFN">
              <Input
                id="p_afn"
                value={form.price_afn}
                onChange={(e) => setForm({ ...form, price_afn: e.target.value })}
              />
            </Field>
            <Field htmlFor="p_cny" label="CNY">
              <Input
                id="p_cny"
                value={form.price_cny}
                onChange={(e) => setForm({ ...form, price_cny: e.target.value })}
              />
            </Field>
            <Field htmlFor="p_usd" label="USD">
              <Input
                id="p_usd"
                value={form.price_usd}
                onChange={(e) => setForm({ ...form, price_usd: e.target.value })}
              />
            </Field>
          </div>
          <Field htmlFor="p_stock" label="Stock">
            <Input
              id="p_stock"
              type="number"
              value={form.stock_quantity}
              onChange={(e) =>
                setForm({ ...form, stock_quantity: Number(e.target.value) })
              }
            />
          </Field>
          <Field htmlFor="p_image" label={t('admin.field.image')}>
            <input
              id="p_image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
              }}
              className="text-sm"
            />
            {form.primary_image_path && (
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {form.primary_image_path}
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

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
