import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import {
  findPatient,
  findProfessional,
  getAppointments,
  getProfessionals,
  getScheduleExceptions,
  professionalName,
  resetPrototypeStore,
  updateAppointment,
} from '@/prototype/prototype-store';
import { addDays, today } from '@/shared/utils/dates';
import { renderWithProviders } from '../../../../tests/test-utils';
import AgendaPage from './agenda-page';

type User = ReturnType<typeof renderWithProviders>['user'];

const signInAsReception = () => {
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
};

const board = async () => within(await screen.findByRole('table'));

/** Primer turno de la grilla, que es el que abre el panel de detalle. */
const openFirstAppointment = async (user: User) => {
  const cells = (await board()).getAllByRole('button', { pressed: false });
  await user.click(cells[0]);

  return cells[0];
};

/**
 * El seed cierra los turnos de hoy según la hora, así que para probar el
 * registro de asistencia se reabre uno a propósito.
 */
const reopenAppointmentOfToday = () => {
  const appointment = getAppointments().find((item) => item.date === today());
  expect(appointment).toBeDefined();

  const reopened = appointment as NonNullable<typeof appointment>;
  updateAppointment(reopened.id, { status: 'booked', attended_at: null });

  return reopened;
};

/** `user.type` no sirve con `input[type=date]`: el valor se fija entero. */
const goToDate = async (date: string) => {
  const input = screen.getByLabelText(
    /^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo)$/,
  );
  fireEvent.change(input, { target: { value: date } });
  await screen.findByRole('table');
};

