import { clipPeriodsToUpperDate, totalAdministrativeDuration } from "./periods.js";
import { isStrictlyMoreThanSixMonths, mergePeriods } from "./time.js";

const SENIORITY_MAX_POINTS = 18;
const SENIORITY_POINTS_PER_YEAR = 0.6;

function roundPoints(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function valuedYearsFromDuration(duration) {
  const residual = { years: 0, months: duration.months, days: duration.days };
  return duration.years + (isStrictlyMoreThanSixMonths(residual) ? 1 : 0);
}

export function scoreSeniority(
  periods,
  {
    referenceDate,
    inclusiveEnd = true,
    maximumPoints = SENIORITY_MAX_POINTS,
    pointsPerYear = SENIORITY_POINTS_PER_YEAR,
  } = {},
) {
  if (!Array.isArray(periods)) {
    throw new TypeError("Los rangos deben proporcionarse como una lista.");
  }
  if (typeof maximumPoints !== "number" || !Number.isFinite(maximumPoints) || maximumPoints <= 0) {
    throw new RangeError("La puntuación máxima de antigüedad debe ser un número positivo.");
  }
  if (typeof pointsPerYear !== "number" || !Number.isFinite(pointsPerYear) || pointsPerYear <= 0) {
    throw new RangeError("La puntuación anual de antigüedad debe ser un número positivo.");
  }

  const eligible = periods.filter((period) => period.seniorityEligible !== false);
  const clipped = clipPeriodsToUpperDate(eligible, { referenceDate });
  const duration = totalAdministrativeDuration(clipped.periods, { inclusiveEnd });
  const merged = mergePeriods(clipped.periods, { inclusiveEnd });
  const valuedYears = valuedYearsFromDuration(duration);
  const uncappedPoints = roundPoints(valuedYears * pointsPerYear);
  const points = Math.min(maximumPoints, uncappedPoints);

  return {
    points,
    uncappedPoints,
    maximumPoints,
    pointsPerYear,
    valuedYears,
    duration,
    totalDays: merged.totalDays,
    mergedPeriods: merged.mergedPeriods,
    overlapsDetected: merged.overlapsDetected,
    eligiblePeriods: clipped.periods.length,
    excludedPeriods: clipped.excludedPeriods,
    clippedPeriods: clipped.clippedPeriods,
    referenceDate,
  };
}

export { SENIORITY_MAX_POINTS, SENIORITY_POINTS_PER_YEAR };
