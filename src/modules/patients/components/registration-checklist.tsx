import clsx from 'clsx';
import type { PatientRegistrationValues } from '@/modules/patients/schemas/patient.schema';

type ChecklistRow = {
  label: string;
  fields: (keyof PatientRegistrationValues)[];
  ok: string;
};

const CHECKS: ChecklistRow[] = [
  { label: 'Documento', fields: ['document_number'], ok: 'Completo' },
  {
    label: 'Apellido y nombre',
    fields: ['last_name', 'first_name'],
    ok: 'Completo',
  },
  { label: 'Fecha de nacimiento', fields: ['birth_date'], ok: 'Válida' },
  { label: 'Teléfono', fields: ['phone'], ok: 'Válido' },
  { label: 'Correo electrónico', fields: ['email'], ok: 'Válido' },
  {
    label: 'Obra social y afiliado',
    fields: ['health_insurance_id', 'member_number'],
    ok: 'Completo',
  },
  {
    label: 'Contraseña',
    fields: ['password', 'password_confirmation', 'terms'],
    ok: 'Completa',
  },
];

type RegistrationChecklistProps = {
  values: PatientRegistrationValues;
  errors: Partial<Record<keyof PatientRegistrationValues, string>>;
  /** En mostrador no hay credenciales y el correo es opcional. */
  mode?: 'portal' | 'desk';
};

type RowState = 'ok' | 'error' | 'pending';

const rowState = (
  row: ChecklistRow,
  values: PatientRegistrationValues,
  errors: RegistrationChecklistProps['errors'],
): RowState => {
  if (row.fields.some((field) => errors[field])) return 'error';

  const filled = row.fields.every((field) => {
    const value = values[field];
    return typeof value === 'boolean' ? value : Boolean(value);
  });

  return filled ? 'ok' : 'pending';
};

const STATE_CLASSES: Record<RowState, string> = {
  ok: 'text-success',
  error: 'text-danger',
  pending: 'text-ink-muted',
};

/** Tarjeta «Validaciones»: resume qué falta antes de guardar la ficha. */
const RegistrationChecklist = ({
  values,
  errors,
  mode = 'portal',
}: RegistrationChecklistProps) => (
  <dl className="mb-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2.5">
    {CHECKS.filter(
      (row) => mode === 'portal' || row.label !== 'Contraseña',
    ).map((row) => {
      const state = rowState(row, values, errors);

      return (
        <div key={row.label} className="contents">
          <dt className="text-ink dark:text-white">{row.label}</dt>
          <dd
            className={clsx(
              'm-0 text-right font-semibold',
              STATE_CLASSES[state],
            )}
          >
            {state === 'ok' && row.ok}
            {state === 'error' && 'Revisar'}
            {state === 'pending' && 'Pendiente'}
          </dd>
        </div>
      );
    })}
  </dl>
);

export default RegistrationChecklist;
