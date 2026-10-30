import type { RouteObject } from 'react-router-dom';
import { AppRoutesWithRoles, type NavItem } from '@/router/nav-items';
import RequireRole from '@/shared/components/auth/require-role';

const createRoutes = (items: NavItem[]): RouteObject[] =>
  items.flatMap((item) => [
    {
      path: item.path,
      element: <RequireRole roles={item.roles}>{item.element}</RequireRole>,
    },
    ...createRoutes(item.children ?? []),
  ]);

export const dashboardRoutes: RouteObject[] = createRoutes(AppRoutesWithRoles);
