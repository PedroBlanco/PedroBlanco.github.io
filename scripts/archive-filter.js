/* Accessible progressive enhancement: the unfiltered timeline remains available without JS. */
(() => {
  const filters = document.querySelector(".archive-filters");
  const entries = [...document.querySelectorAll("[data-archive-entry]")];
  const periods = [...document.querySelectorAll("[data-archive-period]")];
  const count = document.querySelector("[data-archive-count]");
  if (!filters || !count || !entries.length) return;
  const buttons = [...filters.querySelectorAll("[data-archive-filter]")];
  const suffix = document.documentElement.lang === "en" ? "items" : "elementos";
  function apply(category) {
    let total = 0;
    entries.forEach(entry => {
      const visible = category === "all" || entry.dataset.archiveCategory === category;
      entry.hidden = !visible;
      if (visible) total++;
    });
    periods.forEach(period => {
      period.hidden = !period.querySelector("[data-archive-entry]:not([hidden])");
    });
    buttons.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.archiveFilter === category));
    });
    count.textContent = total + " " + suffix;
  }
  filters.hidden = false;
  count.hidden = false;
  filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-archive-filter]");
    if (button && filters.contains(button)) apply(button.dataset.archiveFilter);
  });
  apply("all");
})();
