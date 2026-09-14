import {
  classifyPeriodForTarget,
  clipPeriodsToExperienceWindow,
  experienceWindow,
  normalizePeriodDrafts,
  PeriodInputError,
  referenceDates,
  todayIso,
  totalCalendarDuration,
} from "./src/periods.js";
import { discountExperienceRequirement } from "./src/requirement.js";
import { scoreProfessionalExperience } from "./src/scoring.js";
import { scoreSeniority } from "./src/seniority.js";
import { summarizeArticle129Score } from "./src/article129.js";
import { differenceCalendar, isStrictlyMoreThanSixMonths, mergePeriods } from "./src/time.js";

const periodsElement = document.querySelector("#periods");
const form = document.querySelector("#calculator");
const callDateInput = document.querySelector("#call-date");
const callEndInput = document.querySelector("#call-end-date");
const meritCutoffElement = document.querySelector("#merit-cutoff");
const requiredYearsInput = document.querySelector("#required-years");
const specializedTrainingYearsInput = document.querySelector("#specialized-training-years");
const targetLevelInput = document.querySelector("#target-level");
const targetFunctionalAreaInput = document.querySelector("#target-functional-area");
const targetRelationalAreaInput = document.querySelector("#target-relational-area");
const requirementSummary = document.querySelector("#requirement-summary");
const requirementConsumption = document.querySelector("#requirement-consumption");
const experienceScore = document.querySelector("#experience-score");
const seniorityScore = document.querySelector("#seniority-score");
const totalScore = document.querySelector("#total-score");
const results = document.querySelector("#results");
const summary = document.querySelector("#summary");
const status = document.querySelector("#status");
const template = document.querySelector("#period-template");

function updatePeriodLabels() {
  [...periodsElement.querySelectorAll(".period")].forEach((row, index) => {
    const number = index + 1;
    row.querySelector("legend").textContent = `Rango ${number}`;
    row
      .querySelector(".add-period")
      .setAttribute("aria-label", `Añadir rango después del rango ${number}`);
    row.querySelector(".remove-period").setAttribute("aria-label", `Suprimir rango ${number}`);
  });
}

function invalidateRequirementSelection(row) {
  row.dataset.requirementScored = "false";
  row.querySelector("[name=requirement-use]").value = "none";
  row.querySelector(".period-score").textContent =
    "Datos modificados: recalcule para actualizar el valor potencial.";
  syncRequirementSelectionControls(row);
}

function invalidateAllRequirementSelections() {
  for (const row of periodsElement.querySelectorAll(".period")) {
    invalidateRequirementSelection(row);
  }
}

function syncRequirementSelectionControls(row, { clearUnavailable = false } = {}) {
  const experienceEligibleInput = row.querySelector("[name=experience-eligible]");
  const requirementEligibleInput = row.querySelector("[name=requirement-eligible]");
  const reservedAlternativeInput = row.querySelector("[name=reserved-alternative]");
  const useInput = row.querySelector("[name=requirement-use]");
  const partialBlock = row.querySelector(".requirement-partial");
  const partialStart = row.querySelector("[name=requirement-start]");
  const partialEnd = row.querySelector("[name=requirement-end]");
  const canSelect =
    row.dataset.requirementScored === "true" &&
    experienceEligibleInput.checked &&
    requirementEligibleInput.checked &&
    !reservedAlternativeInput.checked;

  if (!canSelect && clearUnavailable) useInput.value = "none";
  useInput.disabled = !canSelect;

  const partial = canSelect && useInput.value === "partial";
  partialBlock.hidden = !partial;
  partialStart.disabled = !partial;
  partialEnd.disabled = !partial;
}

function renderPeriodPotentialScores(periods, rows, target, meritReference) {
  for (const row of rows) {
    row.querySelector(".period-score").textContent =
      "Calcule para ver el valor potencial de este rango.";
  }

  for (const period of periods) {
    const row = rows[period.periodIndex];
    if (!row) continue;

    const classification = classifyPeriodForTarget(period, target);
    const clipped = clipPeriodsToExperienceWindow([period], { referenceDate: meritReference });
    let meritText = "Fuera de la ventana de méritos: pérdida potencial 0 puntos.";

    if (clipped.periods.length > 0) {
      const isolated = scoreProfessionalExperience(clipped.periods, { target });
      meritText = isolated.definitive
        ? `Aportación individual orientativa en la ventana: ${isolated.points.toFixed(2)} puntos.`
        : "Aportación individual no definitiva con los datos introducidos.";
    }

    const requirementText = classification.requirementEligible
      ? "Apto para el requisito."
      : "No apto para el requisito con los datos introducidos.";
    row.querySelector(".period-score").textContent =
      `Valor potencial: ${classification.annualRate.toFixed(2)} puntos/año; ` +
      `${classification.area.label}. ${meritText} ${requirementText}`;
    row.dataset.requirementScored = "true";
    if (!classification.requirementEligible) {
      row.querySelector("[name=requirement-use]").value = "none";
    }
    syncRequirementSelectionControls(row, { clearUnavailable: true });
  }
}

