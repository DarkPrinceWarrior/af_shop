import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save, Send } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import {
  ApiError,
  fetchTelegramSettings,
  testTelegramSettings,
  updateTelegramSettings,
} from '@/api/client';
import type { AdminTelegramSettings } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminTelegram() {
  const { token } = useAuth();
  const { t } = useShop();
  const [settings, setSettings] = useState<AdminTelegramSettings | null>(null);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchTelegramSettings(token)
      .then((s) => {
        setSettings(s);
        setBotToken(s.bot_token ?? '');
        setChatId(s.owner_chat_id ?? '');
        setEnabled(s.enabled);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
        setLoading(false);
      });
  }, [token]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateTelegramSettings(token, {
        enabled,
        owner_chat_id: chatId.trim() || null,
        ...(botToken.trim() ? { bot_token: botToken.trim() } : {}),
      });
      setSettings(updated);
      setBotToken(updated.bot_token ?? '');
      setChatId(updated.owner_chat_id ?? '');
      setEnabled(updated.enabled);
      setNotice(t('admin.telegram.savedOk'));
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!token) return;
    setTesting(true);
    setError(null);
    setNotice(null);
    try {
      await testTelegramSettings(token);
      setNotice(t('admin.telegram.testOk'));
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('admin.telegram.title')}
      </h1>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" /> {t('common.loading')}
        </div>
      )}

      {!loading && (
        <div className="flex max-w-xl flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="m-0 text-sm text-muted-foreground">{t('admin.telegram.hint')}</p>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
              settings?.configured
                ? 'bg-[var(--primary-soft)] text-primary'
                : 'bg-[var(--button-neutral-bg)] text-muted-foreground'
            }`}
          >
            {settings?.configured
              ? `${t('admin.telegram.statusConfigured')} · ${settings.source}`
              : t('admin.telegram.statusMissing')}
          </span>

          <div className="flex flex-col gap-1">
            <Label htmlFor="tg_token" className="text-muted-foreground">
              {t('admin.telegram.botToken')}
            </Label>
            <Input
              id="tg_token"
              type="password"
              autoComplete="off"
              value={botToken}
              placeholder={t('admin.telegram.tokenPlaceholder')}
              onChange={(e) => setBotToken(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="tg_chat" className="text-muted-foreground">
              {t('admin.telegram.chatId')}
            </Label>
            <Input
              id="tg_chat"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            {t('admin.telegram.enabled')}
          </label>

          {error && (
            <div className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {notice && (
            <div className="flex items-center gap-2 rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-sm text-primary">
              <CheckCircle2 className="size-4" /> {notice}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-full"
            >
              <Save className="size-4" /> {t('admin.action.save')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void sendTest()}
              disabled={testing || !settings?.configured}
              className="rounded-full"
            >
              <Send className="size-4" /> {t('admin.telegram.test')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
