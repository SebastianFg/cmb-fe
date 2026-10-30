import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { centerOptions } from '@/config/center-options';
import type { BookedAppointment } from '@/modules/scheduling/types/scheduling.types';
import Button from '@/shared/components/button/button';
import { formatLong } from '@/shared/utils/dates';

type AppointmentVoucherProps = {
  appointment: BookedAppointment;
  onBookAnother: () => void;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <>
    <dt className="text-[0.85rem] text-ink-soft">{label}</dt>
    <dd className="font-mono text-ink dark:text-white">{value}</dd>
  </>
);

/** Comprobante del turno reservado (mockup 17). */
const AppointmentVoucher = ({
  appointment,
  onBookAnother,
}: AppointmentVoucherProps) => (
  <section
    className="mx-auto w-full max-w-3xl border border-border bg-surface dark:border-sidebar-line dark:bg-sidebar-soft"
    aria-labelledby="voucher-title"
  >
    <div className="flex flex-col items-center gap-2 bg-accent px-6 py-7 text-center text-white">
      <span
        className="flex h-11 w-11 items-center justify-center border border-white/40 bg-white/15"
        aria-hidden="true"
      >
        <Check className="h-6 w-6" />
      </span>
      <h2 id="voucher-title" className="text-[1.4rem] font-semibold">
        Turno reservado
      </h2>
      <p className="text-[0.95rem] text-white/85">
        {appointment.patient.email
          ? `Enviamos el comprobante a ${appointment.patient.email}.`
          : 'El paciente no tiene correo cargado: entregale el comprobante impreso.'}
      </p>
    </div>

    <div className="flex flex-col gap-5 p-6">
      <div className="border border-border bg-surface-alt p-5 dark:border-sidebar-line dark:bg-sidebar">
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-ink-soft">
          Código de verificación
        </p>
        <strong className="block py-1 font-mono text-[1.8rem] tracking-[0.08em] text-accent-dark dark:text-accent-bright">
          {appointment.confirmation_code}
        </strong>
        <span className="text-[0.88rem] text-ink-soft">
          Presentalo en recepción o mostralo desde el teléfono.
        </span>

        <dl className="mt-5 grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2.5 border-t border-line pt-4 dark:border-sidebar-line">
          <Row label="Paciente" value={appointment.patient.name} />
          <Row label="Documento" value={appointment.patient.document_number} />
          <Row label="Especialidad" value={appointment.specialty.name} />
          <Row label="Profesional" value={appointment.professional.name} />
          <Row label="Día" value={formatLong(appointment.date)} />
          <Row
            label="Hora"
            value={`${appointment.start_time} a ${appointment.end_time}`}
          />
          <Row label="Consultorio" value={appointment.room?.name ?? '—'} />
        </dl>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button variant="primary" onClick={() => window.print()}>
          Descargar comprobante
        </Button>
        <Button onClick={onBookAnother}>Nuevo turno</Button>
        <Link
          className="inline-flex min-h-11 items-center border border-border-strong px-5 py-2.5 text-ink transition-colors hover:border-accent dark:border-sidebar-line dark:text-white"
          to="/agenda"
        >
          Ver en la agenda
        </Link>
      </div>

      <p className="text-[0.88rem] text-ink-soft">
        Llegá 10 minutos antes con el documento y la credencial. Si no podés
        asistir, llamá al {centerOptions.phone}.
      </p>
    </div>
  </section>
);

export default AppointmentVoucher;
