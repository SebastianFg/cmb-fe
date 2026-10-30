import { screen, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import {
  resetPrototypeStore,
  updatePatient,
} from '@/prototype/prototype-store';
import { renderWithProviders } from '../../../../tests/test-utils';
import PortalBookingPage from './portal-booking-page';

type User = ReturnType<typeof renderWithProviders>['user'];

const SPECIALTY = 'Clínica médica';

/** La sesión del portal es la del paciente 1 del prototipo. */
const signInAsPatient = () => {
  useAuthStore.getState().setSession({
    token: 'tok',
    user: {
      id: 1,
      name: 'Marta Elena Ferreyra',
      shortName: 'M. Ferreyra',
      email: 'marta.ferreyra@correo.com',
      role: 'patient',
    },
  });
};

const chooseSpecialty = async (user: User) => {
  await screen.findByRole('option', { name: SPECIALTY });
  await user.selectOptions(screen.getByLabelText(/^Especialidad/), SPECIALTY);
};

const freeSlots = () =>
  screen
    .getAllByRole('radio')
    .filter((radio) => !(radio as HTMLInputElement).disabled);

describe('autogestión de turnos del paciente', () => {
  beforeEach(() => {
    resetPrototypeStore();
    signInAsPatient();
  });

  test('no pide elegir paciente: el turno es para la sesión', async () => {
    renderWithProviders(<PortalBookingPage />);

    expect(
      screen.getByRole('heading', { name: 'Sacar turno' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Buscar por documento/),
    ).not.toBeInTheDocument();
  });

  test('la tira de días marca el primero con turnos libres', async () => {
    const { user } = renderWithProviders(<PortalBookingPage />);

    await chooseSpecialty(user);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { pressed: true }).length,
      ).toBeGreaterThan(0);
    });
    expect(screen.getByText(/turnos? libres?$/)).toBeInTheDocument();
  });

  test('reserva y muestra el comprobante', async () => {
    const { user } = renderWithProviders(<PortalBookingPage />);

    await chooseSpecialty(user);
    await waitFor(() => {
      expect(freeSlots().length).toBeGreaterThan(0);
    });
    await user.click(freeSlots()[0]);
    await user.click(screen.getByRole('button', { name: 'Confirmar turno' }));

    expect(
      await screen.findByRole('heading', { name: 'Turno reservado' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^TRN-/)).toBeInTheDocument();
  });

  test('una penalización vigente frena la autogestión', async () => {
    const year = new Date().getFullYear() + 1;
    updatePatient(1, { blocked_until: `${year}-12-31` });

    const { user } = renderWithProviders(<PortalBookingPage />);

    await chooseSpecialty(user);
    await waitFor(() => {
      expect(freeSlots().length).toBeGreaterThan(0);
    });
    await user.click(freeSlots()[0]);
    await user.click(screen.getByRole('button', { name: 'Confirmar turno' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'Tu cuenta tiene una penalización hasta el',
    );
    expect(alert).toHaveTextContent('podés sacar turno llamando al centro');
  });

  test('pide la especialidad y la franja antes de confirmar', async () => {
    const { user } = renderWithProviders(<PortalBookingPage />);

    await user.click(screen.getByRole('button', { name: 'Confirmar turno' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Elegí la especialidad.');
    expect(alert).toHaveTextContent('Elegí una franja disponible.');
  });
});
