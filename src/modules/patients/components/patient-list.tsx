import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { usePatientCatalogs } from '@/modules/patients/hooks/use-patient-catalogs';
import { usePatients } from '@/modules/patients/hooks/use-patients';
import { insuranceName } from '@/modules/patients/services/patient.service';
import type {
  PatientFilters,
  PenaltyFilter,
  PortalFilter,
} from '@/modules/patients/types/patient.types';
import Badge from '@/shared/components/badge/badge';
import Button from '@/shared/components/button/button';
import { Card } from '@/shared/components/card/card';
import SelectField from '@/shared/components/input/select-field';
import TextField from '@/shared/components/input/text-field';
import Skeleton from '@/shared/components/skeleton/skeleton';
import { formatShort, today } from '@/shared/utils/dates';

type FilterFormValues = {
  search: string;
  healthInsuranceId: string;
  portal: PortalFilter;
  penalty: PenaltyFilter;
};

type PatientListProps = {
  filters: PatientFilters;
  onFiltersChange: (filters: PatientFilters) => void;
  /** Ficha recién guardada, para destacarla en la tabla. */
  highlightedId?: number | null;
};

/** Filas y celdas de relleno mientras la primera página viaja. */
const SKELETON_ROWS = Array.from({ length: 6 }, (_, row) => `fila-${row}`);
const SKELETON_CELLS = Array.from({ length: 7 }, (_, cell) => `celda-${cell}`);

const formatPhone = (phone: string | null) =>
  phone?.length === 10
    ? `${phone.slice(0, 2)} ${phone.slice(2, 6)}-${phone.slice(6)}`
    : (phone ?? '—');

const isPenalized = (blockedUntil: string | null) =>
  Boolean(blockedUntil && blockedUntil >= today());

