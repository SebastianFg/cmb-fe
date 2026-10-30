import { WHATSAPP_MESSAGES, whatsappHref } from '@/config/center-options';

export type Specialty = {
  num: string;
  name: string;
  whatsappHref: string;
};

export const SPECIALTY_NAMES = [
  'Clínica médica',
  'Pediatría',
  'Cardiología',
  'Dermatología',
  'Ginecología',
  'Traumatología',
  'Oftalmología',
  'Nutrición',
] as const;

export const specialties: Specialty[] = SPECIALTY_NAMES.map((name, index) => ({
  num: `0${index + 1}`,
  name,
  whatsappHref: whatsappHref(WHATSAPP_MESSAGES.specialty(name)),
}));

export type TeamMember = {
  name: string;
  specialty: string;
  license: string;
  initials: string;
};

const TITLE_PREFIX = /^(Dra?\.|Lic\.)\s*/;

const toInitials = (name: string): string => {
  const parts = name.replace(TITLE_PREFIX, '').split(' ');

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const team: TeamMember[] = (
  [
    ['Dra. Paula Aguirre', 'Clínica médica', 'M.N. 112.045'],
    ['Dr. Andrés Paz', 'Clínica médica', 'M.N. 104.388'],
    ['Dr. Hernán Vidal', 'Pediatría', 'M.N. 99.512'],
    ['Dr. Marcos Iriarte', 'Cardiología', 'M.N. 87.230'],
    ['Dra. Lucía Márquez', 'Dermatología', 'M.N. 121.907'],
    ['Dr. Fabián Cabral', 'Traumatología', 'M.N. 96.774'],
    ['Dra. Verónica Lima', 'Ginecología', 'M.N. [—]'],
    ['Dra. Carolina Ruiz', 'Oftalmología', 'M.N. [—]'],
    ['Lic. Tomás Giménez', 'Nutrición', 'M.N. [—]'],
  ] as const
).map(([name, specialty, license]) => ({
  name,
  specialty,
  license,
  initials: toInitials(name),
}));

export const insurers = [
  'OSDE',
  'Swiss Medical',
  'Galeno',
  'IOMA',
  'PAMI',
  'IPS',
] as const;

export const benefits = [
  {
    title: 'Todo en un solo lugar',
    text: 'Clínica, especialistas y nutrición en el mismo piso. Sin ir y venir por la ciudad.',
  },
  {
    title: 'Te atendés con tu cobertura',
    text: 'OSDE, Swiss Medical, Galeno, IOMA, PAMI e IPS. Consultanos por la tuya.',
  },
  {
    title: 'Abrimos los sábados',
    text: 'De lunes a viernes de 8 a 20 h y sábados de 8 a 13 h, para que no pierdas el día.',
  },
  {
    title: 'Sobre Av. Cabildo',
    text: 'En el corazón de Belgrano, a pasos del subte D y de las principales líneas de colectivo.',
  },
] as const;

export const bookingSteps = [
  {
    title: 'Escribinos o llamanos',
    text: 'Contanos qué especialidad buscás.',
  },
  {
    title: 'Elegimos juntos el horario',
    text: 'Te ofrecemos los días y horarios disponibles y confirmamos tu cobertura.',
  },
  {
    title: 'Venís y te atendemos',
    text: 'Traé tu DNI y la credencial de tu obra social. Nosotros nos ocupamos del resto.',
  },
] as const;

export const heroStats = [
  { value: String(SPECIALTY_NAMES.length), label: 'especialidades' },
  { value: String(team.length), label: 'profesionales' },
  { value: String(insurers.length), label: 'obras sociales' },
] as const;
