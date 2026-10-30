import type {
  AppointmentSource,
  AppointmentStatus,
  ClockTime,
  IsoDate,
  ScheduleExceptionType,
} from '@/shared/types/domain.types';

/** Columna de la grilla: un profesional que atiende ese día. */
export type AgendaColumn = {
  id: number;
  name: string;
  license_number: string | null;
  specialty: string | null;
  room: string | null;
  duration_minutes: number;
};

export type AgendaSlotState = 'free' | 'taken' | 'blocked';

export type AgendaAppointment = {
  id: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  confirmation_code: string;
  /** Motivo declarado al reservar; la observación es administrativa. */
  reason: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  room: string | null;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
    health_insurance: string | null;
  };
};

export type AgendaException = {
  id: number;
  type: ScheduleExceptionType;
  reason: string | null;
  start_time: ClockTime;
  end_time: ClockTime;
};

export type AgendaSlot = {
  professional_id: number;
  start_time: ClockTime;
  end_time: ClockTime;
  state: AgendaSlotState;
  appointment: AgendaAppointment | null;
  exception: AgendaException | null;
};

export type AgendaStats = {
  total: number;
  attended: number;
  no_show: number;
  free: number;
};

export type AgendaDay = {
  date: IsoDate;
  weekday: number;
  holiday: string | null;
  /** `true` cuando el actor es profesional: la grilla es su propia agenda. */
  is_own_agenda: boolean;
  professionals: AgendaColumn[];
  slots: AgendaSlot[];
  /** Turnos cancelados del día: la franja quedó libre pero deja la marca. */
  cancelled: { professional_id: number; start_time: ClockTime }[];
  stats: AgendaStats;
};

/** Resultado del turno (RF-20). `null` lo devuelve a reservado. */
export type Attendance = 'present' | 'attended' | 'no_show';

export type AppointmentRecord = {
  id: number;
  attendance: Attendance | null;
  notes: string;
};

export type AppointmentCancellation = {
  id: number;
  cancellation_reason: string;
};

export type NewScheduleException = {
  professional_id: number;
  date: IsoDate;
  start_time: ClockTime;
  end_time: ClockTime;
  type: ScheduleExceptionType;
  reason: string;
};
