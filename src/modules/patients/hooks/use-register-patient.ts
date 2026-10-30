import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PatientRegistrationValues } from '@/modules/patients/schemas/patient.schema';
import { registerPatient } from '@/modules/patients/services/patient.service';
import { patientKeys } from './use-patients';

/** Lo mínimo que la pantalla necesita saber de la ficha recién creada. */
export type RegisteredPatient = {
  id: number;
  first_name: string;
  email: string;
};

type UseRegisterPatientOptions = {
  onRegistered: (patient: RegisteredPatient) => void;
};

export const useRegisterPatient = ({
  onRegistered,
}: UseRegisterPatientOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: PatientRegistrationValues) => registerPatient(values),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      onRegistered(patient);
    },
  });

  return {
    error: mutation.error,
    isRegistering: mutation.isPending,
    register: mutation.mutate,
  };
};
