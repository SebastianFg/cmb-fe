import clsx from 'clsx';
import { useId } from 'react';
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from 'react-hook-form';
import { slotValue } from '@/modules/scheduling/schemas/appointment.schema';
import type { DaySlot } from '@/modules/scheduling/types/scheduling.types';
import Skeleton, {
  SkeletonScreen,
} from '@/shared/components/skeleton/skeleton';

type SlotPickerProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  slots: DaySlot[];
  /** Con un profesional elegido se muestra el día completo, con las tomadas. */
  showTaken: boolean;
  isLoading: boolean;
  emptyMessage: string;
};

const SLOT_CLASSES =
  'min-h-11 border px-3 py-2 text-center font-mono text-[0.95rem] transition-colors';

/** Cuántas franjas finge el esqueleto: la media de una mañana de agenda. */
const SKELETON_SLOTS = Array.from(
  { length: 12 },
  (_, index) => `franja-${index}`,
);

/**
 * Las tres variantes son excluyentes y se eligen de a una: Tailwind no
 * resuelve por orden de escritura cuál gana entre `bg-surface` y `bg-accent`.
 */
const SLOT_STATE_CLASSES = {
  disabled:
    'cursor-not-allowed border-border bg-surface-muted text-ink-muted line-through dark:border-sidebar-line dark:bg-sidebar',
  selected:
    'cursor-pointer border-accent bg-accent font-semibold text-white hover:border-accent-dark hover:bg-accent-dark',
  free: 'cursor-pointer border-border-strong bg-surface text-ink hover:border-accent dark:border-sidebar-line dark:bg-sidebar-soft dark:text-white',
} as const;

/** Franjas agrupadas por profesional, como el mockup 07 cuando es «cualquiera». */
const groupByProfessional = (slots: DaySlot[]) => {
  const groups = new Map<number, DaySlot[]>();

  for (const slot of slots) {
    const current = groups.get(slot.professional_id);
    if (current) current.push(slot);
    else groups.set(slot.professional_id, [slot]);
  }

  return [...groups.values()];
};

/**
 * Selector de franja. Es un grupo de radios: la franja elegida lleva consigo
 * el profesional, así que basta un campo para los dos datos.
 */
const SlotPicker = <T extends FieldValues>({
  name,
  control,
  slots,
  showTaken,
  isLoading,
  emptyMessage,
}: SlotPickerProps<T>) => {
  const groupId = useId();

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const visible = showTaken ? slots : slots.filter((slot) => slot.is_bookable);

  if (isLoading) {
    return (
      <SkeletonScreen
        className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2"
        label="Buscando franjas…"
      >
        {SKELETON_SLOTS.map((slot) => (
          <Skeleton key={slot} className="h-11" />
        ))}
      </SkeletonScreen>
    );
  }

  if (visible.length === 0) {
    return <p className="text-ink-soft">{emptyMessage}</p>;
  }

  const slotRadio = (slot: DaySlot) => {
    const value = slotValue(slot.professional_id, slot.start_time);
    const isDisabled = !slot.is_bookable;

    return (
      <label
        key={`${slot.professional_id}-${slot.start_time}`}
        title={
          slot.state === 'taken'
            ? 'Franja ocupada'
            : slot.state === 'blocked'
              ? 'Franja bloqueada'
              : undefined
        }
        className={clsx(
          SLOT_CLASSES,
          SLOT_STATE_CLASSES[
            isDisabled
              ? 'disabled'
              : field.value === value
                ? 'selected'
                : 'free'
          ],
        )}
      >
        <input
          type="radio"
          name={field.name}
          value={value}
          disabled={isDisabled}
          checked={field.value === value}
          onChange={() => field.onChange(value)}
          onBlur={field.onBlur}
          className="sr-only"
        />
        {slot.start_time}
      </label>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {showTaken ? (
        <div
          role="radiogroup"
          aria-labelledby={groupId}
          className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2"
        >
          {visible.map(slotRadio)}
        </div>
      ) : (
        groupByProfessional(visible).map((group) => (
          <div key={group[0].professional_id} className="flex flex-col gap-2">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <strong className="font-medium text-ink dark:text-white">
                {group[0].professional}
              </strong>
              <span className="font-mono text-[0.82rem] text-ink-soft">
                {[
                  group[0].license_number,
                  group[0].room,
                  `${group[0].duration_minutes} min`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </span>
            <div
              role="radiogroup"
              aria-label={`Horarios de ${group[0].professional}`}
              className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2"
            >
              {group.map(slotRadio)}
            </div>
          </div>
        ))
      )}

      {error && <p className="text-[0.85rem] text-danger">{error.message}</p>}
    </div>
  );
};

export default SlotPicker;
