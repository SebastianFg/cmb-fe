import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/config/query-config';
import {
  fetchAppointment,
  rescheduleAppointment,
} from '@/modules/scheduling/services/scheduling.service';
import type {
  BookedAppointment,
  BookingRequest,
} from '@/modules/scheduling/types/scheduling.types';

export const appointmentKeys = {
  detail: (id: number | null) => ['appointment', id] as const,
};

/** Turno que se está reprogramando. */
export const useAppointment = (id: number | null) => {
  const query = useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => fetchAppointment(id as number),
    enabled: id !== null,
    staleTime: CACHE_TIMES.DETAIL_STALE,
    gcTime: CACHE_TIMES.DETAIL_GC,
  });

  return {
    appointment: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};

type UseRescheduleOptions = {
  id: number;
  onRescheduled: (appointment: BookedAppointment) => void;
};

export const useRescheduleAppointment = ({
  id,
  onRescheduled,
}: UseRescheduleOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: Omit<BookingRequest, 'patient_id'>) =>
      rescheduleAppointment(id, request),
    onSuccess: (appointment) => {
      // Se liberó una franja y se ocupó otra: agenda y disponibilidad cambian.
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      onRescheduled(appointment);
    },
  });

  return {
    error: mutation.error,
    isSaving: mutation.isPending,
    reschedule: mutation.mutate,
  };
};
