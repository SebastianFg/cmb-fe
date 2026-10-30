import {
  CalendarDays,
  CalendarPlus,
  LayoutDashboard,
  Stethoscope,
  Users,
} from 'lucide-react';
import type { ComponentType, JSX, SVGProps } from 'react';
import { lazy } from 'react';
import type { AppRole } from '@/shared/constants/roles';
import { STAFF_ROLES } from '@/shared/constants/roles';

const PanelPage = lazy(() => import('@/modules/dashboard/pages/panel-page'));
const SessionSummaryPage = lazy(
  () => import('@/modules/home/pages/session-summary-page'),
);
const PatientDeskPage = lazy(
  () => import('@/modules/patients/pages/patient-desk-page'),
);
const DeskBookingPage = lazy(
  () => import('@/modules/scheduling/pages/desk-booking-page'),
);
const PortalBookingPage = lazy(
  () => import('@/modules/scheduling/pages/portal-booking-page'),
);
const AgendaPage = lazy(() => import('@/modules/agenda/pages/agenda-page'));

export type NavItem = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  path: string;
  roles: AppRole[];
  element: JSX.Element;
  children?: NavItem[];
};

const DESK_ROLES: AppRole[] = ['admin', 'reception'];

/**
 * Única fuente de verdad de las pantallas con sesión: de acá salen las rutas,
 * el menú lateral, la barra del portal y el aterrizaje de cada rol.
 */
export const AppRoutesWithRoles: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Panel',
    path: '/panel',
    roles: STAFF_ROLES,
    element: <PanelPage />,
  },
  {
    icon: CalendarPlus,
    label: 'Turnos',
    path: '/turnos/nuevo',
    roles: DESK_ROLES,
    element: <DeskBookingPage />,
  },
  {
    icon: Stethoscope,
    label: 'Agenda médica',
    path: '/agenda',
    roles: STAFF_ROLES,
    element: <AgendaPage />,
  },
  {
    icon: Users,
    label: 'Pacientes',
    path: '/pacientes',
    roles: DESK_ROLES,
    element: <PatientDeskPage />,
  },
  {
    icon: CalendarPlus,
    label: 'Sacar turno',
    path: '/solicitar-turno',
    roles: ['patient'],
    element: <PortalBookingPage />,
  },
  {
    icon: CalendarDays,
    label: 'Mis turnos',
    path: '/mis-turnos',
    roles: ['patient'],
    element: <SessionSummaryPage />,
  },
];

export const flattenNavItems = (items: NavItem[]): NavItem[] =>
  items.flatMap((item) => [item, ...flattenNavItems(item.children ?? [])]);

export const findNavItem = (path: string): NavItem | null =>
  flattenNavItems(AppRoutesWithRoles).find((item) => item.path === path) ??
  null;

/** Pantallas que el rol puede abrir, en el orden en que se muestran. */
export const navItemsForRole = (role: AppRole): NavItem[] =>
  AppRoutesWithRoles.filter((item) => item.roles.includes(role));
