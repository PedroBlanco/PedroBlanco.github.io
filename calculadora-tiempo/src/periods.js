import { differenceCalendar, mergePeriods, parseIsoDate } from "./time.js";

export class PeriodInputError extends Error {
  constructor(message, { periodIndex, field } = {}) {
    super(message);
    this.name = "PeriodInputError";
    this.periodIndex = periodIndex;
    this.field = field;
  }
}

export function todayIso(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function referenceDates(callEndDate, callDate = callEndDate) {
  parseIsoDate(callEndDate);
  const published = parseIsoDate(callDate);
  if (callDate > callEndDate) {
    throw new RangeError("La fecha de convocatoria no puede ser posterior al fin de solicitudes.");
  }
  return {
    requirements: callEndDate,
    merits: `${published.year - 1}-12-31`,
  };
}

function isEmptyField(field) {
  return field.value === "" && !field.badInput;
}

function validateDateField(field, periodIndex, name) {
  if (field.badInput) {
    throw new PeriodInputError(
      `Rango ${periodIndex + 1}: la fecha ${name} es inválida o incompleta.`,
      {
        periodIndex,
        field: name === "inicial" ? "start" : "end",
      },
    );
  }

  if (field.value !== "") {
    try {
      parseIsoDate(field.value);
    } catch {
      throw new PeriodInputError(`Rango ${periodIndex + 1}: la fecha ${name} no es válida.`, {
        periodIndex,
        field: name === "inicial" ? "start" : "end",
      });
    }
  }
}

export function normalizePeriodDrafts(drafts, { today = todayIso() } = {}) {
  if (!Array.isArray(drafts)) {
    throw new TypeError("Los rangos deben proporcionarse como una lista.");
  }

  parseIsoDate(today);

  const candidates = drafts
    .map((draft, periodIndex) => ({ draft, periodIndex }))
    .filter(({ draft }) => !(isEmptyField(draft.start) && isEmptyField(draft.end)));

  if (candidates.length === 0) return [];

  return candidates.map(({ draft, periodIndex }, candidateIndex) => {
    validateDateField(draft.start, periodIndex, "inicial");
    validateDateField(draft.end, periodIndex, "final");

    if (isEmptyField(draft.start)) {
      throw new PeriodInputError(`Rango ${periodIndex + 1}: falta la fecha inicial.`, {
        periodIndex,
        field: "start",
      });
    }

    let end = draft.end.value;
    let endDefaultedToToday = false;
    if (isEmptyField(draft.end)) {
      const isLastNonEmptyRange = candidateIndex === candidates.length - 1;
      if (!isLastNonEmptyRange) {
        throw new PeriodInputError(`Rango ${periodIndex + 1}: falta la fecha final.`, {
          periodIndex,
          field: "end",
        });
      }
      end = today;
      endDefaultedToToday = true;
    }

    return {
      start: draft.start.value,
      end,
      periodIndex,
      endDefaultedToToday,
      experienceEligible: draft.experienceEligible !== false,
      requirementEligible: draft.requirementEligible !== false,
      seniorityEligible: draft.seniorityEligible !== false,
      level: draft.level ?? null,
      functionalArea: String(draft.functionalArea ?? "").trim(),
      relationalArea: String(draft.relationalArea ?? "").trim(),
      groupedFunctional: Boolean(draft.groupedFunctional),
      ...(draft.reservedAlternative ? { reservedAlternative: true } : {}),
    };
  });
}

const DAY_MS = 86_400_000;

function epochDay(value) {
  const date = parseIsoDate(value);
  return Math.trunc(Date.UTC(date.year, date.month - 1, date.day) / DAY_MS);
}

function isoFromEpochDay(day) {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function normalizeAreaName(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function validateLevel(level, label) {
  if (!Number.isInteger(level) || level < 1 || level > 30) {
    throw new RangeError(`${label} debe ser un entero entre 1 y 30.`);
  }
}

export function experienceBaseRate(periodLevel, targetLevel) {
  validateLevel(periodLevel, "El nivel del periodo");
  validateLevel(targetLevel, "El nivel del puesto solicitado");

  if (periodLevel > targetLevel) return 2.5;

  const difference = targetLevel - periodLevel;
  const rates = [2.35, 2.2, 2.05, 1.9, 1.75, 1.6, 1.45];
  return rates[difference] ?? 1.3;
}

export function classifyAreaRelation(period, target) {
  const periodFunctional = normalizeAreaName(period.functionalArea);
  const periodRelational = normalizeAreaName(period.relationalArea);
  const targetFunctional = normalizeAreaName(target.functionalArea);
  const targetRelational = normalizeAreaName(target.relationalArea);

  if (!targetFunctional) {
    throw new RangeError("El área funcional del puesto solicitado es obligatoria.");
  }

  if (periodFunctional && periodFunctional === targetFunctional) {
    return { code: "same-functional", label: "misma área funcional", multiplier: 1 };
  }

  if (
    (periodFunctional && targetRelational && periodFunctional === targetRelational) ||
    (periodRelational && periodRelational === targetFunctional)
  ) {
    return {
      code: "functional-relational",
      label: "coincidencia funcional-relacional",
      multiplier: 0.8,
    };
  }

  if (periodRelational && targetRelational && periodRelational === targetRelational) {
    return { code: "same-relational", label: "misma área relacional", multiplier: 0.6 };
  }

  if (period.groupedFunctional) {
    return {
      code: "grouped-functional",
      label: "área funcional agrupada",
      multiplier: 0.4,
    };
  }

  return { code: "unrelated", label: "sin relación de área computable", multiplier: 0 };
}

export function isRequirementAreaEligible(period, target) {
  const periodFunctional = normalizeAreaName(period.functionalArea);
  const periodRelational = normalizeAreaName(period.relationalArea);
  const targetFunctional = normalizeAreaName(target.functionalArea);
  const targetRelational = normalizeAreaName(target.relationalArea);

  return Boolean(
    (periodFunctional && periodFunctional === targetFunctional) ||
    (periodRelational && targetRelational && periodRelational === targetRelational) ||
    period.groupedFunctional,
  );
}

export function classifyPeriodForTarget(period, target) {
  validateLevel(target.level, "El nivel del puesto solicitado");

  if (period.experienceEligible === false) {
    return {
      area: {
        code: "excluded",
        label: "no marcado como experiencia profesional",
        multiplier: 0,
      },
      baseRate: 0,
      annualRate: 0,
      requirementEligible: false,
    };
  }

  validateLevel(period.level, `El nivel del rango ${period.periodIndex + 1}`);

  const area = classifyAreaRelation(period, target);
  const baseRate = experienceBaseRate(period.level, target.level);
  const annualRate = Math.round((baseRate * area.multiplier + Number.EPSILON) * 100) / 100;

  return {
    area,
    baseRate,
    annualRate,
    requirementEligible:
      !period.reservedAlternative &&
      period.requirementEligible !== false &&
      isRequirementAreaEligible(period, target),
  };
}

export function experienceWindow(referenceDate, years = 10) {
  const reference = parseIsoDate(referenceDate);
  if (!Number.isInteger(years) || years <= 0) {
    throw new RangeError("El número de años de la ventana debe ser un entero positivo.");
  }

  const anniversary = {
    year: reference.year - years,
    month: reference.month,
    day: Math.min(reference.day, daysInMonth(reference.year - years, reference.month)),
  };

  return {
    start: isoFromEpochDay(
      epochDay(
        `${anniversary.year}-${String(anniversary.month).padStart(2, "0")}-${String(
          anniversary.day,
        ).padStart(2, "0")}`,
      ) + 1,
    ),
    end: referenceDate,
    years,
  };
}

export function clipPeriodsToUpperDate(periods, { referenceDate } = {}) {
  if (!Array.isArray(periods)) {
    throw new TypeError("Los rangos deben proporcionarse como una lista.");
  }

  const referenceDay = epochDay(referenceDate);
  let excludedPeriods = 0;
  let clippedPeriods = 0;
  const clipped = [];

  for (const period of periods) {
    const originalStart = epochDay(period.start);
    const originalEnd = epochDay(period.end);

    if (originalStart > originalEnd) {
      throw new RangeError(
        `Rango ${period.periodIndex + 1}: la fecha inicial es posterior a la final.`,
      );
    }

    if (originalStart > referenceDay) {
      excludedPeriods += 1;
      continue;
    }

    const effectiveEnd = Math.min(originalEnd, referenceDay);
    const endWasClipped = effectiveEnd !== originalEnd;
    if (endWasClipped) clippedPeriods += 1;

    clipped.push({
      ...period,
      originalStart: period.start,
      originalEnd: period.end,
      end: isoFromEpochDay(effectiveEnd),
      endWasClipped,
    });
  }

  return {
    periods: clipped,
    referenceDate,
    excludedPeriods,
    clippedPeriods,
  };
}

export function clipPeriodsToExperienceWindow(periods, { referenceDate, years = 10 } = {}) {
  if (!Array.isArray(periods)) {
    throw new TypeError("Los rangos deben proporcionarse como una lista.");
  }

  const window = experienceWindow(referenceDate, years);
  const windowStart = epochDay(window.start);
  const windowEnd = epochDay(window.end);

  let excludedPeriods = 0;
  let clippedPeriods = 0;
  const clipped = [];

  for (const period of periods) {
    const originalStart = epochDay(period.start);
    const originalEnd = epochDay(period.end);

    if (originalStart > originalEnd) {
      throw new RangeError(
        `Rango ${period.periodIndex + 1}: la fecha inicial es posterior a la final.`,
      );
    }

    const effectiveStart = Math.max(originalStart, windowStart);
    const effectiveEnd = Math.min(originalEnd, windowEnd);

    if (effectiveStart > effectiveEnd) {
      excludedPeriods += 1;
      continue;
    }

    const startWasClipped = effectiveStart !== originalStart;
    const endWasClipped = effectiveEnd !== originalEnd;
    if (startWasClipped || endWasClipped) clippedPeriods += 1;

    clipped.push({
      ...period,
      originalStart: period.start,
      originalEnd: period.end,
      start: isoFromEpochDay(effectiveStart),
      end: isoFromEpochDay(effectiveEnd),
      startWasClipped,
      endWasClipped,
    });
  }

  return {
    periods: clipped,
    window,
    excludedPeriods,
    clippedPeriods,
  };
}

export function totalAdministrativeDuration(periods, { inclusiveEnd = true } = {}) {
  const total = totalCalendarDuration(periods, { inclusiveEnd });

  total.months += Math.floor(total.days / 30);
  total.days %= 30;
  total.years += Math.floor(total.months / 12);
  total.months %= 12;

  return total;
}

export function checkExperienceRequirement(
  periods,
  { referenceDate, requiredYears = 0, inclusiveEnd = true, target = null } = {},
) {
  if (!Number.isInteger(requiredYears) || requiredYears < 0) {
    throw new RangeError("Los años exigidos deben ser un entero mayor o igual que cero.");
  }

  const eligible = periods.filter((period) => {
    if (period.experienceEligible === false) return false;
    return target
      ? classifyPeriodForTarget(period, target).requirementEligible
      : period.requirementEligible !== false;
  });
  const clipped = clipPeriodsToUpperDate(eligible, { referenceDate });
  const duration = totalAdministrativeDuration(clipped.periods, { inclusiveEnd });
  const merged = mergePeriods(clipped.periods, { inclusiveEnd });

  return {
    requiredYears,
    meets: requiredYears === 0 || duration.years >= requiredYears,
    duration,
    totalDays: merged.totalDays,
    eligiblePeriods: clipped.periods.length,
    excludedPeriods: clipped.excludedPeriods,
    clippedPeriods: clipped.clippedPeriods,
    referenceDate,
  };
}

export function totalCalendarDuration(periods, { inclusiveEnd = true } = {}) {
  if (!Array.isArray(periods)) {
    throw new TypeError("Los rangos deben proporcionarse como una lista.");
  }
  if (periods.length === 0) return { years: 0, months: 0, days: 0 };

  const normalized = periods
    .map((period) => ({
      start: epochDay(period.start),
      endExclusive: epochDay(period.end) + (inclusiveEnd ? 1 : 0),
    }))
    .sort((a, b) => a.start - b.start || a.endExclusive - b.endExclusive);

  const merged = [];
  let current = { ...normalized[0] };
  for (const next of normalized.slice(1)) {
    if (next.start <= current.endExclusive) {
      current.endExclusive = Math.max(current.endExclusive, next.endExclusive);
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);

  const total = merged.reduce(
    (result, period) => {
      const duration = differenceCalendar(
        isoFromEpochDay(period.start),
        isoFromEpochDay(period.endExclusive),
        { inclusiveEnd: false },
      );
      result.years += duration.years;
      result.months += duration.months;
      result.days += duration.days;
      return result;
    },
    { years: 0, months: 0, days: 0 },
  );

  total.years += Math.floor(total.months / 12);
  total.months %= 12;
  return total;
}
