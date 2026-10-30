/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PORT: string;
  readonly VITE_PUBLIC_ENVIRONMENT: string;
  readonly VITE_PUBLIC_PROJECT_SHORT_NAME: string;
  readonly VITE_PUBLIC_APP_VERSION: string;
  readonly VITE_AUTH_MODE: 'sanctum' | 'prototype';
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
