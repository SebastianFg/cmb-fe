import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { usePatientCatalogs } from '@/modules/patients/hooks/use-patient-catalogs';
import type { RegisteredPatient } from '@/modules/patients/hooks/use-register-patient';
import { useRegisterPatient } from '@/modules/patients/hooks/use-register-patient';
import {
  createPatientRegistrationSchema,
  type PatientFormMode,
  type PatientRegistrationValues,
  patientRegistrationDefaults,
} from '@/modules/patients/schemas/patient.schema';
import {
  insuranceName,
  PatientFieldError,
} from '@/modules/patients/services/patient.service';
import Button from '@/shared/components/button/button';
import { Card, CardFooter } from '@/shared/components/card/card';
import CheckboxField from '@/shared/components/input/checkbox-field';
import SelectField from '@/shared/components/input/select-field';
import SwitchField from '@/shared/components/input/switch-field';
import TextField from '@/shared/components/input/text-field';
import Notice from '@/shared/components/notice/notice';
import RegistrationChecklist from './registration-checklist';

type PatientRegistrationFormProps = {
  /** `portal` es el alta pública; `desk`, la carga de recepción. */
  mode?: PatientFormMode;
  onRegistered: (patient: RegisteredPatient) => void;
};

const Legend = ({ children }: { children: string }) => (
  <legend className="mb-3 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-ink-soft">
    {children}
  </legend>
);

