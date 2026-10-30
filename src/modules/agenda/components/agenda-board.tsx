import clsx from 'clsx';
import type {
  AgendaDay,
  AgendaSlot,
} from '@/modules/agenda/types/agenda.types';
import {
  buildGrid,
  cancelledAt,
  type GridCell,
} from '@/modules/agenda/utils/grid';
import { APPOINTMENT_STATUS } from '@/shared/constants/appointment-status';
import { formatLong } from '@/shared/utils/dates';

type AgendaBoardProps = {
  day: AgendaDay;
  selectedId: number | null;
  onSelect: (appointment: AgendaSlot) => void;
};

const CELL =
  'border border-line p-2 align-top text-[0.88rem] dark:border-sidebar-line';

/** El fondo de cada turno según su estado, como la leyenda del mockup. */
const SLOT_TONE: Record<string, string> = {
  booked: 'bg-booked-bg',
  confirmed: 'bg-confirmed-bg',
  attended: 'bg-attended-bg',
  no_show: 'bg-no-show-bg',
  cancelled_by_professional: 'bg-cancelled-bg',
  cancelled_by_center: 'bg-cancelled-bg',
};

const LEGEND = [
  { label: 'Reservado', className: 'bg-booked-bg border-booked' },
  { label: 'Confirmado', className: 'bg-confirmed-bg border-confirmed' },
  { label: 'Ausente', className: 'bg-no-show-bg border-no-show' },
  { label: 'Atendido', className: 'bg-attended-bg border-attended' },
  { label: 'Ausencia o bloqueo', className: 'bg-warning-bg border-warning' },
  {
    label: 'Sin agenda / feriado',
    className: 'bg-surface-muted border-border-strong',
  },
];

/** Grilla diaria de turnos por profesional (mockup 06). */
const AgendaBoard = ({ day, selectedId, onSelect }: AgendaBoardProps) => {
  const grid = buildGrid(day);

  const cellFor = (cell: GridCell, professionalId: number) => {
    if (cell.kind === 'off') {
      return (
        <td
          key={professionalId}
          rowSpan={cell.rowSpan}
          className={clsx(CELL, 'bg-surface-muted text-center text-ink-muted')}
        >
          Sin agenda
        </td>
      );
    }

    const { slot } = cell;

    if (slot.state === 'blocked' && slot.exception) {
      return (
        <td
          key={professionalId}
          rowSpan={cell.rowSpan}
          className={clsx(CELL, 'bg-warning-bg')}
        >
          <strong className="block font-medium text-ink">
            {slot.exception.type === 'absence'
              ? 'Ausencia declarada'
              : 'Franja bloqueada'}
          </strong>
          <span className="text-ink-soft">
            {slot.exception.start_time} a {slot.exception.end_time}
            {slot.exception.reason
              ? ` · ${slot.exception.reason.toLowerCase()}`
              : ''}
          </span>
        </td>
      );
    }

    if (slot.state === 'free' || !slot.appointment) {
      const wasCancelled = cancelledAt(day, professionalId, slot.start_time);

      return (
        <td
          key={professionalId}
          rowSpan={cell.rowSpan}
          className={clsx(CELL, 'text-ink-muted')}
        >
          Libre
          {wasCancelled && (
            <span className="block text-[0.8rem] text-cancelled">
              cancelado {slot.start_time}
            </span>
          )}
        </td>
      );
    }

    const { appointment } = slot;
    const status = APPOINTMENT_STATUS[appointment.status];
    const isSelected = appointment.id === selectedId;

    return (
      <td
        key={professionalId}
        rowSpan={cell.rowSpan}
        className={clsx(CELL, 'p-0', SLOT_TONE[appointment.status])}
      >
        <button
          type="button"
          aria-pressed={isSelected}
          aria-label={`${slot.start_time}, ${appointment.patient.last_name}, ${appointment.patient.first_name}, ${status.label}`}
          onClick={() => onSelect(slot)}
          className={clsx(
            'flex h-full w-full flex-col gap-0.5 p-2 text-left transition-colors hover:bg-ink/5',
            isSelected && 'ring-2 ring-inset ring-accent',
          )}
        >
          <strong className="font-medium text-ink">
            {appointment.patient.last_name},{' '}
            {appointment.patient.first_name.split(' ')[0]}
          </strong>
          <span className="text-[0.82rem] text-ink-soft">
            {appointment.status === 'no_show'
              ? 'Ausente sin aviso'
              : appointment.status === 'attended'
                ? `Atendido · ${appointment.patient.document_number}`
                : status.label}
          </span>
        </button>
      </td>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse">
          <caption className="sr-only">
            Agenda del {formatLong(day.date).toLowerCase()}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className={clsx(
                  CELL,
                  'w-[4.5rem] bg-surface-alt text-left text-[0.78rem] uppercase tracking-[0.06em] text-ink-soft',
                )}
              >
                Hora
              </th>
              {grid.columns.map(({ professional }) => (
                <th
                  key={professional.id}
                  scope="col"
                  className={clsx(CELL, 'bg-surface-alt text-left')}
                >
                  <span className="block font-medium text-ink dark:text-white">
                    {professional.name}
                  </span>
                  <span className="block font-mono text-[0.78rem] font-normal text-ink-soft">
                    {[
                      professional.specialty,
                      professional.room,
                      `${professional.duration_minutes} min`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.times.map((time, row) => (
              <tr key={time}>
                <th
                  scope="row"
                  className={clsx(
                    CELL,
                    'bg-surface-alt text-left font-mono font-normal text-ink-soft',
                  )}
                >
                  {time}
                </th>
                {grid.columns.map(({ professional, cells }) => {
                  const cell = cells.find((item) => item.row === row);

                  return cell ? cellFor(cell, professional.id) : null;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul
        aria-label="Referencias"
        className="flex flex-wrap gap-x-5 gap-y-2 text-[0.82rem] text-ink-soft"
      >
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={clsx('h-3 w-3 flex-none border', item.className)}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgendaBoard;
