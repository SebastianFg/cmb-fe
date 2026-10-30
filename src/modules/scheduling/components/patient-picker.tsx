import { useId, useState } from 'react';
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from 'react-hook-form';
import { insuranceName } from '@/modules/patients/services/patient.service';
import type { PatientListItem } from '@/modules/patients/types/patient.types';
import { usePatientSearch } from '@/modules/scheduling/hooks/use-patient-search';
import Field, { fieldControlClasses } from '@/shared/components/input/field';
import Notice from '@/shared/components/notice/notice';
import { formatShort, today } from '@/shared/utils/dates';

type PatientPickerProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  /** Ficha elegida, para mostrar la cobertura y la penalización. */
  selected: PatientListItem | null;
  onSelect: (patient: PatientListItem | null) => void;
};

const isPenalized = (blockedUntil: string | null) =>
  Boolean(blockedUntil && blockedUntil >= today());

/** "IOMA Plan 2 · 7788-0011", como el mockup 07. */
const coverageOf = (patient: PatientListItem) => {
  const name = insuranceName(patient.health_insurance) || '—';

  return patient.member_number ? `${name} · ${patient.member_number}` : name;
};

/** "Ferreyra, Marta — DNI 30.114.552", como el mockup 07. */
const patientLabel = (patient: PatientListItem) =>
  `${patient.last_name}, ${patient.first_name.split(' ')[0]} — DNI ${Number(
    patient.document_number,
  ).toLocaleString('es-AR')}`;

/**
 * Buscador de pacientes del alta de turnos (mockup 07). El campo del
 * formulario es el `patient_id`; el cuadro de texto sólo sirve para buscar.
 */
const PatientPicker = <T extends FieldValues>({
  name,
  control,
  selected,
  onSelect,
}: PatientPickerProps<T>) => {
  const inputId = useId();
  const listId = `${inputId}-results`;
  const [query, setQuery] = useState('');
  // Con una ficha elegida el cuadro muestra su nombre: buscarlo otra vez
  // sería un pedido por nada.
  const { isEnabled, isSearching, matches } = usePatientSearch(
    selected ? '' : query,
  );

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const isOpen = isEnabled && !selected;

  const choose = (patient: PatientListItem | null) => {
    field.onChange(patient ? String(patient.id) : '');
    onSelect(patient);
    setQuery(patient ? patientLabel(patient) : '');
  };

  return (
    <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
      <Field
        id={inputId}
        label="Buscar por documento o apellido"
        error={error?.message}
        required
        hint={
          isSearching
            ? 'Buscando…'
            : 'Escribí al menos dos caracteres del documento o del apellido.'
        }
      >
        <input
          id={inputId}
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-invalid={error ? true : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (selected) choose(null);
          }}
          className={fieldControlClasses(Boolean(error))}
        />
        {/* El id del paciente viaja en el formulario, no el texto buscado. */}
        <input type="hidden" {...field} value={field.value ?? ''} />

        {isOpen && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Pacientes encontrados"
            className="absolute inset-x-0 top-full z-20 max-h-72 overflow-y-auto border border-border-strong bg-surface shadow-lg dark:border-sidebar-line dark:bg-sidebar-soft"
          >
            {matches.length === 0 && !isSearching && (
              <li className="px-3.5 py-3 text-[0.9rem] text-ink-soft">
                No se encontraron pacientes. Registralo desde Pacientes.
              </li>
            )}
            {matches.map((patient) => (
              <li key={patient.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => choose(patient)}
                  className="flex w-full items-baseline justify-between gap-3 border-b border-line px-3.5 py-2.5 text-left last:border-b-0 hover:bg-surface-muted dark:border-sidebar-line dark:hover:bg-sidebar"
                >
                  <strong className="font-medium text-ink dark:text-white">
                    {patient.last_name}, {patient.first_name}
                  </strong>
                  <span className="font-mono text-[0.85rem] text-ink-soft">
                    {patient.document_number}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Field>

      <Field id={`${inputId}-insurance`} label="Obra social">
        <input
          id={`${inputId}-insurance`}
          type="text"
          readOnly
          tabIndex={-1}
          value={selected ? coverageOf(selected) : ''}
          className={fieldControlClasses(false)}
        />
      </Field>

      {selected && isPenalized(selected.blocked_until) && (
        <Notice className="sm:col-span-2" tone="warning" role="status">
          Penalización activa hasta el{' '}
          {formatShort(selected.blocked_until ?? '')}. Solo bloquea la
          autogestión: desde recepción el turno se puede asignar igual.
        </Notice>
      )}
    </div>
  );
};

export default PatientPicker;
