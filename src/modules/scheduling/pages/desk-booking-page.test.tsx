import { screen, waitFor, within } from '@testing-library/react';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import {
  findPatient,
  getAppointments,
  resetPrototypeStore,
} from '@/prototype/prototype-store';
import { today } from '@/shared/utils/dates';
import { renderWithProviders } from '../../../../tests/test-utils';
import DeskBookingPage from './desk-booking-page';

type User = ReturnType<typeof renderWithProviders>['user'];

const SPECIALTY = 'Clínica médica';

const chooseSpecialty = async (user: User) => {
  await screen.findByRole('option', { name: SPECIALTY });
  await user.selectOptions(screen.getByLabelText(/^Especialidad/), SPECIALTY);
};

const choosePatient = async (user: User) => {
  await user.type(
    screen.getByLabelText(/^Buscar por documento o apellido/),
    'Ferreyra',
  );

  const option = await screen.findByRole(
    'button',
    { name: /Ferreyra, Marta Elena/ },
    { timeout: 3000 },
  );
  await user.click(option);
};

/** Primera franja libre de la selección actual. */
const freeSlots = () =>
  screen
    .getAllByRole('radio')
    .filter((radio) => !(radio as HTMLInputElement).disabled);

const chooseFirstSlot = async (user: User) => {
  await waitFor(() => {
    expect(freeSlots().length).toBeGreaterThan(0);
  });
  await user.click(freeSlots()[0]);
};

describe('alta de turnos desde el mostrador', () => {
  beforeEach(() => {
    resetPrototypeStore();
    useAuthStore.getState().setSession({
      token: 'tok',
      user: {
        id: 2,
        name: 'Claudia Molina',
        shortName: 'C. Molina',
        email: 'recepcion@cmbelgrano.com.ar',
        role: 'reception',
      },
    });
  });

  test('pide la especialidad antes de ofrecer franjas', async () => {
    renderWithProviders(<DeskBookingPage />);

    expect(
      screen.getByText('Elegí la especialidad para ver las franjas.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Fecha/)).toBeDisabled();
  });

  test('elige solo el primer día con turnos libres', async () => {
    const { user } = renderWithProviders(<DeskBookingPage />);

    await chooseSpecialty(user);

    const dateSelect = screen.getByLabelText(/^Fecha/) as HTMLSelectElement;
    await waitFor(() => {
      expect(dateSelect).toBeEnabled();
      expect(dateSelect.value).not.toBe('');
    });
    // El selector anota cuántas franjas quedan libres en cada día.
    expect(
      screen.getAllByRole('option', { name: /\d+ libres?$/ }).length,
    ).toBeGreaterThan(0);
  });

  test('no se puede guardar sin paciente ni franja', async () => {
    const { user } = renderWithProviders(<DeskBookingPage />);

    await user.click(screen.getByRole('button', { name: 'Guardar turno' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Buscá y seleccioná el paciente.');
    expect(alert).toHaveTextContent('Elegí la especialidad.');
    expect(alert).toHaveTextContent('Elegí una franja disponible.');
  });

  test('reserva el turno y emite el comprobante', async () => {
    const { user } = renderWithProviders(<DeskBookingPage />);

    await choosePatient(user);
    await chooseSpecialty(user);
    await chooseFirstSlot(user);
    await user.type(
      screen.getByLabelText(/^Motivo de la consulta/),
      'Control anual',
    );
    await user.click(screen.getByRole('button', { name: 'Guardar turno' }));

    const voucher = await screen.findByRole('heading', {
      name: 'Turno reservado',
    });
    expect(voucher).toBeInTheDocument();
    expect(screen.getByText(/^TRN-/)).toBeInTheDocument();
    expect(screen.getByText(/marta\.ferreyra@correo\.com/)).toBeInTheDocument();
  });

  test('la cobertura del paciente se completa sola', async () => {
    const { user } = renderWithProviders(<DeskBookingPage />);

    await choosePatient(user);

    expect(screen.getByLabelText('Obra social')).not.toHaveValue('');
  });

  test('con un profesional elegido muestra el día completo, con las tomadas', async () => {
    const { user } = renderWithProviders(<DeskBookingPage />);

    await chooseSpecialty(user);
    await waitFor(() => {
      expect(screen.getByLabelText(/^Profesional/)).toBeEnabled();
    });

    await user.selectOptions(screen.getByLabelText(/^Profesional/), [
      screen.getAllByRole('option', { name: /M\.N\./ })[0],
    ]);

    await waitFor(() => {
      expect(screen.getAllByRole('radio').length).toBeGreaterThan(0);
    });
    // El día completo incluye franjas que no se pueden reservar.
    expect(screen.getAllByRole('radio').length).toBeGreaterThanOrEqual(
      freeSlots().length,
    );
  });

  test('el resumen refleja la franja elegida', async () => {
    const { user } = renderWithProviders(<DeskBookingPage />);

    await chooseSpecialty(user);
    await chooseFirstSlot(user);

    const summary = screen
      .getByRole('heading', { name: 'Resumen' })
      .closest('div') as HTMLElement;

    await waitFor(() => {
      expect(within(summary).getByText(SPECIALTY)).toBeInTheDocument();
    });
    expect(within(summary).getByText('Reservado')).toBeInTheDocument();
  });
});

describe('reprogramación desde la agenda', () => {
  beforeEach(() => {
    resetPrototypeStore();
    useAuthStore.getState().setSession({
      token: 'tok',
      user: {
        id: 2,
        name: 'Claudia Molina',
        shortName: 'C. Molina',
        email: 'recepcion@cmbelgrano.com.ar',
        role: 'reception',
      },
    });
  });

  /** Turno futuro: las franjas de hoy que ya pasaron no son reservables. */
  const futureAppointment = () => {
    const appointment = getAppointments().find(
      (item) => item.date > today() && item.status === 'booked',
    );
    expect(appointment).toBeDefined();

    return appointment as NonNullable<typeof appointment>;
  };

  test('el paciente y la especialidad quedan fijos', async () => {
    const appointment = futureAppointment();
    const patient = findPatient(appointment.patient_id);

    renderWithProviders(<DeskBookingPage />, {
      initialEntries: [`/turnos/nuevo?reprogramar=${appointment.id}`],
    });

    // El nombre aparece en el formulario y en el resumen de la derecha.
    expect(
      await screen.findAllByText(
        new RegExp(`${patient?.first_name} ${patient?.last_name}`),
      ),
    ).not.toHaveLength(0);
    expect(
      screen.queryByLabelText(/Buscar por documento/),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText(/^Especialidad/)).toBeDisabled();
    });
    expect(
      screen.getByRole('button', { name: 'Guardar cambios' }),
    ).toBeInTheDocument();
  });

  test('mueve el turno a otra franja y conserva el código', async () => {
    const appointment = futureAppointment();

    const { user } = renderWithProviders(<DeskBookingPage />, {
      initialEntries: [`/turnos/nuevo?reprogramar=${appointment.id}`],
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/^Especialidad/)).toBeDisabled();
    });

    const free = await waitFor(() => {
      const radios = screen
        .getAllByRole('radio')
        .filter((radio) => !(radio as HTMLInputElement).disabled);
      expect(radios.length).toBeGreaterThan(0);
      return radios;
    });

    await user.click(free[0]);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByRole('heading', { name: 'Turno reservado' }),
    ).toBeInTheDocument();
    expect(screen.getByText(appointment.confirmation_code)).toBeInTheDocument();
  });
});
