export const AREA_CATALOG = Object.freeze([
  { code: "0010", name: "Administración Pública" },
  { code: "0020", name: "Presupuestos y Gestión Económica" },
  { code: "0030", name: "Recursos Humanos" },
  { code: "0040", name: "Contratación Administrativa y Régimen Patrimonial" },
  { code: "0050", name: "Documentación, Publicaciones y Comunicación Social" },
  { code: "0060", name: "Administración Local" },
  { code: "0090", name: "Juegos y Espectáculos Públicos" },
  { code: "0070", name: "Tecnología de la Información y Telecomunicaciones" },
  { code: "0080", name: "Legislación y Régimen Jurídico" },
  { code: "0100", name: "Defensa y Asesoramiento Jurídico" },
  { code: "0110", name: "Hacienda Pública" },
  { code: "0120", name: "Intervención" },
  { code: "0130", name: "Tributos" },
  { code: "0140", name: "Obras Públicas y Construcciones" },
  { code: "0150", name: "Urbanismo y Ordenación del Territorio" },
  { code: "0160", name: "Arquitectura e Instalaciones" },
  { code: "0180", name: "Carreteras y Obras Hidráulicas" },
  { code: "0170", name: "Administración Agraria" },
  { code: "0200", name: "Administración Pesquera" },
  { code: "0210", name: "Investigación, Análisis y Formación Agraria y Pesquera" },
  { code: "0230", name: "Medio Ambiente" },
  { code: "0240", name: "Calidad Ambiental" },
  { code: "0250", name: "Gestión del Medio Natural" },
  { code: "0260", name: "Ordenación Económica" },
  { code: "0270", name: "Industria y Energía" },
  { code: "0280", name: "Minas" },
  { code: "0290", name: "Régimen Laboral" },
  { code: "0300", name: "Seguridad" },
  { code: "0310", name: "Cooperativas, Empleo y Formación Ocupacional" },
  { code: "0320", name: "Transporte" },
  { code: "0330", name: "Consumo" },
  { code: "0190", name: "Turismo" },
  { code: "0220", name: "Comercio" },
  { code: "0340", name: "Ordenación Educativa" },
  { code: "0350", name: "Salud y Ordenación Sanitaria" },
  { code: "0360", name: "Control y Análisis de Salud" },
  { code: "0380", name: "Asuntos Sociales" },
  { code: "0420", name: "Tutela del Patrimonio Histórico" },
  { code: "0430", name: "Archivística" },
  { code: "0440", name: "Biblioteconomía" },
  { code: "0370", name: "Museística" },
  { code: "0450", name: "Gestión Cultural" },
  { code: "0500", name: "Estadística" },
]);

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function areaDisplayValue(area) {
  return `${area.code} · ${area.name}`;
}

export function resolveArea(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  return (
    AREA_CATALOG.find((area) => {
      const display = normalizeText(areaDisplayValue(area));
      return (
        normalized === normalizeText(area.code) ||
        normalized === normalizeText(area.name) ||
        normalized === display
      );
    }) ?? null
  );
}

export function canonicalAreaValue(value) {
  if (!String(value ?? "").trim()) return "";
  const area = resolveArea(value);
  if (!area) {
    throw new RangeError("Seleccione un área del catálogo oficial de la Junta de Andalucía.");
  }
  return areaDisplayValue(area);
}
