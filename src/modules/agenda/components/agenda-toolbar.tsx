import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId } from 'react';
import type {
  AgendaDay,
  AgendaStats,
} from '@/modules/agenda/types/agenda.types';
import type { ProfessionalOption } from '@/modules/scheduling/types/scheduling.types';
import Button from '@/shared/components/button/button';
import { fieldControlClasses } from '@/shared/components/input/field';
import type { IsoDate } from '@/shared/types/domain.types';
import { WEEKDAYS } from '@/shared/utils/dates';

type AgendaToolbarProps = {
  date: IsoDate;
  stats: AgendaStats;
  weekday: number;
  professionals: ProfessionalOption[];
  professionalId: number | null;
  /** El profesional ve su propia agenda y no puede cambiar de columna. */
  isOwnAgenda: boolean;
  onDateChange: (date: IsoDate) => void;
  onProfessionalChange: (professionalId: number | null) => void;
  onDeclare: (type: 'absence' | 'block') => void;
  day: AgendaDay | undefined;
};

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Navegación por día, filtro de profesional y resumen (mockup 06). */
const AgendaToolbar = ({
  date,
  stats,
  weekday,
  professionals,
  professionalId,
  isOwnAgenda,
  onDateChange,
  onProfessionalChange,
  onDeclare,
  day,
}: AgendaToolbarProps) => {
  const dateId = useId();
  const professionalFilterId = useId();

  const shift = (days: number) => {
    const [year, month, dayOfMonth] = date.split('-').map(Number);
    const moved = new Date(year, month - 1, dayOfMonth + days);
    const pad = (value: number) => String(value).padStart(2, '0');

    onDateChange(
      `${moved.getFullYear()}-${pad(moved.getMonth() + 1)}-${pad(moved.getDate())}`,
    );
  };

  const summary: [number, string][] = [
    [stats.total, 'turnos'],
    [stats.attended, 'atendidos'],
    [stats.no_show, 'ausentes'],
    [stats.free, 'franjas libres'],
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex items-end gap-2">
          <Button aria-label="Día anterior" onClick={() => shift(-1)}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <div className="flex flex-col gap-[7px]">
            <label
              htmlFor={dateId}
              className="text-[0.92rem] font-medium text-ink-strong dark:text-sidebar-ink"
            >
              {capitalize(WEEKDAYS[weekday])}
            </label>
            <input
              id={dateId}
              type="date"
              value={date}
              onChange={(event) => {
                if (event.target.value) onDateChange(event.target.value);
              }}
              className={`${fieldControlClasses(false)} w-auto`}
            />
          </div>
          <Button aria-label="Día siguiente" onClick={() => shift(1)}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Button
            disabled={!day || day.professionals.length === 0}
            onClick={() => onDeclare('absence')}
          >
            Declarar ausencia
          </Button>
          <Button
            disabled={!day || day.professionals.length === 0}
            onClick={() => onDeclare('block')}
          >
            Bloquear franja
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <ul
          aria-label="Resumen del día"
          className="flex flex-wrap gap-x-6 gap-y-1 text-[0.92rem] text-ink-soft"
        >
          {summary.map(([value, label]) => (
            <li key={label}>
              <strong className="font-mono text-[1.1rem] font-semibold text-ink dark:text-white">
                {value}
              </strong>{' '}
              {label}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-[7px]">
          <label
            htmlFor={professionalFilterId}
            className="text-[0.92rem] font-medium text-ink-strong dark:text-sidebar-ink"
          >
            Profesional
          </label>
          <select
            id={professionalFilterId}
            value={professionalId ? String(professionalId) : ''}
            disabled={isOwnAgenda}
            onChange={(event) =>
              onProfessionalChange(Number(event.target.value) || null)
            }
            className={`${fieldControlClasses(false)} w-auto min-w-[14rem] appearance-none pr-10`}
          >
            <option value="">Todos los profesionales</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AgendaToolbar;
