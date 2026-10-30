import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { queryClient } from '@/config/query-client';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { signOut } from '@/modules/auth/services/auth.service';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { createWrapper } from '../../../../tests/test-utils';
import { useLogout } from './use-logout';

jest.mock('sonner');
jest.mock('@/modules/auth/services/auth.service');

const mockedSignOut = jest.mocked(signOut);
const mockedToast = jest.mocked(toast);

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const user: AuthUser = {
  id: 1,
  name: 'Roberto Fernandes',
  shortName: 'R. Fernandes',
  email: 'admin@cmbelgrano.com.ar',
  role: 'admin',
};

const renderUseLogout = (options?: Parameters<typeof useLogout>[0]) =>
  renderHook(() => useLogout(options), { wrapper: createWrapper() });

describe('useLogout', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession({ token: 'sanctum-token', user });
  });

  test('revokes the token, empties the session and redirects', async () => {
    mockedSignOut.mockResolvedValue();
    const clearQueries = jest.spyOn(queryClient, 'clear');
    const { result } = renderUseLogout();

    result.current.logout();

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
    });
    expect(useAuthStore.getState().user).toBeNull();
    expect(clearQueries).toHaveBeenCalled();
    expect(mockedToast.success).toHaveBeenCalledWith(
      'Sesión cerrada correctamente.',
    );
    expect(mockedNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  test('closes the session locally even if the server call fails', async () => {
    mockedSignOut.mockRejectedValue(new Error('network'));
    const { result } = renderUseLogout();

    result.current.logout();

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
    });
    expect(mockedToast.warning).toHaveBeenCalledWith(
      'Ocurrió un problema al cerrar sesión.',
    );
    expect(mockedNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  test('stays quiet and honours a custom destination when asked', async () => {
    mockedSignOut.mockResolvedValue();
    const { result } = renderUseLogout({ redirectTo: '/', silent: true });

    result.current.logout();

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
    expect(mockedToast.success).not.toHaveBeenCalled();
  });
});
