import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookAppointment } from '@/modules/scheduling/services/scheduling.service';
import type {
  BookedAppointment,
  BookingRequest,
} from '@/modules/scheduling/types/scheduling.types';
import { schedulingKeys } from './use-booking-catalogs';

type UseBookAppointmentOptions = {
  onBooked: (appointment: BookedAppointment) => void;
  /** `true` en el portal: el turno es para el paciente de la sesión. */
  selfService?: boolean;
};

export const useBookAppointment = ({
  onBooked,
  selfService = false,
}: UseBookAppointmentOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: BookingRequest) =>
      bookAppointment(request, selfService),
    onSuccess: (appointment) => {
      // La franja dejó de estar libre: la disponibilidad se recarga.
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: schedulingKeys.appointments });
      onBooked(appointment);
    },
  });

  return {
    error: mutation.error,
    isBooking: mutation.isPending,
    book: mutation.mutate,
  };
};
