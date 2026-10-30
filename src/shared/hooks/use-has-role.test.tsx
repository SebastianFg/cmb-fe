import { renderHook } from '@testing-library/react';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import type { AppRole } from '@/shared/constants/roles';
import { useHasRole } from './use-has-role';

const userWithRole = (role: AppRole): AuthUser => ({
  id: 1,
  name: 'Tester',
  shortName: 'Tester',
  email: 'tester@cmbelgrano.com.ar',
  role,
});

describe('useHasRole', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  test('is false without a session', () => {
    expect(renderHook(() => useHasRole('admin')).result.current).toBe(false);
  });

  test('accepts a single role', () => {
    useAuthStore.getState().setSession({ user: userWithRole('professional') });

    expect(renderHook(() => useHasRole('professional')).result.current).toBe(
      true,
    );
    expect(renderHook(() => useHasRole('admin')).result.current).toBe(false);
  });

  test('accepts any role of the list', () => {
    useAuthStore.getState().setSession({ user: userWithRole('reception') });

    expect(
      renderHook(() => useHasRole(['admin', 'reception'])).result.current,
    ).toBe(true);
    expect(
      renderHook(() => useHasRole(['admin', 'professional'])).result.current,
    ).toBe(false);
  });
});
