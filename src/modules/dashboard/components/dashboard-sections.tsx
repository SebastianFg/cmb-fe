import clsx from 'clsx';
import { Link } from 'react-router-dom';
import type {
  DashboardAlert,
  DashboardKpis,
  DashboardSummary,
  TodayAppointment,
} from '@/modules/dashboard/types/dashboard.types';
import Badge, { type BadgeTone } from '@/shared/components/badge/badge';
import { Card, CardHead } from '@/shared/components/card/card';
import Notice from '@/shared/components/notice/notice';
import type { AppointmentStatus } from '@/shared/types/domain.types';

const STATUS_LABEL: Record<
  AppointmentStatus,
  { label: string; tone: BadgeTone }
> = {
  booked: { label: 'Reservado', tone: 'booked' },
  confirmed: { label: 'Confirmado', tone: 'confirmed' },
  attended: { label: 'Atendido', tone: 'attended' },
  no_show: { label: 'Ausente', tone: 'no-show' },
  cancelled_by_professional: { label: 'Cancelado', tone: 'cancelled' },
  cancelled_by_center: { label: 'Cancelado', tone: 'cancelled' },
};

export const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const info = STATUS_LABEL[status] ?? {
    label: status,
    tone: 'neutral' as const,
  };

  return <Badge tone={info.tone}>{info.label}</Badge>;
};

/**
 * Tailwind genera las clases leyendo el código, así que un ancho calculado en
 * tiempo de ejecución no puede escribirse como `w-[{rate}%]`. Se redondea a
 * pasos de 5 y se elige entre clases que sí existen en el fuente.
 */
const BAR_WIDTHS: Record<string, string> = {
  '0%': 'w-[0%]',
  '5%': 'w-[5%]',
  '10%': 'w-[10%]',
  '15%': 'w-[15%]',
  '20%': 'w-[20%]',
  '25%': 'w-[25%]',
  '30%': 'w-[30%]',
  '35%': 'w-[35%]',
  '40%': 'w-[40%]',
  '45%': 'w-[45%]',
  '50%': 'w-[50%]',
  '55%': 'w-[55%]',
  '60%': 'w-[60%]',
  '65%': 'w-[65%]',
  '70%': 'w-[70%]',
  '75%': 'w-[75%]',
  '80%': 'w-[80%]',
  '85%': 'w-[85%]',
  '90%': 'w-[90%]',
  '95%': 'w-[95%]',
  '100%': 'w-[100%]',
};

const barWidthClass = (rate: number): string => {
  const step = Math.min(100, Math.max(0, Math.round(rate / 5) * 5));

  return BAR_WIDTHS[`${step}%`] ?? 'w-0';
};

/** "1 turno" / "2 turnos": el plural se decide por la cantidad. */
const plural = (count: number, singular: string, plural_: string) =>
  `${count} ${count === 1 ? singular : plural_}`;

