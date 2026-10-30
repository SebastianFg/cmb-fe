import { screen, waitFor } from '@testing-library/react';
import { envConfig } from '@/config/env-config';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import { startGoogleLogin } from '@/modules/auth/services/auth.service';
import { canRoleOpenPath } from '@/router/landing-path';
import { renderWithProviders } from '../../../../tests/test-utils';
import LoginPage from './login-page';

jest.mock('sonner');
jest.mock('@/modules/auth/services/auth.service', () => ({
  ...jest.requireActual('@/modules/auth/services/auth.service'),
  startGoogleLogin: jest.fn(),
}));

const mockedStartGoogleLogin = jest.mocked(startGoogleLogin);

const fillCredentials = async (
  user: ReturnType<typeof renderWithProviders>['user'],
  { email, password }: { email: string; password: string },
) => {
  await user.type(screen.getByLabelText('Correo electrónico'), email);
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByLabelText('No soy un robot'));
};

describe('login page', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  test('renders the brand panel and the credentials form', () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: 'Gestión de turnos del centro' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Mantener la sesión')).not.toBeChecked();
    expect(screen.getByRole('link', { name: 'Registrarme' })).toHaveAttribute(
      'href',
      '/registro',
    );
  });

  test('blocks submission and reports every missing field', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(
      await screen.findByText('Ingresá tu correo electrónico.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ingresá tu contraseña.')).toBeInTheDocument();
    expect(
      screen.getByText('Confirmá que no sos un robot.'),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  test('rejects a malformed email', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    await fillCredentials(user, {
      email: 'no-es-un-mail',
      password: 'turnos2026',
    });
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(
      await screen.findByText('Ingresá un correo electrónico válido.'),
    ).toBeInTheDocument();
  });

  test('toggles password visibility without losing the typed value', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    const password = screen.getByLabelText('Contraseña');
    await user.type(password, 'turnos2026');
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar' }));

    expect(password).toHaveAttribute('type', 'text');
    expect(password).toHaveValue('turnos2026');
  });

  test('opens a session for a prototype account', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    await fillCredentials(user, {
      email: 'recepcion@cmbelgrano.com.ar',
      password: 'turnos2026',
    });
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(useAuthStore.getState().user?.role).toBe('reception');
    });
    expect(useAuthStore.getState().token).toContain('prototype.reception');
  });

  test('reports invalid credentials without opening a session', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    await fillCredentials(user, {
      email: 'recepcion@cmbelgrano.com.ar',
      password: 'incorrecta',
    });
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El correo o la contraseña no son correctos.',
    );
    expect(useAuthStore.getState().token).toBeNull();
  });

  test('hands the Google action to the backend', async () => {
    const { user } = renderWithProviders(<LoginPage />);

    await user.click(
      screen.getByRole('button', { name: 'Continuar con Google' }),
    );

    expect(mockedStartGoogleLogin).toHaveBeenCalledTimes(1);
  });

  test('lists the prototype accounts', () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.getByText('Cuentas de prueba del prototipo'),
    ).toBeInTheDocument();
    expect(screen.getByText('admin@cmbelgrano.com.ar')).toBeInTheDocument();
    expect(screen.getByText('paguirre@cmbelgrano.com.ar')).toBeInTheDocument();
  });
});

describe('login page against the API', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    envConfig.VITE_AUTH_MODE = 'sanctum';
  });

  afterEach(() => {
    envConfig.VITE_AUTH_MODE = 'prototype';
  });

  test('hides the prototype accounts, which do not exist in the API', () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.queryByText('Cuentas de prueba del prototipo'),
    ).not.toBeInTheDocument();
  });
});

describe('destino después de iniciar sesión', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  const loginAs = async (
    user: ReturnType<typeof renderWithProviders>['user'],
    email: string,
  ) => {
    await user.type(screen.getByLabelText('Correo electrónico'), email);
    await user.type(screen.getByLabelText('Contraseña'), 'turnos2026');
    await user.click(screen.getByLabelText('No soy un robot'));
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  };

  const renderWithIntendedPath = (pathname: string) =>
    renderWithProviders(<LoginPage />, {
      initialEntries: [{ pathname: '/login', state: { from: { pathname } } }],
    });

  test('vuelve a la pantalla que la persona quiso abrir', async () => {
    const { user } = renderWithIntendedPath('/panel');

    await loginAs(user, 'recepcion@cmbelgrano.com.ar');

    await waitFor(() => {
      expect(useAuthStore.getState().user?.role).toBe('reception');
    });
  });

  test('ignora una pantalla que no le corresponde al rol', async () => {
    const { user } = renderWithIntendedPath('/mis-turnos');

    await loginAs(user, 'recepcion@cmbelgrano.com.ar');

    await waitFor(() => {
      expect(useAuthStore.getState().token).not.toBeNull();
    });
    expect(canRoleOpenPath('reception', '/mis-turnos')).toBe(false);
  });
});
