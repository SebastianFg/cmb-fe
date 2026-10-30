import type {
  AgendaColumn,
  AgendaDay,
  AgendaSlot,
} from '@/modules/agenda/types/agenda.types';
import type { ClockTime } from '@/shared/types/domain.types';

/**
 * Celda de la grilla. `off` es el hueco fuera del horario del profesional: se
 * dibuja una sola vez por tramo, con el `rowSpan` que le corresponde. `row`
 * es la fila en la que arranca, para no llevar la cuenta al renderizar.
 */
export type GridCell = { row: number; rowSpan: number } & (
  | { kind: 'off' }
  | { kind: 'slot'; slot: AgendaSlot }
);

export type GridColumn = {
  professional: AgendaColumn;
  cells: GridCell[];
};

export type AgendaGrid = {
  times: ClockTime[];
  columns: GridColumn[];
};

/**
 * Arma la grilla del mockup 06: las filas son la unión de todas las horas de
 * inicio del día y cada celda abarca con `rowSpan` las filas que cubre, porque
 * los profesionales atienden con duraciones distintas.
 *
 * Las franjas bloqueadas consecutivas de la misma ausencia se unen en una
 * celda sola, igual que en el prototipo.
 */
export const buildGrid = (day: AgendaDay): AgendaGrid => {
  const times = [...new Set(day.slots.map((slot) => slot.start_time))].sort();

  const rowsWithin = (start: ClockTime, end: ClockTime) =>
    times.filter((time) => time >= start && time < end).length;

  const columns = day.professionals.map((professional) => {
    const slots = day.slots
      .filter((slot) => slot.professional_id === professional.id)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    const cells: GridCell[] = [];
    let row = 0;

    while (row < times.length) {
      const time = times[row];
      const index = slots.findIndex((slot) => slot.start_time === time);

      if (index === -1) {
        // Fuera del horario de este profesional: se unen las filas seguidas.
        let span = 1;
        while (
          row + span < times.length &&
          !slots.some(
            (slot) =>
              slot.start_time <= times[row + span] &&
              slot.end_time > times[row + span],
          )
        ) {
          span += 1;
        }
        cells.push({ kind: 'off', row, rowSpan: span });
        row += span;
        continue;
      }

      const slot = slots[index];
      let end = slot.end_time;

      if (slot.state === 'blocked') {
        let next = index + 1;
        while (
          slots[next]?.state === 'blocked' &&
          slots[next].exception?.id === slot.exception?.id
        ) {
          end = slots[next].end_time;
          next += 1;
        }
      }

      const span = Math.max(1, rowsWithin(slot.start_time, end));
      cells.push({ kind: 'slot', row, rowSpan: span, slot });
      row += span;
    }

    return { professional, cells };
  });

  return { times, columns };
};

/** Hora de un turno cancelado que dejó la franja libre. */
export const cancelledAt = (
  day: AgendaDay,
  professionalId: number,
  time: ClockTime,
): boolean =>
  day.cancelled.some(
    (item) =>
      item.professional_id === professionalId && item.start_time === time,
  );
