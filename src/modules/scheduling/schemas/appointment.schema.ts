import { z } from 'zod';

/** Tope de caracteres del motivo, igual que en el prototipo. */
export const REASON_MAX = 200;

/**
 * Validación del formulario de turno (RF-15). El servidor repite estas reglas
 * y agrega las que necesitan la agenda completa: feriado, horizonte, franja
 * todavía libre y superposición del paciente.
 */
export const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Buscá y seleccioná el paciente.'),
  specialty_id: z.string().min(1, 'Elegí la especialidad.'),
  /** Vacío significa «cualquiera»: filtra las franjas, no es un dato del turno. */
  professional_filter: z.string(),
  date: z.string().min(1, 'Elegí el día.'),
  /** "profesionalId|HH:MM|HH:MM": la franja lleva su profesional. */
  slot: z.string().min(1, 'Elegí una franja disponible.'),
  reason: z
    .string()
    .max(REASON_MAX, `El motivo admite hasta ${REASON_MAX} caracteres.`),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export const appointmentDefaults: AppointmentFormValues = {
  patient_id: '',
  specialty_id: '',
  professional_filter: '',
  date: '',
  slot: '',
  reason: '',
};

/** Identificador de franja usado por los radios del formulario. */
export const slotValue = (professionalId: number, startTime: string) =>
  `${professionalId}|${startTime}`;

export const readSlotValue = (value: string) => {
  const [professionalId, startTime] = value.split('|');
  return { professionalId: Number(professionalId), startTime };
};
