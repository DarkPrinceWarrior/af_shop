import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import {
  ApiError,
  fetchCurrentUser,
  updateCurrentPassword,
  updateCurrentUser,
} from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountProfile() {
  const { token, user, logout } = useAuth();
  const { t } = useShop();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email);
    setFullName(user.full_name ?? '');
  }, [user]);

  if (!user || !token) return null;

  const saveProfile = async () => {
    setProfileMsg(null);
    setProfileErr(null);
    setProfileSubmitting(true);
    try {
      await updateCurrentUser(token, {
        email: email.trim(),
        full_name: fullName.trim() || null,
      });
      // refresh user state implicitly: re-fetch
      await fetchCurrentUser(token);
      setProfileMsg(t('profile.savedOk'));
    } catch (err) {
      setProfileErr(
        err instanceof ApiError || err instanceof Error ? err.message : 'Failed',
      );
    } finally {
      setProfileSubmitting(false);
    }
  };

  const savePassword = async () => {
    setPwMsg(null);
    setPwErr(null);
    setPwSubmitting(true);
    try {
      await updateCurrentPassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwMsg(t('profile.passwordOk'));
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwErr(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('account.profile')}
      </h1>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3">
          <Field htmlFor="profile_email" label={t('profile.email')}>
            <Input
              id="profile_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field htmlFor="profile_full_name" label={t('profile.fullName')}>
            <Input
              id="profile_full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </Field>
          {profileErr && (
            <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
              {profileErr}
            </div>
          )}
          {profileMsg && (
            <div className="rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-sm text-primary">
              {profileMsg}
            </div>
          )}
          <Button
            type="button"
            onClick={saveProfile}
            disabled={profileSubmitting}
            className="self-start rounded-full"
          >
            {t('profile.save')}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="m-0 mb-3 font-display text-lg font-medium tracking-tight">
          {t('profile.changePassword')}
        </h2>
        <div className="flex flex-col gap-3">
          <Field htmlFor="cur_pw" label={t('profile.currentPassword')}>
            <Input
              id="cur_pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Field htmlFor="new_pw" label={t('profile.newPassword')}>
            <Input
              id="new_pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          </Field>
          {pwErr && (
            <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
              {pwErr}
            </div>
          )}
          {pwMsg && (
            <div className="rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-sm text-primary">
              {pwMsg}
            </div>
          )}
          <Button
            type="button"
            onClick={savePassword}
            disabled={pwSubmitting || !currentPassword || !newPassword}
            className="self-start rounded-full"
          >
            {t('profile.changePassword')}
          </Button>
        </div>
      </section>

      <Button
        type="button"
        variant="secondary"
        onClick={logout}
        className="self-start rounded-full"
      >
        <LogOut aria-hidden="true" className="size-4" />
        {t('auth.logout')}
      </Button>
    </>
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
