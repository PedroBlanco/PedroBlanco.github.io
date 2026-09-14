import { classifyPeriodForTarget } from "./periods.js";
import { differenceCalendar, isStrictlyMoreThanSixMonths, parseIsoDate } from "./time.js";

const DAY_MS = 86_400_000;
const EXPERIENCE_MAX_POINTS = 25;

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

function normalizeAreaName(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function roundPoints(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function candidateGroupingKey(candidate) {
  return `${candidate.level}\u0000${candidate.functionalAreaKey}`;
}

function candidateSelectionKey(candidate) {
  return [
    candidate.level,
    candidate.functionalAreaKey,
    candidate.annualRate,
    candidate.area.code,
  ].join("\u0000");
}

function compareCandidates(a, b) {
  return b.annualRate - a.annualRate || a.periodIndex - b.periodIndex;
}

function buildBestDayChoices(periods, target, inclusiveEnd) {
  const choices = new Map();
  const ambiguousOverlapDays = new Set();
  const unclassifiedOverlapDays = new Set();
  let overlappingDays = 0;

  for (const period of periods) {
    if (period.experienceEligible === false) continue;
    const classification = classifyPeriodForTarget(period, target);
    if (classification.annualRate <= 0) continue;

    const startDay = epochDay(period.start);
    const endDay = coveredEndDay(period, inclusiveEnd);
    if (endDay < startDay) continue;

    const candidateBase = {
      periodIndex: period.periodIndex,
      level: period.level,
      functionalArea: String(period.functionalArea ?? "").trim(),
      functionalAreaKey: normalizeAreaName(period.functionalArea),
      annualRate: classification.annualRate,
      baseRate: classification.baseRate,
      area: classification.area,
      reservedAlternative: Boolean(period.reservedAlternative),
    };

    for (let day = startDay; day <= endDay; day += 1) {
      const candidate = { ...candidateBase, day };
      const current = choices.get(day);

      if (!current) {
        choices.set(day, candidate);
        continue;
      }

      overlappingDays += 1;
      const reservedPostAlternative =
        current.reservedAlternative !== candidate.reservedAlternative &&
        (current.reservedAlternative || candidate.reservedAlternative);

      if (
        current.annualRate === candidate.annualRate &&
        candidateGroupingKey(current) !== candidateGroupingKey(candidate)
      ) {
        ambiguousOverlapDays.add(day);
      }

      if (
        !reservedPostAlternative &&
        candidateSelectionKey(current) !== candidateSelectionKey(candidate)
      ) {
        unclassifiedOverlapDays.add(day);
      }

      if (compareCandidates(candidate, current) < 0) {
        choices.set(day, candidate);
      }
    }
  }

  return { choices, overlappingDays, ambiguousOverlapDays, unclassifiedOverlapDays };
}

function choicesToSegments(choices, inclusiveEnd) {
  const ordered = [...choices.values()].sort((a, b) => a.day - b.day);
  const segments = [];
  let current = null;

  for (const item of ordered) {
    const sameSegment =
      current &&
      item.day === current.endDay + 1 &&
      candidateSelectionKey(item) === candidateSelectionKey(current);

    if (!sameSegment) {
      if (current) segments.push(current);
      current = {
        ...item,
        startDay: item.day,
        endDay: item.day,
        sourcePeriodIndexes: new Set([item.periodIndex]),
      };
      continue;
    }

    current.endDay = item.day;
    current.sourcePeriodIndexes.add(item.periodIndex);
  }
  if (current) segments.push(current);

  return segments.map((segment) => ({
    start: isoFromEpochDay(segment.startDay),
    end: isoFromEpochDay(segment.endDay + (inclusiveEnd ? 0 : 1)),
    level: segment.level,
    functionalArea: segment.functionalArea,
    functionalAreaKey: segment.functionalAreaKey,
    annualRate: segment.annualRate,
    baseRate: segment.baseRate,
    area: segment.area,
    sourcePeriodIndexes: [...segment.sourcePeriodIndexes].sort((a, b) => a - b),
  }));
}

function aggregateDurations(segments, inclusiveEnd) {
  const total = segments.reduce(
    (result, segment) => {
      const duration = differenceCalendar(segment.start, segment.end, { inclusiveEnd });
      result.years += duration.years;
      result.months += duration.months;
      result.days += duration.days;
      return result;
    },
    { years: 0, months: 0, days: 0 },
  );

  total.months += Math.floor(total.days / 30);
  total.days %= 30;
  total.years += Math.floor(total.months / 12);
  total.months %= 12;
  return total;
}

function valuedYearsFromDuration(duration) {
  const residual = { years: 0, months: duration.months, days: duration.days };
  return duration.years + (isStrictlyMoreThanSixMonths(residual) ? 1 : 0);
}

function buildBuckets(segments, inclusiveEnd) {
  const buckets = new Map();

  for (const segment of segments) {
    const key = segment.functionalAreaKey
      ? `${segment.level}\u0000${segment.functionalAreaKey}\u0000${segment.annualRate}`
      : `${segment.level}\u0000__missing__\u0000${segment.sourcePeriodIndexes.join(",")}`;
    const bucket = buckets.get(key) ?? {
      key,
      level: segment.level,
      functionalArea: segment.functionalArea,
      functionalAreaKey: segment.functionalAreaKey,
      segments: [],
      rates: new Set(),
      baseRates: new Set(),
      areaLabels: new Set(),
    };

    bucket.segments.push(segment);
    bucket.rates.add(segment.annualRate);
    bucket.baseRates.add(segment.baseRate);
    bucket.areaLabels.add(segment.area.label);
    buckets.set(key, bucket);
  }

  return [...buckets.values()].map((bucket) => {
    const duration = aggregateDurations(bucket.segments, inclusiveEnd);
    const valuedYears = valuedYearsFromDuration(duration);
    const rates = [...bucket.rates].sort((a, b) => a - b);
    const baseRates = [...bucket.baseRates].sort((a, b) => a - b);
    const stableRate = rates.length === 1 && Boolean(bucket.functionalAreaKey);
    const points = stableRate ? roundPoints(valuedYears * rates[0]) : null;
    const minPoints = roundPoints(valuedYears * (rates[0] ?? 0));
    const maxRate = rates.at(-1) ?? baseRates.at(-1) ?? 0;
    const maxPoints = roundPoints(valuedYears * maxRate);

    return {
      key: bucket.key,
      level: bucket.level,
      functionalArea: bucket.functionalArea,
      functionalAreaKnown: Boolean(bucket.functionalAreaKey),
      duration,
      valuedYears,
      annualRate: stableRate ? rates[0] : null,
      annualRates: rates,
      areaLabels: [...bucket.areaLabels].sort(),
      points,
      minPoints,
      maxPoints,
      segments: bucket.segments,
    };
  });
}

export function scoreProfessionalExperience(
  periods,
  { target, inclusiveEnd = true, maximumPoints = EXPERIENCE_MAX_POINTS } = {},
) {
  if (!Array.isArray(periods)) {
    throw new TypeError("Los rangos deben proporcionarse como una lista.");
  }
  if (typeof maximumPoints !== "number" || !Number.isFinite(maximumPoints) || maximumPoints <= 0) {
    throw new RangeError("La puntuación máxima debe ser un número positivo.");
  }

  const { choices, overlappingDays, ambiguousOverlapDays, unclassifiedOverlapDays } =
    buildBestDayChoices(periods, target, inclusiveEnd);
  const segments = choicesToSegments(choices, inclusiveEnd);
  const groups = buildBuckets(segments, inclusiveEnd);
  const issues = [];

  for (const group of groups) {
    if (!group.functionalAreaKnown) {
      issues.push({
        code: "missing-functional-area",
        level: group.level,
        message:
          "Falta el área funcional en experiencia potencialmente baremable; no puede determinarse una agrupación definitiva de fracciones.",
      });
    }
  }

  if (unclassifiedOverlapDays.size > 0) {
    issues.push({
      code: "unclassified-overlap",
      days: unclassifiedOverlapDays.size,
      message:
        "Hay solapamientos entre puestos con distinta valoración que no se han identificado como la alternativa entre puesto provisional y puesto definitivo reservado; la puntuación no se considera definitiva.",
    });
  }

  if (ambiguousOverlapDays.size > 0) {
    issues.push({
      code: "ambiguous-overlap-grouping",
      days: ambiguousOverlapDays.size,
      message:
        "Hay días solapados con igual tasa pero distinta agrupación de nivel/área funcional; la elección puede alterar el redondeo de fracciones.",
    });
  }

  const stablePoints = groups.reduce((sum, group) => sum + (group.points ?? group.minPoints), 0);
  const upperPoints = groups.reduce((sum, group) => sum + group.maxPoints, 0);
  const definitive = issues.length === 0;
  const uncappedPoints = definitive ? roundPoints(stablePoints) : null;
  const points = definitive ? Math.min(maximumPoints, uncappedPoints) : null;

  return {
    definitive,
    points,
    uncappedPoints,
    maximumPoints,
    provisionalMinimumPoints:
      unclassifiedOverlapDays.size > 0 ? 0 : Math.min(maximumPoints, roundPoints(stablePoints)),
    provisionalMaximumPoints: Math.min(maximumPoints, roundPoints(upperPoints)),
    groups,
    segments,
    overlappingDays,
    issues,
  };
}

export { EXPERIENCE_MAX_POINTS };
