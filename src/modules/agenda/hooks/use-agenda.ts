import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CACHE_TIMES } from '@/config/query-config';
import {
  cancelAppointment,
  declareScheduleException,
  fetchAgenda,
  recordAppointment,
} from '@/modules/agenda/services/agenda.service';
import type {
  AppointmentCancellation,
  AppointmentRecord,
  NewScheduleException,
} from '@/modules/agenda/types/agenda.types';
import type { IsoDate } from '@/shared/types/domain.types';

export const agendaKeys = {
  all: ['agenda'] as const,
  day: (date: IsoDate, professionalId: number | null) =>
    [...agendaKeys.all, date, professionalId] as const,
};

export const useAgenda = (date: IsoDate, professionalId: number | null) => {
  const query = useQuery({
    queryKey: agendaKeys.day(date, professionalId),
    queryFn: () => fetchAgenda({ date, professionalId }),
    placeholderData: keepPreviousData,
    staleTime: CACHE_TIMES.LIST_STALE,
    gcTime: CACHE_TIMES.LIST_GC,
  });

  return {
    day: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
};

/**
 * Todo lo que cambia un turno invalida la agenda y la disponibilidad: la
 * franja que se libera o se ocupa tiene que verse en las dos pantallas.
 */
const useAgendaMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  onDone: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      onDone();
    },
  });
};

export const useRecordAppointment = (onDone: () => void) => {
  const mutation = useAgendaMutation<AppointmentRecord>(
    recordAppointment,
    onDone,
  );

  return {
    error: mutation.error,
    isSaving: mutation.isPending,
    save: mutation.mutate,
  };
};

export const useCancelAppointment = (onDone: () => void) => {
  const mutation = useAgendaMutation<AppointmentCancellation>(
    cancelAppointment,
    onDone,
  );

  return {
    error: mutation.error,
    isCancelling: mutation.isPending,
    cancel: mutation.mutate,
  };
};

export const useDeclareException = (onDone: () => void) => {
  const mutation = useAgendaMutation<NewScheduleException>(
    declareScheduleException,
    onDone,
  );

  return {
    error: mutation.error,
    isSaving: mutation.isPending,
    declare: mutation.mutate,
  };
};
