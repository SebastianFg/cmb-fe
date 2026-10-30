import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { queryClient } from '@/config/query-client';
import { signOut } from '@/modules/auth/services/auth.service';
import { useAuthStore } from './use-auth-store';

type UseLogoutOptions = {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
  silent?: boolean;
};

export const useLogout = (opts: UseLogoutOptions = {}) => {
  const { redirectTo = '/login', onSuccess, onError, silent = false } = opts;

  const navigate = useNavigate();
  const logoutLocal = useAuthStore((state) => state.logout);

  const purgeAuthStorage = async () => {
    logoutLocal();
    await useAuthStore.persist?.clearStorage?.();
    await useAuthStore.persist?.rehydrate?.();
    queryClient.clear();
  };

  const mutation = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      await purgeAuthStorage();
      if (!silent) toast.success('Sesión cerrada correctamente.');
      onSuccess?.();
      navigate(redirectTo, { replace: true });
    },
    onError: async (err) => {
      // El token puede haber expirado en el servidor: la sesión se cierra igual.
      await purgeAuthStorage();
      if (!silent) toast.warning('Ocurrió un problema al cerrar sesión.');
      onError?.(err);
      navigate(redirectTo, { replace: true });
    },
  });

  return {
    logout: () => mutation.mutate(),
    logoutAsync: () => mutation.mutateAsync(),
    isLoggingOut: mutation.isPending,
  };
};
