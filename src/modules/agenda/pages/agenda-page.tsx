import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AgendaBoard from '@/modules/agenda/components/agenda-board';
import AgendaSkeleton from '@/modules/agenda/components/agenda-skeleton';
import AgendaToolbar from '@/modules/agenda/components/agenda-toolbar';
import AppointmentDetail from '@/modules/agenda/components/appointment-detail';
import BlockDialog from '@/modules/agenda/components/block-dialog';
import CancelDialog from '@/modules/agenda/components/cancel-dialog';
import { useAgenda } from '@/modules/agenda/hooks/use-agenda';
import type { AgendaSlot } from '@/modules/agenda/types/agenda.types';
import { useProfessionals } from '@/modules/scheduling/hooks/use-booking-catalogs';
import { Card } from '@/shared/components/card/card';
import Notice from '@/shared/components/notice/notice';
import type { ScheduleExceptionType } from '@/shared/types/domain.types';
import { today } from '@/shared/utils/dates';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Agenda diaria del centro (RF-26, mockup 06). */
const AgendaPage = () => {
  const [params, setParams] = useSearchParams();
  const [professionalId, setProfessionalId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<'cancel' | null>(null);
  const [exceptionType, setExceptionType] =
    useState<ScheduleExceptionType | null>(null);

  const fromUrl = params.get('fecha');
  const date = fromUrl && ISO_DATE.test(fromUrl) ? fromUrl : today();

  const { day, error, isLoading } = useAgenda(date, professionalId);
  // La agenda necesita la lista completa para el filtro, no sólo la del día.
  const { professionals } = useProfessionals();

  const selected: AgendaSlot | null =
    day?.slots.find((slot) => slot.appointment?.id === selectedId) ?? null;

  const goTo = (next: string) => {
    setSelectedId(null);
    setParams({ fecha: next }, { replace: true });
  };

  if (isLoading && !day) {
    return <AgendaSkeleton />;
  }

  if (error || !day) {
    return (
      <Notice role="alert" tone="danger">
        No se pudo cargar la agenda del día.
      </Notice>
    );
  }

  const isEmpty = day.professionals.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <AgendaToolbar
        date={date}
        day={day}
        isOwnAgenda={day.is_own_agenda}
        onDateChange={goTo}
        onDeclare={setExceptionType}
        onProfessionalChange={(next) => {
          setProfessionalId(next);
          setSelectedId(null);
        }}
        professionalId={professionalId}
        professionals={professionals}
        stats={day.stats}
        weekday={day.weekday}
      />

      <div className="grid gap-5 min-[1100px]:grid-cols-[minmax(0,1fr)_340px] min-[1100px]:items-start">
        <Card className="flex min-w-0 flex-col gap-4">
          {day.holiday && (
            <Notice tone="warning">
              Feriado: {day.holiday}. Ninguna agenda genera turnos este día.
            </Notice>
          )}

          {!day.holiday && isEmpty && (
            <Notice tone="warning">
              {professionalId
                ? 'El profesional no tiene agenda este día.'
                : 'Ningún profesional atiende este día.'}
            </Notice>
          )}

          {!isEmpty && (
            <AgendaBoard
              day={day}
              onSelect={(slot) => setSelectedId(slot.appointment?.id ?? null)}
              selectedId={selectedId}
            />
          )}
        </Card>

        <AppointmentDetail
          date={date}
          onCancelRequest={() => setDialog('cancel')}
          onSaved={() => undefined}
          slot={selected}
        />
      </div>

      <CancelDialog
        date={date}
        isOpen={dialog === 'cancel'}
        onCancelled={() => {
          setDialog(null);
          setSelectedId(null);
        }}
        onClose={() => setDialog(null)}
        slot={selected}
      />

      <BlockDialog
        day={day}
        onClose={() => setExceptionType(null)}
        onDeclared={() => setExceptionType(null)}
        type={exceptionType}
      />
    </div>
  );
};

export default AgendaPage;
