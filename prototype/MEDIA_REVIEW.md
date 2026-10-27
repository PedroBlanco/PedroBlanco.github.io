# Revisión de materiales históricos — inventario verificable

Fecha de inventario: **27/10/2026**. Fuente: archivos ya existentes en `master`, con hash de blob Git y tamaño. **Ningún archivo de esta lista queda aprobado automáticamente para una nueva publicación.**

El inventario recoge **23 archivos**, **202.690.633 bytes (193.3 MiB)**, repartidos en 3 de tipo document, 1 de tipo presentation, 2 de tipo video, 6 de tipo audio, 3 de tipo html, 6 de tipo image, 2 de tipo spreadsheet.

## Decisiones necesarias

1. **Conservar públicamente**: confirmar titularidad o permiso de distribución, datos personales, créditos y lugar de publicación. Entonces cambiar a `approved` y añadir evidencia de revisión.
2. **Preservar solo una referencia descriptiva**: marcar `retire` y mantener en la nueva web la mención histórica sin reproducir el archivo.
3. **Posponer**: mantener `hold`. La web Eleventy no publica ese recurso y su control de salida exige resolver los enlaces afectados.

La página antigua `revista/index.html` es un prototipo con artículos repetidos titulados «Artículo 1», etc. No sustituye una publicación final; **no se copiará automáticamente**. Además, el vídeo `2023-10-17_Revista_Enredados_Presentacion.mp4` está enlazado desde `CC.html`.

## Registro por archivo

| Archivo original | Tipo | Tamaño (MiB) | Estado | Punto de revisión |
|---|---|---:|---|---|
| `CROQUETAS2024.pdf` | document | 8.16 | hold · conservación solicitada | Conservar PDF completo: decisión del titular 27/10/2026; derechos, privacidad y revisión visual todavía pendientes. |
| `NEXUM2024.pdf` | document | 67.30 | hold | Review personal data, embedded media, author/license, access and download size. |
| `NEXUM2024.pptx` | presentation | 21.11 | hold | Review personal data, embedded media, author/license, access and download size. |
| `revista/2023-10-17_Revista_Enredados_Presentacion.mp4` | video | 53.35 | hold | Review people shown, licenses and continued hosting of large video. |
| `revista/2024-09-23_presentacion_revista.pdf` | document | 1.94 | hold | Review personal data, embedded media, author/license, access and download size. |
| `revista/Caballeria-ligera.mp3` | audio | 7.37 | hold | Audio may involve third-party recordings/music: establish public distribution rights. |
| `revista/crucigrama-001.html` | html | 0.25 | hold | Contains Exolve MIT code plus puzzle content: verify both license notice and puzzle authorship. |
| `revista/crucigrama-002.html` | html | 0.25 | hold | Contains Exolve MIT code plus puzzle content: verify both license notice and puzzle authorship. |
| `revista/Duelo-cancion.mp3` | audio | 5.12 | hold | Audio may involve third-party recordings/music: establish public distribution rights. |
| `revista/Duelo-cancion.ogg` | audio | 6.20 | hold | Audio may involve third-party recordings/music: establish public distribution rights. |
| `revista/img/Italica_246.jpg` | image | 8.63 | hold | Verify image origin, attribution and whether people appear. |
| `revista/img/Italica_448.jpg` | image | 7.05 | hold | Verify image origin, attribution and whether people appear. |
| `revista/img/Preparativos.png` | image | 0.72 | hold | Verify image origin, attribution and whether people appear. |
| `revista/img/Restout_-_Morpheus.jpg` | image | 0.06 | hold | Verify image origin, attribution and whether people appear. |
| `revista/index.html` | html | 0.01 | retire | Original page is only a placeholder layout; replace with curated documentation-only index, without copying original page or images. |
| `revista/logo_limpio_redondo_64px.png` | image | 0.02 | hold | Verify image origin, attribution and whether people appear. |
| `revista/Numero14/Revista_IAAP_Caso_practico_12_Turnos_de_trabajo.ods` | spreadsheet | 0.05 | hold | Inspect spreadsheet content, author metadata and redistribution rights. |
| `revista/Numero14/Revista_IAAP_Casos_practicos_9y11_Funcion_SUMAPRODUCTO.ods` | spreadsheet | 0.02 | hold | Inspect spreadsheet content, author metadata and redistribution rights. |
| `revista/secciones/Actualidad.png` | image | 0.00 | hold | Verify image origin, attribution and whether people appear. |
| `revista/Silencio - 3s.mp3` | audio | 0.01 | hold | Audio may involve third-party recordings/music: establish public distribution rights. |
| `revista/TimTaj - Breaking News - 15s.mp3` | audio | 0.37 | hold | Audio may involve third-party recordings/music: establish public distribution rights. |
| `revista/TimTaj - Breaking News.mp3` | audio | 2.48 | hold | Audio may involve third-party recordings/music: establish public distribution rights. |
| `revista/Video-Arantxa.mp4` | video | 2.84 | hold | Named-person video: check participant consent and public distribution. |

