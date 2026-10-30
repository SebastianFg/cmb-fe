import { apiCore } from '@/config/api-routes';
import { isSanctumAuthMode } from '@/modules/auth/services/auth.service';
import type {
  DashboardAlert,
  DashboardSummary,
  TodayAppointment,
} from '@/modules/dashboard/types/dashboard.types';
import { daySlots, isCancelled } from '@/modules/scheduling/utils/availability';
import {
  findPatient,
  findProfessional,
  getAppointments,
  getAvailabilityData,
  getProfessionals,
  getScheduleExceptions,
  getSettings,
  getSpecialties,
  professionalName,
  professionalShortName,
} from '@/prototype/prototype-store';
import type { Appointment, IsoDate } from '@/shared/types/domain.types';
import { addDays, formatLong, today as todayIso } from '@/shared/utils/dates';

const inRange = (item: Appointment, from: IsoDate, to: IsoDate) =>
  item.date >= from && item.date <= to;

const absenteeism = (items: Appointment[]) => {
  const happened = items.filter(
    (item) => item.status === 'attended' || item.status === 'no_show',
  );
  const absent = happened.filter((item) => item.status === 'no_show').length;

  return {
    rate: happened.length
      ? Math.round((absent / happened.length) * 1000) / 10
      : 0,
    absent,
    total: happened.length,
  };
};

/** Franjas que publica la agenda del profesional, sin contar las bloqueadas. */
const publishedSlots = (professionalId: number, from: IsoDate, to: IsoDate) => {
  const data = getAvailabilityData();
  let total = 0;

  for (let iso = from; iso <= to; iso = addDays(iso, 1)) {
    total += daySlots(data, professionalId, iso).filter(
      (slot) => slot.state !== 'blocked',
    ).length;
  }

  return total;
};

const nextWorkingDay = (from: IsoDate): IsoDate => {
  const data = getAvailabilityData();
  let iso = addDays(from, 1);

  while (
    new Date(`${iso}T00:00:00`).getDay() === 0 ||
    data.holidays.some((holiday) => holiday.date === iso)
  ) {
    iso = addDays(iso, 1);
  }

  return iso;
};

/** Reproduce el resumen del backend con los datos del prototipo. */
const buildPrototypeSummary = (): DashboardSummary => {
  const today = todayIso();
  const monthAgo = addDays(today, -30);
  const settings = getSettings();
  const threshold = settings.no_show_alert_threshold;
  const professionals = getProfessionals();
  const appointments = getAppointments();

  const todays = appointments.filter(
    (item) => item.date === today && !isCancelled(item),
  );
  const published = professionals.reduce(
    (total, professional) =>
      total + publishedSlots(professional.id, today, today),
    0,
  );
  const absence = absenteeism(
    appointments.filter((item) => inRange(item, monthAgo, today)),
  );
  const cancelled = appointments.filter(
    (item) => isCancelled(item) && inRange(item, addDays(today, -7), today),
  );

  const alerts: DashboardAlert[] = [];

  for (const exception of getScheduleExceptions()) {
    if (exception.date < today || exception.date > addDays(today, 7)) continue;

    const professional = findProfessional(exception.professional_id);

    alerts.push({
      type: 'warning',
      title:
        exception.type === 'absence'
          ? 'Ausencia declarada'
          : 'Franja bloqueada',
      text: `${professional ? professionalShortName(professional) : 'El profesional'} no atiende el ${formatLong(exception.date).toLowerCase()} de ${exception.start_time} a ${exception.end_time} (${exception.reason.toLowerCase()}).`,
      date: exception.date,
    });
  }

  const nextDay = nextWorkingDay(today);
  const unconfirmed = appointments.filter(
    (item) => item.date === nextDay && item.status === 'booked',
  );

  if (unconfirmed.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Turnos sin confirmar',
      text: `${unconfirmed.length} ${unconfirmed.length === 1 ? 'turno' : 'turnos'} del ${formatLong(nextDay).toLowerCase()} siguen en estado Reservado.`,
      date: nextDay,
    });
  }

  const over = getSpecialties()
    .map((specialty) => ({
      specialty,
      absence: absenteeism(
        appointments.filter(
          (item) =>
            item.specialty_id === specialty.id &&
            inRange(item, monthAgo, today),
        ),
      ),
    }))
    .filter((row) => row.absence.total >= 10 && row.absence.rate > threshold)
    .sort((a, b) => b.absence.rate - a.absence.rate);

  if (over.length > 0) {
    const worst = over[0];

    alerts.push({
      type: 'warning',
      title: 'Ausentismo sobre umbral',
      text: `${worst.specialty.name} acumula ${worst.absence.rate}% de ausentes en los últimos 30 días (${worst.absence.absent} de ${worst.absence.total} turnos).`,
      date: null,
    });
  }

  const todayAppointments: TodayAppointment[] = appointments
    .filter((item) => item.date === today)
    .sort((a, b) => (a.start_time < b.start_time ? -1 : 1))
    .slice(0, 10)
    .map((item) => {
      const patient = findPatient(item.patient_id);
      const professional = findProfessional(item.professional_id);

      return {
        id: item.id,
        time: item.start_time,
        patient: patient ? `${patient.first_name} ${patient.last_name}` : '',
        professional: professional ? professionalName(professional) : '',
        specialty:
          getSpecialties().find((row) => row.id === item.specialty_id)?.name ??
          '',
        status: item.status,
      };
    });

  return {
    scope: null,
    today,
    no_show_threshold: threshold,
    kpis: {
      today_total: todays.length,
      today_confirmed: todays.filter((item) => item.status === 'confirmed')
        .length,
      today_pending: todays.filter((item) => item.status === 'booked').length,
      published_slots: published,
      occupancy_rate: published
        ? Math.round((todays.length / published) * 1000) / 10
        : null,
      absence_rate: absence.rate,
      absence_over_threshold: absence.rate > threshold,
      cancelled_last_week: cancelled.length,
      cancelled_penalized: cancelled.filter((item) => item.is_penalized).length,
    },
    alerts,
    today_appointments: todayAppointments,
    occupancy: professionals
      .map((professional) => {
        const slots = publishedSlots(professional.id, monthAgo, today);
        const taken = appointments.filter(
          (item) =>
            item.professional_id === professional.id &&
            inRange(item, monthAgo, today) &&
            !isCancelled(item),
        ).length;

        return {
          professional: professionalShortName(professional),
          rate: slots ? Math.round((taken / slots) * 100) : 0,
        };
      })
      .sort((a, b) => b.rate - a.rate),
    demand: getSpecialties()
      .map((specialty) => ({
        specialty: specialty.name,
        count: appointments.filter(
          (item) =>
            item.specialty_id === specialty.id &&
            inRange(item, monthAgo, today) &&
            !isCancelled(item),
        ).length,
      }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count),
  };
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  if (!isSanctumAuthMode()) return buildPrototypeSummary();

  const { data } = await apiCore.get<{ data: DashboardSummary }>(
    '/reports/dashboard-summary',
  );

  return data.data;
};
