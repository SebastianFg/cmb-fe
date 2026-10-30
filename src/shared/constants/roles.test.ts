import {
  APP_ROLES,
  getRoleLabel,
  isStaffRole,
  normalizeRole,
  STAFF_ROLES,
} from './roles';

describe('roles', () => {
  test('declares the four roles of the project', () => {
    expect([...APP_ROLES]).toEqual([
      'admin',
      'reception',
      'professional',
      'patient',
    ]);
  });

  test('staff excludes the patient', () => {
    expect(STAFF_ROLES).not.toContain('patient');
  });

  test.each(APP_ROLES)('normalizes and labels %s', (role) => {
    expect(normalizeRole(role)).toBe(role);
    expect(getRoleLabel(role)).toEqual(expect.any(String));
  });

  test.each([null, undefined, '', 'super-admin'])(
    'rejects the unknown value %p',
    (role) => {
      expect(normalizeRole(role)).toBeNull();
      expect(getRoleLabel(role)).toBeNull();
      expect(isStaffRole(role)).toBe(false);
    },
  );

  test('separates staff from patient', () => {
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('patient')).toBe(false);
  });
});
