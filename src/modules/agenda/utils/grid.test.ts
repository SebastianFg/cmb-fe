import type {
  AgendaColumn,
  AgendaDay,
  AgendaSlot,
} from '@/modules/agenda/types/agenda.types';
import { buildGrid, cancelledAt } from './grid';

const column = (id: number, name: string): AgendaColumn => ({
  id,
  name,
  license_number: 'M.N. 1',
  specialty: 'Clínica médica',
  room: 'C-01',
  duration_minutes: 30,
});

const slot = (
  professionalId: number,
  start: string,
  end: string,
  overrides: Partial<AgendaSlot> = {},
): AgendaSlot => ({
  professional_id: professionalId,
  start_time: start,
  end_time: end,
  state: 'free',
  appointment: null,
  exception: null,
  ...overrides,
});

const dayWith = (
  slots: AgendaSlot[],
  professionals: AgendaColumn[],
): AgendaDay => ({
  date: '2026-10-30',
  weekday: 5,
  holiday: null,
  is_own_agenda: false,
  professionals,
  slots,
  cancelled: [],
  stats: { total: 0, attended: 0, no_show: 0, free: slots.length },
});

describe('buildGrid', () => {
  test('las filas son la unión de las horas de inicio, ordenadas', () => {
    const day = dayWith(
      [
        slot(1, '08:00', '08:30'),
        slot(1, '08:30', '09:00'),
        slot(2, '08:00', '08:40'),
        slot(2, '08:40', '09:20'),
      ],
      [column(1, 'Dra. A'), column(2, 'Dr. B')],
    );

    expect(buildGrid(day).times).toEqual(['08:00', '08:30', '08:40']);
  });

  test('una franja más larga abarca las filas que cubre', () => {
    const day = dayWith(
      [
        slot(1, '08:00', '08:30'),
        slot(1, '08:30', '09:00'),
        slot(2, '08:00', '09:00'),
      ],
      [column(1, 'Dra. A'), column(2, 'Dr. B')],
    );

    const [first, second] = buildGrid(day).columns;

    expect(first.cells.map((cell) => cell.rowSpan)).toEqual([1, 1]);
    expect(second.cells.map((cell) => cell.rowSpan)).toEqual([2]);
  });

  test('las horas sin agenda se unen en una sola celda', () => {
    const day = dayWith(
      [
        slot(1, '08:00', '08:30'),
        slot(2, '14:00', '14:30'),
        slot(2, '14:30', '15:00'),
      ],
      [column(1, 'Dra. A'), column(2, 'Dr. B')],
    );

    const [morning, afternoon] = buildGrid(day).columns;

    expect(morning.cells).toEqual([
      {
        kind: 'slot',
        row: 0,
        rowSpan: 1,
        slot: expect.objectContaining({ start_time: '08:00' }),
      },
      { kind: 'off', row: 1, rowSpan: 2 },
    ]);
    expect(afternoon.cells[0]).toEqual({ kind: 'off', row: 0, rowSpan: 1 });
  });

  test('las franjas seguidas de la misma ausencia son una celda', () => {
    const exception = {
      id: 7,
      type: 'absence' as const,
      reason: 'Congreso',
      start_time: '08:00',
      end_time: '09:00',
    };
    const day = dayWith(
      [
        slot(1, '08:00', '08:30', { state: 'blocked', exception }),
        slot(1, '08:30', '09:00', { state: 'blocked', exception }),
        slot(1, '09:00', '09:30'),
      ],
      [column(1, 'Dra. A')],
    );

    const cells = buildGrid(day).columns[0].cells;

    expect(cells).toHaveLength(2);
    expect(cells[0]).toMatchObject({ kind: 'slot', row: 0, rowSpan: 2 });
  });

  test('cada celda sabe en qué fila arranca', () => {
    const day = dayWith(
      [slot(1, '08:00', '09:00'), slot(1, '09:00', '09:30')],
      [column(1, 'Dra. A')],
    );

    expect(buildGrid(day).columns[0].cells.map((cell) => cell.row)).toEqual([
      0, 1,
    ]);
  });

  test('cada columna cubre todas las filas', () => {
    const day = dayWith(
      [
        slot(1, '08:00', '08:30'),
        slot(1, '08:30', '09:00'),
        slot(2, '08:00', '09:00'),
        slot(2, '09:00', '10:00'),
      ],
      [column(1, 'Dra. A'), column(2, 'Dr. B')],
    );

    const grid = buildGrid(day);

    for (const gridColumn of grid.columns) {
      const covered = gridColumn.cells.reduce(
        (total, cell) => total + cell.rowSpan,
        0,
      );
      expect(covered).toBe(grid.times.length);
    }
  });
});

describe('cancelledAt', () => {
  test('marca la franja que quedó libre por una cancelación', () => {
    const day = {
      ...dayWith([slot(1, '08:00', '08:30')], [column(1, 'Dra. A')]),
      cancelled: [{ professional_id: 1, start_time: '08:00' }],
    };

    expect(cancelledAt(day, 1, '08:00')).toBe(true);
    expect(cancelledAt(day, 1, '08:30')).toBe(false);
    expect(cancelledAt(day, 2, '08:00')).toBe(false);
  });
});
