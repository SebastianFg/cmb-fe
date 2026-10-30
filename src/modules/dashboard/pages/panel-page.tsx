import {
  AlertsCard,
  KpiGrid,
  ReportsColumn,
  TodayCard,
} from '@/modules/dashboard/components/dashboard-sections';
import DashboardSkeleton from '@/modules/dashboard/components/dashboard-skeleton';
import { useDashboardSummary } from '@/modules/dashboard/hooks/use-dashboard-summary';
import Notice from '@/shared/components/notice/notice';
import { formatLong } from '@/shared/utils/dates';

/** Panel principal del back-office (mockup 03 del TP). */
const PanelPage = () => {
  const { error, isLoading, summary } = useDashboardSummary();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !summary) {
    return (
      <Notice tone="danger" role="alert" title="No se pudo cargar el panel">
        {error instanceof Error ? error.message : 'Reintentá en unos segundos.'}
      </Notice>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-ink-soft">
          {formatLong(summary.today)}
          {summary.scope && ` · Agenda de ${summary.scope}`}
        </p>
      </div>

      <KpiGrid kpis={summary.kpis} threshold={summary.no_show_threshold} />

      <AlertsCard alerts={summary.alerts} />

      <div className="grid gap-5 min-[1100px]:grid-cols-[minmax(0,1fr)_340px] min-[1100px]:items-start">
        <TodayCard
          appointments={summary.today_appointments}
          total={summary.kpis.today_total}
        />
        <ReportsColumn summary={summary} />
      </div>

      <p className="text-[0.85rem] text-ink-soft">
        Ocupación: franjas con turno sobre franjas publicadas, sin contar
        ausencias ni bloqueos. Ausentismo: turnos «ausente» sobre turnos ya
        ocurridos.
      </p>
    </div>
  );
};

export default PanelPage;
