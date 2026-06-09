import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { AuthPanel } from '@/components/features/auth/AuthPanel';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from;

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from && from !== '/login' ? from : '/account', { replace: true });
    }
  }, [isAuthenticated, user, from, navigate]);

  return (
    <div className="col-span-full mx-auto flex w-full max-w-[480px] flex-col gap-4">
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('auth.loginTitle')}
      </h1>
      <AuthPanel hideGuest />
    </div>
  );
}
