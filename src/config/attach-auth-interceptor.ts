import type { AxiosError, AxiosInstance } from 'axios';
import { queryClient } from '@/config/query-client';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';

type AuthInterceptorOptions = {
  redirectToLogin?: () => void;
};

/**
 * Los tokens personales de Sanctum no se renuevan: si el servidor contesta
 * 401 el token dejó de valer y la única salida es volver a iniciar sesión.
 */
export const attachAuthInterceptors = (
  instance: AxiosInstance,
  options: AuthInterceptorOptions = {},
): AxiosInstance => {
  const redirectToLogin =
    options.redirectToLogin ?? (() => window.location.replace('/login'));

  instance.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();

    config.headers = config.headers ?? {};
    config.headers.Accept = 'application/json';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const { token, logout } = useAuthStore.getState();

      if (error.response?.status === 401 && token) {
        logout();
        queryClient.clear();
        redirectToLogin();
      }

      return Promise.reject(error);
    },
  );

  return instance;
};
