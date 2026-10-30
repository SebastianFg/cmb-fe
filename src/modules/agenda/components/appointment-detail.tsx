import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useRecordAppointment } from '@/modules/agenda/hooks/use-agenda';
import {
  NOTES_MAX,
  type RecordFormValues,
  recordSchema,
} from '@/modules/agenda/schemas/agenda.schema';
import { AgendaFieldError } from '@/modules/agenda/services/agenda.service';
import type {
  AgendaSlot,
  Attendance,
} from '@/modules/agenda/types/agenda.types';
import Badge from '@/shared/components/badge/badge';
import Button from '@/shared/components/button/button';
import { Card } from '@/shared/components/card/card';
import TextareaField from '@/shared/components/input/textarea-field';
import Notice from '@/shared/components/notice/notice';
import {
  APPOINTMENT_STATUS,
  isCancelledStatus,
} from '@/shared/constants/appointment-status';
import type { AppointmentStatus, IsoDate } from '@/shared/types/domain.types';
import { nowTime, today } from '@/shared/utils/dates';

type AppointmentDetailProps = {
  slot: AgendaSlot | null;
  date: IsoDate;
  onCancelRequest: () => void;
  onSaved: () => void;
};

const CHOICES: { value: Attendance; label: string }[] = [
  { value: 'present', label: 'Presente' },
  { value: 'attended', label: 'Atendido' },
  { value: 'no_show', label: 'Ausente' },
];

/** «Presente» no tiene columna propia: el turno pasa a confirmado. */
const attendanceOf = (status: AppointmentStatus): Attendance | null => {
  if (status === 'attended' || status === 'no_show') return status;

  return status === 'confirmed' ? 'present' : null;
};

const Eyebrow = ({ children }: { children: string }) => (
  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-ink-soft">
    {children}
  </p>
);

/** Panel lateral del turno elegido: resultado y observación (RF-20, RF-21). */
const AppointmentDetail = ({
  slot,
  date,
  onCancelRequest,
  onSaved,
}: AppointmentDetailProps) => {
  const appointment = slot?.appointment ?? null;

  const [choice, setChoice] = useState<Attendance | null>(null);

  const { control, handleSubmit, reset, watch } = useForm<RecordFormValues>({
    defaultValues: { notes: '' },
    resolver: zodResolver(recordSchema),
  });

  // Cada turno trae su propia observación y su propio resultado: al cambiar
  // de selección el panel se recarga con los del turno elegido.
  useEffect(() => {
    reset({ notes: appointment?.notes ?? '' });
    setChoice(appointment ? attendanceOf(appointment.status) : null);
  }, [appointment?.id, appointment?.notes, appointment?.status, reset]);

  const { error, isSaving, save } = useRecordAppointment(onSaved);
  const notes = watch('notes');

  if (!appointment || !slot) {
    return (
      <Card>
        <Eyebrow>Turno seleccionado</Eyebrow>
        <p className="mt-2 text-ink-soft">
          Elegí un turno de la agenda para ver el detalle, registrar la
          asistencia y dejar una observación.
        </p>
      </Card>
    );
  }

  const status = APPOINTMENT_STATUS[appointment.status];
  const isCancelled = isCancelledStatus(appointment.status);
  const isFinished =
    appointment.status === 'attended' || appointment.status === 'no_show';
  const hasStarted =
    date < today() || (date === today() && slot.start_time <= nowTime());

  const isAllowed = (value: Attendance) =>
    value === 'present' ? date === today() && !isFinished : hasStarted;

  const onSubmit = ({ notes: value }: RecordFormValues) =>
    save({ id: appointment.id, attendance: choice, notes: value });

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Eyebrow>{`Turno seleccionado · ${slot.start_time}`}</Eyebrow>
        <h2 className="text-[1.25rem] font-semibold text-ink dark:text-white">
          {appointment.patient.last_name},{' '}
          {appointment.patient.first_name.split(' ')[0]}
        </h2>
        <p className="font-mono text-[0.85rem] text-ink-soft">
          DNI {appointment.patient.document_number} ·{' '}
          {appointment.patient.health_insurance ?? '—'} ·{' '}
          {appointment.room ?? '—'}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.85rem] text-ink-soft">
          <Badge tone={status.tone}>{status.label}</Badge>
          <span className="font-mono">{appointment.confirmation_code}</span>
          <span>
            {appointment.source === 'portal'
              ? 'reservado por el portal'
              : 'asignado en mostrador'}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Eyebrow>Motivo declarado</Eyebrow>
        <p className="text-ink dark:text-white">
          {isCancelled
            ? `Cancelado: ${appointment.cancellation_reason || 'sin motivo'}`
            : appointment.reason || 'Sin motivo cargado'}
        </p>
      </div>

      {!isCancelled && (
        <div className="flex flex-col gap-2">
          <Eyebrow>Registrar asistencia</Eyebrow>
          <div
            role="group"
            aria-label="Registrar asistencia"
            className="flex flex-wrap gap-2"
          >
            {CHOICES.map((item) => {
              const isDisabled = !isAllowed(item.value);
              const isPressed = choice === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={isPressed}
                  // Un segundo clic quita la elección; nada se guarda hasta
                  // «Guardar registro».
                  onClick={() => setChoice(isPressed ? null : item.value)}
                  className={clsx(
                    'min-h-10 border px-3.5 py-2 text-[0.92rem] transition-colors',
                    isDisabled
                      ? 'cursor-not-allowed border-border bg-surface-muted text-ink-muted'
                      : isPressed
                        ? 'border-accent bg-accent font-semibold text-white'
                        : 'border-border-strong bg-surface text-ink hover:border-accent dark:border-sidebar-line dark:bg-sidebar-soft dark:text-white',
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="text-[0.82rem] text-ink-muted">
            {hasStarted
              ? 'Recepción marca «Presente» cuando llega; al terminar, el profesional lo marca como atendido.'
              : 'El turno todavía no empezó: la asistencia se registra el día del turno.'}
          </p>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <TextareaField
          label="Observación administrativa"
          counter={`${notes.length} / ${NOTES_MAX}`}
          hint="Dato administrativo. No forma parte de la historia clínica del paciente."
          maxLength={NOTES_MAX}
          rows={5}
          disabled={isCancelled}
          control={control}
          name="notes"
        />

        {error && (
          <Notice className="mt-4" role="alert" tone="danger">
            {error instanceof AgendaFieldError || error instanceof Error
              ? error.message
              : 'No se pudo guardar el registro.'}
          </Notice>
        )}

        {!isCancelled && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Button isLoading={isSaving} type="submit" variant="primary">
              Guardar registro
            </Button>
            {!isFinished && !hasStarted && (
              <>
                <Link
                  className="inline-flex min-h-11 items-center border border-border-strong px-5 py-2.5 text-ink transition-colors hover:border-accent dark:border-sidebar-line dark:text-white"
                  to={`/turnos/nuevo?reprogramar=${appointment.id}`}
                >
                  Reprogramar
                </Link>
                <Button onClick={onCancelRequest} variant="danger">
                  Cancelar turno
                </Button>
              </>
            )}
          </div>
        )}
      </form>
    </Card>
  );
};

export default AppointmentDetail;
