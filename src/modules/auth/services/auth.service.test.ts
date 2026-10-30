import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { apiCore } from '@/config/api-routes';
import { envConfig } from '@/config/env-config';
import {
  fetchCurrentUser,
  googleRedirectUrl,
  isSanctumAuthMode,
  signIn,
  signOut,
} from './auth.service';

const apiError = (status: number, data: unknown = {}) => {
  const response = {
    config: { headers: new AxiosHeaders() },
    data,
    headers: {},
    status,
    statusText: String(status),
  } as AxiosResponse;

  return new AxiosError(
    'failed',
    AxiosError.ERR_BAD_REQUEST,
    undefined,
    undefined,
    response,
  );
};

const userLoginBody = {
  message: 'Sesión iniciada.',
  statusCode: 200,
  access_token: '18|abcdef',
  token_type: 'Bearer',
  expires_in: 86400,
  actor_type: 'users',
  data: {
    id: 7,
    name: 'Claudia Molina',
    email: 'recepcion@cmbelgrano.com.ar',
    phone: null,
    avatar_url: null,
    is_active: true,
    roles: ['reception'],
  },
};

const patientLoginBody = {
  message: 'Sesión iniciada.',
  statusCode: 200,
  access_token: '19|ghijkl',
  token_type: 'Bearer',
  expires_in: 86400,
  actor_type: 'patients',
  data: {
    id: 3,
    first_name: 'Marta Elena',
    last_name: 'Ferreyra',
    document_number: '30114552',
    email: 'marta.ferreyra@correo.com',
    phone: null,
    is_active: true,
    blocked_until: null,
    roles: ['patient'],
  },
};

describe('auth service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    envConfig.VITE_AUTH_MODE = 'prototype';
  });

  describe('prototype mode', () => {
    test('opens a session for a seeded account', async () => {
      const session = await signIn({
        email: ' Admin@CMBelgrano.com.ar ',
        password: 'turnos2026',
      });

      expect(session.user.role).toBe('admin');
      expect(session.token).toContain('prototype.admin');
    });

    test('rejects a wrong password', async () => {
      await expect(
        signIn({ email: 'admin@cmbelgrano.com.ar', password: 'nope' }),
      ).rejects.toThrow('El correo o la contraseña no son correctos.');
    });

    test('does not call the API on logout', async () => {
      const post = jest.spyOn(apiCore, 'post');

      await signOut();

      expect(post).not.toHaveBeenCalled();
    });
  });

  describe('sanctum mode', () => {
    beforeEach(() => {
      envConfig.VITE_AUTH_MODE = 'sanctum';
    });

    test('logs a staff account in through the users endpoint', async () => {
      const post = jest
        .spyOn(apiCore, 'post')
        .mockResolvedValue({ data: userLoginBody });

      const session = await signIn({
        email: 'Recepcion@cmbelgrano.com.ar',
        password: 'turnos2026',
      });

      expect(post).toHaveBeenCalledWith('/auth/users/login', {
        email: 'recepcion@cmbelgrano.com.ar',
        password: 'turnos2026',
        device_name: expect.stringContaining('cmb-fe'),
      });
      expect(session).toEqual({
        token: '18|abcdef',
        user: {
          id: 7,
          name: 'Claudia Molina',
          shortName: 'C. Molina',
          email: 'recepcion@cmbelgrano.com.ar',
          role: 'reception',
        },
      });
    });

    test('falls back to the patients endpoint when the staff one answers 401', async () => {
      const post = jest
        .spyOn(apiCore, 'post')
        .mockRejectedValueOnce(apiError(401))
        .mockResolvedValueOnce({ data: patientLoginBody });

      const session = await signIn({
        email: 'marta.ferreyra@correo.com',
        password: 'turnos2026',
      });

      expect(post).toHaveBeenNthCalledWith(
        1,
        '/auth/users/login',
        expect.anything(),
      );
      expect(post).toHaveBeenNthCalledWith(
        2,
        '/auth/patients/login',
        expect.anything(),
      );
      expect(session.user).toEqual({
        id: 3,
        name: 'Marta Elena Ferreyra',
        shortName: 'Marta Elena',
        email: 'marta.ferreyra@correo.com',
        role: 'patient',
      });
    });

    test('reports invalid credentials when neither actor matches', async () => {
      jest.spyOn(apiCore, 'post').mockRejectedValue(apiError(401));

      await expect(
        signIn({ email: 'nadie@cmb.test', password: 'x' }),
      ).rejects.toThrow('El correo o la contraseña no son correctos.');
    });

    test('surfaces the rate limit of the API', async () => {
      jest.spyOn(apiCore, 'post').mockRejectedValue(apiError(429));

      await expect(
        signIn({ email: 'admin@cmbelgrano.com.ar', password: 'x' }),
      ).rejects.toThrow(
        'Demasiados intentos. Esperá un minuto antes de volver a probar.',
      );
    });

    test('does not retry as a patient when the failure is not a 401', async () => {
      const post = jest
        .spyOn(apiCore, 'post')
        .mockRejectedValue(
          apiError(503, { message: 'Servicio no disponible.' }),
        );

      await expect(
        signIn({ email: 'admin@cmbelgrano.com.ar', password: 'x' }),
      ).rejects.toThrow('Servicio no disponible.');
      expect(post).toHaveBeenCalledTimes(1);
    });

    test('rejects a staff account without a role the frontend knows', async () => {
      jest.spyOn(apiCore, 'post').mockResolvedValue({
        data: { ...userLoginBody, data: { ...userLoginBody.data, roles: [] } },
      });

      await expect(
        signIn({ email: 'admin@cmbelgrano.com.ar', password: 'x' }),
      ).rejects.toThrow('La cuenta no tiene un rol del centro asignado.');
    });

    test('revokes the token on logout', async () => {
      const post = jest
        .spyOn(apiCore, 'post')
        .mockResolvedValue({ data: null });

      await signOut();

      expect(post).toHaveBeenCalledWith('/auth/logout');
    });

    test('reads the current actor from /auth/me', async () => {
      const get = jest
        .spyOn(apiCore, 'get')
        .mockResolvedValue({ data: userLoginBody });

      const user = await fetchCurrentUser();

      expect(get).toHaveBeenCalledWith('/auth/me');
      expect(user.role).toBe('reception');
    });
  });

  test('isSanctumAuthMode follows the environment', () => {
    expect(isSanctumAuthMode()).toBe(false);
    envConfig.VITE_AUTH_MODE = 'sanctum';
    expect(isSanctumAuthMode()).toBe(true);
  });

  test('points Google login at the Socialite endpoint', () => {
    expect(googleRedirectUrl()).toBe(
      `${envConfig.VITE_API_URL}/auth/google/redirect`,
    );
  });
});
