import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/config/query-config';
import { fetchPatients } from '@/modules/patients/services/patient.service';
import type { PatientFilters } from '@/modules/patients/types/patient.types';

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: PatientFilters) => [...patientKeys.lists(), filters] as const,
};

export const usePatients = (filters: PatientFilters) => {
  const query = useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => fetchPatients(filters),
    placeholderData: keepPreviousData,
    staleTime: CACHE_TIMES.LIST_STALE,
    gcTime: CACHE_TIMES.LIST_GC,
  });

  return {
    page: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
};
