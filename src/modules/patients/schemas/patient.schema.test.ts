import { addDays, today } from '@/shared/utils/dates';
import {
  createPatientRegistrationSchema,
  patientRegistrationDefaults,
} from './patient.schema';

const PRIVATE_INSURANCE_ID = 1;

const schema = createPatientRegistrationSchema({
  privateInsuranceId: PRIVATE_INSURANCE_ID,
});

const validValues = {
  ...patientRegistrationDefaults,
  document_number: '30114552',
  last_name: 'Ferreyra',
  first_name: 'Marta Elena',
  birth_date: '1983-05-14',
  nationality_id: '1',
  phone: '1154238890',
  email: 'marta@correo.com',
  health_insurance_id: '2',
  member_number: '4471-0090-1',
  password: 'turnos2026',
  password_confirmation: 'turnos2026',
  terms: true,
};

const errorFor = (
  overrides: Partial<typeof validValues>,
  field: string,
): string | undefined => {
  const result = schema.safeParse({ ...validValues, ...overrides });
  if (result.success) return undefined;

  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
};

describe('patient registration schema', () => {
  test('accepts a complete form and keeps the catalog ids as text', () => {
    const result = schema.safeParse(validValues);

    expect(result.success).toBe(true);
    // Los `<select>` entregan texto; el servicio convierte al armar el pedido.
    expect(result.data?.nationality_id).toBe('1');
    expect(result.data?.health_insurance_id).toBe('2');
  });

  test('reports every missing field of an empty form', () => {
    const result = schema.safeParse(patientRegistrationDefaults);
    const fields = new Set(result.error?.issues.map((issue) => issue.path[0]));

    expect(fields).toEqual(
      new Set([
        'document_number',
        'last_name',
        'first_name',
        'birth_date',
        'nationality_id',
        'phone',
        'email',
        'health_insurance_id',
        'password',
        'password_confirmation',
        'terms',
      ]),
    );
  });

  describe('document', () => {
    test.each([
      ['30.114.552', 'Escribí solo números, sin puntos ni espacios.'],
      [
        '123456',
        'El documento debe tener 7 u 8 dígitos, sin puntos ni espacios.',
      ],
      [
        '123456789',
        'El documento debe tener 7 u 8 dígitos, sin puntos ni espacios.',
      ],
    ])('rejects %s', (document_number, message) => {
      expect(errorFor({ document_number }, 'document_number')).toBe(message);
    });

    test.each(['1234567', '12345678'])('accepts %s', (document_number) => {
      expect(errorFor({ document_number }, 'document_number')).toBeUndefined();
    });
  });

  describe('names', () => {
    test('rejects a single letter', () => {
      expect(errorFor({ last_name: 'A' }, 'last_name')).toBe(
        'Revisá el apellido: es demasiado corto.',
      );
    });

    test('rejects digits and symbols', () => {
      expect(errorFor({ first_name: 'Ana3' }, 'first_name')).toBe(
        'Usá solo letras, espacios, apóstrofo o guion.',
      );
    });

    test.each(['Ñandú', "O'Connor", 'García Pérez', 'Jean-Luc'])(
      'accepts %s',
      (last_name) => {
        expect(errorFor({ last_name }, 'last_name')).toBeUndefined();
      },
    );
  });

  describe('birth date', () => {
    test('rejects a date in the future', () => {
      expect(errorFor({ birth_date: addDays(today(), 1) }, 'birth_date')).toBe(
        'La fecha de nacimiento no puede ser posterior a hoy.',
      );
    });

    test('rejects an age over 120', () => {
      expect(errorFor({ birth_date: '1850-01-01' }, 'birth_date')).toBe(
        'Revisá el año: la edad resultante supera los 120 años.',
      );
    });
  });

  describe('phone', () => {
    test.each(['11542388', '11542388901'])('rejects %s', (phone) => {
      expect(errorFor({ phone }, 'phone')).toBe(
        'El teléfono debe tener 10 dígitos: característica sin 0 y número sin 15.',
      );
    });

    test('accepts a formatted number with 10 digits', () => {
      expect(errorFor({ phone: '11 5423-8890' }, 'phone')).toBeUndefined();
    });
  });

  describe('member number', () => {
    test('is required for a real insurance', () => {
      expect(
        errorFor(
          { health_insurance_id: '2', member_number: '' },
          'member_number',
        ),
      ).toBe('Ingresá el número de afiliado que figura en la credencial.');
    });

    test('is optional for Particular', () => {
      expect(
        errorFor(
          {
            health_insurance_id: String(PRIVATE_INSURANCE_ID),
            member_number: '',
          },
          'member_number',
        ),
      ).toBeUndefined();
    });

    test('validates the format when it is present', () => {
      expect(errorFor({ member_number: 'ab' }, 'member_number')).toBe(
        'El número de afiliado admite letras, números y guiones (4 a 20 caracteres).',
      );
    });
  });

  describe('password', () => {
    test.each(['corta1', 'sinnumeros', '12345678'])(
      'rejects %s',
      (password) => {
        expect(
          errorFor({ password, password_confirmation: password }, 'password'),
        ).toBe(
          'La contraseña necesita al menos 8 caracteres, con letras y números.',
        );
      },
    );

    test('requires both entries to match', () => {
      expect(
        errorFor(
          { password_confirmation: 'otra12345' },
          'password_confirmation',
        ),
      ).toBe('Las contraseñas no coinciden.');
    });
  });

  test('requires accepting the terms', () => {
    expect(errorFor({ terms: false }, 'terms')).toBe(
      'Tenés que aceptar el uso de tus datos para gestionar turnos.',
    );
  });
});
