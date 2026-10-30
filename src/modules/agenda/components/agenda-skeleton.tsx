import { Fragment } from 'react';
import { Card } from '@/shared/components/card/card';
import Skeleton, {
  SkeletonScreen,
} from '@/shared/components/skeleton/skeleton';

const COLUMNS = ['col-1', 'col-2', 'col-3', 'col-4'];
const ROWS = [
  'fila-1',
  'fila-2',
  'fila-3',
  'fila-4',
  'fila-5',
  'fila-6',
  'fila-7',
  'fila-8',
  'fila-9',
  'fila-10',
];
const LEGEND = ['ref-1', 'ref-2', 'ref-3', 'ref-4', 'ref-5', 'ref-6'];

const CELL = 'border-b border-line p-2 dark:border-sidebar-line';

/** Esqueleto de la agenda diaria: barra, grilla por profesional y panel. */
const AgendaSkeleton = () => (
  <SkeletonScreen
    className="flex flex-col gap-6"
    label="Cargando la agenda del día…"
  >
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <Skeleton className="h-11 w-56" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-36" />
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <Skeleton className="h-5 w-72 max-w-full" />
        <Skeleton className="h-11 w-56" />
      </div>
    </div>

    <div className="grid gap-5 min-[1100px]:grid-cols-[minmax(0,1fr)_340px] min-[1100px]:items-start">
      <Card className="flex min-w-0 flex-col gap-4">
        <div className="min-w-0 overflow-hidden border-x border-t border-line dark:border-sidebar-line">
          <div className="grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))]">
            <div className={`${CELL} bg-surface-alt dark:bg-sidebar`}>
              <Skeleton className="h-3.5 w-9" />
            </div>
            {COLUMNS.map((column) => (
              <div
                key={column}
                className={`${CELL} bg-surface-alt dark:bg-sidebar`}
              >
                <Skeleton className="mb-1.5 h-4" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}

            {ROWS.map((row) => (
              <Fragment key={row}>
                <div className={`${CELL} bg-surface-alt dark:bg-sidebar`}>
                  <Skeleton className="h-4 w-9" />
                </div>
                {COLUMNS.map((column) => (
                  <div key={column} className={CELL}>
                    <Skeleton className="h-4" />
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {LEGEND.map((item) => (
            <li key={item}>
              <Skeleton className="h-3.5 w-28" />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-col gap-3">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-6 w-56 max-w-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-2 h-24" />
        <Skeleton className="h-11 w-full" />
      </Card>
    </div>
  </SkeletonScreen>
);

export default AgendaSkeleton;
