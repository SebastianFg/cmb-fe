import { envConfig } from './env-config';
import { createApi } from './http';

export const apiCore = createApi(envConfig.VITE_API_URL);
