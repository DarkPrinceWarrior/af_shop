import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useShop } from '@/state/useShop';
import { ApiError, requestPasswordRecovery } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const { t } = useShop();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordRecovery(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="col-span-full mx-auto flex w-full max-w-[480px] flex-col gap-4">
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('auth.forgotTitle')}
      </h1>
      {sent ? (
        <div className="rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-sm text-primary">
          {t('auth.recoverySent')}
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="m-0 text-sm text-muted-foreground">{t('auth.forgotHint')}</p>
          <div className="flex flex-col gap-1">
            <Label htmlFor="fp_email">{t('auth.email')}</Label>
            <Input
              id="fp_email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            disabled={submitting || !email.trim()}
            className="rounded-full"
          >
            {t('auth.sendResetLink')}
          </Button>
        </form>
      )}
      <Link
        to="/login"
        className="self-center text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {t('auth.backToLogin')}
      </Link>
    </div>
  );
}
