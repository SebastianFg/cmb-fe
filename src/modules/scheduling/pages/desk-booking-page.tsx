import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import type { PatientListItem } from '@/modules/patients/types/patient.types';
import AppointmentVoucher from '@/modules/scheduling/components/appointment-voucher';
import BookingSummary from '@/modules/scheduling/components/booking-summary';
import PatientPicker from '@/modules/scheduling/components/patient-picker';
import SlotPicker from '@/modules/scheduling/components/slot-picker';
import {
  useAppointment,
  useRescheduleAppointment,
} from '@/modules/scheduling/hooks/use-appointment';
import {
  useAvailabilityDays,
  useDaySlots,
} from '@/modules/scheduling/hooks/use-availability';
import { useBookAppointment } from '@/modules/scheduling/hooks/use-book-appointment';
import { useBookingCatalogs } from '@/modules/scheduling/hooks/use-booking-catalogs';
import {
  type AppointmentFormValues,
  appointmentDefaults,
  appointmentSchema,
  REASON_MAX,
  readSlotValue,
} from '@/modules/scheduling/schemas/appointment.schema';
import { BookingFieldError } from '@/modules/scheduling/services/scheduling.service';
import type { BookedAppointment } from '@/modules/scheduling/types/scheduling.types';
import Button from '@/shared/components/button/button';
import { Card, CardFooter } from '@/shared/components/card/card';
import Field, { fieldControlClasses } from '@/shared/components/input/field';
import SelectField from '@/shared/components/input/select-field';
import TextareaField from '@/shared/components/input/textarea-field';
import Notice from '@/shared/components/notice/notice';
import Skeleton from '@/shared/components/skeleton/skeleton';
import { formatWeekdayShort } from '@/shared/utils/dates';

const Legend = ({ children }: { children: string }) => (
  <legend className="mb-3 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-ink-soft">
    {children}
  </legend>
);

/** "Mar 03/11 — 6 libres", como el selector de fecha del mockup 07. */
const dayLabel = (date: string, free: number, holiday: string | null) => {
  const note = holiday
    ? 'feriado'
    : free === 0
      ? 'sin turnos'
      : free === 1
        ? '1 libre'
        : `${free} libres`;

  return `${formatWeekdayShort(date)} — ${note}`;
};

/**
 * Alta de turnos desde el mostrador (CU-01, mockup 07). Con
 * `?reprogramar=<id>` el mismo formulario mueve un turno existente (RF-18):
 * el paciente y la especialidad no cambian, sólo la franja.
 */
