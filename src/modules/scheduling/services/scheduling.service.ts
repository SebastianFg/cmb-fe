import axios from 'axios';
import { apiCore } from '@/config/api-routes';
import { isSanctumAuthMode } from '@/modules/auth/services/auth.service';
import type {
  AvailabilityDay,
  AvailabilityDays,
  AvailabilityQuery,
  BookedAppointment,
  BookingRequest,
  DaySlot,
  DaySlots,
  ProfessionalOption,
  SpecialtyOption,
} from '@/modules/scheduling/types/scheduling.types';
import {
  bookableSlots,
  daySlots,
} from '@/modules/scheduling/utils/availability';
import {
  addAppointment,
  findAppointment,
  findPatient,
  findProfessional,
  getAvailabilityData,
  getHolidays,
  getProfessionals,
  getRooms,
  getSettings,
  getSpecialties,
  isPenalized,
  patientConflicts,
  professionalName,
  professionalsBySpecialty,
  updateAppointment,
} from '@/prototype/prototype-store';
import type { IsoDate, Professional } from '@/shared/types/domain.types';
import {
  addDays,
  formatShort,
  nowTime,
  today,
  toMinutes,
  weekday,
} from '@/shared/utils/dates';

/** Días que muestran la tira del portal y el selector del mostrador. */
export const DAYS_SHOWN = 14;

/** Error de validación que pertenece a un campo concreto del formulario. */
export class BookingFieldError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'BookingFieldError';
    this.field = field;
  }
}

type ApiEnvelope<T> = { data: T };

/**
 * La API devuelve los errores de validación dentro de `data`, no en `errors`:
 * es la forma que fija `ResponseJson` del backend.
 */
const toFieldError = (error: unknown): BookingFieldError | null => {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) return null;

  const payload = (error.response.data as { data?: unknown } | undefined)?.data;
  if (typeof payload !== 'object' || payload === null) return null;

  const [field, messages] = Object.entries(payload)[0] ?? [];
  if (!field) return null;

  const message = Array.isArray(messages)
    ? String(messages[0])
    : String(messages);

  return new BookingFieldError(field, message);
};

