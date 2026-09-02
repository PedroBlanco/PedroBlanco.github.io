const DAY_MS = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parseIsoDate(value) {
  if (typeof value !== "string") {
    throw new TypeError("La fecha debe ser una cadena AAAA-MM-DD.");
  }

  const match = ISO_DATE.exec(value);
  if (!match) {
    throw new RangeError(`Fecha no válida: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError(`Fecha no válida: ${value}`);
  }

  return { year, month, day };
}

function epochDay(date) {
  return Math.trunc(Date.UTC(date.year, date.month - 1, date.day) / DAY_MS);
}

function fromEpochDay(day) {
  const date = new Date(day * DAY_MS);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function addDays(date, days) {
  return fromEpochDay(epochDay(date) + days);
}

function compareDates(a, b) {
  return epochDay(a) - epochDay(b);
}

function addYearsClamped(date, years) {
  const year = date.year + years;
  return {
    year,
    month: date.month,
    day: Math.min(date.day, daysInMonth(year, date.month)),
  };
}

function addMonthsClamped(date, months) {
  const absolute = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(absolute / 12);
  const month = (absolute % 12) + 1;
  return {
    year,
    month,
    day: Math.min(date.day, daysInMonth(year, month)),
  };
}

export function differenceCalendar(startValue, endValue, { inclusiveEnd = true } = {}) {
  const start = parseIsoDate(startValue);
  const end = parseIsoDate(endValue);

  if (compareDates(start, end) > 0) {
    throw new RangeError("La fecha inicial no puede ser posterior a la final.");
  }

  const effectiveEnd = inclusiveEnd ? addDays(end, 1) : end;
  const totalDays = epochDay(effectiveEnd) - epochDay(start);

  let years = effectiveEnd.year - start.year;
  let cursor = addYearsClamped(start, years);
  if (compareDates(cursor, effectiveEnd) > 0) {
    years -= 1;
    cursor = addYearsClamped(start, years);
  }

  let months = (effectiveEnd.year - cursor.year) * 12 + (effectiveEnd.month - cursor.month);
  let monthCursor = addMonthsClamped(cursor, months);
  if (compareDates(monthCursor, effectiveEnd) > 0) {
    months -= 1;
    monthCursor = addMonthsClamped(cursor, months);
  }

  const days = epochDay(effectiveEnd) - epochDay(monthCursor);

  return { years, months, days, totalDays };
}

export function isStrictlyMoreThanSixMonths(duration) {
  if (duration.years > 0) return true;
  if (duration.months > 6) return true;
  if (duration.months < 6) return false;
  return duration.days > 0;
}

export function valuableYearsForContinuousPeriod(duration) {
  return (
    duration.years +
    (isStrictlyMoreThanSixMonths({
      years: 0,
      months: duration.months,
      days: duration.days,
    })
      ? 1
      : 0)
  );
}

export function mergePeriods(periods, { inclusiveEnd = true } = {}) {
  if (!Array.isArray(periods)) {
    throw new TypeError("Los periodos deben proporcionarse como una lista.");
  }

  const normalized = periods.map((period, index) => {
    const start = parseIsoDate(period.start);
    const end = parseIsoDate(period.end);
    if (compareDates(start, end) > 0) {
      throw new RangeError(`Periodo ${index + 1}: la fecha inicial es posterior a la final.`);
    }

    return {
      start: epochDay(start),
      endExclusive: epochDay(end) + (inclusiveEnd ? 1 : 0),
    };
  });

  if (normalized.length === 0) {
    return { totalDays: 0, mergedPeriods: 0, overlapsDetected: false };
  }

  normalized.sort((a, b) => a.start - b.start || a.endExclusive - b.endExclusive);

  let current = { ...normalized[0] };
  let totalDays = 0;
  let mergedPeriods = 0;
  let overlapsDetected = false;

  for (const next of normalized.slice(1)) {
    if (next.start <= current.endExclusive) {
      if (next.start < current.endExclusive) overlapsDetected = true;
      current.endExclusive = Math.max(current.endExclusive, next.endExclusive);
    } else {
      totalDays += current.endExclusive - current.start;
      mergedPeriods += 1;
      current = { ...next };
    }
  }

  totalDays += current.endExclusive - current.start;
  mergedPeriods += 1;

  return { totalDays, mergedPeriods, overlapsDetected };
}
