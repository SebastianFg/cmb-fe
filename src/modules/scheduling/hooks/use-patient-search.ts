import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/config/query-config';
import { fetchPatients } from '@/modules/patients/services/patient.service';
import { emptyPatientFilters } from '@/modules/patients/types/patient.types';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';

/** Desde cuántos caracteres vale la pena consultar. */
const MIN_LENGTH = 2;

/** Cuántas coincidencias muestra la lista, igual que el prototipo. */
const MAX_RESULTS = 6;

/** Búsqueda de pacientes por documento o apellido para el buscador del alta. */
export const usePatientSearch = (query: string) => {
  const search = useDebouncedValue(query.trim(), 300);
  const isEnabled = search.length >= MIN_LENGTH;

  const result = useQuery({
    queryKey: ['patients', 'search', search],
    queryFn: () => fetchPatients({ ...emptyPatientFilters, search }),
    enabled: isEnabled,
    staleTime: CACHE_TIMES.LIST_STALE,
    gcTime: CACHE_TIMES.LIST_GC,
  });

  return {
    isEnabled,
    isSearching: isEnabled && result.isFetching,
    matches: (result.data?.items ?? []).slice(0, MAX_RESULTS),
  };
};
