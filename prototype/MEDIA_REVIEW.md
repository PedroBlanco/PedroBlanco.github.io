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
| `NEXUM2024.pptx` | presentation | 21.11 | hold · conservación solicitada | Conservar editable completo: revisar diapositivas, notas, comentarios, vínculos, objetos incrustados, licencias y datos personales. |
| `revista/2023-10-17_Revista_Enredados_Presentacion.mp4` | video | 53.35 | hold · conservación solicitada | Producción propia declarada por el titular; revisión de participantes, voces, música, elementos de terceros y metadatos pendiente. |
| `revista/2024-09-23_presentacion_revista.pdf` | document | 1.94 | hold · conservación solicitada | Mantener PDF completo tras revisión de derechos, imágenes, posibles datos personales y contenido; pendiente. |
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

## Expediente individual 02 — NEXUM2024.pdf

- **Decisión del titular (27/10/2026):** conservar el PDF completo (70.568.492 bytes, 67,30 MiB), condicionado a comprobar derechos y privacidad. **No significa que esté autorizado para nueva publicación.**
- **Procedencia técnica:** ruta pública histórica `/NEXUM2024.pdf`, Git blob `fcc95fa427fa59fc7915a9e60a3d1ea2b93846c5`. No se ha podido inspeccionar directamente el documento binario en el entorno de conversación; su contenido sigue pendiente de revisión visual.
- **Relación documental:** existe además `/NEXUM2024.pptx` (archivo 3/22), que se valorará **por separado**; la conservación de PDF no implica autorizar el PPTX editable.
- **Comprobación técnica:** el script `prototype/scripts/audit-legacy-pdf.py` se aplica al PDF en CI, verificando hash y emitiendo únicamente señales agregadas (sin texto de páginas ni nombres de autor). Este procedimiento no identifica visualmente personas, capturas corporativas ni derechos de materiales gráficos.
- **Comprobaciones humanas pendientes:** revisar todas las páginas, datos personales (incluso dentro de capturas/imágenes), posibles nombres de asistentes o autores, información administrativa no pública, licencias de fotografías y permiso de redistribución. Examinar metadatos del PDF antes de publicarlo en Eleventy.
- **Estado operativo:** `hold`; decisión de conservación `preserve-full`, todavía no `approved`.

## Expediente individual 03 — NEXUM2024.pptx

- **Decisión del titular (27/10/2026):** conservar el PowerPoint editable completo (22.130.560 bytes; 21,11 MiB), condicionado a revisar derechos y privacidad. No equivale a autorizar la publicación.
- **Integridad:** hash Git de origen fijado en `src/data/media-review.json`. El archivo permanece en `hold` y no se copia al resultado Eleventy.
- **Riesgos específicos del formato editable:** diapositivas ocultas, notas del presentador, comentarios, autor/último editor en metadatos, hipervínculos, medios y objetos incrustados, capturas e información interna visible o no visible en la presentación.
- **Análisis técnico superado:** [CI #40563265136](https://github.com/PedroBlanco/PedroBlanco.github.io/actions/runs/40563265136), hash Git correcto. **20 diapositivas**, ninguna marcada como oculta; **0 ficheros de notas**, **0 comentarios**, **0 objetos incrustados**, **82 recursos en `ppt/media/`** (20.909.902 bytes), **1 relación externa**, **0 indicadores de contenido activo**. Metadatos de título y último modificador presentes. **11 diapositivas con escaso texto extraíble**. Ningún patrón de correo, DNI o IBAN detectado en el texto XML, sin descartar datos visibles en imágenes. La estructura no permite acreditar derechos ni privacidad.
- **Comparación inicial con PDF:** ambos presentan 20 páginas/diapositivas; **no se ha comprobado identidad del contenido** y la equivalencia queda pendiente de inspección visual.
- **Pendiente:** comprobar visualmente todas las diapositivas, elementos ocultos y notas, confirmar derechos del contenido y determinar si es necesario eliminar propiedades personales para preparar una copia publicable.
- **Relación con archivo 02:** el PDF `NEXUM2024.pdf` se revisa de forma independiente; tener ambos archivos no demuestra identidad de contenido ni autorización para redistribuirlos.

## Expediente individual 04 — Revista EnRed@2.0: vídeo 2023

- **Decisión del titular (27/10/2026):** conservar el MP4 íntegro en la ruta histórica. Declara expresamente que es una **producción propia suya**. Se registra la afirmación de autoría como declaración del titular, no como licencia general sobre aportaciones de terceros.
- **Archivo:** `revista/2023-10-17_Revista_Enredados_Presentacion.mp4`, 55.941.137 bytes (53,35 MiB), Git blob `2d9746db23cbf415dc6c9cb6df0321872ed228b4`.
- **Contexto:** el índice histórico `CC.html` lo describía como «Proceso Editorial (GitHub) - Octubre 2023»; el mismo índice tiene un enlace alternativo a YouTube, **sin haber comprobado que los dos vídeos sean idénticos**.
- **Inspección técnica superada:** [GitHub Actions #40567732706](https://github.com/PedroBlanco/PedroBlanco.github.io/actions/runs/40567732706). Integridad y SHA-256 comprobados. Duración **216,533 s (3:36,5)**, vídeo **H.264 1920 × 1080 a 25 fps**, audio **AAC estéreo a 48 kHz**. Dos pistas y ningún capítulo detectado. No se han publicado valores de metadatos, fotogramas, nombres ni contenido de audio en los registros. La inspección no determina presencia de personas, voces, música ajena ni autorizaciones aplicables.
- **Pendiente:** revisar manualmente imágenes y voces, derechos de música y recursos externos, permisos de posibles participantes identificables y metadatos que puedan revelar información personal. La declaración de producción propia no resuelve automáticamente esos elementos.
- **Estado:** `hold`, con decisión `preserve-full`; el prototipo Eleventy todavía **no redistribuye** el MP4. Para publicar, confirmar el resultado de la inspección visual y los permisos de las personas y de los materiales incluidos.

## Expediente individual 05 — Presentación Revista EnRed@2.0 (2024)

- **Decisión del titular (27/10/2026):** conservar íntegro `revista/2024-09-23_presentacion_revista.pdf` (2.030.694 bytes, 1,94 MiB) sujeto a comprobaciones. No es aprobación de redistribución.
- **Identidad:** archivo PDF del índice histórico de la revista; la fecha 23/09/2024 procede del nombre del fichero, no de una verificación del contenido. Autoría no confirmada.
- **Procedencia técnica:** SHA de blob Git `3131c375dc10c0e96b3f0cbd6982c4e32e3d76e2` fijado en inventario. Se realizará preflight con `prototype/scripts/audit-legacy-pdf.py`, que informa de páginas, referencias a imágenes, enlaces y coincidencias de patrones sin revelar texto ni metadatos personales.
- **Pendientes:** revisar visualmente todas las páginas, fotografías, nombres, imágenes y logos; confirmar si hay datos personales, material de terceros y permiso de difusión; comprobar metadatos y anotaciones antes de publicar.
- **Estado:** `hold`, decisión `preserve-full` y revisión de privacidad y derechos pendiente; no se copia al build Eleventy.