export const fetchSpecialties = async (): Promise<SpecialtyOption[]> => {
  if (!isSanctumAuthMode()) {
    return getSpecialties()
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  const { data } =
    await apiCore.get<ApiEnvelope<SpecialtyOption[]>>('/specialties');
  return data.data;
};

const toProfessionalOption = (
  professional: Professional,
): ProfessionalOption => ({
  id: professional.id,
  name: professionalName(professional),
  license_number: professional.license_number,
  specialties: [],
});

/** Sin especialidad devuelve el plantel completo, como la agenda lo necesita. */
export const fetchProfessionals = async (
  specialtyId: number | null,
): Promise<ProfessionalOption[]> => {
  if (!isSanctumAuthMode()) {
    const professionals =
      specialtyId === null
        ? getProfessionals()
        : professionalsBySpecialty(specialtyId);

    return professionals
      .map(toProfessionalOption)
      .sort((one, other) => one.name.localeCompare(other.name, 'es'));
  }

  const { data } = await apiCore.get<ApiEnvelope<ProfessionalOption[]>>(
    '/professionals',
    specialtyId === null
      ? undefined
      : { params: { specialty_id: specialtyId } },
  );
  return data.data;
};

/* ---------------------------------------------------------------
   Disponibilidad
   --------------------------------------------------------------- */

/** Los próximos días de atención, sin domingos. */
const workingDates = (count: number): IsoDate[] => {
  const dates: IsoDate[] = [];

  for (let iso = today(); dates.length < count; iso = addDays(iso, 1)) {
    if (weekday(iso) !== 0) dates.push(iso);
  }

  return dates;
};

/** Profesionales del prototipo que entran en la selección actual. */
const prototypeScope = (
  specialtyId: number,
  professionalId: number | null,
): Professional[] =>
  professionalsBySpecialty(specialtyId).filter(
    (professional) => !professionalId || professional.id === professionalId,
  );

const prototypeSlots = (
  specialtyId: number,
  professionalId: number | null,
  iso: IsoDate,
): DaySlot[] => {
  const data = getAvailabilityData();
  const rooms = getRooms();
  const currentDate = today();
  const currentTime = nowTime();

  /** Igual que `bookableSlots`: una franja de hoy a las 09:00 ya pasó a las 09:05. */
  const isBookable = (state: string, startTime: string) => {
    if (state !== 'free' || iso < currentDate) return false;
    return iso > currentDate || startTime > currentTime;
  };

  const slots = prototypeScope(specialtyId, professionalId).flatMap(
    (professional) =>
      daySlots(data, professional.id, iso)
        .filter((slot) => slot.specialty_id === specialtyId)
        .map((slot) => ({
          professional_id: professional.id,
          professional: professionalName(professional),
          license_number: professional.license_number,
          specialty_id: slot.specialty_id,
          room_id: slot.room_id,
          room: rooms.find((room) => room.id === slot.room_id)?.name ?? null,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          duration_minutes:
            toMinutes(slot.end_time) - toMinutes(slot.start_time),
          state: slot.state,
          is_bookable: isBookable(slot.state, slot.start_time),
        })),
  );

  return slots.sort((a, b) =>
    a.start_time === b.start_time
      ? a.professional.localeCompare(b.professional, 'es')
      : a.start_time.localeCompare(b.start_time),
  );
};

export const fetchAvailabilityDays = async ({
  specialtyId,
  professionalId,
}: AvailabilityQuery): Promise<AvailabilityDays> => {
  if (!specialtyId) {
    return { horizonDays: 0, today: today(), days: [] };
  }

  if (!isSanctumAuthMode()) {
    const settings = getSettings();
    const holidays = getHolidays();
    const horizon = addDays(today(), settings.booking_horizon_days);

    const days: AvailabilityDay[] = workingDates(DAYS_SHOWN).map((iso) => {
      const holiday = holidays.find((item) => item.date === iso) ?? null;

      return {
        date: iso,
        weekday: weekday(iso),
        holiday: holiday?.name ?? null,
        free:
          holiday || iso > horizon
            ? 0
            : prototypeScope(specialtyId, professionalId).reduce(
                (sum, professional) =>
                  sum +
                  bookableSlots(
                    getAvailabilityData(),
                    professional.id,
                    iso,
                  ).filter((slot) => slot.specialty_id === specialtyId).length,
                0,
              ),
      };
    });

    return {
      horizonDays: settings.booking_horizon_days,
      today: today(),
      days,
    };
  }

  const { data } = await apiCore.get<
    ApiEnvelope<{
      horizon_days: number;
      today: IsoDate;
      days: AvailabilityDay[];
    }>
  >('/availability/days', {
    params: {
      specialty_id: specialtyId,
      professional_id: professionalId || undefined,
    },
  });

  return {
    horizonDays: data.data.horizon_days,
    today: data.data.today,
    days: data.data.days,
  };
};

export const fetchDaySlots = async ({
  specialtyId,
  professionalId,
  date,
}: AvailabilityQuery & { date: IsoDate | null }): Promise<DaySlots> => {
  if (!specialtyId || !date) {
    return { date: date ?? today(), holiday: null, slots: [] };
  }

  if (!isSanctumAuthMode()) {
    const holiday = getHolidays().find((item) => item.date === date) ?? null;

    return {
      date,
      holiday: holiday?.name ?? null,
      slots: holiday ? [] : prototypeSlots(specialtyId, professionalId, date),
    };
  }

  const { data } = await apiCore.get<ApiEnvelope<DaySlots>>(
    '/availability/slots',
    {
      params: {
        specialty_id: specialtyId,
        professional_id: professionalId || undefined,
        date,
      },
    },
  );

  return data.data;
};

/* ---------------------------------------------------------------
   Reserva
   --------------------------------------------------------------- */

/** Repite en el prototipo las reglas que el backend aplica en el servidor. */
const bookInPrototype = (
  request: BookingRequest,
  selfService: boolean,
): BookedAppointment => {
  const patient = findPatient(request.patient_id);
  if (!patient) {
    throw new BookingFieldError(
      'patient_id',
      'Buscá y seleccioná el paciente.',
    );
  }

  // La penalización sólo frena la autogestión: desde el mostrador el turno se
  // asigna igual.
  if (selfService && isPenalized(patient)) {
    throw new BookingFieldError(
      'patient_id',
      `Tu cuenta tiene una penalización hasta el ${formatShort(
        patient.blocked_until ?? '',
      )} por una cancelación fuera de término. Mientras tanto, podés sacar ` +
        'turno llamando al centro.',
    );
  }

  const slot = prototypeSlots(
    request.specialty_id,
    request.professional_id,
    request.date,
  ).find((item) => item.start_time === request.start_time && item.is_bookable);

  if (!slot) {
    throw new BookingFieldError(
      'slot',
      `La franja de las ${request.start_time} ya no está disponible. Elegí otra.`,
    );
  }

  const [conflict] = patientConflicts(
    patient.id,
    request.date,
    slot.start_time,
    slot.end_time,
  );

  if (conflict) {
    throw new BookingFieldError(
      'slot',
      `${selfService ? 'Ya tenés' : 'El paciente ya tiene'} un turno el ${formatShort(conflict.date)} de ` +
        `${conflict.start_time} a ${conflict.end_time}. Un paciente no puede ` +
        'tener dos turnos superpuestos: elegí otra franja.',
    );
  }

  const appointment = addAppointment({
    patient_id: patient.id,
    professional_id: slot.professional_id,
    specialty_id: slot.specialty_id,
    room_id: slot.room_id ?? 0,
    date: slot.date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    source: selfService ? 'portal' : 'desk',
    reason: request.reason,
  });

  const specialty = getSpecialties().find(
    (item) => item.id === slot.specialty_id,
  );

  return {
    id: appointment.id,
    confirmation_code: appointment.confirmation_code,
    date: appointment.date,
    start_time: appointment.start_time,
    end_time: appointment.end_time,
    status: appointment.status,
    source: appointment.source,
    reason: appointment.reason,
    patient: {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      document_number: patient.document_number,
      email: patient.email || null,
    },
    professional: { id: slot.professional_id, name: slot.professional },
    specialty: { id: slot.specialty_id, name: specialty?.name ?? '' },
    room: slot.room_id ? { id: slot.room_id, name: slot.room ?? '' } : null,
  };
};

/**
 * `selfService` distingue los dos casos de uso: el mostrador reserva para un
 * paciente (CU-01) y el portal reserva para el de la sesión (CU-02), que es
 * el único que la penalización frena.
 */
/** Un turno concreto, para armar el formulario de reprogramación. */
export const fetchAppointment = async (
  id: number,
): Promise<BookedAppointment> => {
  if (!isSanctumAuthMode()) {
    const appointment = findAppointment(id);

    if (!appointment) {
      throw new BookingFieldError('slot', 'El turno ya no existe.');
    }

    const patient = findPatient(appointment.patient_id);
    const professional = findProfessional(appointment.professional_id);

    return {
      id: appointment.id,
      confirmation_code: appointment.confirmation_code,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
      source: appointment.source,
      reason: appointment.reason,
      patient: {
        id: patient?.id ?? 0,
        name: patient ? `${patient.first_name} ${patient.last_name}` : '',
        document_number: patient?.document_number ?? '',
        email: patient?.email || null,
      },
      professional: {
        id: appointment.professional_id,
        name: professional ? professionalName(professional) : '',
      },
      specialty: {
        id: appointment.specialty_id,
        name:
          getSpecialties().find((item) => item.id === appointment.specialty_id)
            ?.name ?? '',
      },
      room: null,
    };
  }

  const { data } = await apiCore.get<ApiEnvelope<BookedAppointment>>(
    `/appointments/${id}`,
  );

  return data.data;
};

/**
 * Reprograma un turno (RF-18): conserva el paciente y el código, y libera la
 * franja anterior.
 */
export const rescheduleAppointment = async (
  id: number,
  request: Omit<BookingRequest, 'patient_id'>,
): Promise<BookedAppointment> => {
  if (!isSanctumAuthMode()) {
    const appointment = findAppointment(id);

    if (!appointment) {
      throw new BookingFieldError('slot', 'El turno ya no existe.');
    }

    const slot = prototypeSlots(
      request.specialty_id,
      request.professional_id,
      request.date,
    ).find(
      (item) =>
        item.start_time === request.start_time &&
        // La franja que ocupa el propio turno no lo bloquea.
        (item.is_bookable ||
          (item.professional_id === appointment.professional_id &&
            item.start_time === appointment.start_time)),
    );

    if (!slot) {
      throw new BookingFieldError(
        'slot',
        `La franja de las ${request.start_time} ya no está disponible. Elegí otra.`,
      );
    }

    updateAppointment(id, {
      professional_id: slot.professional_id,
      specialty_id: slot.specialty_id,
      room_id: slot.room_id ?? 0,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: 'booked',
      reason: request.reason || appointment.reason,
    });

    return fetchAppointment(id);
  }

  try {
    const { data } = await apiCore.put<ApiEnvelope<BookedAppointment>>(
      `/appointments/${id}`,
      {
        specialty_id: request.specialty_id,
        professional_id: request.professional_id,
        date: request.date,
        start_time: request.start_time,
        reason: request.reason || null,
      },
    );

    return data.data;
  } catch (error: unknown) {
    throw toFieldError(error) ?? error;
  }
};

export const bookAppointment = async (
  request: BookingRequest,
  selfService = false,
): Promise<BookedAppointment> => {
  if (!isSanctumAuthMode()) return bookInPrototype(request, selfService);

  try {
    const { data } = await apiCore.post<ApiEnvelope<BookedAppointment>>(
      selfService ? '/portal/appointments' : '/appointments',
      {
        // En el portal el paciente sale del token, y mandarlo sería un dato
        // que el servidor rechaza.
        patient_id: selfService ? undefined : request.patient_id,
        specialty_id: request.specialty_id,
        professional_id: request.professional_id,
        date: request.date,
        start_time: request.start_time,
        reason: request.reason || null,
      },
    );

    return data.data;
  } catch (error: unknown) {
    throw toFieldError(error) ?? error;
  }
};

export { isPenalized };
