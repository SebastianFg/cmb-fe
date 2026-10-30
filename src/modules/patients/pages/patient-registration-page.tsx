import { useState } from 'react';
import { Link } from 'react-router-dom';
import PatientRegistrationForm from '@/modules/patients/components/patient-registration-form';
import type { RegisteredPatient } from '@/modules/patients/hooks/use-register-patient';
import Notice from '@/shared/components/notice/notice';
import PublicShell from '@/shared/layouts/public-shell';

const PatientRegistrationPage = () => {
  const [registered, setRegistered] = useState<RegisteredPatient | null>(null);

  return (
    <PublicShell>
      <div className="mb-6">
        <h1 className="mb-2 text-[clamp(1.6rem,4vw,2.2rem)] font-semibold tracking-[-0.01em] text-ink dark:text-white">
          Crear tu cuenta
        </h1>
        <p className="max-w-[44em] text-ink-soft">
          Con tu cuenta sacás y consultás tus turnos desde el celular. Si ya te
          atendiste en el centro, usá el mismo documento: vamos a reconocer tu
          ficha.
        </p>
      </div>

      {registered ? (
        <Notice tone="success" title="Cuenta creada" role="status">
          <p>
            Listo, {registered.first_name}. Ya podés{' '}
            <Link className="font-semibold underline" to="/login">
              iniciar sesión
            </Link>{' '}
            con {registered.email}.
          </p>
        </Notice>
      ) : (
        <PatientRegistrationForm onRegistered={setRegistered} />
      )}
    </PublicShell>
  );
};

export default PatientRegistrationPage;
