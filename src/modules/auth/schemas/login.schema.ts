import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresá tu correo electrónico.')
    .pipe(z.email('Ingresá un correo electrónico válido.')),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
  keepSession: z.boolean(),
  notARobot: z
    .boolean()
    .refine((checked) => checked, 'Confirmá que no sos un robot.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const loginDefaultValues: LoginFormValues = {
  email: '',
  password: '',
  keepSession: false,
  notARobot: false,
};
