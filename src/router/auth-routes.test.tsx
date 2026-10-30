import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { useHydration } from '@/modules/auth/hooks/use-hydration';
import { publicRoutes } from './auth-routes';

jest.mock('@/modules/auth/hooks/use-hydration');
jest.mock('@/modules/auth/pages/login-page', () => ({
  __esModule: true,
  default: () => <h1>Página de acceso</h1>,
}));

const mockedUseHydration = jest.mocked(useHydration);

const AuthRoutes = () => useRoutes(publicRoutes);

describe('authRoutes', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    mockedUseHydration.mockReturnValue(true);
  });

  test('exposes the public paths of the center', () => {
    expect(publicRoutes.map((route) => route.path)).toEqual([
      '/',
      '/login',
      '/registro',
    ]);
  });

  test('maps the public login path to the login page', async () => {
    render(
      <Suspense fallback={<div role="status">Cargando ruta</div>}>
        <MemoryRouter initialEntries={['/login']}>
          <AuthRoutes />
        </MemoryRouter>
      </Suspense>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Página de acceso' }),
    ).toBeInTheDocument();
  });
});