const DeskBookingPage = () => {
  const [params] = useSearchParams();
  const rescheduleId = Number(params.get('reprogramar')) || null;

  const [patient, setPatient] = useState<PatientListItem | null>(null);
  const [booked, setBooked] = useState<BookedAppointment | null>(null);

  const { appointment: moving, isLoading: isLoadingAppointment } =
    useAppointment(rescheduleId);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<AppointmentFormValues>({
    defaultValues: appointmentDefaults,
    resolver: zodResolver(appointmentSchema),
  });

  const values = watch();
  const specialtyId = Number(values.specialty_id) || null;
  const professionalId = Number(values.professional_filter) || null;

  // El turno que se mueve fija el paciente y la especialidad.
  useEffect(() => {
    if (!moving) return;

    setValue('patient_id', String(moving.patient.id));
    setValue('specialty_id', String(moving.specialty.id));
  }, [moving, setValue]);

  const {
    isLoading: isLoadingCatalogs,
    professionals,
    specialties,
  } = useBookingCatalogs(specialtyId);

  const {
    days,
    horizonDays,
    isLoading: isLoadingDays,
  } = useAvailabilityDays({
    specialtyId,
    professionalId,
  });

  const {
    holiday,
    isFetching: isFetchingSlots,
    slots,
  } = useDaySlots({
    specialtyId,
    professionalId,
    date: values.date || null,
  });

  // El primer día con franjas libres queda elegido solo, y si el día elegido
  // se queda sin lugar se corre al siguiente que tenga.
  const firstFreeDate = days.find((day) => day.free > 0)?.date ?? '';
  const chosenDay = days.find((day) => day.date === values.date);

  useEffect(() => {
    if (!specialtyId) return;
    if (chosenDay && chosenDay.free > 0) return;

    setValue('date', firstFreeDate, { shouldValidate: false });
    setValue('slot', '');
  }, [specialtyId, chosenDay, firstFreeDate, setValue]);

  const selectedSlot = useMemo(() => {
    if (!values.slot) return null;

    const { professionalId: slotProfessional, startTime } = readSlotValue(
      values.slot,
    );

    return (
      slots.find(
        (slot) =>
          slot.professional_id === slotProfessional &&
          slot.start_time === startTime,
      ) ?? null
    );
  }, [values.slot, slots]);

  const onDone = (appointment: BookedAppointment) => {
    setBooked(appointment);
    setPatient(null);
    reset(appointmentDefaults);
  };

  /**
   * El servidor nombra `slot` a la franja y `patient_id` al paciente: son los
   * mismos campos del formulario.
   */
  const onFieldError = (submitError: unknown) => {
    if (!(submitError instanceof BookingFieldError)) return;

    setError(submitError.field as keyof AppointmentFormValues, {
      message: submitError.message,
    });

    if (submitError.field === 'slot') setValue('slot', '');
  };

  const { book, error, isBooking } = useBookAppointment({ onBooked: onDone });

  const {
    error: rescheduleError,
    isSaving: isRescheduling,
    reschedule,
  } = useRescheduleAppointment({
    id: rescheduleId ?? 0,
    onRescheduled: onDone,
  });

  const onSubmit = (parsed: AppointmentFormValues) => {
    const { professionalId: slotProfessional, startTime } = readSlotValue(
      parsed.slot,
    );

    const request = {
      specialty_id: Number(parsed.specialty_id),
      professional_id: slotProfessional,
      date: parsed.date,
      start_time: startTime,
      reason: parsed.reason,
    };

    if (rescheduleId) {
      reschedule(request, { onError: onFieldError });
      return;
    }

    book(
      { ...request, patient_id: Number(parsed.patient_id) },
      { onError: onFieldError },
    );
  };

  if (booked) {
    return (
      <AppointmentVoucher
        appointment={booked}
        onBookAnother={() => setBooked(null)}
      />
    );
  }

  const messages = Object.values(errors)
    .map((item) => item?.message)
    .filter(Boolean) as string[];

  return (
    <div className="grid gap-5 min-[1000px]:grid-cols-[minmax(0,1fr)_340px] min-[1000px]:items-start">
      <Card className="p-6 sm:px-7">
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="mb-6 border-0 p-0">
            <Legend>Paciente</Legend>
            {isLoadingAppointment ? (
              <Skeleton className="h-6 w-80 max-w-full" />
            ) : moving ? (
              <p className="text-ink dark:text-white">
                {moving.patient.name}{' '}
                <span className="font-mono text-ink-soft">
                  · DNI {moving.patient.document_number}
                </span>
              </p>
            ) : (
              <PatientPicker
                control={control}
                name="patient_id"
                onSelect={setPatient}
                selected={patient}
              />
            )}
          </fieldset>

          <fieldset className="mb-6 border-0 p-0">
            <Legend>Turno</Legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Especialidad"
                requiredMark
                disabled={moving !== undefined && rescheduleId !== null}
                placeholder={
                  isLoadingCatalogs ? 'Cargando…' : 'Elegí una especialidad'
                }
                options={specialties.map((specialty) => ({
                  value: specialty.id,
                  label: specialty.name,
                }))}
                control={control}
                name="specialty_id"
              />
              <SelectField
                label="Profesional"
                placeholder="Cualquiera"
                disabled={professionals.length === 0}
                options={professionals.map((professional) => ({
                  value: professional.id,
                  label: professional.license_number
                    ? `${professional.name} · ${professional.license_number}`
                    : professional.name,
                }))}
                control={control}
                name="professional_filter"
              />
              <SelectField
                label="Fecha"
                requiredMark
                placeholder={
                  specialtyId ? 'Elegí el día' : 'Elegí la especialidad'
                }
                disabled={!specialtyId}
                options={days.map((day) => ({
                  value: day.date,
                  label: dayLabel(day.date, day.free, day.holiday),
                }))}
                hint={
                  horizonDays > 0
                    ? `Se puede reservar hasta ${horizonDays} días hacia adelante.`
                    : undefined
                }
                control={control}
                name="date"
              />
              <Field id="booking-room" label="Consultorio">
                <input
                  id="booking-room"
                  type="text"
                  readOnly
                  tabIndex={-1}
                  value={
                    selectedSlot?.room ??
                    (professionalId ? '' : 'Asignado por la agenda')
                  }
                  className={fieldControlClasses(false)}
                />
              </Field>
            </div>

            <div className="mt-5 border border-border bg-surface-alt p-4 dark:border-sidebar-line dark:bg-sidebar">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-[0.92rem] font-medium text-ink-strong dark:text-sidebar-ink">
                  Franja disponible
                </span>
                {selectedSlot && (
                  <span className="font-mono text-[0.82rem] text-ink-soft">
                    Duración de consulta: {selectedSlot.duration_minutes}{' '}
                    minutos
                  </span>
                )}
              </div>

              {holiday && (
                <Notice className="mb-3" tone="info">
                  El {values.date} el centro no atiende ({holiday}).
                </Notice>
              )}

              <SlotPicker
                control={control}
                emptyMessage={
                  specialtyId
                    ? 'No hay franjas libres para esta selección.'
                    : 'Elegí la especialidad para ver las franjas.'
                }
                // Mientras viajan los días todavía no hay fecha elegida:
                // sin esto el recuadro diría que no quedan franjas libres.
                isLoading={isFetchingSlots || isLoadingDays}
                name="slot"
                showTaken={Boolean(professionalId)}
                slots={slots}
              />
            </div>
          </fieldset>

          <TextareaField
            label="Motivo de la consulta"
            counter={`${values.reason.length} / ${REASON_MAX}`}
            maxLength={REASON_MAX}
            rows={3}
            control={control}
            name="reason"
          />

          {messages.length > 0 && (
            <Notice
              className="mt-5"
              role="alert"
              tone="danger"
              title="No se puede guardar el turno"
            >
              {messages.length === 1 ? (
                <p>{messages[0]}</p>
              ) : (
                <ul className="list-disc pl-5">
                  {messages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              )}
            </Notice>
          )}

          {rescheduleError &&
            !(rescheduleError instanceof BookingFieldError) && (
              <Notice className="mt-5" role="alert" tone="danger">
                {rescheduleError instanceof Error
                  ? rescheduleError.message
                  : 'No se pudo reprogramar el turno.'}
              </Notice>
            )}

          {error && !(error instanceof BookingFieldError) && (
            <Notice className="mt-5" role="alert" tone="danger">
              {error instanceof Error
                ? error.message
                : 'No se pudo guardar el turno.'}
            </Notice>
          )}

          <CardFooter className="sm:-mx-7 sm:px-7">
            <Button
              isLoading={isBooking || isRescheduling || isLoadingAppointment}
              type="submit"
              variant="primary"
            >
              {rescheduleId ? 'Guardar cambios' : 'Guardar turno'}
            </Button>
            <Link
              className="ml-auto inline-flex min-h-11 items-center px-5 py-2.5 text-ink-soft transition-colors hover:text-ink"
              to={rescheduleId ? '/agenda' : '/panel'}
            >
              Cancelar
            </Link>
          </CardFooter>
        </form>
      </Card>

      <div className="flex flex-col gap-5">
        <Card>
          <h2 className="mb-3 text-[1.1rem] font-semibold text-ink dark:text-white">
            Resumen
          </h2>
          <BookingSummary
            date={values.date || null}
            movingPatientName={moving?.patient.name ?? null}
            patient={patient}
            slot={selectedSlot}
            specialtyName={
              specialties.find((item) => item.id === specialtyId)?.name ?? null
            }
          />
        </Card>

        <Card>
          <h2 className="mb-3 text-[1.1rem] font-semibold text-ink dark:text-white">
            Al guardar
          </h2>
          <p className="text-ink-soft">
            El paciente recibe por correo la confirmación con el comprobante y
            el código de verificación. El recordatorio se envía 24 h antes.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default DeskBookingPage;
