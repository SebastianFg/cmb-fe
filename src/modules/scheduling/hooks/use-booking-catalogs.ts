import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/config/query-config';
import {
  fetchProfessionals,
  fetchSpecialties,
} from '@/modules/scheduling/services/scheduling.service';

export const schedulingKeys = {
  specialties: ['specialties'] as const,
  professionals: (specialtyId: number | null) =>
    ['professionals', specialtyId] as const,
  days: (specialtyId: number | null, professionalId: number | null) =>
    ['availability', 'days', specialtyId, professionalId] as const,
  slots: (
    specialtyId: number | null,
    professionalId: number | null,
    date: string | null,
  ) => ['availability', 'slots', specialtyId, professionalId, date] as const,
  appointments: ['appointments'] as const,
};

/** El plantel completo, para los filtros que no parten de una especialidad. */
export const useProfessionals = () => {
  const query = useQuery({
    queryKey: schedulingKeys.professionals(null),
    queryFn: () => fetchProfessionals(null),
    staleTime: CACHE_TIMES.SELECT_STALE,
    gcTime: CACHE_TIMES.SELECT_GC,
  });

  return {
    professionals: query.data ?? [],
    isLoading: query.isLoading,
  };
};

/** Especialidades del centro y profesionales de la elegida. */
export const useBookingCatalogs = (specialtyId: number | null) => {
  const specialties = useQuery({
    queryKey: schedulingKeys.specialties,
    queryFn: fetchSpecialties,
    staleTime: CACHE_TIMES.SELECT_STALE,
    gcTime: CACHE_TIMES.SELECT_GC,
  });

  const professionals = useQuery({
    queryKey: schedulingKeys.professionals(specialtyId),
    queryFn: () => fetchProfessionals(specialtyId as number),
    enabled: specialtyId !== null,
    staleTime: CACHE_TIMES.SELECT_STALE,
    gcTime: CACHE_TIMES.SELECT_GC,
  });

  return {
    specialties: specialties.data ?? [],
    professionals: specialtyId === null ? [] : (professionals.data ?? []),
    isLoading: specialties.isLoading,
  };
};
