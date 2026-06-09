import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useShop } from '@/state/useShop';
import { ApiError, resetPassword } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordPage() {
  const { t } = useShop();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="col-span-full mx-auto flex w-full max-w-[480px] flex-col gap-4">
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('auth.resetTitle')}
      </h1>
      {!token ? (
        <>
          <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
            {t('auth.resetInvalid')}
          </div>
          <Link
            to="/forgot-password"
            className="self-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('auth.forgotTitle')}
          </Link>
        </>
      ) : done ? (
        <>
          <div className="rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-sm text-primary">
            {t('auth.resetDone')}
          </div>
          <Link
            to="/login"
            className="self-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('auth.backToLogin')}
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="rp_password">{t('auth.password')}</Label>
            <Input
              id="rp_password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={submitting || password.length < 8}
            className="rounded-full"
          >
            {t('auth.resetSubmit')}
          </Button>
        </form>
      )}
    </div>
  );
}
