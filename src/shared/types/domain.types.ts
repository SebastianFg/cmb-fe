/**
 * Modelo de dominio del centro. Los nombres de campo siguen el DER del TP
 * (snake_case, en inglés) para que el día que responda `cmb-be` no haya que
 * traducir nada.
 *
 * Las fechas viajan como "YYYY-MM-DD" y las horas como "HH:MM", siempre en la
 * hora local del centro: así ordenan y comparan como texto.
 */
export type IsoDate = string;
export type ClockTime = string;

export type Specialty = {
  id: number;
  name: string;
  description: string;
};

export type Room = {
  id: number;
  name: string;
  floor: number;
};

export type Professional = {
  id: number;
  user_id: number | null;
  title: string;
  first_name: string;
  last_name: string;
  license_number: string;
  specialty_ids: number[];
};

export type Schedule = {
  id: number;
  professional_id: number;
  specialty_id: number;
  room_id: number;
  /** 0 = domingo, 6 = sábado */
  weekday: number;
  start_time: ClockTime;
  end_time: ClockTime;
  slot_duration_minutes: number;
};

export type ScheduleExceptionType = 'absence' | 'block';

export type ScheduleException = {
  id: number;
  professional_id: number;
  date: IsoDate;
  start_time: ClockTime;
  end_time: ClockTime;
  type: ScheduleExceptionType;
  reason: string;
};

export type Holiday = {
  id: number;
  date: IsoDate;
  name: string;
  is_nationwide: boolean;
};

export type HealthInsurance = {
  id: number;
  name: string;
  plan: string;
};

export type Nationality = {
  id: number;
  name: string;
  iso_code: string;
};

export type Patient = {
  id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: IsoDate;
  nationality_id: number;
  phone: string;
  email: string;
  password: string | null;
  health_insurance_id: number;
  member_number: string;
  blocked_until: IsoDate | null;
  created_at: IsoDate;
};

/** Estados de `appointments.status` (apartado H del TP). */
export const APPOINTMENT_STATUSES = [
  'booked',
  'confirmed',
  'attended',
  'no_show',
  'cancelled_by_professional',
  'cancelled_by_center',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentSource = 'portal' | 'desk';

export type Appointment = {
  id: number;
  patient_id: number;
  professional_id: number;
  specialty_id: number;
  room_id: number;
  created_by: number | null;
  cancelled_by: number | null;
  date: IsoDate;
  start_time: ClockTime;
  end_time: ClockTime;
  status: AppointmentStatus;
  source: AppointmentSource;
  confirmation_code: string;
  reason: string;
  cancellation_reason: string;
  is_penalized: boolean;
  notes: string;
  attended_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CenterSettings = {
  center_name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  medical_director: string;
  opening_hours: string[];
  timezone: string;
  cancellation_window_minutes: number;
  cancellation_penalty_days: number;
  reminder_lead_minutes: number;
  no_show_alert_threshold: number;
  booking_horizon_days: number;
};
