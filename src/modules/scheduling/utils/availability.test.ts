import type {
  Appointment,
  Holiday,
  Schedule,
  ScheduleException,
} from '@/shared/types/domain.types';
import { today, weekday } from '@/shared/utils/dates';
import {
  type AvailabilityData,
  bookableSlots,
  daySlots,
  holidayOn,
  isCancelled,
  schedulesFor,
  worksOn,
} from './availability';

// 2026-09-07 es lunes; 2026-09-08, martes.
const MONDAY = '2026-09-07';
const TUESDAY = '2026-09-08';

const schedule = (overrides: Partial<Schedule> = {}): Schedule => ({
  id: 1,
  professional_id: 1,
  specialty_id: 1,
  room_id: 1,
  weekday: weekday(MONDAY),
  start_time: '09:00',
  end_time: '10:00',
  slot_duration_minutes: 30,
  ...overrides,
});

const appointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 1,
  patient_id: 1,
  professional_id: 1,
  specialty_id: 1,
  room_id: 1,
  created_by: null,
  cancelled_by: null,
  date: MONDAY,
  start_time: '09:00',
  end_time: '09:30',
  status: 'booked',
  source: 'desk',
  confirmation_code: 'TRN-AAAAAA',
  reason: '',
  cancellation_reason: '',
  is_penalized: false,
  notes: '',
  attended_at: null,
  created_at: '',
  updated_at: null,
  ...overrides,
});

const data = (overrides: Partial<AvailabilityData> = {}): AvailabilityData => ({
  schedules: [schedule()],
  holidays: [],
  schedule_exceptions: [],
  appointments: [],
  ...overrides,
});

describe('availability', () => {
  test('marks only the cancelled statuses as cancelled', () => {
    expect(isCancelled(appointment({ status: 'cancelled_by_center' }))).toBe(
      true,
    );
    expect(
      isCancelled(appointment({ status: 'cancelled_by_professional' })),
    ).toBe(true);
    expect(isCancelled(appointment({ status: 'no_show' }))).toBe(false);
    expect(isCancelled(appointment({ status: 'booked' }))).toBe(false);
  });

  test('finds the holiday of a date', () => {
    const holiday: Holiday = {
      id: 1,
      date: MONDAY,
      name: 'Feriado',
      is_nationwide: true,
    };

    expect(holidayOn(data({ holidays: [holiday] }), MONDAY)).toBe(holiday);
    expect(holidayOn(data({ holidays: [holiday] }), TUESDAY)).toBeNull();
  });

  test('keeps only the schedules of that professional and weekday', () => {
    const current = data({
      schedules: [
        schedule({ id: 1 }),
        schedule({ id: 2, professional_id: 2 }),
        schedule({ id: 3, weekday: weekday(TUESDAY) }),
      ],
    });

    expect(schedulesFor(current, 1, MONDAY).map((item) => item.id)).toEqual([
      1,
    ]);
  });

  test('splits the schedule into slots of the configured duration', () => {
    const slots = daySlots(data(), 1, MONDAY);

    expect(slots).toHaveLength(2);
    expect(slots.map((slot) => `${slot.start_time}-${slot.end_time}`)).toEqual([
      '09:00-09:30',
      '09:30-10:00',
    ]);
    expect(slots.every((slot) => slot.state === 'free')).toBe(true);
  });

  test('drops the tail that does not fit a whole slot', () => {
    const slots = daySlots(
      data({ schedules: [schedule({ end_time: '10:20' })] }),
      1,
      MONDAY,
    );

    expect(slots.map((slot) => slot.start_time)).toEqual(['09:00', '09:30']);
  });

  test('returns nothing on a holiday', () => {
    const holiday: Holiday = {
      id: 1,
      date: MONDAY,
      name: 'Feriado',
      is_nationwide: true,
    };

    expect(daySlots(data({ holidays: [holiday] }), 1, MONDAY)).toEqual([]);
    expect(worksOn(data({ holidays: [holiday] }), 1, MONDAY)).toBe(false);
  });

  test('worksOn is false when no schedule covers the weekday', () => {
    expect(worksOn(data(), 1, TUESDAY)).toBe(false);
    expect(worksOn(data(), 1, MONDAY)).toBe(true);
  });

  test('marks a slot taken by an active appointment', () => {
    const slots = daySlots(data({ appointments: [appointment()] }), 1, MONDAY);

    expect(slots[0].state).toBe('taken');
    expect(slots[0].appointment?.id).toBe(1);
    expect(slots[1].state).toBe('free');
  });

  test('frees the slot of a cancelled appointment', () => {
    const slots = daySlots(
      data({ appointments: [appointment({ status: 'cancelled_by_center' })] }),
      1,
      MONDAY,
    );

    expect(slots[0].state).toBe('free');
  });

  test('marks a slot blocked by an absence', () => {
    const exception: ScheduleException = {
      id: 1,
      professional_id: 1,
      date: MONDAY,
      start_time: '09:30',
      end_time: '10:00',
      type: 'absence',
      reason: 'Congreso',
    };

    const slots = daySlots(
      data({ schedule_exceptions: [exception] }),
      1,
      MONDAY,
    );

    expect(slots[0].state).toBe('free');
    expect(slots[1].state).toBe('blocked');
    expect(slots[1].exception?.reason).toBe('Congreso');
  });

  test('an appointment wins over an absence on the same slot', () => {
    const exception: ScheduleException = {
      id: 1,
      professional_id: 1,
      date: MONDAY,
      start_time: '09:00',
      end_time: '10:00',
      type: 'block',
      reason: 'Bloqueo',
    };

    const slots = daySlots(
      data({ appointments: [appointment()], schedule_exceptions: [exception] }),
      1,
      MONDAY,
    );

    expect(slots[0].state).toBe('taken');
    expect(slots[0].exception).toBeNull();
  });

  describe('bookableSlots', () => {
    test('ignores past dates', () => {
      expect(bookableSlots(data(), 1, MONDAY)).toEqual([]);
    });

    test('keeps the free slots of a future date', () => {
      const future = '2099-09-07';
      const current = data({
        schedules: [schedule({ weekday: weekday(future) })],
      });

      expect(bookableSlots(current, 1, future)).toHaveLength(2);
    });

    test('drops the slots of today that already started', () => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 8, 7, 9, 15));
      const current = data({ schedules: [schedule({ weekday: 1 })] });

      const slots = bookableSlots(current, 1, today());

      expect(slots.map((slot) => slot.start_time)).toEqual(['09:30']);
      jest.useRealTimers();
    });
  });
});
