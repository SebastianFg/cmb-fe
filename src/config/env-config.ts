import { z } from 'zod';

/**
 * Sólo las variables que el navegador necesita. `VITE_APP_PORT` queda afuera a
 * propósito: es el puerto del servidor de desarrollo, lo lee `vite.config.ts`
 * con `loadEnv` y en un build desplegado no existe, así que exigirla acá
 * rompía la aplicación en producción sin motivo.
 */
const envSchema = z.object({
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

  // Vite incrusta estas variables al compilar: si fallan en un sitio ya
  // desplegado, el `.env` no estaba cuando se corrió `pnpm build`.
  throw new Error(
    `Configuración de entorno inválida. Revisar: ${Array.from(missingOrInvalidKeys).join(', ')}. ` +
      'Se resuelven al compilar: verificá que el archivo .env esté presente al correr «pnpm build» y volvé a compilar.',
  );
}

export const envConfig = parsedEnv.data;

export type EnvConfig = typeof envConfig;
