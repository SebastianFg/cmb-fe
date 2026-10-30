import { daySlots, worksOn } from '@/modules/scheduling/utils/availability';
import type {
  Appointment,
  CenterSettings,
  HealthInsurance,
  Holiday,
  Nationality,
  Patient,
  Professional,
  Room,
  Schedule,
  ScheduleException,
  Specialty,
} from '@/shared/types/domain.types';
import { addDays, age, nowTime, today } from '@/shared/utils/dates';
import {
  createRandom,
  newConfirmationCode,
  pick,
  type RandomFn,
} from './random';
import { seedData } from './seed-data';

export const PROTOTYPE_STATE_VERSION = 2;
const SEED = 20260907;

export type PrototypeState = {
  version: number;
  generated_on: string;
  settings: CenterSettings;
  specialties: Specialty[];
  rooms: Room[];
  professionals: Professional[];
  schedules: Schedule[];
  holidays: Holiday[];
  health_insurances: HealthInsurance[];
  nationalities: Nationality[];
  patients: Patient[];
  schedule_exceptions: ScheduleException[];
  appointments: Appointment[];
};

const REASONS: Record<number, string[]> = {
  1: [
    'Control anual',
    'Control anual y renovación de recetas',
    'Chequeo general',
    'Resultados de laboratorio',
  ],
  2: [
    'Control de niño sano',
    'Fiebre y tos',
    'Certificado escolar',
    'Vacunación',
  ],
  3: [
    'Control de presión',
    'Evaluación prequirúrgica',
    'Electrocardiograma',
    'Palpitaciones',
  ],
  4: ['Control de lunares', 'Consulta por acné', 'Dermatitis'],
  5: ['Control anual', 'Resultados de estudios'],
  6: ['Dolor de rodilla', 'Apto físico', 'Esguince de tobillo', 'Dolor lumbar'],
  7: ['Control visual', 'Receta de anteojos', 'Fondo de ojo'],
  8: ['Primera consulta', 'Seguimiento del plan'],
};

const FIRST_NAMES = [
  'Alejandro',
  'Beatriz',
  'Carlos',
  'Daniela',
  'Eduardo',
  'Fernanda',
  'Gabriel',
  'Hilda',
  'Ignacio',
  'Julieta',
  'Leandro',
  'Mariana',
  'Nicolás',
  'Patricia',
  'Ricardo',
  'Sabrina',
  'Tomás',
  'Verónica',
  'Walter',
  'Yamila',
];
const LAST_NAMES = [
  'Aguilar',
  'Barrios',
  'Castro',
  'Díaz',
  'Escobar',
  'Figueroa',
  'Godoy',
  'Ibáñez',
  'Juárez',
  'Luna',
  'Morales',
  'Navarro',
  'Olivera',
  'Paredes',
  'Quintana',
  'Ríos',
  'Suárez',
  'Toledo',
  'Vega',
  'Zárate',
];
const CHILD_NAMES = [
  'Benjamín',
  'Catalina',
  'Felipe',
  'Isabella',
  'Joaquina',
  'Mateo',
  'Martina',
  'Santino',
  'Renata',
  'Thiago',
  'Zoe',
  'Bruno',
];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Fichas cargadas por recepción, sin acceso al portal. Los pacientes con
 * nombre del seed no alcanzan para llenar 57 días de agenda sin que la misma
 * persona tenga varios turnos el mismo día.
 */
const addDeskPatients = (state: PrototypeState, random: RandomFn) => {
  const insuranceIds = [2, 3, 4, 5, 6, 7, 8, 9, 1];
  let id = state.patients.length;

  const add = (firstName: string, lastName: string, birthYear: number) => {
    id++;
    const insuranceId =
      insuranceIds[Math.floor(random() * insuranceIds.length)];

    state.patients.push({
      id,
      document_number: String(20_000_000 + Math.floor(random() * 35_000_000)),
      first_name: firstName,
      last_name: lastName,
      birth_date: `${birthYear}-${pad(1 + Math.floor(random() * 12))}-${pad(1 + Math.floor(random() * 28))}`,
      nationality_id: random() < 0.85 ? 1 : 2 + Math.floor(random() * 7),
      phone: `11${String(30_000_000 + Math.floor(random() * 39_999_999))}`,
      email: '',
      password: null,
      health_insurance_id: insuranceId,
      member_number:
        insuranceId === 1
          ? ''
          : String(100_000 + Math.floor(random() * 899_999)),
      blocked_until: null,
      created_at: state.generated_on,
    });
  };

  for (let i = 0; i < 44; i++) {
    const lastName =
      LAST_NAMES[
        (i * 7 + Math.floor(i / FIRST_NAMES.length) * 3) % LAST_NAMES.length
      ];
    add(
      FIRST_NAMES[i % FIRST_NAMES.length],
      lastName,
      1945 + Math.floor(random() * 60),
    );
  }

  CHILD_NAMES.forEach((name, index) => {
    add(
      name,
      LAST_NAMES[(index * 3 + 5) % LAST_NAMES.length],
      2012 + Math.floor(random() * 12),
    );
  });
};