function addPeriod(values = {}, { after = null, focus = false } = {}) {
  const fragment = template.content.cloneNode(true);
  const row = fragment.querySelector(".period");
  const startInput = row.querySelector("[name=start]");
  const endInput = row.querySelector("[name=end]");
  row.dataset.requirementScored = "false";

  startInput.value = values.start ?? "";
  endInput.value = values.end ?? "";
  row.querySelector("[name=level]").value = values.level ?? "";
  row.querySelector("[name=functional-area]").value = values.functionalArea ?? "";
  row.querySelector("[name=relational-area]").value = values.relationalArea ?? "";
  const experienceEligibleInput = row.querySelector("[name=experience-eligible]");
  const requirementEligibleInput = row.querySelector("[name=requirement-eligible]");
  const reservedAlternativeInput = row.querySelector("[name=reserved-alternative]");
  const requirementUseInput = row.querySelector("[name=requirement-use]");
  const requirementStartInput = row.querySelector("[name=requirement-start]");
  const requirementEndInput = row.querySelector("[name=requirement-end]");

  experienceEligibleInput.checked = values.experienceEligible !== false;
  requirementEligibleInput.checked = values.requirementEligible !== false;
  row.querySelector("[name=grouped-functional]").checked = Boolean(values.groupedFunctional);
  reservedAlternativeInput.checked = Boolean(values.reservedAlternative);
  requirementEligibleInput.checked =
    values.requirementEligible !== false && !reservedAlternativeInput.checked;
  requirementEligibleInput.disabled = reservedAlternativeInput.checked;
  requirementUseInput.value = values.requirementUse ?? "none";
  requirementStartInput.value = values.requirementStart ?? "";
  requirementEndInput.value = values.requirementEnd ?? "";

  reservedAlternativeInput.addEventListener("change", () => {
    if (reservedAlternativeInput.checked) requirementEligibleInput.checked = false;
    requirementEligibleInput.disabled = reservedAlternativeInput.checked;
    invalidateRequirementSelection(row);
  });
  experienceEligibleInput.addEventListener("change", () => {
    invalidateRequirementSelection(row);
  });
  requirementEligibleInput.addEventListener("change", () => {
    invalidateRequirementSelection(row);
  });
  for (const input of [
    startInput,
    endInput,
    row.querySelector("[name=level]"),
    row.querySelector("[name=functional-area]"),
    row.querySelector("[name=relational-area]"),
    row.querySelector("[name=grouped-functional]"),
  ]) {
    input.addEventListener("change", () => invalidateRequirementSelection(row));
  }

  requirementUseInput.addEventListener("change", () => {
    if (requirementUseInput.value === "partial") {
      if (!requirementStartInput.value) requirementStartInput.value = startInput.value;
      if (!requirementEndInput.value) requirementEndInput.value = endInput.value;
    }
    syncRequirementSelectionControls(row);
  });
  syncRequirementSelectionControls(row);
  row.querySelector("[name=seniority-eligible]").checked = values.seniorityEligible !== false;

  row.querySelector(".add-period").addEventListener("click", () => {
    addPeriod({}, { after: row, focus: true });
  });

  row.querySelector(".remove-period").addEventListener("click", () => {
    const nextRow = row.nextElementSibling;
    const previousRow = row.previousElementSibling;
    row.remove();

    if (!periodsElement.querySelector(".period")) {
      addPeriod({}, { focus: true });
      return;
    }

    updatePeriodLabels();
    const focusTarget =
      nextRow?.querySelector("[name=start]") ?? previousRow?.querySelector(".add-period");
    focusTarget?.focus();
  });

  if (after) {
    periodsElement.insertBefore(fragment, after.nextElementSibling);
  } else {
    periodsElement.append(fragment);
  }

  updatePeriodLabels();
  if (focus) startInput.focus();
}

