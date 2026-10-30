/* Theme controller: system is the default; manual choices are stored locally. */
(() => {
  "use strict";
  const root = document.documentElement;
  const storageKey = "pedroblanco-color-mode";
  const known = new Set(["light", "dark"]);
  const prefersDark = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const text = {
    es: {
      system: "Sistema", light: "Claro", dark: "Oscuro",
      mode: "Tema", next: "Cambiar a", lightName: "claro", darkName: "oscuro",
      systemName: "automático"
    },
    en: {
      system: "System", light: "Light", dark: "Dark",
      mode: "Theme", next: "Switch to", lightName: "light", darkName: "dark",
      systemName: "system"
    }
  };
  const preferred = () => prefersDark?.matches ? "dark" : "light";
  let mode = "system";
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (known.has(saved)) mode = saved;
  } catch { /* Private browsing and blocked storage: use system preference. */ }

  function apply() {
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
  }
  // Runs synchronously before the stylesheet loads to avoid a light/dark flash.
  apply();

  const next = () => {
    const opposite = preferred() === "dark" ? "light" : "dark";
    if (mode === "system") return opposite;
    if (mode === opposite) return preferred();
    return "system";
  };
  const effective = () => mode === "system" ? preferred() : mode;
  const strings = () => text[root.lang === "en" ? "en" : "es"];
  const buttons = () => [...document.querySelectorAll("[data-theme-toggle]")];

  function update() {
    const t = strings();
    const nextMode = next();
    for (const button of buttons()) {
      const icon = button.querySelector("[data-theme-icon]");
      const label = button.querySelector("[data-theme-label]");
      if (!icon || !label) continue;
      icon.textContent = mode === "system" ? "◐" : effective() === "dark" ? "☾" : "☀";
      label.textContent = t[mode];
      const choice = nextMode === "system" ? t.systemName
        : nextMode === "light" ? t.lightName : t.darkName;
      const name = t.mode + ": " + t[mode] + ". " + t.next + " " + choice;
      button.setAttribute("aria-label", name);
      button.title = name;
      button.hidden = false;
    }
    // The conceptual diagrams are self-contained SVG images and normally
    // follow the operating system. Only manual mode needs a forced variant.
    for (const img of document.querySelectorAll("img[data-theme-image]")) {
      const original = img.getAttribute("data-theme-image");
      if (!original || !/^\/media\/adaptation-loop-(?:es|en)\.svg$/.test(original)) continue;
      const desired = mode === "system" ? original : original.replace(".svg", "-" + mode + ".svg");
      if (img.getAttribute("src") !== desired) img.setAttribute("src", desired);
    }
  }
  function store() {
    try {
      if (mode === "system") window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, mode);
    } catch { /* The choice still works for the current page. */ }
  }
  function start() {
    for (const button of buttons()) {
      button.addEventListener("click", () => {
        mode = next();
        apply();
        store();
        update();
      });
    }
    if (prefersDark) {
      if (typeof prefersDark.addEventListener === "function")
        prefersDark.addEventListener("change", update);
      else if (typeof prefersDark.addListener === "function")
        prefersDark.addListener(update);
    }
    update();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();
})();
