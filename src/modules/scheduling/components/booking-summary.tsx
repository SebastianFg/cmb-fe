import type { ReactNode } from 'react';
import type { PatientListItem } from '@/modules/patients/types/patient.types';
import type { DaySlot } from '@/modules/scheduling/types/scheduling.types';
import Badge from '@/shared/components/badge/badge';
import { formatDayMonth } from '@/shared/utils/dates';

type BookingSummaryProps = {
  patient: PatientListItem | null;
  specialtyName: string | null;
  slot: DaySlot | null;
  date: string | null;
  /** Al reprogramar el paciente sale del turno, no del buscador. */
  movingPatientName?: string | null;
};

const Row = ({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) => (
  <>
    <dt className="text-[0.85rem] text-ink-soft">{label}</dt>
    <dd
      className={
        mono ? 'font-mono text-ink dark:text-white' : 'text-ink dark:text-white'
      }
    >
      {children}
    </dd>
  </>
);

/** Resumen de la columna derecha del mockup 07. */
const BookingSummary = ({
  patient,
  specialtyName,
  slot,
  date,
  movingPatientName = null,
}: BookingSummaryProps) => (
  <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2.5">
    <Row label="Paciente">
      {movingPatientName ??
        (patient
          ? `${patient.first_name.split(' ')[0]} ${patient.last_name}`
          : '—')}
    </Row>
    <Row label="Especialidad">{specialtyName ?? '—'}</Row>
    <Row label="Profesional">{slot?.professional ?? '—'}</Row>
    <Row label="Matrícula" mono>
      {slot?.license_number ?? '—'}
    </Row>
    <Row label="Fecha y hora" mono>
      {slot && date
        ? `${formatDayMonth(date)} · ${slot.start_time} a ${slot.end_time}`
        : '—'}
    </Row>
    <Row label="Consultorio" mono>
      {slot?.room ?? '—'}
    </Row>
    <Row label="Estado inicial">
      <Badge tone="booked">Reservado</Badge>
    </Row>
  </dl>
);

export default BookingSummary;
