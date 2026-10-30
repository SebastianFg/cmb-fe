import axios from 'axios';
import { apiCore } from '@/config/api-routes';
import { DEMO_ACCOUNTS } from '@/modules/auth/data/demo-accounts';
import { isSanctumAuthMode } from '@/modules/auth/services/auth.service';
import type { PatientRegistrationValues } from '@/modules/patients/schemas/patient.schema';
import type {
  PatientFilters,
  PatientListItem,
  PatientPage,
} from '@/modules/patients/types/patient.types';
import {
  addPatient,
  findPatientByDocument,
  findPatientByEmail,
  getHealthInsurances,
  getNationalities,
  getPatients,
  insuranceName,
  isPenalized,
} from '@/prototype/prototype-store';
import type {
  HealthInsurance,
  Nationality,
  Patient,
} from '@/shared/types/domain.types';

/** Error de validación que pertenece a un campo concreto del formulario. */
export class PatientFieldError extends Error {
  readonly field: keyof PatientRegistrationValues;

  constructor(field: keyof PatientRegistrationValues, message: string) {
    super(message);
    this.name = 'PatientFieldError';
    this.field = field;
  }
}

type ApiEnvelope<T> = { data: T };

type PaginationEnvelope = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

/**
 * La API devuelve los errores de validación dentro de `data`, no en `errors`:
 * es la forma que fija `ResponseJson` del backend.
 */
const toFieldError = (error: unknown): PatientFieldError | null => {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) return null;

  const payload = (error.response.data as { data?: unknown } | undefined)?.data;
  if (typeof payload !== 'object' || payload === null) return null;

  const [field, messages] = Object.entries(payload)[0] ?? [];
  if (!field) return null;

  const message = Array.isArray(messages)
    ? String(messages[0])
    : String(messages);

  return new PatientFieldError(
    field as keyof PatientRegistrationValues,
    message,
  );
};

export const fetchNationalities = async (): Promise<Nationality[]> => {
  if (!isSanctumAuthMode()) return getNationalities();

  const { data } =
    await apiCore.get<ApiEnvelope<Nationality[]>>('/nationalities');
  return data.data;
};

export const fetchHealthInsurances = async (): Promise<HealthInsurance[]> => {
  if (!isSanctumAuthMode()) return getHealthInsurances();

  const { data } =
    await apiCore.get<ApiEnvelope<HealthInsurance[]>>('/health-insurances');
  return data.data;
};

const isStaffEmail = (email: string) =>
  DEMO_ACCOUNTS.some(({ user }) => user.email === email);

const registerInPrototype = (values: PatientRegistrationValues): Patient => {
  const email = values.email.toLowerCase();

  if (findPatientByDocument(values.document_number)) {
    throw new PatientFieldError(
      'document_number',
      'Ya existe una ficha con ese documento.',
    );
  }

  if (email && (findPatientByEmail(email) || isStaffEmail(email))) {
    throw new PatientFieldError('email', 'Ese correo ya está registrado.');
  }

  return addPatient({
    document_number: values.document_number,
    first_name: values.first_name,
    last_name: values.last_name,
    birth_date: values.birth_date,
    nationality_id: Number(values.nationality_id),
    phone: values.phone,
    email,
    password: values.password || null,
    health_insurance_id: Number(values.health_insurance_id),
    member_number: values.member_number,
  });
};

export const registerPatient = async (
  values: PatientRegistrationValues,
): Promise<{ id: number; first_name: string; email: string }> => {
  if (!isSanctumAuthMode()) {
    const patient = registerInPrototype(values);
    return {
      id: patient.id,
      first_name: patient.first_name,
      email: patient.email,
    };
  }

  try {
    const { data } = await apiCore.post<ApiEnvelope<PatientListItem>>(
      '/patients',
      {
        document_number: values.document_number,
        first_name: values.first_name,
        last_name: values.last_name,
        birth_date: values.birth_date,
        nationality_id: values.nationality_id,
        phone: values.phone,
        email: values.email || null,
        health_insurance_id: values.health_insurance_id,
        member_number: values.member_number || null,
      },
    );

    return {
      id: data.data.id,
      first_name: data.data.first_name,
      email: data.data.email ?? '',
    };
  } catch (error: unknown) {
    throw toFieldError(error) ?? error;
  }
};

const matchesPrototypeFilters = (
  patient: Patient,
  filters: PatientFilters,
): boolean => {
  const search = filters.search.trim().toLowerCase();

  if (
    search &&
    !patient.document_number.includes(search) &&
    !patient.last_name.toLowerCase().includes(search) &&
    !patient.first_name.toLowerCase().includes(search)
  ) {
    return false;
  }

  if (
    filters.healthInsuranceId &&
    patient.health_insurance_id !== filters.healthInsuranceId
  ) {
    return false;
  }

  if (
    filters.portal &&
    (filters.portal === 'active') !== Boolean(patient.password)
  ) {
    return false;
  }

  if (filters.penalty && (filters.penalty === 'yes') !== isPenalized(patient)) {
    return false;
  }

  return true;
};

const PAGE_SIZE = 10;

export const fetchPatients = async (
  filters: PatientFilters,
): Promise<PatientPage> => {
  if (!isSanctumAuthMode()) {
    const insurances = getHealthInsurances();
    const rows = getPatients()
      .filter((patient) => matchesPrototypeFilters(patient, filters))
      .sort((a, b) =>
        `${a.last_name} ${a.first_name}`.localeCompare(
          `${b.last_name} ${b.first_name}`,
          'es',
        ),
      );

    const start = (filters.page - 1) * PAGE_SIZE;

    return {
      total: rows.length,
      currentPage: filters.page,
      lastPage: Math.max(1, Math.ceil(rows.length / PAGE_SIZE)),
      items: rows.slice(start, start + PAGE_SIZE).map((patient) => ({
        id: patient.id,
        document_number: patient.document_number,
        first_name: patient.first_name,
        last_name: patient.last_name,
        phone: patient.phone,
        email: patient.email || null,
        member_number: patient.member_number || null,
        has_portal_access: Boolean(patient.password),
        blocked_until: patient.blocked_until,
        nationality:
          getNationalities().find(
            (item) => item.id === patient.nationality_id,
          ) ?? null,
        health_insurance:
          insurances.find((item) => item.id === patient.health_insurance_id) ??
          null,
      })),
    };
  }

  const { data } = await apiCore.get<
    ApiEnvelope<PatientListItem[]> & { pagination: PaginationEnvelope }
  >('/patients', {
    params: {
      search: filters.search || undefined,
      health_insurance_id: filters.healthInsuranceId || undefined,
      portal: filters.portal || undefined,
      penalty: filters.penalty || undefined,
      page: filters.page,
    },
  });

  return {
    items: data.data,
    total: data.pagination.total,
    currentPage: data.pagination.current_page,
    lastPage: data.pagination.last_page,
  };
};

export { insuranceName };
