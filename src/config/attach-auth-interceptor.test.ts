import axios, {
  type AxiosAdapter,
  AxiosError,
  type AxiosResponse,
} from 'axios';
import { queryClient } from '@/config/query-client';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import type { AuthUser } from '@/modules/auth/types/auth.types';
import { attachAuthInterceptors } from './attach-auth-interceptor';

const user: AuthUser = {
  id: 1,
  name: 'Roberto Fernandes',
  shortName: 'R. Fernandes',
  email: 'admin@cmbelgrano.com.ar',
  role: 'admin',
};

const echoAdapter: AxiosAdapter = async (config) => ({
  config,
  data: {
    accept: config.headers?.Accept ?? null,
    authorization: config.headers?.Authorization ?? null,
  },
  headers: {},
  status: 200,
  statusText: 'OK',
});

const failingAdapter = (status: number): AxiosAdapter => {
  return async (config) => {
    const response: AxiosResponse = {
      config,
      data: {},
      headers: {},
      status,
      statusText: String(status),
    };

    throw new AxiosError(
      `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      undefined,
      response,
    );
  };
};

describe('attachAuthInterceptors', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    useAuthStore.getState().clearSession();
  });

  test('always asks for JSON and omits the header without a session', async () => {
    const instance = attachAuthInterceptors(
      axios.create({ adapter: echoAdapter }),
    );

    const response = await instance.get('/public');

    expect(response.data).toEqual({
      accept: 'application/json',
      authorization: null,
    });
  });

  test('attaches the Sanctum token of the open session', async () => {
    useAuthStore.getState().setSession({ token: 'sanctum-token', user });
    const instance = attachAuthInterceptors(
      axios.create({ adapter: echoAdapter }),
    );

    const response = await instance.get('/private');

    expect(response.data.authorization).toBe('Bearer sanctum-token');
  });

  test('closes the session and redirects on 401', async () => {
    useAuthStore.getState().setSession({ token: 'expired-token', user });
    const redirectToLogin = jest.fn();
    const clearQueries = jest.spyOn(queryClient, 'clear');
    const instance = attachAuthInterceptors(
      axios.create({ adapter: failingAdapter(401) }),
      { redirectToLogin },
    );

    await expect(instance.get('/private')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(clearQueries).toHaveBeenCalled();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  test('leaves a failed login alone, because there is no session to close', async () => {
    const redirectToLogin = jest.fn();
    const instance = attachAuthInterceptors(
      axios.create({ adapter: failingAdapter(401) }),
      { redirectToLogin },
    );

    await expect(instance.post('/login')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  test('keeps the session when the endpoint is forbidden', async () => {
    useAuthStore.getState().setSession({ token: 'sanctum-token', user });
    const redirectToLogin = jest.fn();
    const instance = attachAuthInterceptors(
      axios.create({ adapter: failingAdapter(403) }),
      { redirectToLogin },
    );

    await expect(instance.get('/forbidden')).rejects.toMatchObject({
      response: { status: 403 },
    });

    expect(useAuthStore.getState().token).toBe('sanctum-token');
    expect(redirectToLogin).not.toHaveBeenCalled();
  });
});
