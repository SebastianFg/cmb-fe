import { useState } from 'react';
import PatientList from '@/modules/patients/components/patient-list';
import PatientRegistrationForm from '@/modules/patients/components/patient-registration-form';
import type { RegisteredPatient } from '@/modules/patients/hooks/use-register-patient';
import {
  emptyPatientFilters,
  type PatientFilters,
} from '@/modules/patients/types/patient.types';
import Notice from '@/shared/components/notice/notice';

/** Alta y listado de fichas desde el mostrador (mockup 04 del TP). */
const PatientDeskPage = () => {
  const [saved, setSaved] = useState<RegisteredPatient | null>(null);
  const [filters, setFilters] = useState<PatientFilters>(emptyPatientFilters);

  const handleRegistered = (patient: RegisteredPatient) => {
    setSaved(patient);
    setFilters({ ...emptyPatientFilters, search: '' });
  };

  return (
    <div className="flex flex-col gap-6">
      {saved && (
        <Notice tone="success" title="Ficha guardada" role="status">
          Se registró a {saved.first_name}. Ya aparece en el listado.
        </Notice>
      )}

      <PatientRegistrationForm mode="desk" onRegistered={handleRegistered} />

      <PatientList
        filters={filters}
        highlightedId={saved?.id ?? null}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default PatientDeskPage;
