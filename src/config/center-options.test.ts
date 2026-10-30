import {
  centerOptions,
  mailHref,
  telHref,
  WHATSAPP_MESSAGES,
  whatsappHref,
} from './center-options';

describe('center options', () => {
  test('el teléfono del enlace es E.164 y el visible es legible', () => {
    expect(telHref()).toBe(`tel:${centerOptions.phoneE164}`);
    expect(centerOptions.phoneE164).toMatch(/^\+\d{8,15}$/);
    expect(centerOptions.phone).not.toBe(centerOptions.phoneE164);
  });

  test('arma el correo', () => {
    expect(mailHref()).toBe(`mailto:${centerOptions.email}`);
  });

  test('wa.me recibe solo dígitos y el mensaje codificado', () => {
    const href = whatsappHref('Hola, ¿cómo va?');

    expect(href).toBe(
      `https://wa.me/${centerOptions.whatsapp}?text=${encodeURIComponent('Hola, ¿cómo va?')}`,
    );
    expect(href).not.toContain(' ');
  });

  test('el mensaje por especialidad nombra la especialidad', () => {
    expect(WHATSAPP_MESSAGES.specialty('Cardiología')).toContain('Cardiología');
  });
});
