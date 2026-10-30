import axios from 'axios';
import { attachAuthInterceptors } from './attach-auth-interceptor';

const cache = new Map<string, ReturnType<typeof axios.create>>();

type CreateApiOptions = {
  withAuth?: boolean;
};

export const createApi = (baseURL: string, opts: CreateApiOptions = {}) => {
  if (!baseURL) throw new Error('Missing baseURL');
  if (cache.has(baseURL)) return cache.get(baseURL)!;

  const { withAuth = true } = opts;

  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  if (withAuth) {
    attachAuthInterceptors(instance);
  }

  cache.set(baseURL, instance);
  return instance;
};
