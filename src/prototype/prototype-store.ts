import { isCancelled } from '@/modules/scheduling/utils/availability';
import type {
  Appointment,
  HealthInsurance,
  Patient,
  Professional,
  ScheduleException,
} from '@/shared/types/domain.types';
import { overlaps, today } from '@/shared/utils/dates';
import {
  buildInitialState,
  PROTOTYPE_STATE_VERSION,
  type PrototypeState,
} from './build-state';
import { newConfirmationCode } from './random';

/**
 * Capa de datos en el navegador. Reemplaza a la API de Laravel mientras
 * `cmb-be` no exista: los servicios de cada módulo leen y escriben por acá,
 * así cambiarlos por `fetch` después no toca las pantallas.
 *
 * Todo el estado vive bajo una sola clave de `localStorage`. Si el navegador
 * rechaza el almacenamiento, la aplicación sigue andando solo en memoria.
 */
const STORAGE_KEY = 'cmb.turnos.v1';

let state: PrototypeState | null = null;

const readStoredState = (): PrototypeState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw) as PrototypeState;
    return saved?.version === PROTOTYPE_STATE_VERSION ? saved : null;
  } catch {
    return null;
  }
};

const save = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sin almacenamiento la sesión dura hasta la próxima carga.
  }
};

/**
 * CU-07, paso 4: al cierre del día los turnos sin marcar pasan a «ausente».
 * Hacerlo al cargar mantiene los datos coherentes cuando la aplicación se
 * abre días después de haberlos generado.
 */
const closePastDays = (current: PrototypeState) => {
  const currentDate = today();

  for (const appointment of current.appointments) {
    if (
      appointment.date < currentDate &&
      (appointment.status === 'booked' || appointment.status === 'confirmed')
    ) {
      appointment.status = 'no_show';
      appointment.updated_at = new Date().toISOString();
    }
  }
};

const getState = (): PrototypeState => {
  if (!state) {
    state = readStoredState() ?? buildInitialState();
    closePastDays(state);
    save();
  }

  return state;
};

/** Descarta todos los cambios y vuelve a generar los datos de ejemplo. */
export const resetPrototypeStore = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que borrar.
  }

  state = buildInitialState();
  save();
};

/* ---------------------------------------------------------------
   Consultas
   --------------------------------------------------------------- */

export const getSettings = () => getState().settings;

export const getSpecialties = () => getState().specialties;
export const getRooms = () => getState().rooms;
export const getProfessionals = () => getState().professionals;
export const getHolidays = () => getState().holidays;
export const getHealthInsurances = () => getState().health_insurances;
export const getNationalities = () => getState().nationalities;
export const getPatients = () => getState().patients;
export const getAppointments = () => getState().appointments;
export const getScheduleExceptions = () => getState().schedule_exceptions;

/** Lo que necesita el cálculo de disponibilidad, siempre al día. */
export const getAvailabilityData = () => {
  const current = getState();

  return {
    schedules: current.schedules,
    holidays: current.holidays,
    schedule_exceptions: current.schedule_exceptions,
    appointments: current.appointments,
  };
};

export const findPatient = (id: number): Patient | null =>
  getState().patients.find((patient) => patient.id === id) ?? null;

export const findProfessional = (id: number): Professional | null =>
  getState().professionals.find((professional) => professional.id === id) ??
  null;

export const findAppointment = (id: number): Appointment | null =>
  getState().appointments.find((appointment) => appointment.id === id) ?? null;

export const findPatientByDocument = (documentNumber: string): Patient | null =>
  getState().patients.find(
    (patient) => patient.document_number === documentNumber.trim(),
  ) ?? null;

export const findPatientByEmail = (email: string): Patient | null => {
  const wanted = email.trim().toLowerCase();

  return (
    getState().patients.find(
      (patient) => patient.email && patient.email.toLowerCase() === wanted,
    ) ?? null
  );
};

export const professionalsBySpecialty = (specialtyId: number): Professional[] =>
  getState().professionals.filter((professional) =>
    professional.specialty_ids.includes(specialtyId),
  );

/** Turnos activos del paciente que se superponen con el rango dado. */
export const patientConflicts = (
  patientId: number,
  date: string,
  start: string,
  end: string,
  ignoreId?: number,
): Appointment[] =>
  getState().appointments.filter(
    (item) =>
      item.patient_id === patientId &&
      item.date === date &&
      item.id !== ignoreId &&
      !isCancelled(item) &&
      overlaps(start, end, item.start_time, item.end_time),
  );

/* ---------------------------------------------------------------
   Comandos
   --------------------------------------------------------------- */

const nextId = (items: { id: number }[]): number =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

export type NewPatient = Omit<Patient, 'id' | 'blocked_until' | 'created_at'>;

export const addPatient = (data: NewPatient): Patient => {
  const current = getState();

  const patient: Patient = {
    ...data,
    id: nextId(current.patients),
    blocked_until: null,
    created_at: today(),
  };

  current.patients.push(patient);
  save();

  return patient;
};

export const updatePatient = (
  id: number,
  changes: Partial<Patient>,
): Patient | null => {
  const patient = findPatient(id);
  if (!patient) return null;

  Object.assign(patient, changes);
  save();

  return patient;
};

export type NewAppointment = Pick<
  Appointment,
  | 'patient_id'
  | 'professional_id'
  | 'specialty_id'
  | 'room_id'
  | 'date'
  | 'start_time'
  | 'end_time'
  | 'source'
  | 'reason'
> &
  Partial<Pick<Appointment, 'created_by'>>;

export const addAppointment = (data: NewAppointment): Appointment => {
  const current = getState();
  const usedCodes = new Set(
    current.appointments.map((item) => item.confirmation_code),
  );

  const appointment: Appointment = {
    created_by: null,
    ...data,
    id: nextId(current.appointments),
    cancelled_by: null,
    status: 'booked',
    confirmation_code: newConfirmationCode(usedCodes),
    cancellation_reason: '',
    is_penalized: false,
    notes: '',
    attended_at: null,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  current.appointments.push(appointment);
  save();

  return appointment;
};

export const updateAppointment = (
  id: number,
  changes: Partial<Appointment>,
): Appointment | null => {
  const appointment = findAppointment(id);
  if (!appointment) return null;

  Object.assign(appointment, changes, { updated_at: new Date().toISOString() });
  save();

  return appointment;
};

export type NewScheduleException = Omit<ScheduleException, 'id'>;

export const addScheduleException = (
  data: NewScheduleException,
): ScheduleException => {
  const current = getState();

  const exception: ScheduleException = {
    ...data,
    id: nextId(current.schedule_exceptions),
  };

  current.schedule_exceptions.push(exception);
  save();

  return exception;
};

/* ---------------------------------------------------------------
   Derivados de presentación
   --------------------------------------------------------------- */

export const professionalName = (professional: Professional): string =>
  `${professional.title} ${professional.first_name} ${professional.last_name}`;

/** "Dra. P. Aguirre" */
export const professionalShortName = (professional: Professional): string =>
  `${professional.title} ${professional.first_name.charAt(0)}. ${professional.last_name}`;

/** "Ferreyra, Marta Elena" */
export const patientName = (patient: Patient): string =>
  `${patient.last_name}, ${patient.first_name}`;

export const insuranceName = (insurance: HealthInsurance | null): string =>
  insurance
    ? `${insurance.name}${insurance.plan ? ` ${insurance.plan}` : ''}`
    : '';

export const isPenalized = (patient: Patient): boolean =>
  Boolean(patient.blocked_until && patient.blocked_until >= today());
