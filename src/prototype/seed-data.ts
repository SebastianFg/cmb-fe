import type {
  CenterSettings,
  HealthInsurance,
  Holiday,
  Nationality,
  Professional,
  Room,
  Schedule,
  Specialty,
} from '@/shared/types/domain.types';
import healthInsurances from './data/health_insurances.json';
import holidays from './data/holidays.json';
import nationalities from './data/nationalities.json';
import patients from './data/patients.json';
import professionals from './data/professionals.json';
import rooms from './data/rooms.json';
import schedules from './data/schedules.json';
import settings from './data/settings.json';
import specialties from './data/specialties.json';

/** Paciente tal como viene del seed, antes de completar los campos derivados. */
export type SeedPatient = {
  id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationality_id: number;
  phone: string;
  email: string;
  password: string | null;
  health_insurance_id: number;
  member_number: string;
};

/**
 * Datos de ejemplo de `doc/vistas/data`. Los JSON se tipan acá, en el borde,
 * para que el resto de la aplicación trabaje con el modelo de dominio.
 */
export const seedData = {
  settings: settings as CenterSettings,
  specialties: specialties as Specialty[],
  rooms: rooms as Room[],
  professionals: professionals as Professional[],
  schedules: schedules as Schedule[],
  holidays: holidays as Holiday[],
  healthInsurances: healthInsurances as HealthInsurance[],
  nationalities: nationalities as Nationality[],
  patients: patients as SeedPatient[],
};
