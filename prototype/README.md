# Eleventy (11ty) · Renovación del sitio personal (prototipo)

**Tecnología elegida:** Eleventy 3.1.7. La variante Astro se conserva únicamente
como referencia de la comparación previa. **No se ha desplegado ni fusionado nada
en master.** El código de este prototipo reside en `prototype/`.

## Ejecutar y verificar

```sh
cd prototype
npm install
npm run dev
npm run build
npm run check
npm run check:publish
```

`check:publish` debe fallar mientras queden traducciones sin revisión humana.
La aprobación se documenta en `src/data/translation-review.json` mediante huellas
de contenido español. El comando `check` informa de traducciones pendientes sin
impedir la compilación del prototipo.

## Identidad visual provisional · Decisión 22

**«Archivo contemporáneo»**, escogida provisionalmente.

| Token | Claro | Oscuro (preferencia del sistema) |
| --- | --- | --- |
| Fondo | `#F7F0E6` | `#211B1F` |
| Superficie | `#FFFCF7` | `#30282C` |
| Texto | `#342D2A` | `#F7EEE5` |
| Principal | `#794654` | `#E1B4C2` |
| Acento | `#9D7029` | `#D7A96D` |

## Tipografía · Decisión 23 (confirmada)

**Editorial equilibrada:** títulos serif y texto sans-serif. La familia de
encabezados se resuelve con Georgia/Cambria y serif del sistema; el cuerpo usa
fuentes sans-serif del sistema. Se trata de una elección tipográfica
confirmada, aunque sus tamaños y espaciados podrán ajustarse durante las
pruebas de diseño. No se descargan tipografías externas.

Variables CSS en `src/styles/site.css`. El acento ocre es decorativo; para
texto pequeño se emplea una variante más oscura. No se usan bibliotecas CSS.

## Contenido y catálogo

Las rutas, fichas y traducciones provisionales están en
`src/data/content.json`. Los repositorios públicos se sincronizan desde GitHub
antes de `npm run build`; si falla la API, se conserva el snapshot local.
La selección editorial se gestiona en `src/data/editorial.json`.

## Condiciones para publicar

- Revisión humana de todas las traducciones; contenido del TFG limitado a su
  descripción pública, sin exponer el repositorio privado.
- Auditoría de privacidad, licencias, datos personales y enlaces interiores.
- Conservación de las aplicaciones vigentes `/piefirma/` y `/calculadora-tiempo/`.
- Conservación selectiva de documentos históricos, con URLs originales.
- No retirar ni borrar proyectos históricos antes de revisar sus datos; las
  fichas actuales **son prototipos**, no una migración de archivos realizada.
- Los enlaces interiores personales no se redirigirán; se aplicará la política
  descrita en `MIGRATION.md`.
- Revisión visual móvil/escritorio, accesibilidad y SEO.
- PR final y plan de reversión; no fusionar este prototipo directamente.