const PatientList = ({
  filters,
  onFiltersChange,
  highlightedId,
}: PatientListProps) => {
  const headingId = useId();
  const { healthInsurances } = usePatientCatalogs();
  const { isLoading, page } = usePatients(filters);

  // Los filtros también son un formulario controlado: la tabla se recalcula
  // con lo que mira `watch`, sin estado duplicado.
  const { control, watch } = useForm<FilterFormValues>({
    values: {
      search: filters.search,
      healthInsuranceId: filters.healthInsuranceId
        ? String(filters.healthInsuranceId)
        : '',
      portal: filters.portal,
      penalty: filters.penalty,
    },
  });

  const watched = watch();

  useEffect(() => {
    const changed =
      watched.search !== filters.search ||
      (Number(watched.healthInsuranceId) || null) !==
        filters.healthInsuranceId ||
      watched.portal !== filters.portal ||
      watched.penalty !== filters.penalty;

    if (!changed) return;

    onFiltersChange({
      search: watched.search,
      healthInsuranceId: Number(watched.healthInsuranceId) || null,
      portal: watched.portal,
      penalty: watched.penalty,
      page: 1,
    });
  }, [watched, filters, onFiltersChange]);

  const rows = page?.items ?? [];

  return (
    <section aria-labelledby={headingId} className="mt-9 flex flex-col gap-5">
      <h2 id={headingId} className="text-[1.3rem] font-semibold text-ink">
        Pacientes
      </h2>

      <Card
        role="search"
        aria-label="Buscar pacientes"
        className="grid gap-4 sm:grid-cols-2 min-[1100px]:grid-cols-4"
      >
        <TextField
          control={control}
          name="search"
          label="Buscar por documento o apellido"
          type="search"
          className="font-mono"
        />
        <SelectField
          control={control}
          name="healthInsuranceId"
          label="Obra social"
          placeholder="Todas"
          options={healthInsurances.map((insurance) => ({
            value: insurance.id,
            label: insuranceName(insurance),
          }))}
        />
        <SelectField
          control={control}
          name="portal"
          label="Acceso al portal"
          placeholder="Todos"
          options={[
            { value: 'active', label: 'Activo' },
            { value: 'none', label: 'No registrado' },
          ]}
        />
        <SelectField
          control={control}
          name="penalty"
          label="Penalización"
          placeholder="Todos"
          options={[
            { value: 'yes', label: 'Con penalización' },
            { value: 'no', label: 'Sin penalización' },
          ]}
        />
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table aria-busy={isLoading} className="w-full border-collapse">
            <caption className="sr-only">
              Listado de pacientes del centro
            </caption>
            <thead>
              <tr>
                {[
                  'Documento',
                  'Apellido y nombre',
                  'Nacionalidad',
                  'Obra social',
                  'Teléfono',
                  'Acceso al portal',
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="border-b border-border px-3.5 py-2.75 text-left text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-ink-soft"
                  >
                    {header}
                  </th>
                ))}
                <th
                  scope="col"
                  className="border-b border-border px-3.5 py-2.75"
                >
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                rows.length === 0 &&
                SKELETON_ROWS.map((row) => (
                  <tr key={row}>
                    {SKELETON_CELLS.map((cell) => (
                      <td
                        key={cell}
                        className="border-b border-line px-3.5 py-2.75"
                      >
                        <Skeleton className="h-4" />
                      </td>
                    ))}
                  </tr>
                ))}

              {rows.map((patient) => {
                const penalized = isPenalized(patient.blocked_until);

                return (
                  <tr
                    key={patient.id}
                    className={
                      patient.id === highlightedId
                        ? 'bg-accent-soft'
                        : penalized
                          ? 'bg-warning-bg'
                          : undefined
                    }
                  >
                    <td className="border-b border-line px-3.5 py-2.75 font-mono text-[0.92rem] whitespace-nowrap">
                      {patient.document_number}
                    </td>
                    <td className="border-b border-line px-3.5 py-2.75">
                      {patient.last_name}, {patient.first_name}{' '}
                      {penalized && (
                        <Badge tone="warning" className="ml-1 uppercase">
                          Penalizado
                        </Badge>
                      )}
                    </td>
                    <td className="border-b border-line px-3.5 py-2.75">
                      {patient.nationality?.name ?? '—'}
                    </td>
                    <td className="border-b border-line px-3.5 py-2.75">
                      {insuranceName(patient.health_insurance)}
                    </td>
                    <td className="border-b border-line px-3.5 py-2.75 font-mono text-[0.92rem] whitespace-nowrap">
                      {formatPhone(patient.phone)}
                    </td>
                    <td className="border-b border-line px-3.5 py-2.75">
                      {patient.has_portal_access ? (
                        <Badge tone="portal">Activo</Badge>
                      ) : (
                        <Badge tone="neutral">No registrado</Badge>
                      )}
                    </td>
                    <td className="border-b border-line px-3.5 py-2.75 whitespace-nowrap">
                      <Link
                        className="text-accent hover:underline"
                        to={`/turnos/nuevo?paciente=${patient.id}`}
                        aria-label={`Dar turno a ${patient.last_name}, ${patient.first_name}`}
                      >
                        Dar turno
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && rows.length === 0 && (
          <p className="px-5 py-8 text-center text-ink-soft">
            No hay pacientes que coincidan con la búsqueda.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 text-[0.9rem] text-ink-soft">
          <span>
            {page ? `${page.total} paciente${page.total === 1 ? '' : 's'}` : ''}
          </span>
          <div className="flex items-center gap-3">
            <Button
              small
              disabled={!page || page.currentPage <= 1}
              onClick={() =>
                onFiltersChange({ ...filters, page: filters.page - 1 })
              }
            >
              Anterior
            </Button>
            <span>
              {page ? `Página ${page.currentPage} de ${page.lastPage}` : ''}
            </span>
            <Button
              small
              disabled={!page || page.currentPage >= page.lastPage}
              onClick={() =>
                onFiltersChange({ ...filters, page: filters.page + 1 })
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem] text-ink-soft">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 bg-warning-bg ring-1 ring-warning/40"
          />
          Con penalización activa: no puede reservar por autogestión
          {rows.some((row) => isPenalized(row.blocked_until)) &&
            ` (hasta el ${formatShort(
              rows.find((row) => isPenalized(row.blocked_until))
                ?.blocked_until as string,
            )})`}
        </li>
        <li className="flex items-center gap-2">
          <Badge tone="neutral">No registrado</Badge>
          Ficha sin credenciales: la creó recepción
        </li>
      </ul>
    </section>
  );
};

export default PatientList;
