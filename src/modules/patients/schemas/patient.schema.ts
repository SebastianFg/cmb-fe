import { z } from 'zod';
import { age, today } from '@/shared/utils/dates';

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const MEMBER_PATTERN = /^[A-Za-z0-9-]{4,20}$/;
const DIGITS_ONLY = /^\d+$/;

const EMAIL_MESSAGE =
  'El correo no tiene un formato válido (ejemplo: nombre@dominio.com).';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const nameField = (article: string, label: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresá ${article}.`)
    .min(2, `Revisá ${article}: es demasiado corto.`)
    .regex(NAME_PATTERN, 'Usá solo letras, espacios, apóstrofo o guion.')
    .describe(label);

/**
 * Validación de la ficha del paciente (RF-14, RF-15). Reproduce las reglas de
 * `doc/vistas/js/validation.js`. La unicidad de documento y correo no está acá:
 * la resuelve el servicio, porque depende de los datos ya guardados.
 */
export type PatientFormMode = 'portal' | 'desk';

export const createPatientRegistrationSchema = ({
  privateInsuranceId,
  mode = 'portal',
}: {
  privateInsuranceId: number | null;
  /** `desk` es la carga de recepción: sin credenciales y con correo opcional. */
  mode?: PatientFormMode;
}) =>
  z
    .object({
      document_number: z
        .string()
        .trim()
        .min(1, 'Ingresá el número de documento.')
        .regex(DIGITS_ONLY, 'Escribí solo números, sin puntos ni espacios.')
        .refine(
          (value) => value.length >= 7 && value.length <= 8,
          'El documento debe tener 7 u 8 dígitos, sin puntos ni espacios.',
        ),
      last_name: nameField('el apellido', 'Apellido'),
      first_name: nameField('el nombre', 'Nombre'),
      birth_date: z
        .string()
        .min(1, 'Ingresá la fecha de nacimiento.')
        .refine(
          (value) => value <= today(),
          'La fecha de nacimiento no puede ser posterior a hoy.',
        )
        .refine(
          (value) => age(value) <= 120,
          'Revisá el año: la edad resultante supera los 120 años.',
        ),
      nationality_id: z.string().min(1, 'Elegí la nacionalidad.'),
      phone: z
        .string()
        .trim()
        .min(1, 'Ingresá un teléfono de contacto.')
        .refine(
          (value) => onlyDigits(value).length === 10,
          'El teléfono debe tener 10 dígitos: característica sin 0 y número sin 15.',
        ),
      email:
        mode === 'portal'
          ? z
              .string()
              .trim()
              .min(1, 'Para crear tu acceso necesitamos un correo electrónico.')
              .pipe(z.email(EMAIL_MESSAGE))
          : z
              .string()
              .trim()
              .refine(
                (value) => value === '' || z.email().safeParse(value).success,
                EMAIL_MESSAGE,
              ),
      health_insurance_id: z
        .string()
        .min(
          1,
          'Elegí la obra social. Si no tiene cobertura, elegí «Particular».',
        ),
      member_number: z.string().trim(),
      password:
        mode === 'portal'
          ? z
              .string()
              .min(1, 'Elegí una contraseña.')
              .refine(
                (value) =>
                  value.length >= 8 &&
                  /[A-Za-z]/.test(value) &&
                  /\d/.test(value),
                'La contraseña necesita al menos 8 caracteres, con letras y números.',
              )
          : z.string(),
      password_confirmation:
        mode === 'portal'
          ? z.string().min(1, 'Repetí la contraseña.')
          : z.string(),
      terms:
        mode === 'portal'
          ? z
              .boolean()
              .refine(
                (accepted) => accepted,
                'Tenés que aceptar el uso de tus datos para gestionar turnos.',
              )
          : z.boolean(),
      /** Solo en mostrador: enviar invitación al portal. */
      invite: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (
        mode === 'portal' &&
        values.password_confirmation &&
        values.password !== values.password_confirmation
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['password_confirmation'],
          message: 'Las contraseñas no coinciden.',
        });
      }

      // Sin obra social elegida no se reclama el afiliado: ya hay un error
      // en ese campo y pedir dos cosas a la vez confunde.
      if (!values.health_insurance_id) return;

      const isPrivate =
        privateInsuranceId !== null &&
        Number(values.health_insurance_id) === privateInsuranceId;

      if (!isPrivate && !values.member_number) {
        ctx.addIssue({
          code: 'custom',
          path: ['member_number'],
          message: 'Ingresá el número de afiliado que figura en la credencial.',
        });
        return;
      }

      if (values.member_number && !MEMBER_PATTERN.test(values.member_number)) {
        ctx.addIssue({
          code: 'custom',
          path: ['member_number'],
          message:
            'El número de afiliado admite letras, números y guiones (4 a 20 caracteres).',
        });
      }
    });

export type PatientRegistrationSchema = ReturnType<
  typeof createPatientRegistrationSchema
>;

/**
 * Los ids de catálogo viajan como texto, que es lo que da un `<select>`; el
 * servicio los convierte al armar el pedido.
 */
export type PatientRegistrationValues = z.infer<PatientRegistrationSchema>;

export const patientRegistrationDefaults: PatientRegistrationValues = {
  document_number: '',
  last_name: '',
  first_name: '',
  birth_date: '',
  nationality_id: '',
  phone: '',
  email: '',
  health_insurance_id: '',
  member_number: '',
  password: '',
  password_confirmation: '',
  terms: false,
  invite: false,
};
