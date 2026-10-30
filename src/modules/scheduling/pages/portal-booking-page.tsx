import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { centerOptions } from '@/config/center-options';
import { useAuthStore } from '@/modules/auth/hooks/use-auth-store';
import AppointmentVoucher from '@/modules/scheduling/components/appointment-voucher';
import DayStrip from '@/modules/scheduling/components/day-strip';
import SlotPicker from '@/modules/scheduling/components/slot-picker';
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
import { Card } from '@/shared/components/card/card';
import SelectField from '@/shared/components/input/select-field';
import TextareaField from '@/shared/components/input/textarea-field';
import Notice from '@/shared/components/notice/notice';
import { formatLong } from '@/shared/utils/dates';

/** Autogestión del paciente (CU-02, mockup 16). */
const PortalBookingPage = () => {
  const patientId = useAuthStore((state) => state.user?.id ?? null);
  const [booked, setBooked] = useState<BookedAppointment | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<AppointmentFormValues>({
    // El paciente es el de la sesión: el campo existe pero no se pide.
    defaultValues: { ...appointmentDefaults, patient_id: String(patientId) },
    resolver: zodResolver(appointmentSchema),
  });

  const values = watch();
  const specialtyId = Number(values.specialty_id) || null;
  const professionalId = Number(values.professional_filter) || null;

  const {
    isLoading: isLoadingCatalogs,
    professionals,
    specialties,
  } = useBookingCatalogs(specialtyId);

  const { days, isLoading: isLoadingDays } = useAvailabilityDays({
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

  const firstFreeDate = days.find((day) => day.free > 0)?.date ?? '';
  const chosenDay = days.find((day) => day.date === values.date);

  useEffect(() => {
    if (!specialtyId) return;
    if (chosenDay && chosenDay.free > 0) return;

    setValue('date', firstFreeDate, { shouldValidate: false });
    setValue('slot', '');
  }, [specialtyId, chosenDay, firstFreeDate, setValue]);

  const freeCount = useMemo(
    () => slots.filter((slot) => slot.is_bookable).length,
    [slots],
  );

  const { book, error, isBooking } = useBookAppointment({
    selfService: true,
    onBooked: (appointment) => {
      setBooked(appointment);
      reset({ ...appointmentDefaults, patient_id: String(patientId) });
    },
  });

  const onSubmit = (parsed: AppointmentFormValues) => {
    const { professionalId: slotProfessional, startTime } = readSlotValue(
      parsed.slot,
    );

    book(
      {
        patient_id: Number(parsed.patient_id),
        specialty_id: Number(parsed.specialty_id),
        professional_id: slotProfessional,
        date: parsed.date,
        start_time: startTime,
        reason: parsed.reason,
      },
      {
        onError: (submitError) => {
          if (!(submitError instanceof BookingFieldError)) return;

          setError(submitError.field as keyof AppointmentFormValues, {
            message: submitError.message,
          });

          if (submitError.field === 'slot') setValue('slot', '');
        },
      },
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

  // El paciente no elige la ficha, así que su error no tiene campo visible:
  // es el aviso de penalización y va arriba de todo.
  const penaltyMessage = errors.patient_id?.message;

  const messages = [
    errors.specialty_id,
    errors.date,
    errors.slot,
    errors.reason,
  ]
    .map((item) => item?.message)
    .filter(Boolean) as string[];

  return (
    <Card className="mx-auto w-full max-w-3xl p-6 sm:px-7">
      <h1 className="mb-5 text-[1.4rem] font-semibold text-ink dark:text-white">
        Sacar turno
      </h1>

      {penaltyMessage && (
        <Notice className="mb-5" role="alert" tone="danger">
          {penaltyMessage} Podés llamar al {centerOptions.phone}.
        </Notice>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Especialidad"
            requiredMark
            placeholder={isLoadingCatalogs ? 'Cargando…' : 'Elegí'}
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
              label: professional.name,
            }))}
            control={control}
            name="professional_filter"
          />
        </div>

        {/* `min-w-0`: un fieldset no baja de su ancho de contenido, así que sin
            esto la tira de días empujaría la tarjeta fuera de la pantalla. */}
        <fieldset className="mt-6 min-w-0 border-0 p-0">
          <legend className="mb-3 text-[0.92rem] font-medium text-ink-strong dark:text-sidebar-ink">
            Día
          </legend>
          <DayStrip
            control={control}
            days={days}
            isLoading={isLoadingDays}
            name="date"
          />
        </fieldset>

        <section className="mt-6" aria-labelledby="portal-slots-title">
          <h2
            id="portal-slots-title"
            className="mb-3 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-ink-soft"
          >
            {!specialtyId
              ? 'Elegí una especialidad'
              : isLoadingDays
                ? 'Buscando turnos disponibles'
                : values.date
                  ? `${formatLong(values.date)} · ${freeCount} ${
                      freeCount === 1 ? 'turno libre' : 'turnos libres'
                    }`
                  : 'No hay turnos libres en los próximos días'}
          </h2>

          {holiday && (
            <Notice className="mb-3" tone="info">
              Ese día el centro no atiende ({holiday}).
            </Notice>
          )}

          <SlotPicker
            control={control}
            emptyMessage={
              specialtyId
                ? 'No hay turnos libres para esta selección.'
                : 'Elegí una especialidad para ver los horarios.'
            }
            // Mientras viajan los días todavía no hay fecha elegida:
            // sin esto el recuadro diría que no quedan turnos libres.
            isLoading={isFetchingSlots || isLoadingDays}
            name="slot"
            showTaken={false}
            slots={slots}
          />
        </section>

        <div className="mt-6">
          <TextareaField
            label="Motivo de la consulta (opcional)"
            counter={`${values.reason.length} / ${REASON_MAX}`}
            maxLength={REASON_MAX}
            rows={2}
            control={control}
            name="reason"
          />
        </div>

        {messages.length > 0 && (
          <Notice
            className="mt-5"
            role="alert"
            tone="danger"
            title="No se puede reservar el turno"
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

        {error && !(error instanceof BookingFieldError) && (
          <Notice className="mt-5" role="alert" tone="danger">
            {error instanceof Error
              ? error.message
              : 'No se pudo reservar el turno.'}
          </Notice>
        )}

        <Button
          block
          className="mt-6"
          isLoading={isBooking}
          type="submit"
          variant="primary"
        >
          Confirmar turno
        </Button>
      </form>
    </Card>
  );
};

export default PortalBookingPage;
