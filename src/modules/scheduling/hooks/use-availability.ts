import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/config/query-config';
import {
  fetchAvailabilityDays,
  fetchDaySlots,
} from '@/modules/scheduling/services/scheduling.service';
import type { IsoDate } from '@/shared/types/domain.types';
import { schedulingKeys } from './use-booking-catalogs';

type AvailabilityArgs = {
  specialtyId: number | null;
  professionalId: number | null;
};

/**
 * La disponibilidad se consulta en el momento: el tiempo de vigencia es corto
 * porque otra sesión puede tomar la franja mientras se completa el formulario.
 */
export const useAvailabilityDays = ({
  specialtyId,
  professionalId,
}: AvailabilityArgs) => {
  const query = useQuery({
    queryKey: schedulingKeys.days(specialtyId, professionalId),
    queryFn: () => fetchAvailabilityDays({ specialtyId, professionalId }),
    enabled: specialtyId !== null,
    placeholderData: keepPreviousData,
    staleTime: CACHE_TIMES.LIST_STALE,
    gcTime: CACHE_TIMES.LIST_GC,
  });

  return {
    days: query.data?.days ?? [],
    horizonDays: query.data?.horizonDays ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};

export const useDaySlots = ({
  specialtyId,
  professionalId,
  date,
}: AvailabilityArgs & { date: IsoDate | null }) => {
  const query = useQuery({
    queryKey: schedulingKeys.slots(specialtyId, professionalId, date),
    queryFn: () => fetchDaySlots({ specialtyId, professionalId, date }),
    enabled: specialtyId !== null && date !== null,
    placeholderData: keepPreviousData,
    staleTime: CACHE_TIMES.LIST_STALE,
    gcTime: CACHE_TIMES.LIST_GC,
  });

  return {
    slots: query.data?.slots ?? [],
    holiday: query.data?.holiday ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};
