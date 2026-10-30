import { parseIsoDate } from "./time.js";
import {
  checkExperienceRequirement,
  classifyPeriodForTarget,
  clipPeriodsToExperienceWindow,
  totalAdministrativeDuration,
} from "./periods.js";

const DAY_MS = 86_400_000;
const SELECTION_MODES = new Set(["none", "full", "partial"]);

function epochDay(value) {
  const date = parseIsoDate(value);
  return Math.trunc(Date.UTC(date.year, date.month - 1, date.day) / DAY_MS);
}

function isoFromEpochDay(day) {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

function coveredEndDay(period, inclusiveEnd) {
  return epochDay(period.end) - (inclusiveEnd ? 0 : 1);
}

function periodFromCoveredDays(startDay, endDay, inclusiveEnd, extra = {}) {
  return {
    ...extra,
    start: isoFromEpochDay(startDay),
    end: isoFromEpochDay(endDay + (inclusiveEnd ? 0 : 1)),
  };
}

function administrativeUnits(periods, inclusiveEnd) {
  const duration = totalAdministrativeDuration(periods, { inclusiveEnd });
  return duration.years * 360 + duration.months * 30 + duration.days;
}

function durationFromAdministrativeUnits(units) {
  const years = Math.floor(units / 360);
  const months = Math.floor((units % 360) / 30);
  const days = units % 30;
  return { years, months, days };
}

function rangesFromSelectedDays(selectedDays, inclusiveEnd) {
  const ordered = [...selectedDays].sort((a, b) => a - b);
  if (ordered.length === 0) return [];

  const ranges = [];
  let startDay = ordered[0];
  let endDay = ordered[0];

  for (const day of ordered.slice(1)) {
    if (day === endDay + 1) {
      endDay = day;
    } else {
      ranges.push(periodFromCoveredDays(startDay, endDay, inclusiveEnd));
      startDay = day;
      endDay = day;
    }
  }
  ranges.push(periodFromCoveredDays(startDay, endDay, inclusiveEnd));
  return ranges;
}

function normalizeSelection(selection) {
  if (!selection || !Number.isInteger(selection.periodIndex) || selection.periodIndex < 0) {
    throw new RangeError("Cada selección del requisito debe identificar un rango válido.");
  }

  const mode = selection.mode ?? "none";
  if (!SELECTION_MODES.has(mode)) {
    throw new RangeError(
      `El modo de selección del rango ${selection.periodIndex + 1} no es válido.`,
    );
  }

  if (mode !== "partial") {
    return { periodIndex: selection.periodIndex, mode };
  }

  const start = String(selection.start ?? "").trim();
  const end = String(selection.end ?? "").trim();
  if (!start || !end) {
    throw new RangeError(
      `Rango ${selection.periodIndex + 1}: indique las fechas inicial y final de la parte usada para el requisito.`,
    );
  }

  parseIsoDate(start);
  parseIsoDate(end);
  if (start > end) {
    throw new RangeError(
      `Rango ${selection.periodIndex + 1}: la parte usada para el requisito termina antes de empezar.`,
    );
  }

  return { periodIndex: selection.periodIndex, mode, start, end };
}

function selectionRange(period, selection, { requirementReference, target }) {
  const classification = classifyPeriodForTarget(period, target);
  if (!classification.requirementEligible) {
    throw new RangeError(
      `Rango ${period.periodIndex + 1}: no puede utilizarse para acreditar el requisito con los datos introducidos.`,
    );
  }

  if (period.start > requirementReference) {
    throw new RangeError(
      `Rango ${period.periodIndex + 1}: comienza después de la fecha de referencia del requisito.`,
    );
  }

  const usableEnd = period.end < requirementReference ? period.end : requirementReference;

  if (selection.mode === "full") {
    return {
      periodIndex: period.periodIndex,
      start: period.start,
      end: usableEnd,
      classification,
    };
  }

  if (selection.start < period.start || selection.end > period.end) {
    throw new RangeError(
      `Rango ${period.periodIndex + 1}: la selección parcial debe quedar dentro de las fechas del periodo.`,
    );
  }
  if (selection.end > requirementReference) {
    throw new RangeError(
      `Rango ${period.periodIndex + 1}: la selección parcial no puede superar la fecha de referencia del requisito.`,
    );
  }

  return {
    periodIndex: period.periodIndex,
    start: selection.start,
    end: selection.end,
    classification,
  };
}

function buildSelectedDays(
  periods,
  selections,
  { requirementReference, meritWindow, inclusiveEnd, target },
) {
  const periodsByIndex = new Map(periods.map((period) => [period.periodIndex, period]));
  const selectedDays = new Set();
  const selectedMeta = new Map();
  const seenIndexes = new Set();
  const meritStart = epochDay(meritWindow.start);
  const meritEnd = epochDay(meritWindow.end);

  for (const rawSelection of selections) {
    const selection = normalizeSelection(rawSelection);
    if (selection.mode === "none") continue;

    if (seenIndexes.has(selection.periodIndex)) {
      throw new RangeError(
        `Rango ${selection.periodIndex + 1}: existe más de una selección para el requisito.`,
      );
    }
    seenIndexes.add(selection.periodIndex);

    const period = periodsByIndex.get(selection.periodIndex);
    if (!period) {
      throw new RangeError(
        `La selección del requisito hace referencia al rango ${selection.periodIndex + 1}, que no existe.`,
      );
    }

    const range = selectionRange(period, selection, { requirementReference, target });
    const startDay = epochDay(range.start);
    const endDay = coveredEndDay(range, inclusiveEnd);
    if (endDay < startDay) {
      throw new RangeError(
        `Rango ${selection.periodIndex + 1}: la selección para el requisito no contiene días computables.`,
      );
    }

    for (let day = startDay; day <= endDay; day += 1) {
      const existing = selectedMeta.get(day);
      if (existing && existing.periodIndex !== selection.periodIndex) {
        throw new RangeError(
          `La selección del requisito solapa los rangos ${existing.periodIndex + 1} y ${selection.periodIndex + 1}; cada día debe elegirse una sola vez.`,
        );
      }

      const insideMeritWindow = day >= meritStart && day <= meritEnd;
      selectedDays.add(day);
      selectedMeta.set(day, {
        periodIndex: selection.periodIndex,
        annualRate: range.classification.annualRate,
        area: range.classification.area,
        level: period.level,
        insideMeritWindow,
      });
    }
  }

  return { selectedDays, selectedMeta };
}

function groupConsumedSegments(selectedMeta, inclusiveEnd) {
  const ordered = [...selectedMeta.entries()]
    .map(([day, meta]) => ({ ...meta, day }))
    .sort((a, b) => a.day - b.day);
  const groups = [];
  let current = null;

  for (const item of ordered) {
    const sameGroup =
      current &&
      item.day === current.endDay + 1 &&
      item.periodIndex === current.periodIndex &&
      item.annualRate === current.annualRate &&
      item.insideMeritWindow === current.insideMeritWindow;

    if (!sameGroup) {
      if (current) groups.push(current);
      current = { ...item, startDay: item.day, endDay: item.day };
    } else {
      current.endDay = item.day;
    }
  }
  if (current) groups.push(current);

  return groups.map((group) => ({
    periodIndex: group.periodIndex,
    start: isoFromEpochDay(group.startDay),
    end: isoFromEpochDay(group.endDay + (inclusiveEnd ? 0 : 1)),
    insideMeritWindow: group.insideMeritWindow,
    annualRate: group.annualRate,
    level: group.level,
    area: group.area,
  }));
}

function subtractSelectedDays(periods, selectedDays, inclusiveEnd) {
  const remaining = [];

  for (const period of periods) {
    const startDay = epochDay(period.start);
    const endDay = coveredEndDay(period, inclusiveEnd);
    if (endDay < startDay) continue;

    let segmentStart = null;
    for (let day = startDay; day <= endDay; day += 1) {
      if (!selectedDays.has(day)) {
        if (segmentStart === null) segmentStart = day;
        continue;
      }

      if (segmentStart !== null) {
        remaining.push(
          periodFromCoveredDays(segmentStart, day - 1, inclusiveEnd, {
            ...period,
            requirementDiscountApplied: true,
          }),
        );
        segmentStart = null;
      }
    }

    if (segmentStart !== null) {
      remaining.push(
        periodFromCoveredDays(segmentStart, endDay, inclusiveEnd, {
          ...period,
          requirementDiscountApplied: true,
        }),
      );
    }
  }

  return remaining;
}

function baseResult(requirement, merit, overrides = {}) {
  return {
    requirement,
    complete: false,
    selectionStatus: "under",
    serviceRequiredDuration: {
      years: requirement.serviceRequiredYears,
      months: 0,
      days: 0,
    },
    selectedDuration: { years: 0, months: 0, days: 0 },
    selectionDifferenceDuration: {
      years: requirement.serviceRequiredYears,
      months: 0,
      days: 0,
    },
    consumedDuration: { years: 0, months: 0, days: 0 },
    consumedDays: 0,
    consumedMeritDays: 0,
    consumedOutsideMeritDays: 0,
    consumedSegments: [],
    remainingMeritPeriods: merit.periods,
    meritWindow: merit.window,
    ...overrides,
  };
}

export function discountExperienceRequirement(
  periods,
  {
    requirementReference,
    meritReference,
    requiredYears = 0,
    specializedTrainingYears = 0,
    requirementSelections = [],
    target,
    inclusiveEnd = true,
  } = {},
) {
  if (!Array.isArray(periods)) {
    throw new TypeError("Los rangos deben proporcionarse como una lista.");
  }
  if (!Array.isArray(requirementSelections)) {
    throw new TypeError("La selección del requisito debe proporcionarse como una lista.");
  }
  if (!Number.isInteger(requiredYears) || requiredYears < 0) {
    throw new RangeError("Los años exigidos deben ser un entero mayor o igual que cero.");
  }
  if (!Number.isInteger(specializedTrainingYears) || specializedTrainingYears < 0) {
    throw new RangeError(
      "Los años equivalentes de Formación Especializada deben ser un entero mayor o igual que cero.",
    );
  }

  const trainingYearsApplied = Math.min(requiredYears, specializedTrainingYears);
  const serviceRequiredYears = Math.max(0, requiredYears - trainingYearsApplied);
  const experiencePeriods = periods.filter((period) => period.experienceEligible !== false);
  const serviceRequirement = checkExperienceRequirement(experiencePeriods, {
    referenceDate: requirementReference,
    requiredYears: serviceRequiredYears,
    inclusiveEnd,
    target,
  });
  const requirement = {
    ...serviceRequirement,
    requiredYears,
    serviceRequiredYears,
    specializedTrainingYears,
    trainingYearsApplied,
    meets: serviceRequiredYears === 0 || serviceRequirement.meets,
  };
  const merit = clipPeriodsToExperienceWindow(experiencePeriods, { referenceDate: meritReference });

  if (requiredYears === 0 || serviceRequiredYears === 0) {
    return baseResult(requirement, merit, {
      complete: true,
      selectionStatus: "not-required",
      selectionDifferenceDuration: { years: 0, months: 0, days: 0 },
    });
  }

  const activeSelections = requirementSelections.filter(
    (selection) => (selection?.mode ?? "none") !== "none",
  );
  const { selectedDays, selectedMeta } = buildSelectedDays(experiencePeriods, activeSelections, {
    requirementReference,
    meritWindow: merit.window,
    inclusiveEnd,
    target,
  });

  if (!requirement.meets) {
    return baseResult(requirement, merit, {
      selectionStatus: "unavailable",
    });
  }
  const selectedRanges = rangesFromSelectedDays(selectedDays, inclusiveEnd);
  const selectedDuration = totalAdministrativeDuration(selectedRanges, { inclusiveEnd });
  const selectedUnits = administrativeUnits(selectedRanges, inclusiveEnd);
  const targetUnits = serviceRequiredYears * 360;
  const differenceUnits = Math.abs(targetUnits - selectedUnits);
  const selectionDifferenceDuration = durationFromAdministrativeUnits(differenceUnits);
  const selectionStatus =
    selectedUnits === targetUnits ? "complete" : selectedUnits < targetUnits ? "under" : "over";
  const complete = selectionStatus === "complete";
  const consumedSegments = groupConsumedSegments(selectedMeta, inclusiveEnd);
  const consumedMeritDays = [...selectedMeta.values()].filter(
    (item) => item.insideMeritWindow,
  ).length;

  return baseResult(requirement, merit, {
    complete,
    selectionStatus,
    selectedDuration,
    selectionDifferenceDuration,
    consumedDuration: selectedDuration,
    consumedDays: selectedDays.size,
    consumedMeritDays,
    consumedOutsideMeritDays: selectedDays.size - consumedMeritDays,
    consumedSegments,
    remainingMeritPeriods: complete
      ? subtractSelectedDays(merit.periods, selectedDays, inclusiveEnd)
      : merit.periods,
  });
}
