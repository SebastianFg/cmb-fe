import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import PublicRoute from './public-route';

const LandingPage = lazy(() => import('@/modules/landing/pages/landing-page'));
const LoginPage = lazy(() => import('@/modules/auth/pages/login-page'));
const PatientRegistrationPage = lazy(
  () => import('@/modules/patients/pages/patient-registration-page'),
);

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/registro',
    element: (
      <PublicRoute>
        <PatientRegistrationPage />
      </PublicRoute>
    ),
  },
];
