import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { type AppRole, normalizeRole } from '@/shared/constants/roles';

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (sessionData: Partial<AuthState>) => void;
  clearSession: () => void;
  logout: () => void;
  getRole: () => AppRole | null;
};

const emptySessionState = {
  token: null,
  user: null,
} satisfies Omit<
  AuthState,
  'setSession' | 'clearSession' | 'logout' | 'getRole'
>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...emptySessionState,

      setSession: (data) => set((state) => ({ ...state, ...data })),

      clearSession: () => set(emptySessionState),

      logout: () => set(emptySessionState),

      getRole: () => normalizeRole(get().user?.role),
    }),
    { name: 'auth-storage' },
  ),
);
