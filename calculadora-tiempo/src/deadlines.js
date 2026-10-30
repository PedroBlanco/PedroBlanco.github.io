import { parseIsoDate } from "./time.js";

const DAY_MS = 86_400_000;

// Calendario de días inhábiles del Registro Electrónico Único de la Junta de Andalucía.
// 2026: Orden de 21 de octubre de 2025 (BOJA). Las fiestas locales no se aplican al Registro.
export const ANDALUSIA_ADMIN_HOLIDAYS = Object.freeze({
  2026: Object.freeze([
    "2026-01-01",
    "2026-01-06",
    "2026-02-28",
    "2026-04-02",
    "2026-04-03",
    "2026-05-01",
    "2026-08-15",
    "2026-10-12",
    "2026-11-02",
    "2026-12-07",
    "2026-12-08",
    "2026-12-25",
  ]),
});

export class UnsupportedAdministrativeCalendarError extends RangeError {
  constructor(year) {
    super(
      `No se ha incorporado el calendario oficial de días inhábiles de Andalucía para ${year}.`,
    );
    this.name = "UnsupportedAdministrativeCalendarError";
    this.year = year;
  }
}

function epochDay(value) {
  const date = parseIsoDate(value);
  return Math.trunc(Date.UTC(date.year, date.month - 1, date.day) / DAY_MS);
}

function isoFromEpochDay(day) {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

function calendarForYear(year, calendars) {
  const holidays = calendars[year];
  if (!holidays) throw new UnsupportedAdministrativeCalendarError(year);
  return new Set(holidays);
}

function isBusinessDay(value, calendars) {
  const parsed = parseIsoDate(value);
  const weekday = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay();
  const holidays = calendarForYear(parsed.year, calendars);
  return weekday !== 0 && weekday !== 6 && !holidays.has(value);
}

export function applicationDeadline(
  publicationDate,
  { businessDays = 10, calendars = ANDALUSIA_ADMIN_HOLIDAYS } = {},
) {
  parseIsoDate(publicationDate);
  if (!Number.isInteger(businessDays) || businessDays < 1) {
    throw new RangeError("El número de días hábiles debe ser un entero positivo.");
  }

  let day = epochDay(publicationDate) + 1;
  let counted = 0;

  while (counted < businessDays) {
    const value = isoFromEpochDay(day);
    if (isBusinessDay(value, calendars)) counted += 1;
    if (counted === businessDays) return value;
    day += 1;
  }

  throw new Error("No se pudo calcular el fin del plazo.");
}