function plural(value, singular, pluralForm) {
  return `${value} ${value === 1 ? singular : pluralForm}`;
}

function formatDuration(duration) {
  return [
    plural(duration.years, "año", "años"),
    plural(duration.months, "mes", "meses"),
    plural(duration.days, "día", "días"),
  ].join(", ");
}

function inputDraft(input) {
  return {
    value: input.value,
    badInput: input.validity.badInput,
  };
}

function readRequiredYears() {
  const value = Number(requiredYearsInput.value);
  if (!Number.isInteger(value) || value < 0) {
    requiredYearsInput.setAttribute("aria-invalid", "true");
    requiredYearsInput.focus();
    throw new Error("Los años de experiencia exigidos deben ser un entero mayor o igual que cero.");
  }
  return value;
}

function readRequirementSelections(rows) {
  return rows
    .map((row, periodIndex) => {
      const mode = row.querySelector("[name=requirement-use]").value;
      if (mode === "none") return { periodIndex, mode };

      const startInput = row.querySelector("[name=requirement-start]");
      const endInput = row.querySelector("[name=requirement-end]");
      if (mode === "partial") {
        if (startInput.validity.badInput || !startInput.value) {
          startInput.setAttribute("aria-invalid", "true");
          startInput.focus();
          throw new Error(
            `Rango ${periodIndex + 1}: indique una fecha inicial válida para la parte usada en el requisito.`,
          );
        }
        if (endInput.validity.badInput || !endInput.value) {
          endInput.setAttribute("aria-invalid", "true");
          endInput.focus();
          throw new Error(
            `Rango ${periodIndex + 1}: indique una fecha final válida para la parte usada en el requisito.`,
          );
        }
      }

      return {
        periodIndex,
        mode,
        ...(mode === "partial" ? { start: startInput.value, end: endInput.value } : {}),
      };
    })
    .filter((selection) => selection.mode !== "none");
}

function readSpecializedTrainingYears() {
  const value = Number(specializedTrainingYearsInput.value);
  if (!Number.isInteger(value) || value < 0) {
    specializedTrainingYearsInput.setAttribute("aria-invalid", "true");
    specializedTrainingYearsInput.focus();
    throw new Error(
      "Los años equivalentes de Formación Especializada deben ser un entero mayor o igual que cero.",
    );
  }
  return value;
}

function readTargetPost() {
  const level = Number(targetLevelInput.value);
  if (!Number.isInteger(level) || level < 1 || level > 30) {
    targetLevelInput.setAttribute("aria-invalid", "true");
    targetLevelInput.focus();
    throw new Error("Introduzca un nivel del puesto solicitado entre 1 y 30.");
  }

  const functionalArea = targetFunctionalAreaInput.value.trim();
  if (!functionalArea) {
    targetFunctionalAreaInput.setAttribute("aria-invalid", "true");
    targetFunctionalAreaInput.focus();
    throw new Error("Introduzca el área funcional del puesto solicitado.");
  }

  return {
    level,
    functionalArea,
    relationalArea: targetRelationalAreaInput.value.trim(),
  };
}

function clearInvalidState() {
  document.querySelectorAll('input[aria-invalid="true"]').forEach((input) => {
    input.removeAttribute("aria-invalid");
  });
}

function focusInputError(error) {
  if (!(error instanceof PeriodInputError)) return;
  const row = periodsElement.querySelectorAll(".period")[error.periodIndex];
  const input = row?.querySelector(`[name=${error.field}]`);
  if (!input) return;
  input.setAttribute("aria-invalid", "true");
  input.focus();
}

function readReferenceDates() {
  if (callDateInput.validity.badInput || !callDateInput.value) {
    callDateInput.setAttribute("aria-invalid", "true");
    callDateInput.focus();
    throw new Error("Introduzca una fecha de convocatoria/publicación válida.");
  }
  if (callEndInput.validity.badInput || !callEndInput.value) {
    callEndInput.setAttribute("aria-invalid", "true");
    callEndInput.focus();
    throw new Error("Introduzca una fecha fin del plazo de solicitudes válida.");
  }

  try {
    const dates = referenceDates(callEndInput.value, callDateInput.value);
    experienceWindow(dates.merits);
    meritCutoffElement.textContent = dates.merits;
    return dates;
  } catch {
    callDateInput.setAttribute("aria-invalid", "true");
    callEndInput.setAttribute("aria-invalid", "true");
    callDateInput.focus();
    throw new Error(
      "Las fechas de convocatoria y fin de solicitudes no son válidas o están en orden incorrecto.",
    );
  }
}

