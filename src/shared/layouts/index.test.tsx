import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { renderWithProviders } from '../../../tests/test-utils';
import Layout from './index';

jest.mock('@/shared/components/footer/footer', () => ({
  __esModule: true,
  default: () => <footer>Pie</footer>,
}));

const userWithRole = (role: AuthUser['role']): AuthUser => ({
  id: 1,
  name: 'Claudia Molina',
  shortName: 'C. Molina',
  email: 'recepcion@cmbelgrano.com.ar',
  role,
});

const renderLayoutAt = (pathname: string) =>
  renderWithProviders(
    <Routes>
      <Route element={<Layout />}>
        <Route path={pathname} element={<h2>Página enrutada</h2>} />
      </Route>
    </Routes>,
    { initialEntries: [pathname] },
  );

describe('Layout', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  test('da al personal la cáscara con barra lateral', () => {
    useAuthStore.getState().setSession({ user: userWithRole('reception') });

    renderLayoutAt('/panel');

    expect(
      screen.getByRole('navigation', { name: 'Navegación del back-office' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Panel' })).toBeInTheDocument();
    expect(screen.getByText('Página enrutada')).toBeInTheDocument();
    expect(screen.getByText('Pie')).toBeInTheDocument();
  });

  test('da al paciente la cáscara del portal', () => {
    useAuthStore.getState().setSession({ user: userWithRole('patient') });

    renderLayoutAt('/mis-turnos');

    expect(
      screen.getByRole('navigation', { name: 'Secciones del portal' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Navegación del back-office' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Página enrutada')).toBeInTheDocument();
  });

  test('la barra lateral sólo lista las pantallas del rol', () => {
    useAuthStore.getState().setSession({ user: userWithRole('professional') });

    renderLayoutAt('/agenda');

    expect(screen.getByRole('link', { name: 'Panel' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Agenda médica' }),
    ).toBeInTheDocument();
    // Cargar turnos y pacientes es de mostrador, no del profesional.
    expect(
      screen.queryByRole('link', { name: 'Turnos' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Pacientes' }),
    ).not.toBeInTheDocument();
  });

  test('muestra la cuenta y el rol en la barra lateral', () => {
    useAuthStore.getState().setSession({ user: userWithRole('admin') });

    renderLayoutAt('/panel');

    expect(screen.getByText('C. Molina')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
  });
});
