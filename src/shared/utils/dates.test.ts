import {
  addDays,
  age,
  diffDays,
  formatDayMonth,
  formatLong,
  formatShort,
  formatWeekdayShort,
  fromMinutes,
  nowTime,
  overlaps,
  parseIso,
  today,
  toIso,
  toMinutes,
  weekday,
} from './dates';

describe('date helpers', () => {
  test('reads an ISO date as local midnight, not UTC', () => {
    const date = parseIso('2026-09-07');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(7);
    expect(date.getHours()).toBe(0);
  });

  test('round-trips a date through toIso', () => {
    expect(toIso(parseIso('2026-01-05'))).toBe('2026-01-05');
  });

  test('today and nowTime use the padded local format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(nowTime()).toMatch(/^\d{2}:\d{2}$/);
  });

  test.each([
    ['2026-09-07', 1, '2026-09-08'],
    ['2026-09-30', 1, '2026-10-01'],
    ['2026-01-01', -1, '2025-12-31'],
    ['2024-02-28', 1, '2024-02-29'],
  ])('addDays(%s, %i) crosses the boundary', (iso, days, expected) => {
    expect(addDays(iso, days)).toBe(expected);
  });

  test('weekday follows the Sunday-zero convention', () => {
    expect(weekday('2026-09-07')).toBe(1);
    expect(weekday('2026-09-13')).toBe(0);
  });

  test('diffDays counts whole days in both directions', () => {
    expect(diffDays('2026-09-07', '2026-09-10')).toBe(3);
    expect(diffDays('2026-09-10', '2026-09-07')).toBe(-3);
  });

  test.each([
    ['08:00', 480],
    ['13:30', 810],
    ['00:00', 0],
  ])('converts %s to minutes and back', (time, minutes) => {
    expect(toMinutes(time)).toBe(minutes);
    expect(fromMinutes(minutes)).toBe(time);
  });

  test('formats a date for the interface', () => {
    expect(formatShort('2026-09-07')).toBe('07/09/2026');
    expect(formatDayMonth('2026-09-07')).toBe('07/09');
    expect(formatLong('2026-09-07')).toBe('Lunes 7 de septiembre de 2026');
    expect(formatWeekdayShort('2026-09-08')).toBe('Mar 08/09');
  });

  describe('age', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 8, 7));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test.each([
      ['birthday already passed', '1983-05-14', 43],
      ['birthday today', '1983-09-07', 43],
      ['birthday still to come', '1983-09-08', 42],
    ])('counts completed years when the %s', (_label, birth, expected) => {
      expect(age(birth)).toBe(expected);
    });
  });

  describe('overlaps', () => {
    test.each([
      ['identical ranges', '09:00', '09:30', '09:00', '09:30', true],
      ['partial overlap', '09:00', '09:30', '09:15', '09:45', true],
      ['contained range', '09:00', '10:00', '09:15', '09:30', true],
      ['touching edges', '09:00', '09:30', '09:30', '10:00', false],
      ['disjoint ranges', '09:00', '09:30', '10:00', '10:30', false],
    ])('%s', (_label, startA, endA, startB, endB, expected) => {
      expect(overlaps(startA, endA, startB, endB)).toBe(expected);
    });
  });
});
