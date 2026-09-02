import { differenceCalendar, isStrictlyMoreThanSixMonths, mergePeriods } from "./src/time.js";

const periodsElement = document.querySelector("#periods");
const addButton = document.querySelector("#add-period");
const form = document.querySelector("#calculator");
const results = document.querySelector("#results");
const summary = document.querySelector("#summary");
const status = document.querySelector("#status");
const template = document.querySelector("#period-template");

function addPeriod(values = {}) {
  const fragment = template.content.cloneNode(true);
  const row = fragment.querySelector(".period");
  row.querySelector("[name=start]").value = values.start ?? "";
  row.querySelector("[name=end]").value = values.end ?? "";

  row.querySelector(".remove-period").addEventListener("click", () => {
    row.remove();
    if (!periodsElement.querySelector(".period")) addPeriod();
  });

  periodsElement.append(fragment);
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

function render() {
  const inclusiveEnd = document.querySelector("#inclusive-end").checked;
  const rows = [...periodsElement.querySelectorAll(".period")];
  const periods = rows.map((row) => ({
    start: row.querySelector("[name=start]").value,
    end: row.querySelector("[name=end]").value,
  }));

  if (periods.some((period) => !period.start || !period.end)) {
    throw new Error("Complete las dos fechas de todos los periodos.");
  }

  const details = periods.map((period, index) => ({
    ...period,
    index,
    duration: differenceCalendar(period.start, period.end, { inclusiveEnd }),
  }));
  const merged = mergePeriods(periods, { inclusiveEnd });

  results.replaceChildren();
  for (const item of details) {
    const li = document.createElement("li");
    const threshold = isStrictlyMoreThanSixMonths(item.duration)
      ? "supera seis meses"
      : "no supera seis meses";
    li.textContent = `Periodo ${item.index + 1}: ${formatDuration(item.duration)} (${item.duration.totalDays} días); ${threshold}.`;
    results.append(li);
  }

  summary.textContent = `Total exacto sin duplicar solapamientos: ${merged.totalDays} días en ${merged.mergedPeriods} tramo(s) continuo(s).`;
  status.textContent = merged.overlapsDetected
    ? "Se han detectado periodos solapados; el total no los duplica."
    : "No se han detectado solapamientos.";
}

addButton.addEventListener("click", () => addPeriod());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    render();
    status.classList.remove("error");
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
    status.classList.add("error");
  }
});

addPeriod();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // La calculadora sigue funcionando aunque no se pueda instalar como PWA.
    });
  });
}
