import type { EnvConfig } from '@/config/env-config';

export const envConfig = {
  VITE_APP_PORT: '3000',
  VITE_PUBLIC_ENVIRONMENT: 'test',
  VITE_PUBLIC_PROJECT_SHORT_NAME: 'Centro Médico Belgrano',
  VITE_PUBLIC_APP_VERSION: '0.0.0-test',
  VITE_AUTH_MODE: 'prototype',
  VITE_API_URL: 'https://api.test.local/api/v1',
} satisfies EnvConfig;