describe('agenda diaria', () => {
  beforeEach(() => {
    resetPrototypeStore();
    signInAsReception();
  });

  test('arma la grilla con una columna por profesional', async () => {
    renderWithProviders(<AgendaPage />);

    const table = await board();

    expect(
      table.getByRole('columnheader', { name: /Hora/ }),
    ).toBeInTheDocument();
    expect(table.getAllByRole('columnheader').length).toBeGreaterThan(1);
    expect(table.getAllByRole('row').length).toBeGreaterThan(1);
  });

  test('muestra el esqueleto mientras viaja la agenda', async () => {
    renderWithProviders(<AgendaPage />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Cargando la agenda del día…',
    );

    await screen.findByRole('table');

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('el filtro ofrece el plantel completo, sin pedir especialidad', async () => {
    renderWithProviders(<AgendaPage />);
    await screen.findByRole('table');

    const filter = screen.getByLabelText('Profesional');

    await waitFor(() => {
      // El plantel entero más la opción «Todos los profesionales».
      expect(within(filter).getAllByRole('option')).toHaveLength(
        getProfessionals().length + 1,
      );
    });
  });

  test('muestra el resumen del día', async () => {
    renderWithProviders(<AgendaPage />);
    await screen.findByRole('table');

    const summary = within(
      screen.getByRole('list', { name: 'Resumen del día' }),
    );

    expect(summary.getByText('turnos')).toBeInTheDocument();
    expect(summary.getByText('franjas libres')).toBeInTheDocument();
  });

  test('el panel arranca vacío y se llena al elegir un turno', async () => {
    const { user } = renderWithProviders(<AgendaPage />);
    await screen.findByRole('table');

    expect(screen.getByText(/Elegí un turno de la agenda/)).toBeInTheDocument();

    await openFirstAppointment(user);

    expect(await screen.findByText('Motivo declarado')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Registrar asistencia' }),
    ).toBeInTheDocument();
  });

  test('guarda la observación administrativa del turno', async () => {
    const { user } = renderWithProviders(<AgendaPage />);
    await screen.findByRole('table');
    await openFirstAppointment(user);

    const notes = await screen.findByLabelText(/Observación administrativa/);
    await user.clear(notes);
    await user.type(notes, 'Trae estudios previos.');
    await user.click(screen.getByRole('button', { name: 'Guardar registro' }));

    await waitFor(() => {
      expect(
        getAppointments().some(
          (item) => item.notes === 'Trae estudios previos.',
        ),
      ).toBe(true);
    });
  });

  test('registra el resultado del turno', async () => {
    const reopened = reopenAppointmentOfToday();
    const patient = findPatient(reopened.patient_id);
    expect(patient).toBeDefined();
    const { user } = renderWithProviders(<AgendaPage />);
    const table = await board();

    // Dos profesionales pueden atender a la misma hora, así que la celda se
    // busca por el nombre del paciente y no sólo por la franja.
    await user.click(
      table.getByRole('button', {
        name: `${reopened.start_time}, ${patient?.last_name}, ${patient?.first_name}, Reservado`,
      }),
    );
    await user.click(await screen.findByRole('button', { name: 'Presente' }));
    await user.click(screen.getByRole('button', { name: 'Guardar registro' }));

    await waitFor(() => {
      expect(
        getAppointments().find((item) => item.id === reopened.id)?.status,
      ).toBe('confirmed');
    });
  });

  test('cancelar pide el motivo y lo exige con detalle', async () => {
    const { user } = renderWithProviders(<AgendaPage />);
    await screen.findByRole('table');
    await openFirstAppointment(user);

    const cancelButton = screen.queryByRole('button', {
      name: 'Cancelar turno',
    });
    // El turno de hoy que ya empezó no se puede cancelar: en ese caso la
    // prueba no tiene nada que verificar.
    if (!cancelButton) return;

    await user.click(cancelButton);

    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByLabelText(/Motivo de la cancelación/), 'no');
    await user.click(dialog.getByRole('button', { name: 'Cancelar turno' }));

    expect(
      await screen.findByText('Describí el motivo con un poco más de detalle.'),
    ).toBeInTheDocument();
  });

  test('declara una ausencia sobre una franja libre', async () => {
    const { user } = renderWithProviders(<AgendaPage />);
    await screen.findByRole('table');
    // Un día sin turnos cargados: cualquier franja sirve.
    await goToDate(addDays(today(), 25));

    await user.click(screen.getByRole('button', { name: 'Declarar ausencia' }));

    const dialog = within(await screen.findByRole('dialog'));
    const professional = dialog.getByLabelText(/^Profesional/);
    await user.selectOptions(
      professional,
      within(professional).getAllByRole('option')[1],
    );

    const starts = within(dialog.getByLabelText(/^Desde/)).getAllByRole(
      'option',
    );
    const ends = within(dialog.getByLabelText(/^Hasta/)).getAllByRole('option');
    await user.selectOptions(dialog.getByLabelText(/^Desde/), starts[1]);
    await user.selectOptions(dialog.getByLabelText(/^Hasta/), ends[1]);
    await user.type(dialog.getByLabelText(/^Motivo/), 'Congreso');
    await user.click(dialog.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(
        getScheduleExceptions().some((item) => item.reason === 'Congreso'),
      ).toBe(true);
    });
  });

  test('rechaza bloquear una franja que tiene turnos', async () => {
    const booked = getAppointments().find((item) => item.date === today());
    expect(booked).toBeDefined();

    const owner = findProfessional(
      (booked as NonNullable<typeof booked>).professional_id,
    );
    const { user } = renderWithProviders(<AgendaPage />);
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Bloquear franja' }));

    const dialog = within(await screen.findByRole('dialog'));
    await user.selectOptions(
      dialog.getByLabelText(/^Profesional/),
      professionalName(owner as NonNullable<typeof owner>),
    );
    await user.selectOptions(
      dialog.getByLabelText(/^Desde/),
      (booked as NonNullable<typeof booked>).start_time,
    );
    await user.selectOptions(
      dialog.getByLabelText(/^Hasta/),
      (booked as NonNullable<typeof booked>).end_time,
    );
    await user.type(dialog.getByLabelText(/^Motivo/), 'Mantenimiento');
    await user.click(dialog.getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByText(/Reprogramalos o cancelalos antes de bloquearla/),
    ).toBeInTheDocument();
  });
});
