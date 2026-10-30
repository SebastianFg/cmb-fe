import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { useHydration } from '@/modules/auth/hooks/use-hydration';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { routes } from './index';

jest.mock('@/modules/auth/hooks/use-hydration');
jest.mock('@/modules/auth/pages/login-page', () => ({
  __esModule: true,
  default: () => <h1>Acceso público</h1>,
}));
jest.mock('@/modules/dashboard/pages/panel-page', () => ({
  __esModule: true,
  default: () => <h1>Panel principal</h1>,
}));
jest.mock('@/modules/home/pages/session-summary-page', () => ({
  __esModule: true,
  default: () => <h1>Mis turnos</h1>,
}));
jest.mock('@/shared/layouts', () => {
  const routerDom =
    jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    __esModule: true,
    default: () => (
      <main>
        <p>Layout principal</p>
        <routerDom.Outlet />
      </main>
    ),
  };
});

const mockedUseHydration = jest.mocked(useHydration);

const adminUser: AuthUser = {
  id: 1,
  name: 'Roberto Fernandes',
  shortName: 'R. Fernandes',
  email: 'admin@cmbelgrano.com.ar',
  role: 'admin',
};

const AppRoutes = () => useRoutes(routes);

const renderAppPath = (path: string) =>
  render(
    <Suspense fallback={<div role="status">Cargando aplicación</div>}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </Suspense>,
  );

describe('application router composition', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    mockedUseHydration.mockReturnValue(true);
  });

  test('keeps the login outside the protected layout', async () => {
    renderAppPath('/login');

    expect(
      await screen.findByRole('heading', { name: 'Acceso público' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Layout principal')).not.toBeInTheDocument();
  });

  test('composes authenticated screens inside the layout', async () => {
    useAuthStore.getState().setSession({ token: 'tok', user: adminUser });

    renderAppPath('/panel');

    expect(await screen.findByText('Layout principal')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Panel principal' }),
    ).toBeInTheDocument();
  });

  test('renders the wildcard page inside the authenticated layout', async () => {
    useAuthStore.getState().setSession({ token: 'tok', user: adminUser });

    renderAppPath('/ruta-que-no-existe');

    expect(await screen.findByText('Layout principal')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
