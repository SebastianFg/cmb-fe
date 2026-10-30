import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import NotFoundPage from '@/shared/components/not-found/not-found-page';
import { publicRoutes } from './auth-routes';
import PrivateRoute from './private-route';
import { dashboardRoutes } from './routes';

const Layout = lazy(() => import('@/shared/layouts'));

export const routes: RouteObject[] = [
  ...publicRoutes,
  {
    // Ruta sin path: agrupa las pantallas con sesión bajo el layout, sin
    // ocupar '/', que ahora es la landing pública.
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      ...dashboardRoutes,
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
