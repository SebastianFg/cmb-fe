import type {
  AppointmentSource,
  AppointmentStatus,
  ClockTime,
  IsoDate,
} from '@/shared/types/domain.types';

export type SpecialtyOption = {
  id: number;
  name: string;
};

export type ProfessionalOption = {
  id: number;
  name: string;
  license_number: string | null;
  specialties: string[];
};

/** Un día de la tira: lo que trae `GET /availability/days`. */
export type AvailabilityDay = {
  date: IsoDate;
  /** 0 = domingo, 6 = sábado */
  weekday: number;
  holiday: string | null;
  free: number;
};

export type AvailabilityDays = {
  horizonDays: number;
  today: IsoDate;
  days: AvailabilityDay[];
};

export type SlotState = 'free' | 'taken' | 'blocked';

/**
 * Franja de un día. Llegan también las ocupadas y bloqueadas, porque el
 * mostrador las muestra tachadas cuando se eligió un profesional.
 */
export type DaySlot = {
  professional_id: number;
  professional: string;
  license_number: string | null;
  specialty_id: number;
  room_id: number | null;
  room: string | null;
  date: IsoDate;
  start_time: ClockTime;
  end_time: ClockTime;
  duration_minutes: number;
  state: SlotState;
  is_bookable: boolean;
};

export type DaySlots = {
  date: IsoDate;
  holiday: string | null;
  slots: DaySlot[];
};

/** Turno recién reservado: es lo que imprime el comprobante. */
export type BookedAppointment = {
  id: number;
  confirmation_code: string;
  date: IsoDate;
  start_time: ClockTime;
  end_time: ClockTime;
  status: AppointmentStatus;
  source: AppointmentSource;
  reason: string | null;
  patient: {
    id: number;
    name: string;
    document_number: string;
    email: string | null;
  };
  professional: { id: number; name: string };
  specialty: { id: number; name: string };
  room: { id: number; name: string } | null;
};

export type BookingRequest = {
  patient_id: number;
  specialty_id: number;
  professional_id: number;
  date: IsoDate;
  start_time: ClockTime;
  reason: string;
};

export type AvailabilityQuery = {
  specialtyId: number | null;
  professionalId: number | null;
};
