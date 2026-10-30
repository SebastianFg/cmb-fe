import { Card } from '@/shared/components/card/card';
import Skeleton, {
  SkeletonScreen,
} from '@/shared/components/skeleton/skeleton';

const KPIS = ['turnos', 'ocupacion', 'ausentismo', 'cancelados'];
const ALERTS = ['alerta-1', 'alerta-2'];
const TODAY_ROWS = ['fila-1', 'fila-2', 'fila-3', 'fila-4', 'fila-5'];
const OCCUPANCY = ['prof-1', 'prof-2', 'prof-3', 'prof-4'];
const DEMAND = ['esp-1', 'esp-2', 'esp-3'];

/** Esqueleto del panel: la misma grilla que arma `PanelPage` al llegar. */
const DashboardSkeleton = () => (
  <SkeletonScreen className="flex flex-col gap-5" label="Cargando el panel…">
    <Skeleton className="h-5 w-72 max-w-full" />

    <div className="grid gap-4 sm:grid-cols-2 min-[1100px]:grid-cols-4">
      {KPIS.map((kpi) => (
        <Card key={kpi} className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-3.5 w-36 max-w-full" />
        </Card>
      ))}
    </div>

    <Card>
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="grid gap-3 min-[1100px]:grid-cols-2">
        {ALERTS.map((alert) => (
          <Skeleton key={alert} className="h-20" />
        ))}
      </div>
    </Card>

    <div className="grid gap-5 min-[1100px]:grid-cols-[minmax(0,1fr)_340px] min-[1100px]:items-start">
      <Card className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        {TODAY_ROWS.map((row) => (
          <Skeleton key={row} className="h-6" />
        ))}
      </Card>

      <div className="flex flex-col gap-5">
        <Card className="flex flex-col gap-3">
          <Skeleton className="h-6 w-56 max-w-full" />
          {OCCUPANCY.map((row) => (
            <div key={row} className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-1.5" />
            </div>
          ))}
        </Card>

        <Card className="flex flex-col gap-2.5">
          <Skeleton className="mb-1 h-6 w-64 max-w-full" />
          {DEMAND.map((row) => (
            <Skeleton key={row} className="h-4" />
          ))}
        </Card>
      </div>
    </div>
  </SkeletonScreen>
);

export default DashboardSkeleton;
