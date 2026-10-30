const ARTICLE129_MAX_POINTS = 43;

function roundPoints(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function assertScore(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} debe ser un número mayor o igual que cero.`);
  }
}

export function summarizeArticle129Score({
  experience,
  seniority,
  experienceRequirementMet = true,
  experienceRequirementSelectionComplete = true,
} = {}) {
  if (!experience || !seniority) {
    throw new TypeError("Se requieren los resultados de experiencia y antigüedad.");
  }

  assertScore(seniority.points, "La puntuación de antigüedad");

  if (!experienceRequirementMet) {
    return {
      scoreAvailable: false,
      technicalPoints: null,
      provisionalMinimumPoints: null,
      provisionalMaximumPoints: null,
      maximumPoints: ARTICLE129_MAX_POINTS,
      calculationDefinitive: false,
      legalReviewRequired: false,
      caveats: ["No se cumple el requisito de experiencia introducido."],
    };
  }

  if (!experienceRequirementSelectionComplete) {
    return {
      scoreAvailable: false,
      technicalPoints: null,
      provisionalMinimumPoints: null,
      provisionalMaximumPoints: null,
      maximumPoints: ARTICLE129_MAX_POINTS,
      calculationDefinitive: false,
      legalReviewRequired: false,
      caveats: [
        "La puntuación definitiva queda pendiente de seleccionar exactamente el servicio que se utilizará para cumplir el requisito de experiencia.",
      ],
    };
  }

  if (experience.definitive) {
    assertScore(experience.points, "La puntuación de experiencia");
    const technicalPoints = Math.min(
      ARTICLE129_MAX_POINTS,
      roundPoints(experience.points + seniority.points),
    );

    return {
      scoreAvailable: true,
      technicalPoints,
      provisionalMinimumPoints: technicalPoints,
      provisionalMaximumPoints: technicalPoints,
      maximumPoints: ARTICLE129_MAX_POINTS,
      calculationDefinitive: true,
      legalReviewRequired: false,
      caveats: [],
    };
  }

  assertScore(experience.provisionalMinimumPoints, "El mínimo provisional de experiencia");
  assertScore(experience.provisionalMaximumPoints, "El máximo provisional de experiencia");

  return {
    scoreAvailable: true,
    technicalPoints: null,
    provisionalMinimumPoints: Math.min(
      ARTICLE129_MAX_POINTS,
      roundPoints(experience.provisionalMinimumPoints + seniority.points),
    ),
    provisionalMaximumPoints: Math.min(
      ARTICLE129_MAX_POINTS,
      roundPoints(experience.provisionalMaximumPoints + seniority.points),
    ),
    maximumPoints: ARTICLE129_MAX_POINTS,
    calculationDefinitive: false,
    legalReviewRequired: true,
    caveats: [
      "La puntuación de experiencia profesional no es inequívoca con los datos introducidos.",
    ],
  };
}

export { ARTICLE129_MAX_POINTS };
