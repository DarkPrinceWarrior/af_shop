import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import {
  ApiError,
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from '@/api/client';
import type { AdminCategory, AdminCategoryPayload } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const EMPTY: AdminCategoryPayload = {
  name_en: '',
  name_ps: '',
  name_zh_cn: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminCategories() {
  const { token } = useAuth();
  const { t } = useShop();
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetchAdminCategories(token);
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
    if (!token) return;
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await deleteAdminCategory(token, id);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
          {t('admin.categories')}
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
      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          {t('common.empty')}
        </div>
      )}

      {items.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map((c) => (
            <li
              key={c.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="font-medium">{c.name_en}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {c.name_ps} · {c.name_zh_cn}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">#{c.sort_order}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${c.is_active ? 'bg-[var(--primary-soft)] text-primary' : 'bg-[var(--button-neutral-bg)] text-muted-foreground'}`}
              >
                {c.is_active ? t('admin.field.active') : '—'}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(c)}
                  aria-label={t('admin.action.edit')}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void onDelete(c.id)}
                  aria-label={t('admin.action.delete')}
                  className="text-destructive hover:bg-destructive-soft"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CategoryForm
        open={creating}
        onOpenChange={setCreating}
        initial={EMPTY}
        onSubmit={async (payload) => {
          if (!token) return;
          await createAdminCategory(token, payload);
          await reload();
          setCreating(false);
        }}
      />
      <CategoryForm
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={editing ?? EMPTY}
        onSubmit={async (payload) => {
          if (!token || !editing) return;
          await updateAdminCategory(token, editing.id, payload);
          await reload();
          setEditing(null);
        }}
      />
    </>
  );
}

interface FormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: AdminCategoryPayload | AdminCategory;
  onSubmit: (payload: AdminCategoryPayload) => Promise<void>;
}

function CategoryForm({ open, onOpenChange, initial, onSubmit }: FormProps) {
  const { t } = useShop();
  const [form, setForm] = useState<AdminCategoryPayload>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name_en: initial.name_en,
      name_ps: initial.name_ps,
      name_zh_cn: initial.name_zh_cn,
      sort_order: initial.sort_order ?? 0,
      is_active: initial.is_active ?? true,
    });
    setError(null);
  }, [initial, open]);

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
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-display tracking-tight">
            {t('admin.categories')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <Field htmlFor="cat_en" label="Name (en)">
            <Input
              id="cat_en"
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            />
          </Field>
          <Field htmlFor="cat_ps" label="Name (ps)">
            <Input
              id="cat_ps"
              value={form.name_ps}
              onChange={(e) => setForm({ ...form, name_ps: e.target.value })}
            />
          </Field>
          <Field htmlFor="cat_zh" label="Name (zh-CN)">
            <Input
              id="cat_zh"
              value={form.name_zh_cn}
              onChange={(e) => setForm({ ...form, name_zh_cn: e.target.value })}
            />
          </Field>
          <Field htmlFor="cat_sort" label={t('admin.field.sortOrder')}>
            <Input
              id="cat_sort"
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) })
              }
            />
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
