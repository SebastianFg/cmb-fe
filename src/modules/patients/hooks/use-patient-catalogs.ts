import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/config/query-config';
import {
  fetchHealthInsurances,
  fetchNationalities,
} from '@/modules/patients/services/patient.service';

const PRIVATE_INSURANCE_NAME = 'Particular';

export const patientCatalogKeys = {
  nationalities: ['nationalities'] as const,
  healthInsurances: ['health-insurances'] as const,
};

export const usePatientCatalogs = () => {
  const nationalities = useQuery({
    queryKey: patientCatalogKeys.nationalities,
    queryFn: fetchNationalities,
    staleTime: CACHE_TIMES.SELECT_STALE,
    gcTime: CACHE_TIMES.SELECT_GC,
  });

  const healthInsurances = useQuery({
    queryKey: patientCatalogKeys.healthInsurances,
    queryFn: fetchHealthInsurances,
    staleTime: CACHE_TIMES.SELECT_STALE,
    gcTime: CACHE_TIMES.SELECT_GC,
  });

  const privateInsuranceId =
    healthInsurances.data?.find(
      (insurance) => insurance.name === PRIVATE_INSURANCE_NAME,
    )?.id ?? null;

  return {
    nationalities: nationalities.data ?? [],
    healthInsurances: healthInsurances.data ?? [],
    privateInsuranceId,
    isLoading: nationalities.isLoading || healthInsurances.isLoading,
  };
};
