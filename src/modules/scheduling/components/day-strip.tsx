import clsx from 'clsx';
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from 'react-hook-form';
import type { AvailabilityDay } from '@/modules/scheduling/types/scheduling.types';
import Skeleton, {
  SkeletonScreen,
} from '@/shared/components/skeleton/skeleton';
import { formatLong, WEEKDAYS_SHORT } from '@/shared/utils/dates';

type DayStripProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  days: AvailabilityDay[];
  isLoading?: boolean;
};

/** Los mismos catorce días que devuelve la disponibilidad. */
const SKELETON_DAYS = Array.from({ length: 14 }, (_, day) => `dia-${day}`);

/**
 * Las tres variantes son excluyentes: Tailwind no resuelve por orden de
 * escritura cuál fondo gana.
 */
const DAY_STATE_CLASSES = {
  disabled:
    'cursor-not-allowed border-border bg-surface-muted text-ink-muted dark:border-sidebar-line dark:bg-sidebar',
  selected:
    'cursor-pointer border-accent bg-accent text-white hover:border-accent-dark hover:bg-accent-dark',
  free: 'cursor-pointer border-border-strong bg-surface text-ink hover:border-accent dark:border-sidebar-line dark:bg-sidebar-soft dark:text-white',
} as const;

/** Tira de días del portal (mockup 16). */
const DayStrip = <T extends FieldValues>({
  name,
  control,
  days,
  isLoading = false,
}: DayStripProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const holidays = days.filter((day) => day.holiday);

  if (isLoading) {
    return (
      <SkeletonScreen
        className="flex min-w-0 gap-2 overflow-hidden pb-1"
        label="Buscando los días con turnos…"
      >
        {SKELETON_DAYS.map((day) => (
          <Skeleton key={day} className="h-[4.25rem] w-[4.25rem] flex-none" />
        ))}
      </SkeletonScreen>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const isDisabled = day.free === 0;

          return (
            <button
              key={day.date}
              type="button"
              disabled={isDisabled}
              aria-pressed={field.value === day.date}
              aria-label={`${formatLong(day.date)}${
                day.holiday
                  ? `, feriado: ${day.holiday}`
                  : `, ${day.free} turnos libres`
              }`}
              onClick={() => field.onChange(day.date)}
              className={clsx(
                'flex min-w-[4.25rem] flex-none flex-col items-center gap-0.5 border px-3 py-2.5 transition-colors',
                DAY_STATE_CLASSES[
                  isDisabled
                    ? 'disabled'
                    : field.value === day.date
                      ? 'selected'
                      : 'free'
                ],
              )}
            >
              <span className="text-[0.78rem] uppercase tracking-[0.04em]">
                {WEEKDAYS_SHORT[day.weekday]}
              </span>
              <span className="font-mono text-[1.15rem] font-semibold">
                {day.date.slice(8, 10)}
              </span>
            </button>
          );
        })}
      </div>

      {holidays.length > 0 && (
        <p className="text-[0.85rem] text-ink-soft">
          {holidays
            .map(
              (day) =>
                `El ${formatLong(day.date).toLowerCase()} el centro no atiende (${day.holiday}).`,
            )
            .join(' ')}
        </p>
      )}

      {error && <p className="text-[0.85rem] text-danger">{error.message}</p>}
    </div>
  );
};

export default DayStrip;
