import {
  heroStats,
  insurers,
  SPECIALTY_NAMES,
  specialties,
  team,
} from './landing-content';

describe('contenido de la landing', () => {
  test('el centro acepta IPS', () => {
    expect(insurers).toContain('IPS');
  });

  // Los números del hero se calculaban a mano y quedaban viejos al sumar
  // una cobertura o un profesional.
  test('los números del hero salen de los catálogos', () => {
    expect(heroStats.map((stat) => stat.value)).toEqual([
      String(SPECIALTY_NAMES.length),
      String(team.length),
      String(insurers.length),
    ]);
  });

  test('cada especialidad tiene número correlativo y enlace propio', () => {
    expect(specialties).toHaveLength(SPECIALTY_NAMES.length);

    specialties.forEach((specialty, index) => {
      expect(specialty.num).toBe(`0${index + 1}`);
      expect(specialty.whatsappHref).toContain(
        encodeURIComponent(specialty.name),
      );
    });
  });

  test('las iniciales del equipo ignoran el título profesional', () => {
    expect(team[0]).toMatchObject({
      name: 'Dra. Paula Aguirre',
      initials: 'PA',
    });
    expect(team[team.length - 1]).toMatchObject({
      name: 'Lic. Tomás Giménez',
      initials: 'TG',
    });
  });
});
