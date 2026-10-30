import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { MemoryRouter, useLocation, useRoutes } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { AppRoutesWithRoles } from './nav-items';
import { dashboardRoutes } from './routes';

jest.mock('@/modules/dashboard/pages/panel-page', () => ({
  __esModule: true,
  default: () => <h1>Panel principal</h1>,
}));
jest.mock('@/modules/home/pages/session-summary-page', () => ({
  __esModule: true,
  default: () => <h1>Mis turnos</h1>,
}));

const userWithRole = (role: AuthUser['role']): AuthUser => ({
  id: 1,
  name: 'Tester',
  shortName: 'Tester',
  email: 'tester@cmbelgrano.com.ar',
  role,
});

const DashboardRoutes = () => useRoutes(dashboardRoutes);

const LocationProbe = () => {
  const location = useLocation();

  return <output data-testid="pathname">{location.pathname}</output>;
};

const renderDashboardPath = (path: string) =>
  render(
    <Suspense fallback={<div role="status">Cargando ruta</div>}>
      <MemoryRouter initialEntries={[path]}>
        <DashboardRoutes />
        <LocationProbe />
      </MemoryRouter>
    </Suspense>,
  );

const currentPath = () => screen.getByTestId('pathname').textContent;

describe('dashboardRoutes', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  test('declares a route for every navigable item', () => {
    const routePaths = dashboardRoutes.map((route) => route.path);

    for (const item of AppRoutesWithRoles) {
      expect(routePaths).toContain(item.path);
    }
  });

  test('renders the page for an allowed role', async () => {
    useAuthStore.getState().setSession({
      token: 'tok',
      user: userWithRole('reception'),
    });

    renderDashboardPath('/panel');

    expect(
      await screen.findByRole('heading', { name: 'Panel principal' }),
    ).toBeInTheDocument();
  });

  test('sends the patient back to its own screen instead of a 404', async () => {
    useAuthStore.getState().setSession({
      token: 'tok',
      user: userWithRole('patient'),
    });

    renderDashboardPath('/panel');

    expect(
      await screen.findByRole('heading', { name: 'Mis turnos' }),
    ).toBeInTheDocument();
    expect(currentPath()).toBe('/mis-turnos');
  });

  test('sends staff back to its own screen instead of a 404', async () => {
    useAuthStore.getState().setSession({
      token: 'tok',
      user: userWithRole('admin'),
    });

    renderDashboardPath('/mis-turnos');

    expect(
      await screen.findByRole('heading', { name: 'Panel principal' }),
    ).toBeInTheDocument();
    expect(currentPath()).toBe('/panel');
  });
});
