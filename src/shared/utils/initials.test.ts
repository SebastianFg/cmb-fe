import { initialsOf } from './initials';

describe('initialsOf', () => {
  test.each([
    ['Claudia Molina', 'CM'],
    ['Dra. Paula Aguirre', 'PA'],
    ['Dr. A. Paz', 'AP'],
    ['Lic. Sofía Benítez', 'SB'],
    ['Roberto Sebastián Fernandes', 'RS'],
    ['Paciente', 'P'],
    ['', ''],
  ])('%s -> %s', (name, expected) => {
    expect(initialsOf(name)).toBe(expected);
  });
});
