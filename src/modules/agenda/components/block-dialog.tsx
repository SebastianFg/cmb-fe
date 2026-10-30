import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useDeclareException } from '@/modules/agenda/hooks/use-agenda';
import {
  type ExceptionFormValues,
  exceptionDefaults,
  exceptionSchema,
} from '@/modules/agenda/schemas/agenda.schema';
import { AgendaFieldError } from '@/modules/agenda/services/agenda.service';
import type { AgendaDay } from '@/modules/agenda/types/agenda.types';
import Button from '@/shared/components/button/button';
import Dialog from '@/shared/components/dialog/dialog';
import SelectField from '@/shared/components/input/select-field';
import TextField from '@/shared/components/input/text-field';
import Notice from '@/shared/components/notice/notice';
import type { ScheduleExceptionType } from '@/shared/types/domain.types';
import { formatLong } from '@/shared/utils/dates';

type BlockDialogProps = {
  day: AgendaDay;
  type: ScheduleExceptionType | null;
  onClose: () => void;
  onDeclared: () => void;
};

/** Ausencia del profesional o bloqueo de una franja (RF-12). */
const BlockDialog = ({ day, type, onClose, onDeclared }: BlockDialogProps) => {
  const { control, handleSubmit, reset, setError, watch } =
    useForm<ExceptionFormValues>({
      defaultValues: exceptionDefaults,
      resolver: zodResolver(exceptionSchema),
    });

  const professionalId = Number(watch('professional_id')) || null;

  const { error, isSaving, declare } = useDeclareException(() => {
    reset(exceptionDefaults);
    onDeclared();
  });

  // Con una sola agenda a la vista no hay nada que elegir.
  const onlyProfessional =
    day.professionals.length === 1 ? day.professionals[0] : null;

  useEffect(() => {
    if (!type) return;

    reset({
      ...exceptionDefaults,
      professional_id: onlyProfessional ? String(onlyProfessional.id) : '',
    });
  }, [type, onlyProfessional, reset]);

  const times = useMemo(() => {
    const slots = day.slots
      .filter((slot) => slot.professional_id === professionalId)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    return {
      starts: slots.map((slot) => slot.start_time),
      ends: slots.map((slot) => slot.end_time),
    };
  }, [day.slots, professionalId]);

  const onSubmit = (values: ExceptionFormValues) => {
    if (!type) return;

    declare(
      {
        professional_id: Number(values.professional_id),
        date: day.date,
        start_time: values.start_time,
        end_time: values.end_time,
        type,
        reason: values.reason,
      },
      {
        onError: (submitError) => {
          if (submitError instanceof AgendaFieldError) {
            setError(submitError.field as keyof ExceptionFormValues, {
              message: submitError.message,
            });
          }
        },
      },
    );
  };

  const isAbsence = type === 'absence';

  return (
    <Dialog
      isOpen={type !== null}
      title={isAbsence ? 'Declarar ausencia' : 'Bloquear franja'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Volver</Button>
          <Button
            form="block-form"
            isLoading={isSaving}
            type="submit"
            variant="primary"
          >
            Guardar
          </Button>
        </>
      }
    >
      <form id="block-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <SelectField
            label="Profesional"
            requiredMark
            placeholder="Elegí el profesional"
            disabled={onlyProfessional !== null}
            options={day.professionals.map((professional) => ({
              value: professional.id,
              label: professional.name,
            }))}
            control={control}
            name="professional_id"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Desde"
              requiredMark
              placeholder="Hora de inicio"
              disabled={times.starts.length === 0}
              options={times.starts.map((time) => ({
                value: time,
                label: time,
              }))}
              control={control}
              name="start_time"
            />
            <SelectField
              label="Hasta"
              requiredMark
              placeholder="Hora de fin"
              disabled={times.ends.length === 0}
              options={times.ends.map((time) => ({ value: time, label: time }))}
              control={control}
              name="end_time"
            />
          </div>

          <TextField
            label="Motivo"
            requiredMark
            maxLength={80}
            control={control}
            name="reason"
          />
        </div>
      </form>

      {error && !(error instanceof AgendaFieldError) && (
        <Notice role="alert" tone="danger">
          {error instanceof Error
            ? error.message
            : 'No se pudo guardar la excepción.'}
        </Notice>
      )}

      <p className="text-[0.82rem] text-ink-muted">
        {isAbsence
          ? 'La ausencia se registra para el '
          : 'El bloqueo se aplica el '}
        {formatLong(day.date).toLowerCase()}. Si hay turnos en la franja,
        primero hay que reprogramarlos o cancelarlos.
      </p>
    </Dialog>
  );
};

export default BlockDialog;
