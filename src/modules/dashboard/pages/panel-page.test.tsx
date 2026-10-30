import { screen, within } from '@testing-library/react';
import { fetchDashboardSummary } from '@/modules/dashboard/services/dashboard.service';
import type { DashboardSummary } from '@/modules/dashboard/types/dashboard.types';
import { renderWithProviders } from '../../../../tests/test-utils';
import PanelPage from './panel-page';

jest.mock('@/modules/dashboard/services/dashboard.service');

const mockedFetch = jest.mocked(fetchDashboardSummary);

const summary = (
  overrides: Partial<DashboardSummary> = {},
): DashboardSummary => ({
  scope: null,
  today: '2026-10-29',
  no_show_threshold: 8,
  kpis: {
    today_total: 8,
    today_confirmed: 3,
    today_pending: 5,
    published_slots: 50,
    occupancy_rate: 16,
    absence_rate: 18.2,
    absence_over_threshold: true,
    cancelled_last_week: 1,
    cancelled_penalized: 0,
  },
  alerts: [
    {
      type: 'warning',
      title: 'Ausencia declarada',
      text: 'Dra. P. Aguirre no atiende el lunes.',
      date: '2026-11-02',
    },
  ],
  today_appointments: [
    {
      id: 1,
      time: '08:00',
      patient: 'Marta Ferreyra',
      professional: 'Dra. Paula Aguirre',
      specialty: 'Clínica médica',
      status: 'confirmed',
    },
    {
      id: 2,
      time: '08:30',
      patient: 'Julián Sosa',
      professional: 'Dr. Andrés Paz',
      specialty: 'Pediatría',
      status: 'booked',
    },
  ],
  occupancy: [
    { professional: 'Dra. P. Aguirre', rate: 72 },
    { professional: 'Dr. A. Paz', rate: 41 },
  ],
  demand: [
    { specialty: 'Clínica médica', count: 8 },
    { specialty: 'Pediatría', count: 7 },
  ],
  ...overrides,
});

describe('panel principal', () => {
  beforeEach(() => {
    mockedFetch.mockResolvedValue(summary());
  });

  test('muestra el esqueleto mientras viaja el resumen', async () => {
    renderWithProviders(<PanelPage />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando el panel…');

    await screen.findByRole('region', { name: 'Indicadores' });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('muestra los cuatro indicadores con su detalle', async () => {
    renderWithProviders(<PanelPage />);

    const kpis = await screen.findByRole('region', { name: 'Indicadores' });

    expect(within(kpis).getByText('Turnos de hoy')).toBeInTheDocument();
    expect(within(kpis).getByText('8')).toBeInTheDocument();
    expect(
      within(kpis).getByText('3 confirmados · 5 sin confirmar'),
    ).toBeInTheDocument();
    expect(within(kpis).getByText('16%')).toBeInTheDocument();
    expect(
      within(kpis).getByText('Sobre 50 franjas publicadas'),
    ).toBeInTheDocument();
    expect(within(kpis).getByText('18,2%')).toBeInTheDocument();
    expect(
      within(kpis).getByText('Umbral configurado: 8%'),
    ).toBeInTheDocument();
  });

  test('sin agendas publicadas la ocupación no inventa un número', async () => {
    mockedFetch.mockResolvedValue(
      summary({
        kpis: {
          ...summary().kpis,
          published_slots: 0,
          occupancy_rate: null,
        },
      }),
    );

    renderWithProviders(<PanelPage />);

    expect(
      await screen.findByText('No hay agendas publicadas hoy'),
    ).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('lista las alertas tempranas con su enlace a la agenda', async () => {
    renderWithProviders(<PanelPage />);

    expect(await screen.findByText('Ausencia declarada')).toBeInTheDocument();
    expect(screen.getByText('1 alerta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver agenda' })).toHaveAttribute(
      'href',
      '/agenda?fecha=2026-11-02',
    );
  });

  test('avisa cuando no hay alertas', async () => {
    mockedFetch.mockResolvedValue(summary({ alerts: [] }));

    renderWithProviders(<PanelPage />);

    expect(
      await screen.findByText('Sin alertas por ahora.'),
    ).toBeInTheDocument();
  });

  test('arma la tabla de turnos de hoy con el estado de cada uno', async () => {
    renderWithProviders(<PanelPage />);

    const table = await screen.findByRole('table');

    expect(within(table).getByText('Marta Ferreyra')).toBeInTheDocument();
    expect(within(table).getByText('08:00')).toBeInTheDocument();
    expect(within(table).getByText('Confirmado')).toBeInTheDocument();
    expect(within(table).getByText('Reservado')).toBeInTheDocument();
  });

  test('muestra ocupación y demanda', async () => {
    renderWithProviders(<PanelPage />);

    expect(await screen.findByText('Dra. P. Aguirre')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('8 turnos')).toBeInTheDocument();
    expect(screen.getByText('7 turnos')).toBeInTheDocument();
  });

  test('indica de quién es la agenda cuando entra un profesional', async () => {
    mockedFetch.mockResolvedValue(summary({ scope: 'Dra. Paula Aguirre' }));

    renderWithProviders(<PanelPage />);

    expect(
      await screen.findByText(/Agenda de Dra\. Paula Aguirre/),
    ).toBeInTheDocument();
  });

  test('informa si el resumen no se pudo cargar', async () => {
    mockedFetch.mockRejectedValue(new Error('Servicio no disponible.'));

    renderWithProviders(<PanelPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Servicio no disponible.',
    );
  });

  test('ajusta el plural cuando hay un solo turno', async () => {
    mockedFetch.mockResolvedValue(
      summary({
        kpis: { ...summary().kpis, today_confirmed: 1, cancelled_penalized: 1 },
        demand: [{ specialty: 'Nutrición', count: 1 }],
      }),
    );

    renderWithProviders(<PanelPage />);

    expect(await screen.findByText(/^1 confirmado ·/)).toBeInTheDocument();
    expect(screen.getByText('1 turno con penalización')).toBeInTheDocument();
    expect(screen.getByText('1 turno')).toBeInTheDocument();
  });
});
