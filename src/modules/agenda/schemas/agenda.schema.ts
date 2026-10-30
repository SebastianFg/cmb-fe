import { z } from 'zod';

/** Tope de la observación administrativa, igual que en el prototipo. */
export const NOTES_MAX = 500;

export const recordSchema = z.object({
  notes: z
    .string()
    .max(NOTES_MAX, `La observación admite hasta ${NOTES_MAX} caracteres.`),
});

export type RecordFormValues = z.infer<typeof recordSchema>;

/** Cancelación (RF-18): el motivo queda registrado en el turno. */
export const cancellationSchema = z.object({
  cancellation_reason: z
    .string()
    .trim()
    .min(1, 'Indicá el motivo de la cancelación: queda registrado en el turno.')
    .min(5, 'Describí el motivo con un poco más de detalle.')
    .max(200, 'El motivo admite hasta 200 caracteres.'),
});

export type CancellationFormValues = z.infer<typeof cancellationSchema>;

/** Ausencia o bloqueo de franja (RF-12). */
export const exceptionSchema = z
  .object({
    professional_id: z.string().min(1, 'Elegí el profesional.'),
    start_time: z.string().min(1, 'Elegí el horario.'),
    end_time: z.string().min(1, 'Elegí el horario.'),
    reason: z
      .string()
      .trim()
      .min(3, 'Indicá el motivo (por ejemplo: congreso, trámite personal).')
      .max(80, 'El motivo admite hasta 80 caracteres.'),
  })
  .refine((values) => values.end_time > values.start_time, {
    path: ['end_time'],
    message: 'La hora de fin tiene que ser posterior a la de inicio.',
  });

export type ExceptionFormValues = z.infer<typeof exceptionSchema>;

export const exceptionDefaults: ExceptionFormValues = {
  professional_id: '',
  start_time: '',
  end_time: '',
  reason: '',
};
