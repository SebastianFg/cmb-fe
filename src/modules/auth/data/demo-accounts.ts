import type { AuthUser } from '@/modules/auth/types/auth.types';

export type DemoAccount = {
  password: string;
  user: AuthUser;
};

/**
 * Cuentas del prototipo, tomadas de `doc/vistas/data/users.json`. Solo se
 * usan con `VITE_AUTH_MODE=prototype`, mientras `cmb-be` no exponga el login
 * de Sanctum.
 */
export const DEMO_PASSWORD = 'turnos2026';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    password: DEMO_PASSWORD,
    user: {
      id: 1,
      name: 'Roberto Fernandes',
      shortName: 'R. Fernandes',
      email: 'admin@cmbelgrano.com.ar',
      role: 'admin',
    },
  },
  {
    password: DEMO_PASSWORD,
    user: {
      id: 2,
      name: 'Claudia Molina',
      shortName: 'C. Molina',
      email: 'recepcion@cmbelgrano.com.ar',
      role: 'reception',
    },
  },
  {
    password: DEMO_PASSWORD,
    user: {
      id: 3,
      name: 'Paula Aguirre',
      shortName: 'Dra. P. Aguirre',
      email: 'paguirre@cmbelgrano.com.ar',
      role: 'professional',
    },
  },
];
