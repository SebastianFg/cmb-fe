import type { AppRole } from '@/shared/constants/roles';

/** Los dos actores autenticables de la API. Coincide con el morph map. */
export type ActorType = 'users' | 'patients';

export type AuthUser = {
  id: number;
  name: string;
  shortName: string;
  email: string;
  role: AppRole;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

/** Lo que devuelve `POST /login`: token personal de Sanctum y el usuario. */
export type AuthSession = {
  token: string;
  user: AuthUser;
};
