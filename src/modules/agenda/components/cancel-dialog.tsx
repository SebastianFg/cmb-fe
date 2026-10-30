import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCancelAppointment } from '@/modules/agenda/hooks/use-agenda';
import {
  type CancellationFormValues,
  cancellationSchema,
} from '@/modules/agenda/schemas/agenda.schema';
import { AgendaFieldError } from '@/modules/agenda/services/agenda.service';
import type { AgendaSlot } from '@/modules/agenda/types/agenda.types';
import Button from '@/shared/components/button/button';
import Dialog from '@/shared/components/dialog/dialog';
import TextareaField from '@/shared/components/input/textarea-field';
import Notice from '@/shared/components/notice/notice';
import type { IsoDate } from '@/shared/types/domain.types';
import { formatShort } from '@/shared/utils/dates';

type CancelDialogProps = {
  slot: AgendaSlot | null;
  date: IsoDate;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
};

/** Cancelación con motivo (RF-18). */
const CancelDialog = ({
  slot,
  date,
  isOpen,
  onClose,
  onCancelled,
}: CancelDialogProps) => {
  const appointment = slot?.appointment ?? null;

  const { control, handleSubmit, reset, setError } =
    useForm<CancellationFormValues>({
      defaultValues: { cancellation_reason: '' },
      resolver: zodResolver(cancellationSchema),
    });

  const { error, isCancelling, cancel } = useCancelAppointment(() => {
    reset({ cancellation_reason: '' });
    onCancelled();
  });

  if (!appointment || !slot) return null;

  const onSubmit = ({ cancellation_reason }: CancellationFormValues) =>
    cancel(
      { id: appointment.id, cancellation_reason },
      {
        onError: (submitError) => {
          if (submitError instanceof AgendaFieldError) {
            setError('cancellation_reason', { message: submitError.message });
          }
        },
      },
    );

  return (
    <Dialog
      isOpen={isOpen}
      title="Cancelar turno"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Volver</Button>
          <Button
            form="cancel-appointment-form"
            isLoading={isCancelling}
            type="submit"
            variant="danger"
          >
            Cancelar turno
          </Button>
        </>
      }
    >
      <p className="text-ink dark:text-white">
        Turno de {appointment.patient.first_name}{' '}
        {appointment.patient.last_name} el {formatShort(date)} a las{' '}
        {slot.start_time}.
      </p>

      <form
        id="cancel-appointment-form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextareaField
          label="Motivo de la cancelación"
          requiredMark
          maxLength={200}
          rows={3}
          control={control}
          name="cancellation_reason"
        />
      </form>

      {error && !(error instanceof AgendaFieldError) && (
        <Notice role="alert" tone="danger">
          {error instanceof Error
            ? error.message
            : 'No se pudo cancelar el turno.'}
        </Notice>
      )}

      <p className="text-[0.82rem] text-ink-muted">
        La franja vuelve a quedar disponible y el cambio queda registrado con tu
        usuario.
      </p>
    </Dialog>
  );
};

export default CancelDialog;
