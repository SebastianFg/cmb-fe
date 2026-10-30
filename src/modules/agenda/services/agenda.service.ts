import axios from 'axios';
import { apiCore } from '@/config/api-routes';
import type {
  AgendaAppointment,
  AgendaColumn,
  AgendaDay,
  AgendaSlot,
  AppointmentCancellation,
  AppointmentRecord,
  Attendance,
  NewScheduleException,
} from '@/modules/agenda/types/agenda.types';
import { isSanctumAuthMode } from '@/modules/auth/services/auth.service';
import { daySlots, isCancelled } from '@/modules/scheduling/utils/availability';
import {
  addScheduleException,
  findAppointment,
  findPatient,
  getAppointments,
  getAvailabilityData,
  getHealthInsurances,
  getHolidays,
  getProfessionals,
  getRooms,
  getScheduleExceptions,
  getSettings,
  getSpecialties,
  professionalName,
  updateAppointment,
  updatePatient,
} from '@/prototype/prototype-store';
import type {
  Appointment,
  AppointmentStatus,
  IsoDate,
  Professional,
} from '@/shared/types/domain.types';
import {
  addDays,
  overlaps,
  today,
  toMinutes,
  weekday,
} from '@/shared/utils/dates';

/** Error de validación que pertenece a un campo concreto del formulario. */
export class AgendaFieldError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'AgendaFieldError';
    this.field = field;
  }
}

type ApiEnvelope<T> = { data: T };

/** La API devuelve los errores de validación dentro de `data`. */
const toFieldError = (error: unknown): AgendaFieldError | null => {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) return null;

  const payload = (error.response.data as { data?: unknown } | undefined)?.data;
  if (typeof payload !== 'object' || payload === null) return null;

  const [field, messages] = Object.entries(payload)[0] ?? [];
  if (!field) return null;

  return new AgendaFieldError(
    field,
    Array.isArray(messages) ? String(messages[0]) : String(messages),
  );
};

/* ---------------------------------------------------------------
   Prototipo
   --------------------------------------------------------------- */

const prototypeAppointment = (
  appointment: Appointment,
): AgendaAppointment | null => {
  const patient = findPatient(appointment.patient_id);
  if (!patient) return null;

  const insurance = getHealthInsurances().find(
    (item) => item.id === patient.health_insurance_id,
  );

  return {
    id: appointment.id,
    status: appointment.status,
    source: appointment.source,
    confirmation_code: appointment.confirmation_code,
    reason: appointment.reason || null,
    notes: appointment.notes || null,
    cancellation_reason: appointment.cancellation_reason || null,
    room:
      getRooms().find((room) => room.id === appointment.room_id)?.name ?? null,
    patient: {
      id: patient.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      document_number: patient.document_number,
      health_insurance: insurance?.name ?? null,
    },
  };
};

/** Profesionales que atienden ese día, con o sin filtro. */
const prototypeColumns = (
  date: IsoDate,
  professionalId: number | null,
): Professional[] => {
  const data = getAvailabilityData();

  return getProfessionals().filter((professional) => {
    if (professionalId && professional.id !== professionalId) return false;
    return daySlots(data, professional.id, date).length > 0;
  });
};

