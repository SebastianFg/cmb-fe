import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { useHydration } from '@/modules/auth/hooks/use-hydration';
import PublicRoute from './public-route';

jest.mock('@/modules/auth/hooks/use-hydration');
jest.mock('@/shared/components/spinner/spinner', () => ({
  __esModule: true,
  default: () => <div role="status">Cargando sesión</div>,
}));

const mockedUseHydration = jest.mocked(useHydration);

const renderPublicRoute = (entry = '/login') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path={entry}
          element={
            <PublicRoute>
              <h1>Contenido público</h1>
            </PublicRoute>
          }
        />
        <Route path="/panel" element={<h1>Panel</h1>} />
        <Route path="/mis-turnos" element={<h1>Mis turnos</h1>} />
      </Routes>
    </MemoryRouter>,
  );

describe('PublicRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    mockedUseHydration.mockReturnValue(true);
  });

  test('shows a hydration spinner before evaluating authentication', () => {
    mockedUseHydration.mockReturnValue(false);

    renderPublicRoute();

    expect(screen.getByRole('status')).toHaveTextContent('Cargando sesión');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  test('renders the public child for an unauthenticated session', () => {
    renderPublicRoute();

    expect(
      screen.getByRole('heading', { name: 'Contenido público' }),
    ).toBeInTheDocument();
  });

  test('sends an authenticated session to the screen of its role', () => {
    useAuthStore.getState().setSession({
      token: 'access-token',
      user: {
        id: 1,
        name: 'Paciente',
        shortName: 'Paciente',
        email: 'patient@example.com',
        role: 'patient',
      },
    });

    renderPublicRoute();

    expect(
      screen.getByRole('heading', { name: 'Mis turnos' }),
    ).toBeInTheDocument();
  });

  test('also guards the registration screen', () => {
    useAuthStore.getState().setSession({ token: 'access-token' });

    renderPublicRoute('/registro');

    expect(screen.getByRole('heading', { name: 'Panel' })).toBeInTheDocument();
  });
});
