import type {
  Appointment,
  Holiday,
  IsoDate,
  Schedule,
  ScheduleException,
} from '@/shared/types/domain.types';
import {
  fromMinutes,
  nowTime,
  overlaps,
  today,
  toMinutes,
  weekday,
} from '@/shared/utils/dates';

/**
 * Cálculo de disponibilidad (RF-13). Expande la agenda semanal del
 * profesional en franjas de un día y descuenta feriados, ausencias, bloqueos
 * y turnos ya tomados. No toca el DOM ni el almacenamiento: recibe los datos,
 * así que también sirve para generar los turnos de ejemplo.
 */
export type AvailabilityData = {
  schedules: Schedule[];
  holidays: Holiday[];
  schedule_exceptions: ScheduleException[];
  appointments: Appointment[];
};

export type SlotState = 'free' | 'taken' | 'blocked';

export type Slot = {
  professional_id: number;
  specialty_id: number;
  room_id: number;
  schedule_id: number;
  date: IsoDate;
  start_time: string;
  end_time: string;
  state: SlotState;
  appointment: Appointment | null;
  exception: ScheduleException | null;
};

const CANCELLED_STATUSES = new Set([
  'cancelled_by_professional',
  'cancelled_by_center',
]);

export const isCancelled = (appointment: Appointment): boolean =>
  CANCELLED_STATUSES.has(appointment.status);

export const holidayOn = (
  data: AvailabilityData,
  iso: IsoDate,
): Holiday | null =>
  data.holidays.find((holiday) => holiday.date === iso) ?? null;

export const schedulesFor = (
  data: AvailabilityData,
  professionalId: number,
  iso: IsoDate,
): Schedule[] => {
  const day = weekday(iso);
  return data.schedules.filter(
    (schedule) =>
      schedule.professional_id === professionalId && schedule.weekday === day,
  );
};

/** Si el profesional atiende ese día. */
export const worksOn = (
  data: AvailabilityData,
  professionalId: number,
  iso: IsoDate,
): boolean =>
  !holidayOn(data, iso) && schedulesFor(data, professionalId, iso).length > 0;

/** Todas las franjas del profesional ese día, en orden. Vacío si es feriado. */
export const daySlots = (
  data: AvailabilityData,
  professionalId: number,
  iso: IsoDate,
): Slot[] => {
  if (holidayOn(data, iso)) return [];

  const exceptions = data.schedule_exceptions.filter(
    (exception) =>
      exception.professional_id === professionalId && exception.date === iso,
  );
  const taken = data.appointments.filter(
    (appointment) =>
      appointment.professional_id === professionalId &&
      appointment.date === iso &&
      !isCancelled(appointment),
  );

  const slots: Slot[] = [];

  for (const schedule of schedulesFor(data, professionalId, iso)) {
    const last = toMinutes(schedule.end_time);
    const step = schedule.slot_duration_minutes;

    for (
      let minute = toMinutes(schedule.start_time);
      minute + step <= last;
      minute += step
    ) {
      const startTime = fromMinutes(minute);
      const endTime = fromMinutes(minute + step);

      const appointment =
        taken.find((item) =>
          overlaps(startTime, endTime, item.start_time, item.end_time),
        ) ?? null;
      const exception =
        exceptions.find((item) =>
          overlaps(startTime, endTime, item.start_time, item.end_time),
        ) ?? null;

      let state: SlotState = 'free';
      if (appointment) state = 'taken';
      else if (exception) state = 'blocked';

      slots.push({
        professional_id: professionalId,
        specialty_id: schedule.specialty_id,
        room_id: schedule.room_id,
        schedule_id: schedule.id,
        date: iso,
        start_time: startTime,
        end_time: endTime,
        state,
        appointment: state === 'taken' ? appointment : null,
        exception: state === 'blocked' ? exception : null,
      });
    }
  }

  return slots.sort((a, b) => (a.start_time < b.start_time ? -1 : 1));
};

/** Franjas libres que todavía no empezaron. */
export const bookableSlots = (
  data: AvailabilityData,
  professionalId: number,
  iso: IsoDate,
): Slot[] => {
  const currentDate = today();
  const currentTime = nowTime();

  return daySlots(data, professionalId, iso).filter((slot) => {
    if (slot.state !== 'free' || iso < currentDate) return false;
    return iso > currentDate || slot.start_time > currentTime;
  });
};