const prototypeAgenda = (
  date: IsoDate,
  professionalId: number | null,
): AgendaDay => {
  const data = getAvailabilityData();
  const holiday = getHolidays().find((item) => item.date === date) ?? null;
  const rooms = getRooms();
  const specialties = getSpecialties();
  const professionals = prototypeColumns(date, professionalId);

  const columns: AgendaColumn[] = professionals
    .map((professional) => {
      const [first] = daySlots(data, professional.id, date);

      return {
        id: professional.id,
        name: professionalName(professional),
        license_number: professional.license_number,
        specialty:
          specialties.find((item) => item.id === first.specialty_id)?.name ??
          null,
        room: rooms.find((item) => item.id === first.room_id)?.name ?? null,
        duration_minutes:
          toMinutes(first.end_time) - toMinutes(first.start_time),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

  const slots: AgendaSlot[] = professionals.flatMap((professional) =>
    daySlots(data, professional.id, date).map((slot) => ({
      professional_id: professional.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      state: slot.state,
      appointment: slot.appointment
        ? prototypeAppointment(slot.appointment)
        : null,
      exception: slot.exception
        ? {
            id: slot.exception.id,
            type: slot.exception.type,
            reason: slot.exception.reason,
            start_time: slot.exception.start_time,
            end_time: slot.exception.end_time,
          }
        : null,
    })),
  );

  const taken = slots.filter((slot) => slot.state === 'taken');
  const counted = (status: AppointmentStatus) =>
    taken.filter((slot) => slot.appointment?.status === status).length;

  return {
    date,
    weekday: weekday(date),
    holiday: holiday?.name ?? null,
    is_own_agenda: false,
    professionals: columns,
    slots,
    cancelled: getAppointments()
      .filter(
        (item) =>
          item.date === date &&
          isCancelled(item) &&
          (!professionalId || item.professional_id === professionalId),
      )
      .map((item) => ({
        professional_id: item.professional_id,
        start_time: item.start_time,
      })),
    stats: {
      total: taken.length,
      attended: counted('attended'),
      no_show: counted('no_show'),
      free: slots.filter((slot) => slot.state === 'free').length,
    },
  };
};

/* ---------------------------------------------------------------
   Lecturas
   --------------------------------------------------------------- */

export const fetchAgenda = async ({
  date,
  professionalId,
}: {
  date: IsoDate;
  professionalId: number | null;
}): Promise<AgendaDay> => {
  if (!isSanctumAuthMode()) return prototypeAgenda(date, professionalId);

  const { data } = await apiCore.get<ApiEnvelope<AgendaDay>>('/agenda', {
    params: { date, professional_id: professionalId || undefined },
  });

  return data.data;
};

/* ---------------------------------------------------------------
   Resultado del turno (RF-20, RF-21)
   --------------------------------------------------------------- */

const STATUS_BY_ATTENDANCE: Record<Attendance, AppointmentStatus> = {
  present: 'confirmed',
  attended: 'attended',
  no_show: 'no_show',
};

export const recordAppointment = async ({
  id,
  attendance,
  notes,
}: AppointmentRecord): Promise<void> => {
  if (!isSanctumAuthMode()) {
    updateAppointment(id, {
      notes: notes.trim(),
      status: attendance ? STATUS_BY_ATTENDANCE[attendance] : 'booked',
      attended_at: attendance === 'attended' ? new Date().toISOString() : null,
    });
    return;
  }

  try {
    await apiCore.patch(`/appointments/${id}`, {
      attendance,
      notes: notes.trim() || null,
    });
  } catch (error: unknown) {
    throw toFieldError(error) ?? error;
  }
};

/* ---------------------------------------------------------------
   Cancelación (RF-18)
   --------------------------------------------------------------- */

export const cancelAppointment = async ({
  id,
  cancellation_reason,
}: AppointmentCancellation): Promise<void> => {
  if (!isSanctumAuthMode()) {
    const appointment = findAppointment(id);
    const settings = getSettings();

    updateAppointment(id, {
      status: 'cancelled_by_center',
      cancellation_reason: cancellation_reason.trim(),
      is_penalized: true,
    });

    // Fuera de la ventana configurada el paciente queda penalizado (RF-18).
    if (appointment) {
      updatePatient(appointment.patient_id, {
        blocked_until: addDays(today(), settings.cancellation_penalty_days),
      });
    }
    return;
  }

  try {
    await apiCore.post(`/appointments/${id}/cancel`, { cancellation_reason });
  } catch (error: unknown) {
    throw toFieldError(error) ?? error;
  }
};

/* ---------------------------------------------------------------
   Ausencias y bloqueos (RF-12)
   --------------------------------------------------------------- */

export const declareScheduleException = async (
  values: NewScheduleException,
): Promise<void> => {
  if (!isSanctumAuthMode()) {
    const overlapping = getScheduleExceptions().some(
      (item) =>
        item.professional_id === values.professional_id &&
        item.date === values.date &&
        overlaps(
          values.start_time,
          values.end_time,
          item.start_time,
          item.end_time,
        ),
    );

    if (overlapping) {
      throw new AgendaFieldError(
        'start_time',
        'Ya hay una ausencia o un bloqueo que se superpone con ese horario.',
      );
    }

    const affected = getAppointments().filter(
      (item) =>
        item.professional_id === values.professional_id &&
        item.date === values.date &&
        !isCancelled(item) &&
        overlaps(
          values.start_time,
          values.end_time,
          item.start_time,
          item.end_time,
        ),
    );

    if (affected.length > 0) {
      throw new AgendaFieldError(
        'start_time',
        `Hay ${affected.length === 1 ? '1 turno' : `${affected.length} turnos`} en esa franja (` +
          `${affected.map((item) => item.start_time).join(', ')}). ` +
          'Reprogramalos o cancelalos antes de bloquearla.',
      );
    }

    addScheduleException({ ...values, reason: values.reason.trim() });
    return;
  }

  try {
    await apiCore.post('/schedule-exceptions', values);
  } catch (error: unknown) {
    throw toFieldError(error) ?? error;
  }
};
