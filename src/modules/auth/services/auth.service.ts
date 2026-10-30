import axios from 'axios';
import { apiCore } from '@/config/api-routes';
import { envConfig } from '@/config/env-config';
import { DEMO_ACCOUNTS } from '@/modules/auth/data/demo-accounts';
import type {
  ActorType,
  AuthSession,
  AuthUser,
  LoginCredentials,
} from '@/modules/auth/types/auth.types';
import { deviceName } from '@/modules/auth/utils/device-name';
import { type AppRole, normalizeRole } from '@/shared/constants/roles';

/** Respuesta de `POST /auth/{actor}/login` y de `GET /auth/me`. */
type AuthApiResponse = {
  message: string;
  actor_type: ActorType;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  data: UserPayload | PatientPayload;
};

type UserPayload = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

type PatientPayload = {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  roles: string[];
};

const INVALID_CREDENTIALS = 'El correo o la contraseña no son correctos.';
const TOO_MANY_ATTEMPTS =
  'Demasiados intentos. Esperá un minuto antes de volver a probar.';

const isPatientPayload = (
  _payload: UserPayload | PatientPayload,
  actorType: ActorType,
): _payload is PatientPayload => actorType === 'patients';

/** "Dra. P. Aguirre" a partir de "Paula Aguirre". */
const toShortName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;

  return `${parts[0].charAt(0)}. ${parts.slice(1).join(' ')}`;
};

const toAuthUser = (response: AuthApiResponse): AuthUser => {
  const { actor_type: actorType, data } = response;

  if (isPatientPayload(data, actorType)) {
    const name = `${data.first_name} ${data.last_name}`.trim();

    return {
      id: data.id,
      name,
      shortName: data.first_name,
      email: data.email ?? '',
      role: 'patient',
    };
  }

  const role = data.roles.map(normalizeRole).find(Boolean) as
    | AppRole
    | undefined;

  if (!role || role === 'patient') {
    throw new Error('La cuenta no tiene un rol del centro asignado.');
  }

  return {
    id: data.id,
    name: data.name,
    shortName: toShortName(data.name),
    email: data.email,
    role,
  };
};

const toApiError = (error: unknown): Error => {
  if (!axios.isAxiosError(error)) {
    return new Error('No se pudo iniciar sesión.');
  }

  if (error.response?.status === 429) return new Error(TOO_MANY_ATTEMPTS);
  if (error.response?.status === 401) return new Error(INVALID_CREDENTIALS);

  const data: unknown = error.response?.data;
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const { message } = data as { message?: unknown };
    if (typeof message === 'string' && message.trim())
      return new Error(message);
  }

  return new Error('No se pudo iniciar sesión.');
};

const isUnauthorized = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;

const postLogin = async (
  actorType: ActorType,
  { email, password }: LoginCredentials,
): Promise<AuthApiResponse> => {
  const { data } = await apiCore.post<AuthApiResponse>(
    `/auth/${actorType}/login`,
    {
      email: email.trim().toLowerCase(),
      password,
      device_name: deviceName(),
    },
  );

  return data;
};

/**
 * El formulario es uno solo, pero la API separa los actores. Se prueba
 * primero el personal del centro y, si no existe esa cuenta, el paciente.
 * El límite de intentos es por actor, correo e IP, así que los dos intentos
 * caen en cubetas distintas.
 */
const signInWithSanctum = async (
  credentials: LoginCredentials,
): Promise<AuthSession> => {
  let body: AuthApiResponse;

  try {
    body = await postLogin('users', credentials);
  } catch (userError: unknown) {
    if (!isUnauthorized(userError)) throw toApiError(userError);

    try {
      body = await postLogin('patients', credentials);
    } catch (patientError: unknown) {
      throw toApiError(patientError);
    }
  }

  // Fuera del catch: un rol desconocido es un dato inconsistente, no un
  // problema de red, y su mensaje no debe quedar tapado.
  return { token: body.access_token ?? '', user: toAuthUser(body) };
};

const signInWithDemoAccount = async ({
  email,
  password,
}: LoginCredentials): Promise<AuthSession> => {
  const normalizedEmail = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (candidate) =>
      candidate.user.email === normalizedEmail &&
      candidate.password === password,
  );

  if (!account) {
    throw new Error(INVALID_CREDENTIALS);
  }

  return {
    token: `prototype.${account.user.role}.${account.user.id}`,
    user: account.user,
  };
};

export const isSanctumAuthMode = () => envConfig.VITE_AUTH_MODE === 'sanctum';

export const signIn = (credentials: LoginCredentials): Promise<AuthSession> =>
  isSanctumAuthMode()
    ? signInWithSanctum(credentials)
    : signInWithDemoAccount(credentials);

/** Revalida el token guardado contra `GET /auth/me`. */
export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await apiCore.get<AuthApiResponse>('/auth/me');
  return toAuthUser(data);
};

/** Revoca el token en el servidor. Un fallo acá no bloquea el cierre local. */
export const signOut = async (): Promise<void> => {
  if (!isSanctumAuthMode()) return;

  await apiCore.post('/auth/logout');
};

/** Endpoint de Socialite que inicia el flujo de Google en el backend. */
export const googleRedirectUrl = () =>
  `${envConfig.VITE_API_URL}/auth/google/redirect`;

/**
 * Entra al flujo de Google por Socialite: el backend redirige a Google y
 * vuelve con un token de Sanctum.
 */
export const startGoogleLogin = () => {
  window.location.assign(googleRedirectUrl());
};