## Control técnico

Datos estructurados: `src/data/media-review.json`.
Ejecutar `npm run audit:media` desde `prototype/`, después de la compilación.

- El validador descubre **todos** los archivos de `revista/` y los documentos
  `CROQUETAS2024` y `NEXUM2024`; si falta o sobra alguno exige actualizar
  el inventario.
- Comprueba el hash Git, tamaño, rutas y ausencia de enlaces simbólicos.
- Impide que recursos `hold` o `retire` aparezcan en la salida estática.
- `approved` significará que existe una revisión documentada, no una
  presunción deducida de que el archivo estaba previamente en GitHub.

**Atención:** borrar una distribución estática no elimina contenidos del
historial de Git ni de los archivos ya descargados. El análisis de privacidad
del historial es una tarea separada.

## Decisión editorial provisional para `/revista/`

Se habilita en el prototipo una **nueva portada documental sin imágenes ni medios**
que identifica la antigua portada como maqueta. Enlaza únicamente a
`CC.html` y `KM2024.html`, y informa de que los archivos audiovisuales
siguen pendientes de revisión. El archivo anterior `revista/index.html`
permanece inventariado como `retire`: **no se copia el original**.
No se modifica el estado `hold` de los otros diecinueve archivos de
la carpeta.

## Expediente individual 01 — CROQUETAS2024.pdf

- **Decisión del titular (27/10/2026):** conservar el archivo PDF completo, sujeto a comprobar derechos y privacidad. **No equivale a aprobar la nueva publicación.**
- **Evidencia contextual:** el IAAP incluye Croquetas del Conocimiento en el programa de la VII Jornada de Gestión del Conocimiento (22/10/2024) y en su dossier público de proyectos. Estas publicaciones **no prueban** una licencia de distribución aplicable a los bytes concretos de `CROQUETAS2024.pdf`.
- **Contenido interior:** revisión visual de todas las páginas y recursos gráficos **pendiente**; no se debe inferir ausencia de personas, datos personales ni imágenes de terceros a partir de la extracción textual.
- **Preflight automatizado superado (GitHub Actions #40556104172):** 20 páginas; 1.338 caracteres de texto extraíble; 6 páginas casi sin texto extraíble; 81 referencias a imágenes; metadatos de autor y creación; 0 anotaciones de enlaces externos. Búsqueda de patrones en texto extraíble: 0 correos, 0 DNI, 0 IBAN y 0 indicadores textuales de licencia. **No se extraen conclusiones absolutas de privacidad ni derechos:** el PDF contiene muchas imágenes y debe examinarse visualmente. Evidencia técnica: [ejecución 40556104172](https://github.com/PedroBlanco/PedroBlanco.github.io/actions/runs/40556104172).
- **Método técnico:** `python prototype/scripts/audit-legacy-pdf.py` en CI lee únicamente el PDF del inventario, valida su Git blob y emite señales **agregadas sin nombres ni texto de páginas** (metadatos presentes, páginas, imágenes/adjuntos aparentes, enlaces, patrones de datos personales, indicios de licencia). No sustituye la inspección humana.
- **Preguntas por confirmar:** quién autorizó la presentación, si las diapositivas o imágenes de terceros pueden redistribuirse, si hay fotografías o nombres personales sin consentimiento aplicable, y si debemos mantener los metadatos PDF originales o generar una copia saneada conservando la versión histórica.
- **Estado operativo:** `hold`, excluido de Eleventy; reserva de URL `/CROQUETAS2024.pdf` hasta completar revisión.
