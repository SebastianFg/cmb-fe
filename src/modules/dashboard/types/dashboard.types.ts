import type { AppointmentStatus, IsoDate } from '@/shared/types/domain.types';

export type DashboardKpis = {
  today_total: number;
  today_confirmed: number;
  today_pending: number;
  published_slots: number;
  /** `null` cuando no hay agendas publicadas hoy. */
  occupancy_rate: number | null;
  absence_rate: number;
  absence_over_threshold: boolean;
  cancelled_last_week: number;
  cancelled_penalized: number;
};

export type DashboardAlertTone = 'warning' | 'info';

export type DashboardAlert = {
  type: DashboardAlertTone;
  title: string;
  text: string;
  date: IsoDate | null;
};

export type TodayAppointment = {
  id: number;
  time: string;
  patient: string;
  professional: string;
  specialty: string;
  status: AppointmentStatus;
};

export type DashboardSummary = {
  /** Nombre del profesional cuando la sesión ve sólo su agenda. */
  scope: string | null;
  today: IsoDate;
  no_show_threshold: number;
  kpis: DashboardKpis;
  alerts: DashboardAlert[];
  today_appointments: TodayAppointment[];
  occupancy: { professional: string; rate: number }[];
  demand: { specialty: string; count: number }[];
};
