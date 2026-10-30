import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_PORT: z.string().trim().min(1, 'VITE_APP_PORT'),
  VITE_PUBLIC_ENVIRONMENT: z.string().trim().min(1, 'VITE_PUBLIC_ENVIRONMENT'),
  VITE_PUBLIC_PROJECT_SHORT_NAME: z
    .string()
    .trim()
    .min(1, 'VITE_PUBLIC_PROJECT_SHORT_NAME'),
  VITE_PUBLIC_APP_VERSION: z.string().trim().min(1, 'VITE_PUBLIC_APP_VERSION'),

  /**
   * `sanctum` pega contra la API; `prototype` resuelve el login con las
   * cuentas de ejemplo mientras el backend no exponga los endpoints.
   */
  VITE_AUTH_MODE: z.enum(['sanctum', 'prototype']),

  VITE_API_URL: z.url({ error: 'VITE_API_URL' }),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const missingOrInvalidKeys = new Set<string>();

  for (const issue of parsedEnv.error.issues) {
    const pathKey = issue.path[0];
    if (typeof pathKey === 'string' && pathKey.length > 0) {
      missingOrInvalidKeys.add(pathKey);
    }
  }

  throw new Error(
    `Configuración de entorno inválida. Revisar: ${Array.from(missingOrInvalidKeys).join(', ')}`,
  );
}

export const envConfig = parsedEnv.data;

export type EnvConfig = typeof envConfig;
