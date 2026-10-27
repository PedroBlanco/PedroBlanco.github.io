import { AREA_CATALOG, areaDisplayValue, canonicalAreaValue } from "./src/areas.js";
import { applicationDeadline, UnsupportedAdministrativeCalendarError } from "./src/deadlines.js";

const AREA_FIELD_SELECTOR = [
  "#target-functional-area",
  "#target-relational-area",
  '[name="functional-area"]',
  '[name="relational-area"]',
].join(",");

export function focusInitialField(root) {
  root.querySelector("#call-date")?.focus();
}

export function inheritAreaValues(sourceRow, targetRow) {
  for (const name of ["functional-area", "relational-area"]) {
    const source = sourceRow?.querySelector(`[name="${name}"]`);
    const target = targetRow?.querySelector(`[name="${name}"]`);
    if (source && target) target.value = source.value;
  }
}

function ensureAreaOptions(root) {
  let list = root.querySelector("#area-options");
  if (list) return list;

  list = root.createElement("datalist");
  list.id = "area-options";
  for (const area of AREA_CATALOG) {
    const option = root.createElement("option");
    option.value = areaDisplayValue(area);
    list.append(option);
  }
  root.body.append(list);
  return list;
}

function configureAreaField(input) {
  input.setAttribute("list", "area-options");
  input.setAttribute("autocomplete", "off");
  input.dataset.areaField = "true";
  if (input.id === "target-functional-area") input.required = true;
}

function configureAreaFields(root) {
  ensureAreaOptions(root);
  for (const input of root.querySelectorAll(AREA_FIELD_SELECTOR)) configureAreaField(input);
}

function validateAreaField(input) {
  input.setCustomValidity("");
  const raw = input.value.trim();

  if (!raw) {
    if (input.required)
      input.setCustomValidity("Seleccione el área funcional del puesto solicitado.");
    return input.validity.valid;
  }

  try {
    input.value = canonicalAreaValue(raw);
  } catch (error) {
    input.setCustomValidity(error instanceof Error ? error.message : String(error));
  }
  return input.validity.valid;
}

function firstInvalidAreaField(root) {
  for (const input of root.querySelectorAll("[data-area-field]")) {
    if (!validateAreaField(input)) return input;
  }
  return null;
}

function ensureDeadlineHint(root, callEndInput) {
  let hint = root.querySelector("#call-end-hint");
  if (hint) return hint;

  hint = root.createElement("p");
  hint.id = "call-end-hint";
  hint.className = "hint";
  hint.setAttribute("aria-live", "polite");
  callEndInput.closest("label")?.insertAdjacentElement("afterend", hint);
  return hint;
}

export function syncApplicationDeadline(root) {
  const callDateInput = root.querySelector("#call-date");
  const callEndInput = root.querySelector("#call-end-date");
  if (!callDateInput || !callEndInput) return false;

  const hint = ensureDeadlineHint(root, callEndInput);
  callEndInput.readOnly = true;
  callEndInput.setAttribute("aria-describedby", hint.id);

  if (!callDateInput.value) {
    callEndInput.value = "";
    hint.textContent = "Introduzca la fecha de publicación para calcular el plazo.";
    return false;
  }

  try {
    callEndInput.value = applicationDeadline(callDateInput.value);
    hint.textContent =
      "Calculada automáticamente: 10 días hábiles desde el día siguiente a la publicación.";
  } catch (error) {
    callEndInput.value = "";
    hint.textContent =
      error instanceof UnsupportedAdministrativeCalendarError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
  }

  callEndInput.dispatchEvent(new Event("change", { bubbles: true }));
  return Boolean(callEndInput.value);
}

function initializeAreaUi(root) {
  configureAreaFields(root);

  root.addEventListener("input", (event) => {
    if (event.target.matches?.("[data-area-field]")) event.target.setCustomValidity("");
  });

  root.addEventListener("change", (event) => {
    if (event.target.matches?.("[data-area-field]")) validateAreaField(event.target);
  });

  root.addEventListener("click", (event) => {
    const button = event.target.closest?.(".add-period");
    if (!button) return;

    const sourceRow = button.closest(".period");
    const targetRow = sourceRow?.nextElementSibling;
    if (!targetRow?.matches(".period")) return;

    configureAreaFields(root);
    inheritAreaValues(sourceRow, targetRow);
  });
}

function initializeDeadlineUi(root) {
  syncApplicationDeadline(root);
  root.addEventListener("change", (event) => {
    if (event.target.id === "call-date") syncApplicationDeadline(root);
  });
}

function initializeFormValidation(root) {
  const form = root.querySelector("#calculator");
  form?.addEventListener(
    "submit",
    (event) => {
      const callDateInput = root.querySelector("#call-date");
      const callEndInput = root.querySelector("#call-end-date");
      if (callDateInput?.value && !callEndInput?.value) {
        event.preventDefault();
        event.stopImmediatePropagation();
        callDateInput.focus();
        root.querySelector("#status").textContent =
          root.querySelector("#call-end-hint").textContent;
        root.querySelector("#status").classList.add("error");
        return;
      }

      configureAreaFields(root);
      const invalid = firstInvalidAreaField(root);
      if (!invalid) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      invalid.focus();
      invalid.reportValidity();
    },
    { capture: true },
  );
}

if (typeof window !== "undefined") {
  window.addEventListener(
    "DOMContentLoaded",
    () => {
      initializeAreaUi(document);
      initializeDeadlineUi(document);
      initializeFormValidation(document);
      focusInitialField(document);
    },
    { once: true },
  );
}