const PatientRegistrationForm = ({
  mode = 'portal',
  onRegistered,
}: PatientRegistrationFormProps) => {
  const isPortal = mode === 'portal';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { healthInsurances, isLoading, nationalities, privateInsuranceId } =
    usePatientCatalogs();

  const schema = useMemo(
    () => createPatientRegistrationSchema({ privateInsuranceId, mode }),
    [privateInsuranceId, mode],
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    setError,
    watch,
  } = useForm<PatientRegistrationValues>({
    defaultValues: patientRegistrationDefaults,
    resolver: zodResolver(schema),
  });

  const {
    error,
    isRegistering,
    register: submitPatient,
  } = useRegisterPatient({
    onRegistered,
  });

  const values = watch();

  const fieldErrors = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(errors).map(([field, value]) => [field, value?.message]),
      ) as Partial<Record<keyof PatientRegistrationValues, string>>,
    [errors],
  );

  const onSubmit = (parsed: PatientRegistrationValues) =>
    submitPatient(parsed, {
      onError: (submitError) => {
        if (submitError instanceof PatientFieldError) {
          setError(submitError.field as keyof PatientRegistrationValues, {
            message: submitError.message,
          });
        }
      },
    });

  const passwordType = isPasswordVisible ? 'text' : 'password';

  return (
    <div className="grid gap-5 min-[1000px]:grid-cols-[minmax(0,1fr)_380px] min-[1000px]:items-start">
      <Card className="p-6 sm:px-7">
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="mb-6 border-0 p-0">
            <Legend>Datos personales</Legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Apellido"
                requiredMark
                maxLength={60}
                autoComplete="family-name"
                control={control}
                name="last_name"
              />
              <TextField
                label="Nombre"
                requiredMark
                maxLength={60}
                autoComplete="given-name"
                control={control}
                name="first_name"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1.4fr_1fr_1.25fr]">
              <TextField
                label="Número de documento"
                requiredMark
                inputMode="numeric"
                maxLength={8}
                autoComplete="off"
                control={control}
                name="document_number"
              />
              <TextField
                label="Fecha de nacimiento"
                requiredMark
                type="date"
                control={control}
                name="birth_date"
              />
              <SelectField
                label="Nacionalidad"
                requiredMark
                hint="Catálogo del centro"
                placeholder={isLoading ? 'Cargando…' : 'Elegí una opción'}
                options={nationalities.map((nationality) => ({
                  value: nationality.id,
                  label: nationality.name,
                }))}
                control={control}
                name="nationality_id"
              />
            </div>
          </fieldset>

          <fieldset className="mb-6 border-0 p-0">
            <Legend>Contacto</Legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Teléfono"
                requiredMark
                type="tel"
                inputMode="tel"
                maxLength={14}
                autoComplete="tel-national"
                className="font-mono"
                hint="Característica sin 0 y número sin 15"
                control={control}
                name="phone"
              />
              <TextField
                label="Correo electrónico"
                requiredMark={isPortal}
                type="email"
                maxLength={80}
                autoComplete="email"
                hint={
                  isPortal
                    ? 'Lo usás para ingresar y para recibir los comprobantes.'
                    : 'Necesario solo si va a activar el acceso al portal'
                }
                control={control}
                name="email"
              />
            </div>
          </fieldset>

          <fieldset className="mb-6 border-0 p-0">
            <Legend>Cobertura</Legend>
            <div className="grid gap-4 sm:grid-cols-[1.7fr_1fr]">
              <SelectField
                label="Obra social"
                requiredMark
                hint="Catálogo del centro. Si no tenés cobertura, elegí «Particular»"
                placeholder={isLoading ? 'Cargando…' : 'Elegí una opción'}
                options={healthInsurances.map((insurance) => ({
                  value: insurance.id,
                  label: insuranceName(insurance),
                }))}
                control={control}
                name="health_insurance_id"
              />
              <TextField
                label="Número de afiliado"
                maxLength={20}
                autoComplete="off"
                className="font-mono"
                control={control}
                name="member_number"
              />
            </div>
          </fieldset>

          <fieldset className="border-0 p-0">
            <Legend>Acceso al portal</Legend>
            {isPortal ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Contraseña"
                  requiredMark
                  type={passwordType}
                  autoComplete="new-password"
                  hint="Al menos 8 caracteres, con letras y números"
                  control={control}
                  name="password"
                />
                <TextField
                  label="Repetir contraseña"
                  requiredMark
                  type={passwordType}
                  autoComplete="new-password"
                  control={control}
                  name="password_confirmation"
                />
                {/* No es un campo del formulario: solo alterna la visibilidad. */}
                <label className="flex cursor-pointer items-center gap-2.5 text-[0.95rem] text-ink-strong sm:col-span-2">
                  <input
                    type="checkbox"
                    className="h-[18px] w-[18px] flex-none accent-accent"
                    checked={isPasswordVisible}
                    onChange={(event) =>
                      setIsPasswordVisible(event.target.checked)
                    }
                  />
                  Mostrar contraseña
                </label>
                <CheckboxField
                  fieldClassName="sm:col-span-2"
                  label="Acepto que el centro use mis datos para gestionar mis turnos y enviarme avisos."
                  control={control}
                  name="terms"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-base text-ink-soft">
                  El paciente no es usuario del sistema: la ficha se guarda sin
                  credenciales. Si más adelante activa el portal, se agregan a
                  esta misma ficha.
                </p>
                <SwitchField
                  label="Enviar invitación al portal"
                  control={control}
                  name="invite"
                />
              </div>
            )}
          </fieldset>

          {error && !(error instanceof PatientFieldError) && (
            <Notice className="mt-6" role="alert" tone="danger">
              {error instanceof Error
                ? error.message
                : 'No se pudo guardar la ficha.'}
            </Notice>
          )}

          <CardFooter className="sm:-mx-7 sm:px-7">
            <Button isLoading={isRegistering} type="submit" variant="primary">
              {isPortal ? 'Crear cuenta' : 'Guardar paciente'}
            </Button>
            <Link
              className="ml-auto inline-flex min-h-11 items-center px-5 py-2.5 text-ink-soft transition-colors hover:text-ink"
              to={isPortal ? '/login' : '/panel'}
            >
              Cancelar
            </Link>
          </CardFooter>
        </form>
      </Card>

      <div className="flex flex-col gap-5">
        <Card>
          <h2 className="mb-3 text-[1.1rem] font-semibold text-ink dark:text-white">
            {isPortal ? 'Acceso al portal' : 'Contenido de la ficha'}
          </h2>
          <p className="text-ink-soft">
            {isPortal
              ? 'Tus datos se guardan en tu ficha del centro. La contraseña solo sirve para el portal: no da acceso a ninguna pantalla interna.'
              : 'Esta pantalla registra únicamente datos administrativos. La evolución clínica se carga desde la historia clínica y la firma el profesional.'}
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 text-[1.1rem] font-semibold text-ink dark:text-white">
            Validaciones
          </h2>
          <RegistrationChecklist
            errors={fieldErrors}
            mode={mode}
            values={values}
          />
          <p className="text-[0.82rem] text-ink-muted">
            Los campos marcados con * son obligatorios.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;