function render() {
  clearInvalidState();
  const inclusiveEnd = true;
  const dates = readReferenceDates();
  const requiredYears = readRequiredYears();
  const specializedTrainingYears = readSpecializedTrainingYears();
  const target = readTargetPost();
  const rows = [...periodsElement.querySelectorAll(".period")];
  const requirementSelections = readRequirementSelections(rows);
  const drafts = rows.map((row) => ({
    start: inputDraft(row.querySelector("[name=start]")),
    end: inputDraft(row.querySelector("[name=end]")),
    experienceEligible: row.querySelector("[name=experience-eligible]").checked,
    requirementEligible: row.querySelector("[name=requirement-eligible]").checked,
    level:
      row.querySelector("[name=level]").value === ""
        ? null
        : Number(row.querySelector("[name=level]").value),
    functionalArea: row.querySelector("[name=functional-area]").value,
    relationalArea: row.querySelector("[name=relational-area]").value,
    groupedFunctional: row.querySelector("[name=grouped-functional]").checked,
    reservedAlternative: row.querySelector("[name=reserved-alternative]").checked,
    seniorityEligible: row.querySelector("[name=seniority-eligible]").checked,
  }));
  const periods = normalizePeriodDrafts(drafts);

  if (periods.length === 0) {
    throw new Error("Introduzca al menos un rango con fecha inicial.");
  }

  renderPeriodPotentialScores(periods, rows, target, dates.merits);

  const experiencePeriods = periods.filter((period) => period.experienceEligible !== false);
  const discount = discountExperienceRequirement(periods, {
    requirementReference: dates.requirements,
    meritReference: dates.merits,
    requiredYears,
    specializedTrainingYears,
    requirementSelections,
    inclusiveEnd,
    target,
  });
  const requirement = discount.requirement;
  const clipped = clipPeriodsToExperienceWindow(experiencePeriods, { referenceDate: dates.merits });
  const meritPeriods = discount.complete ? discount.remainingMeritPeriods : clipped.periods;
  const details = meritPeriods.map((period) => ({
    ...period,
    duration: differenceCalendar(period.start, period.end, { inclusiveEnd }),
    classification: classifyPeriodForTarget(period, target),
  }));
  const merged = mergePeriods(meritPeriods, { inclusiveEnd });
  const totalDuration = totalCalendarDuration(meritPeriods, { inclusiveEnd });
  const experience = scoreProfessionalExperience(meritPeriods, { target, inclusiveEnd });
  const seniority = scoreSeniority(periods, { referenceDate: dates.merits, inclusiveEnd });
  const selectionPending =
    requiredYears > 0 &&
    requirement.meets &&
    requirement.serviceRequiredYears > 0 &&
    !discount.complete;
  const article129 = summarizeArticle129Score({
    experience,
    seniority,
    experienceRequirementMet: requiredYears === 0 || requirement.meets,
    experienceRequirementSelectionComplete: !selectionPending,
  });

  requirementConsumption.replaceChildren();
  if (requiredYears === 0) {
    requirementSummary.textContent =
      "Requisito de experiencia previa: no exigido en los datos de esta convocatoria.";
  } else {
    const availabilityText = requirement.meets ? "SUFICIENTE" : "INSUFICIENTE";
    requirementSummary.textContent =
      `Experiencia disponible para el requisito: ${availabilityText}. ` +
      `${requirement.trainingYearsApplied} año(s) equivalente(s) por Formación Especializada y ` +
      `${formatDuration(requirement.duration)} (${requirement.totalDays} días) de servicio computable hasta ` +
      `${dates.requirements}; se exigen ${requiredYears} año(s) en total.`;

    if (requirement.meets && requirement.serviceRequiredYears > 0) {
      if (discount.selectionStatus === "complete") {
        requirementSummary.textContent +=
          ` Selección para el requisito: COMPLETA. Se descuentan exactamente ${formatDuration(discount.selectedDuration)} ` +
          `(${discount.consumedDays} días únicos): ${discount.consumedOutsideMeritDays} fuera de la ventana de méritos y ` +
          `${discount.consumedMeritDays} dentro de ella.`;
      } else if (discount.selectionStatus === "under") {
        requirementSummary.textContent +=
          ` Selección para el requisito: INCOMPLETA. Ha seleccionado ${formatDuration(discount.selectedDuration)}; ` +
          `faltan ${formatDuration(discount.selectionDifferenceDuration)}.`;
      } else if (discount.selectionStatus === "over") {
        requirementSummary.textContent +=
          ` Selección para el requisito: EXCESIVA. Ha seleccionado ${formatDuration(discount.selectedDuration)}; ` +
          `sobran ${formatDuration(discount.selectionDifferenceDuration)}.`;
      }

      for (const segment of discount.consumedSegments) {
        const li = document.createElement("li");
        const cost = segment.insideMeritWindow
          ? `${segment.annualRate.toFixed(2)} puntos/año potenciales`
          : "fuera de la ventana de méritos; pérdida potencial 0";
        li.textContent = `Selección · Rango ${segment.periodIndex + 1}: ${segment.start}–${segment.end}; ${cost}.`;
        requirementConsumption.append(li);
      }
    }
  }

  if (requiredYears > 0 && !requirement.meets) {
    experienceScore.textContent =
      "Puntuación de experiencia profesional: no se calcula porque no se cumple el requisito de experiencia.";
  } else if (selectionPending && experience.definitive) {
    experienceScore.textContent =
      `Puntuación potencial antes de descontar el requisito: ${experience.points.toFixed(2)} de ` +
      `${experience.maximumPoints.toFixed(2)} puntos. Complete la selección del requisito para obtener la puntuación definitiva.`;
  } else if (selectionPending) {
    experienceScore.textContent =
      "Puntuación potencial antes de descontar el requisito: no definitiva por otros datos introducidos. " +
      `Intervalo ${experience.provisionalMinimumPoints.toFixed(2)}–` +
      `${experience.provisionalMaximumPoints.toFixed(2)} de ${experience.maximumPoints.toFixed(2)} puntos.`;
  } else if (experience.definitive) {
    experienceScore.textContent =
      `Puntuación de experiencia profesional: ${experience.points.toFixed(2)} de ` +
      `${experience.maximumPoints.toFixed(2)} puntos.`;
  } else {
    experienceScore.textContent =
      "Puntuación de experiencia profesional: no definitiva. " +
      `Intervalo provisional ${experience.provisionalMinimumPoints.toFixed(2)}–` +
      `${experience.provisionalMaximumPoints.toFixed(2)} de ${experience.maximumPoints.toFixed(2)} puntos.`;
  }

  seniorityScore.textContent =
    `Antigüedad: ${seniority.valuedYears} año(s) valorado(s), ` +
    `${seniority.points.toFixed(2)} de ${seniority.maximumPoints.toFixed(2)} puntos; ` +
    `${formatDuration(seniority.duration)} de servicios reconocidos/inscritos hasta ${dates.merits}.`;

  if (requiredYears > 0 && !requirement.meets) {
    totalScore.textContent =
      "Puntuación total del baremo: no se calcula porque no se cumple el requisito de experiencia introducido.";
  } else if (selectionPending) {
    totalScore.textContent =
      "Puntuación total del baremo: pendiente de seleccionar exactamente el servicio que se utilizará para cumplir el requisito.";
  } else if (!article129.calculationDefinitive) {
    totalScore.textContent =
      `Puntuación total provisional: ${article129.provisionalMinimumPoints.toFixed(2)}–` +
      `${article129.provisionalMaximumPoints.toFixed(2)} de ${article129.maximumPoints.toFixed(2)} puntos.`;
  } else {
    totalScore.textContent =
      `Puntuación total del baremo: ${article129.technicalPoints.toFixed(2)} de ` +
      `${article129.maximumPoints.toFixed(2)} puntos.`;
  }

  results.replaceChildren();
  for (const item of details) {
    const li = document.createElement("li");
    const threshold = isStrictlyMoreThanSixMonths(item.duration)
      ? "supera seis meses"
      : "no supera seis meses";
    const inferredEnd = item.endDefaultedToToday ? "; fecha final tomada como hoy" : "";
    const clippedText =
      item.startWasClipped || item.endWasClipped ? "; ajustado al límite de diez años" : "";
    const requirementText = item.classification.requirementEligible
      ? ""
      : "; no apto para el requisito por relación de área";
    const rateText = `; nivel ${item.level}; ${item.classification.area.label}; ${item.classification.annualRate.toFixed(2)} puntos/año potenciales`;
    li.textContent = `Rango ${item.periodIndex + 1} computable: ${formatDuration(item.duration)} (${item.duration.totalDays} días); ${threshold}${rateText}${inferredEnd}${clippedText}${requirementText}.`;
    results.append(li);
  }

  summary.textContent =
    `Total de experiencia ${discount.complete ? "restante" : "potencial"} dentro de ${clipped.window.start}–${clipped.window.end}, sin duplicar solapamientos: ` +
    `${formatDuration(totalDuration)} (${merged.totalDays} días) en ${merged.mergedPeriods} tramo(s) continuo(s).`;

  const messages = [];
  if (clipped.excludedPeriods > 0) {
    messages.push(
      `${clipped.excludedPeriods} rango(s) queda(n) completamente fuera de los diez últimos años.`,
    );
  }
  if (clipped.clippedPeriods > 0) {
    messages.push(
      `${clipped.clippedPeriods} rango(s) ha(n) sido recortado(s) al intervalo de diez años.`,
    );
  }
  if (merged.overlapsDetected) {
    messages.push("Se han detectado rangos solapados; el total no los duplica.");
  } else if (clipped.periods.length > 0) {
    messages.push("No se han detectado solapamientos dentro de la ventana.");
  }
  if (periods.some((item) => item.endDefaultedToToday)) {
    messages.push("En el último rango incompleto se ha usado hoy como fecha final.");
  }
  if (requirement.trainingYearsApplied > 0) {
    messages.push(
      `Se han aplicado ${requirement.trainingYearsApplied} año(s) equivalentes de Formación Especializada exclusivamente al requisito; no suman experiencia profesional ni antigüedad.`,
    );
  }
  if (selectionPending && discount.selectionStatus === "under") {
    messages.push(
      "Revise el valor potencial mostrado en cada rango y seleccione qué periodos, completos o parciales, quiere utilizar para el requisito hasta completar exactamente el tiempo necesario.",
    );
  } else if (selectionPending && discount.selectionStatus === "over") {
    messages.push(
      "La selección del requisito supera el tiempo necesario. Reduzca algún periodo o cambie una selección total por una selección parcial.",
    );
  } else if (requiredYears > 0 && discount.complete && discount.consumedDays > 0) {
    messages.push(
      "El servicio utilizado para el requisito ha sido elegido expresamente por la persona usuaria y se descuenta del mérito de experiencia sin reducir la antigüedad.",
    );
  } else if (requiredYears > 0 && !requirement.meets) {
    messages.push(
      "No se descuenta experiencia del baremo porque no se alcanza el requisito exigido.",
    );
  }
  if (seniority.overlapsDetected) {
    messages.push("La antigüedad no duplica servicios prestados simultáneamente.");
  }
  if (seniority.clippedPeriods > 0) {
    messages.push(
      `${seniority.clippedPeriods} rango(s) de antigüedad ha(n) sido recortado(s) al corte de méritos.`,
    );
  }
  if (experience.issues.length > 0) {
    messages.push(...experience.issues.map((issue) => issue.message));
  }
  if (article129.caveats.length > 0) {
    messages.push(...article129.caveats);
  }
  if (clipped.periods.length === 0) {
    messages.push("No hay experiencia computable dentro de la ventana seleccionada.");
  }
  status.textContent = messages.join(" ");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    render();
    status.classList.remove("error");
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
    status.classList.add("error");
    focusInputError(error);
  }
});

callDateInput.value = todayIso();
callEndInput.value = todayIso();
meritCutoffElement.textContent = referenceDates(callEndInput.value, callDateInput.value).merits;
for (const input of [callDateInput, callEndInput]) {
  input.addEventListener("change", () => {
    invalidateAllRequirementSelections();
    try {
      meritCutoffElement.textContent = referenceDates(
        callEndInput.value,
        callDateInput.value,
      ).merits;
    } catch {
      meritCutoffElement.textContent = "—";
    }
  });
}

for (const input of [targetLevelInput, targetFunctionalAreaInput, targetRelationalAreaInput]) {
  input.addEventListener("change", invalidateAllRequirementSelections);
}
addPeriod({}, { focus: true });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // La calculadora sigue funcionando aunque no se pueda instalar como PWA.
    });
  });
}
