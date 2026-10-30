# Propuesta de revisión asistida ES/EN · Eleventy

**Fecha:** 2026-10-30. **Estado:** propuesta lingüística, **sin aprobación del titular**. La ficha definitiva de equivalencias se genera en `TRANSLATION_REVIEW.md`, incluido el Markdown extenso. El registro `src/data/translation-review.json` sigue vacío hasta la confirmación humana.

| Bloque | Resultado de la revisión preliminar | Actuación propuesta |
| --- | --- | --- |
| Interfaz (`site-ui`) | Etiquetas, menús, mensajes y navegación ES/EN coherentes. `View project` era demasiado estrecho para herramientas y documentos. Los pies incluían `prototipo/no publicado`, impropio del futuro lanzamiento. | Sustituir por `View details` y pies definitivos equivalentes. |
| Calculadora (`calculator`) | El alcance legal y el carácter de PWA se trasladan adecuadamente; `service merits` es una formulación jurídica que podría revisarse en futuras ampliaciones. | Simplificar el texto inglés del detalle sin cambiar prestaciones. Sin cambio en el resumen. |
| Firmas (`signature`) | La descripción ES/EN identifica la validación y escapado HTML. La revisión visual sin incidencias no equivale a certificar toda la compatibilidad de clientes ni autorizaciones de marcas institucionales. | Redactar el inglés más natural y conservar la advertencia contextual. |
| Fotos PDF (`pdf`) | Resumen y desarrollo equivalentes, pero `rotation` no traslada con precisión `inclinación`/enderezado. | Cambiar por `skew (tilt)` en el Markdown inglés. |
| CSV2SQLite (`csv`) | Campos, lotes, requisitos e instrucciones coherentes; ejemplos de ejecución equivalentes. | Sin cambios. |
| Narrativa adaptativa (`research`) | Objetivos, enfoque, integración, estado, descripciones y pies de imagen concuerdan. No se atribuyen pruebas concluyentes ni se expone el repositorio privado. | Sin cambios. |
| Atlas crítico (`mapas`) | Título, ficha histórica y referencia al sitio externo conservados. | Sin cambios. |
| Mapeo 2019 (`mapeo`) | Descripción y exclusión de exportaciones de participantes bien trasladadas. | Sin cambios. |
| Embajadores (`embajadores`) | La distinción entre ficha y antigua aplicación con fotografías/perfiles personales está clara. | Sin cambios. |
| Innovación colaborativa (`art-of-hosting`) | El título, año y exclusión de perfiles de asistentes mantienen el sentido. | Sin cambios. |

## Comprobaciones aplicadas

- Comparación de títulos, resúmenes, descripciones y secciones en ambos idiomas.
- Revisión de etiquetas de navegación, archivo, recursos y errores 404.
- Contraste de textos Markdown extensos en ambas lenguas.
- Revisión de los pies y textos alternativos del diagrama conceptual.
- Correcciones propuestas directamente en fuente, y sincronización de `TRANSLATION_REVIEW.md`.
- Normalización de LF/CRLF para que los digests de revisión no dependan del sistema operativo.

## Validación pendiente

**Se solicita al titular una única aprobación conjunta de los diez bloques tras revisar la propuesta**. Puede excluir los bloques que desee corregir. Esa aprobación permitirá incorporar en una revisión posterior los hashes y metadatos de ambos idiomas en `translation-review.json`.

Este documento no certifica licencias, enlaces externos, traducciones jurídicas oficiales ni el funcionamiento de los productos enlazados. El resultado sin incidencias de la revisión visual y funcional ha sido comunicado por el titular.
