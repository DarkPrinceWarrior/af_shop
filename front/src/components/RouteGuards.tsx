import { type ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { Button } from '@/components/ui/button';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <CenteredSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

export function RequireSuperuser({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const { t } = useShop();
  if (loading) return <CenteredSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!user?.is_superuser) {
    return (
      <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center">
        <p className="m-0 mb-4 font-display text-lg font-medium tracking-tight">
          {t('admin.accessDenied')}
        </p>
        <Button asChild className="rounded-full" variant="secondary">
          <Link to="/">{t('admin.backHome')}</Link>
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}

function CenteredSpinner() {
  return (
    <div className="col-span-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground">
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
    </div>
  );
}
