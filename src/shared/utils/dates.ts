import type { ClockTime, IsoDate } from '@/shared/types/domain.types';

export const WEEKDAYS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

export const WEEKDAYS_SHORT = [
  'dom',
  'lun',
  'mar',
  'mié',
  'jue',
  'vie',
  'sáb',
] as const;

export const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

const pad = (value: number) => String(value).padStart(2, '0');

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** "YYYY-MM-DD" en hora local. */
export const toIso = (date: Date): IsoDate =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Medianoche local: `new Date("YYYY-MM-DD")` se interpretaría como UTC. */
export const parseIso = (iso: IsoDate): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const today = (): IsoDate => toIso(new Date());

export const nowTime = (): ClockTime => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export const addDays = (iso: IsoDate, days: number): IsoDate => {
  const date = parseIso(iso);
  date.setDate(date.getDate() + days);
  return toIso(date);
};

export const weekday = (iso: IsoDate): number => parseIso(iso).getDay();

export const diffDays = (fromIso: IsoDate, toIsoDate: IsoDate): number =>
  Math.round(
    (parseIso(toIsoDate).getTime() - parseIso(fromIso).getTime()) / 86_400_000,
  );

export const toMinutes = (time: ClockTime): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const fromMinutes = (minutes: number): ClockTime =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** "07/09/2026" */
export const formatShort = (iso: IsoDate): string => {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
};

/** "07/09" */
export const formatDayMonth = (iso: IsoDate): string => {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
};

/** "Lunes 7 de septiembre de 2026" */
export const formatLong = (iso: IsoDate): string => {
  const date = parseIso(iso);
  return capitalize(
    `${WEEKDAYS[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`,
  );
};

/** "Mar 08/09" */
export const formatWeekdayShort = (iso: IsoDate): string =>
  `${capitalize(WEEKDAYS_SHORT[weekday(iso)])} ${formatDayMonth(iso)}`;

/** Años cumplidos entre una fecha de nacimiento y hoy. */
export const age = (birthIso: IsoDate): number => {
  const birth = parseIso(birthIso);
  const now = new Date();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());

  return now.getFullYear() - birth.getFullYear() - (beforeBirthday ? 1 : 0);
};

/** Si [startA, endA) y [startB, endB) comparten al menos un minuto. */
export const overlaps = (
  startA: ClockTime,
  endA: ClockTime,
  startB: ClockTime,
  endB: ClockTime,
): boolean => startA < endB && startB < endA;
