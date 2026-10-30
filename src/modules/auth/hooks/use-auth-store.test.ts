import type { AuthUser } from '@/modules/auth/types/auth.types';
import { useAuthStore } from './use-auth-store';

const adminUser: AuthUser = {
  id: 1,
  name: 'Roberto Fernandes',
  shortName: 'R. Fernandes',
  email: 'admin@cmbelgrano.com.ar',
  role: 'admin',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  test('starts empty', () => {
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().getRole()).toBeNull();
  });

  test('stores a session and exposes the normalized role', () => {
    useAuthStore.getState().setSession({ token: 'tok', user: adminUser });

    expect(useAuthStore.getState().token).toBe('tok');
    expect(useAuthStore.getState().user).toEqual(adminUser);
    expect(useAuthStore.getState().getRole()).toBe('admin');
  });

  test('keeps untouched fields on a partial update', () => {
    useAuthStore.getState().setSession({ token: 'tok', user: adminUser });
    useAuthStore.getState().setSession({ token: 'rotated' });

    expect(useAuthStore.getState().token).toBe('rotated');
    expect(useAuthStore.getState().user).toEqual(adminUser);
  });

  test('reports no role when the stored value is unknown', () => {
    useAuthStore.getState().setSession({
      token: 'tok',
      user: { ...adminUser, role: 'wizard' as AuthUser['role'] },
    });

    expect(useAuthStore.getState().getRole()).toBeNull();
  });

  test.each(['clearSession', 'logout'] as const)(
    '%s empties the session',
    (method) => {
      useAuthStore.getState().setSession({ token: 'tok', user: adminUser });

      useAuthStore.getState()[method]();

      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    },
  );
});
