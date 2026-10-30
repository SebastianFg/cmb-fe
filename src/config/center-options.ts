/**
 * Datos de contacto del centro. Son los que la landing muestra y los que
 * arman los enlaces de WhatsApp y de teléfono.
 *
 * Están acá y no en `env-config` porque no son configuración de entorno sino
 * datos del centro: cuando `cmb-be` exponga `GET /settings`, este módulo pasa
 * a alimentarse de esa respuesta sin que las pantallas cambien.
 */
export type CenterOptions = {
  name: string;
  address: string;
  city: string;
  /** Como se muestra en pantalla. */
  phone: string;
  /** Formato E.164 para el enlace `tel:`. */
  phoneE164: string;
  /** Solo dígitos con código de país, como lo pide wa.me. */
  whatsapp: string;
  email: string;
  openingHours: string[];
  openingHoursShort: string;
  medicalDirector: string;
  /** Teléfono de emergencias que se muestra en el pie. */
  emergencyPhone: string;
  emergencyLabel: string;
};

export const centerOptions: CenterOptions = {
  name: 'Centro Médico Belgrano',
  address: 'Av. Cabildo 2340, piso 2',
  city: 'Belgrano, Ciudad de Buenos Aires',
  phone: '(0376) 400-0000',
  phoneE164: '+543764000000',
  whatsapp: '543764000000',
  email: 'turnos@cmbelgrano.com.ar',
  openingHours: ['Lunes a viernes de 8 a 20 h', 'Sábados de 8 a 13 h'],
  openingHoursShort: 'Lunes a viernes de 8 a 20 h · Sábados de 8 a 13 h',
  medicalDirector: 'Dr. A. Sarmiento, M.N. 84.320',
  emergencyPhone: '107',
  emergencyLabel: 'SAME',
};

export const telHref = (): string => `tel:${centerOptions.phoneE164}`;

export const mailHref = (): string => `mailto:${centerOptions.email}`;

/** Enlace de WhatsApp con el mensaje ya escrito. */
export const whatsappHref = (message: string): string => {
  const digits = centerOptions.whatsapp.replace(/\D/g, '');

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

export const WHATSAPP_MESSAGES = {
  general: `Hola, quiero pedir un turno en el ${centerOptions.name}.`,
  coverage: 'Hola, quiero saber si atienden con mi obra social.',
  specialty: (name: string) => `Hola, quiero pedir un turno de ${name}.`,
} as const;
