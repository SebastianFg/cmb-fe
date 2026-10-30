import { APP_ROLES } from '@/shared/constants/roles';
import { canRoleOpenPath, landingPathForRole } from './landing-path';
import { AppRoutesWithRoles, findNavItem } from './nav-items';

describe('landing path', () => {
  // Esta es la invariante: un aterrizaje que no existe deja al rol en un 404
  // apenas inicia sesión, que es exactamente lo que pasaba con `professional`.
  test.each(APP_ROLES)(
    'el aterrizaje de %s existe y le corresponde',
    (role) => {
      const landing = landingPathForRole(role);

      expect(findNavItem(landing)).not.toBeNull();
      expect(canRoleOpenPath(role, landing)).toBe(true);
    },
  );

  test('cada rol declarado tiene al menos una pantalla', () => {
    for (const role of APP_ROLES) {
      const reachable = AppRoutesWithRoles.filter((item) =>
        item.roles.includes(role),
      );

      expect(reachable.length).toBeGreaterThan(0);
    }
  });

  test('sin rol conocido cae en el panel', () => {
    expect(landingPathForRole(null)).toBe('/panel');
    expect(landingPathForRole('super-admin')).toBe('/panel');
  });

  describe('canRoleOpenPath', () => {
    test('acepta la ruta del rol e ignora query y hash', () => {
      expect(canRoleOpenPath('reception', '/panel')).toBe(true);
      expect(canRoleOpenPath('reception', '/panel?tab=hoy#listado')).toBe(true);
    });

    test('rechaza la ruta de otro rol', () => {
      expect(canRoleOpenPath('reception', '/mis-turnos')).toBe(false);
      expect(canRoleOpenPath('patient', '/panel')).toBe(false);
    });

    test('rechaza una ruta que no existe', () => {
      expect(canRoleOpenPath('admin', '/no-existe')).toBe(false);
    });

    test('rechaza sin sesión', () => {
      expect(canRoleOpenPath(null, '/panel')).toBe(false);
    });
  });
});