const applyCancellation = (appointment: Appointment, random: RandomFn) => {
  const byCenter = random() < 0.5;

  appointment.status = byCenter
    ? 'cancelled_by_center'
    : 'cancelled_by_professional';
  appointment.cancelled_by = byCenter ? 2 : null;
  appointment.cancellation_reason = byCenter
    ? 'El paciente avisó por teléfono que no puede asistir'
    : 'Cambio en la agenda del profesional';
  appointment.is_penalized = byCenter && random() < 0.3;
};

/** Un paciente sin otro turno ese día (solo para el ejemplo). */
const pickFreePatient = (
  state: PrototypeState,
  pool: Patient[],
  date: string,
  random: RandomFn,
): Patient | null => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = pick(pool, random);
    const busy = state.appointments.some(
      (item) => item.patient_id === candidate.id && item.date === date,
    );
    if (!busy) return candidate;
  }

  return null;
};

export const buildInitialState = (): PrototypeState => {
  const random = createRandom(SEED);
  const currentDate = today();
  const currentTime = nowTime();

  const state: PrototypeState = {
    version: PROTOTYPE_STATE_VERSION,
    generated_on: currentDate,
    settings: clone(seedData.settings),
    specialties: clone(seedData.specialties),
    rooms: clone(seedData.rooms),
    professionals: clone(seedData.professionals),
    schedules: clone(seedData.schedules),
    holidays: clone(seedData.holidays),
    health_insurances: clone(seedData.healthInsurances),
    nationalities: clone(seedData.nationalities),
    patients: clone(seedData.patients).map((patient) => ({
      blocked_until: null,
      created_at: currentDate,
      ...patient,
    })),
    schedule_exceptions: [],
    appointments: [],
  };

  addDeskPatients(state, random);

  // Julián Sosa canceló tarde y queda penalizado unos días.
  state.patients[1].blocked_until = addDays(currentDate, 5);

  // El Dr. Vidal declaró una ausencia en su próximo día de atención.
  for (let offset = 1; offset <= 7; offset++) {
    const iso = addDays(currentDate, offset);
    if (worksOn(state, 3, iso)) {
      state.schedule_exceptions.push({
        id: 1,
        professional_id: 3,
        date: iso,
        start_time: '11:00',
        end_time: '12:00',
        type: 'absence',
        reason: 'Congreso de pediatría',
      });
      break;
    }
  }

  const children = state.patients.filter(
    (patient) => age(patient.birth_date) < 16,
  );
  const adults = state.patients.filter(
    (patient) => age(patient.birth_date) >= 16,
  );
  const usedCodes = new Set<string>();

  for (let offset = -35; offset <= 21; offset++) {
    const iso = addDays(currentDate, offset);
    const fill = offset < 0 ? 0.78 : Math.max(0.08, 0.72 - offset * 0.03);

    for (const professional of state.professionals) {
      for (const slot of daySlots(state, professional.id, iso)) {
        if (slot.state !== 'free' || random() > fill) continue;

        const pool = slot.specialty_id === 2 ? children : adults;
        const patient = pickFreePatient(state, pool, iso, random);
        if (!patient) continue;

        const finished =
          iso < currentDate ||
          (iso === currentDate && slot.end_time <= currentTime);
        const source = random() < 0.55 && patient.password ? 'portal' : 'desk';

        const appointment: Appointment = {
          id: state.appointments.length + 1,
          patient_id: patient.id,
          professional_id: professional.id,
          specialty_id: slot.specialty_id,
          room_id: slot.room_id,
          created_by: source === 'desk' ? 2 : null,
          cancelled_by: null,
          date: iso,
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: 'booked',
          source,
          confirmation_code: newConfirmationCode(usedCodes, random),
          reason: pick(REASONS[slot.specialty_id] ?? ['Consulta'], random),
          cancellation_reason: '',
          is_penalized: false,
          notes: '',
          attended_at: null,
          created_at: addDays(iso, -Math.ceil(random() * 10)),
          updated_at: null,
        };

        const roll = random();
        // Dermatología falta más, así la alerta de ausentismo tiene qué mostrar.
        const noShowRate = slot.specialty_id === 4 ? 0.17 : 0.05;

        if (roll < 0.05) {
          applyCancellation(appointment, random);
        } else if (finished) {
          appointment.status =
            roll < 0.05 + noShowRate ? 'no_show' : 'attended';
          if (appointment.status === 'attended') {
            appointment.attended_at = `${iso}T${slot.end_time}`;
          }
        } else if (random() < (offset <= 1 ? 0.55 : 0.3)) {
          appointment.status = 'confirmed';
        }

        state.appointments.push(appointment);
      }
    }
  }

  return state;
};
