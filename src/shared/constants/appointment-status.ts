import type { BadgeTone } from '@/shared/components/badge/badge';
import type { AppointmentStatus } from '@/shared/types/domain.types';

/** Etiqueta y tono de cada estado, tomados de `js/ui.js` del prototipo. */
export const APPOINTMENT_STATUS: Record<
  AppointmentStatus,
  { label: string; tone: BadgeTone }
> = {
  booked: { label: 'Reservado', tone: 'booked' },
  confirmed: { label: 'Confirmado', tone: 'confirmed' },
  attended: { label: 'Atendido', tone: 'attended' },
  no_show: { label: 'Ausente', tone: 'no-show' },
  cancelled_by_professional: { label: 'Cancelado', tone: 'cancelled' },
  cancelled_by_center: { label: 'Cancelado', tone: 'cancelled' },
};

export const isCancelledStatus = (status: AppointmentStatus): boolean =>
  status === 'cancelled_by_professional' || status === 'cancelled_by_center';
