import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { useHydration } from '@/modules/auth/hooks/use-hydration';
import PrivateRoute from './private-route';

jest.mock('@/modules/auth/hooks/use-hydration');
jest.mock('@/shared/components/spinner/spinner', () => ({
  __esModule: true,
  default: () => <div role="status">Cargando sesión</div>,
}));

const mockedUseHydration = jest.mocked(useHydration);

const LoginDestination = () => {
  const location = useLocation();

  return (
    <main>
      <h1>Acceso</h1>
      <output data-testid="redirect-state">
        {JSON.stringify(location.state)}
      </output>
    </main>
  );
};

const renderPrivateRoute = (entry = '/protected') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <PrivateRoute>
              <h1>Contenido privado</h1>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<LoginDestination />} />
      </Routes>
    </MemoryRouter>,
  );

describe('PrivateRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    mockedUseHydration.mockReturnValue(true);
  });

  test('shows a hydration spinner before evaluating authentication', () => {
    mockedUseHydration.mockReturnValue(false);

    renderPrivateRoute();

    expect(screen.getByRole('status')).toHaveTextContent('Cargando sesión');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  test('renders the protected child for an authenticated session', () => {
    useAuthStore.getState().setSession({ token: 'access-token' });

    renderPrivateRoute();

    expect(
      screen.getByRole('heading', { name: 'Contenido privado' }),
    ).toBeInTheDocument();
  });

  test('redirects an unauthenticated session to login with the intended location', () => {
    renderPrivateRoute('/protected?tab=details#summary');

    expect(screen.getByRole('heading', { name: 'Acceso' })).toBeInTheDocument();
    const redirectState = screen.getByTestId('redirect-state');
    expect(redirectState).toHaveTextContent('"pathname":"/protected"');
    expect(redirectState).toHaveTextContent('"search":"?tab=details"');
    expect(redirectState).toHaveTextContent('"hash":"#summary"');
  });
});
