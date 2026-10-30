import type {
  HealthInsurance,
  IsoDate,
  Nationality,
} from '@/shared/types/domain.types';

export type PortalFilter = '' | 'active' | 'none';
export type PenaltyFilter = '' | 'yes' | 'no';

export type PatientFilters = {
  search: string;
  healthInsuranceId: number | null;
  portal: PortalFilter;
  penalty: PenaltyFilter;
  page: number;
};

export const emptyPatientFilters: PatientFilters = {
  search: '',
  healthInsuranceId: null,
  portal: '',
  penalty: '',
  page: 1,
};

/** Fila del listado del mostrador. */
export type PatientListItem = {
  id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  member_number: string | null;
  has_portal_access: boolean;
  blocked_until: IsoDate | null;
  nationality: Nationality | null;
  health_insurance: HealthInsurance | null;
};

export type PatientPage = {
  items: PatientListItem[];
  total: number;
  currentPage: number;
  lastPage: number;
};
