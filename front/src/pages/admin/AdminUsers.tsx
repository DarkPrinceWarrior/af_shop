import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import {
  ApiError,
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from '@/api/client';
import type { AdminUserPayload, AuthUser } from '@/api/types';
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

const EMPTY: AdminUserPayload = {
  email: '',
  password: '',
  full_name: '',
  is_active: true,
  is_superuser: false,
};

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const { t } = useShop();
  const [items, setItems] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetchAdminUsers(token);
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
      await deleteAdminUser(token, id);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
          {t('admin.users')}
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
          {items.map((u) => (
            <li
              key={u.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{u.email}</div>
                {u.full_name && (
                  <div className="truncate text-xs text-muted-foreground">
                    {u.full_name}
                  </div>
                )}
              </div>
              {u.is_superuser && (
                <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs text-warning">
                  {t('admin.field.superuser')}
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${u.is_active ? 'bg-[var(--primary-soft)] text-primary' : 'bg-[var(--button-neutral-bg)] text-muted-foreground'}`}
              >
                {u.is_active ? t('admin.field.active') : '—'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditing(u)}
                aria-label={t('admin.action.edit')}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void onDelete(u.id)}
                disabled={u.id === currentUser?.id}
                aria-label={t('admin.action.delete')}
                className="text-destructive hover:bg-destructive-soft disabled:text-muted-foreground"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <UserForm
        open={creating || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
        initial={editing}
        onSubmit={async (payload) => {
          if (!token) return;
          if (editing) {
            const stripped: Partial<AdminUserPayload> = { ...payload };
            if (!payload.password) delete stripped.password;
            await updateAdminUser(token, editing.id, stripped);
          } else {
            await createAdminUser(token, payload);
          }
          await reload();
          setEditing(null);
          setCreating(false);
        }}
      />
    </>
  );
}

function UserForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: AuthUser | null;
  onSubmit: (p: AdminUserPayload) => Promise<void>;
}) {
  const { t } = useShop();
  const [form, setForm] = useState<AdminUserPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        email: initial.email,
        password: '',
        full_name: initial.full_name ?? '',
        is_active: initial.is_active,
        is_superuser: initial.is_superuser,
      });
    } else {
      setForm(EMPTY);
    }
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
            {t('admin.users')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <Field htmlFor="u_email" label={t('profile.email')}>
            <Input
              id="u_email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field htmlFor="u_full_name" label={t('profile.fullName')}>
            <Input
              id="u_full_name"
              value={form.full_name ?? ''}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </Field>
          <Field
            htmlFor="u_password"
            label={initial ? `${t('profile.newPassword')} (optional)` : t('auth.password')}
          >
            <Input
              id="u_password"
              type="password"
              value={form.password ?? ''}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_superuser}
              onChange={(e) =>
                setForm({ ...form, is_superuser: e.target.checked })
              }
            />
            {t('admin.field.superuser')}
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