const percent = (value: number) =>
  `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;

type KpiProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'accent' | 'warning';
};

const Kpi = ({ label, value, detail, tone }: KpiProps) => (
  <Card className="flex flex-col gap-1">
    <h3 className="text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-ink-soft">
      {label}
    </h3>
    <p
      className={clsx(
        'font-condensed text-[2.4rem] font-bold leading-none',
        tone === 'accent' && 'text-accent',
        tone === 'warning' && 'text-warning',
        !tone && 'text-ink',
      )}
    >
      {value}
    </p>
    <p className="text-[0.85rem] text-ink-soft">{detail}</p>
  </Card>
);

export const KpiGrid = ({
  kpis,
  threshold,
}: {
  kpis: DashboardKpis;
  threshold: number;
}) => (
  <section
    aria-label="Indicadores"
    className="grid gap-4 sm:grid-cols-2 min-[1100px]:grid-cols-4"
  >
    <Kpi
      label="Turnos de hoy"
      value={String(kpis.today_total)}
      detail={`${plural(kpis.today_confirmed, 'confirmado', 'confirmados')} · ${kpis.today_pending} sin confirmar`}
    />
    <Kpi
      label="Ocupación de agenda"
      value={kpis.occupancy_rate === null ? '—' : percent(kpis.occupancy_rate)}
      detail={
        kpis.published_slots
          ? `Sobre ${kpis.published_slots} franjas publicadas`
          : 'No hay agendas publicadas hoy'
      }
      tone="accent"
    />
    <Kpi
      label="Ausentismo del mes"
      value={percent(kpis.absence_rate)}
      detail={`Umbral configurado: ${threshold}%`}
      tone={kpis.absence_over_threshold ? 'warning' : undefined}
    />
    <Kpi
      label="Turnos cancelados (7 días)"
      value={String(kpis.cancelled_last_week)}
      detail={`${plural(kpis.cancelled_penalized, 'turno', 'turnos')} con penalización`}
    />
  </section>
);

export const AlertsCard = ({ alerts }: { alerts: DashboardAlert[] }) => (
  <Card>
    <CardHead
      title="Alertas tempranas"
      action={
        alerts.length > 0 && (
          <Badge tone="warning">
            {alerts.length === 1 ? '1 alerta' : `${alerts.length} alertas`}
          </Badge>
        )
      }
    />

    {alerts.length === 0 ? (
      <p className="text-ink-soft">Sin alertas por ahora.</p>
    ) : (
      <div className="grid gap-3 min-[1100px]:grid-cols-2">
        {alerts.map((alert) => (
          <Notice
            key={`${alert.title}-${alert.text}`}
            tone={alert.type}
            title={alert.title}
          >
            <p>{alert.text}</p>
            {alert.date && (
              <p className="mt-1">
                <Link
                  className="text-accent hover:underline"
                  to={`/agenda?fecha=${alert.date}`}
                >
                  Ver agenda
                </Link>
              </p>
            )}
          </Notice>
        ))}
      </div>
    )}
  </Card>
);

export const TodayCard = ({
  appointments,
  total,
}: {
  appointments: TodayAppointment[];
  total: number;
}) => (
  <Card className="p-0">
    <div className="p-5 pb-0">
      <CardHead
        title="Turnos de hoy"
        action={
          <Link className="text-accent hover:underline" to="/agenda">
            {total > appointments.length
              ? `Ver los ${total} turnos`
              : 'Ver la agenda del día'}
          </Link>
        }
      />
    </div>

    {appointments.length === 0 ? (
      <p className="px-5 pb-6 text-ink-soft">No hay turnos para hoy.</p>
    ) : (
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Turnos de hoy ordenados por hora
          </caption>
          <thead>
            <tr>
              {[
                'Hora',
                'Paciente',
                'Profesional',
                'Especialidad',
                'Estado',
              ].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="border-b border-border px-3 py-2.5 text-left text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-ink-soft"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.map((item) => (
              <tr key={item.id}>
                <td className="border-b border-line px-3 py-2.5 font-mono text-[0.92rem] whitespace-nowrap">
                  {item.time}
                </td>
                <td className="border-b border-line px-3 py-2.5">
                  {item.patient}
                </td>
                <td className="border-b border-line px-3 py-2.5">
                  {item.professional}
                </td>
                <td className="border-b border-line px-3 py-2.5">
                  {item.specialty}
                </td>
                <td className="border-b border-line px-3 py-2.5">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

export const ReportsColumn = ({ summary }: { summary: DashboardSummary }) => (
  <div className="flex flex-col gap-5">
    <Card>
      <h2 className="text-[1.1rem] font-semibold text-ink">
        Ocupación por profesional
      </h2>
      <p className="mb-4 text-[0.85rem] text-ink-soft">Últimos 30 días</p>

      <ul className="flex list-none flex-col gap-3">
        {summary.occupancy.map((row) => (
          <li
            key={row.professional}
            className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5"
          >
            <span className="text-[0.92rem]">{row.professional}</span>
            <span className="font-mono text-[0.92rem] text-ink-soft">
              {row.rate}%
            </span>
            <span
              aria-hidden="true"
              className="col-span-2 block h-1.5 bg-surface-muted"
            >
              <span
                className={clsx(
                  'block h-full bg-accent',
                  barWidthClass(row.rate),
                )}
              />
            </span>
          </li>
        ))}
      </ul>
    </Card>

    <Card>
      <h2 className="mb-4 text-[1.1rem] font-semibold text-ink">
        Demanda por especialidad (30 días)
      </h2>

      {summary.demand.length === 0 ? (
        <p className="text-ink-soft">Sin turnos en el período.</p>
      ) : (
        <ul className="flex list-none flex-col gap-2.5">
          {summary.demand.map((row) => (
            <li key={row.specialty} className="flex justify-between gap-3">
              <span>{row.specialty}</span>
              <span className="font-mono text-[0.92rem] text-ink-soft">
                {plural(row.count, 'turno', 'turnos')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  </div>
);
