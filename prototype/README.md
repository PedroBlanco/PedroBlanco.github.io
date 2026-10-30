# Eleventy (11ty) · Renovación del sitio personal (prototipo)

**Tecnología elegida:** Eleventy 3.1.7. La variante Astro se conserva únicamente
como referencia de la comparación previa. **No se ha desplegado ni fusionado nada
en master.** El código de este prototipo reside en `prototype/`.

## Ejecutar y verificar

```sh
cd prototype
npm install
npm run build
npm run check
npm run test:migration
npm run check:publish
```

`npm run dev` inicia la vista previa local. Durante la transición se distinguen
**tres niveles de pruebas**, sin duplicar la revisión histórica en cada cambio:

| Comando | Uso | Vigencia |
| --- | --- | --- |
| `npm run check` | Rutas actuales a partir del catálogo, 404, enlaces, contraste, ES/EN, informe bilingüe y contratos de herramientas | Permanente, para actualizaciones ordinarias |
| `npm run test:migration` | Preservación de originales, salida heredada, calculadora publicada, 15 medios autorizados y crucigramas concretos | Temporal, hasta cerrar y verificar la migración |
| `npm run check:publish` | Ejecuta los dos anteriores y añade bloqueos estrictos de migración, herramientas, traducciones y medios | Obligatorio antes de publicar la PR #4 |

Los contenidos nuevos **no requieren tests personalizados por fichero**: bastan
los controles generales; solo se añaden pruebas de lógica si aparece una
funcionalidad nueva. `check:publish` seguirá bloqueado mientras haya traducciones
o entradas de migración pendientes, aunque `check` sea correcto. Ninguna
aprobación ES/EN se concede automáticamente; se documenta en
`src/data/translation-review.json` con huellas de ambos idiomas.

**Retirada prevista (issue [#11](https://github.com/PedroBlanco/PedroBlanco.github.io/issues/11)):** tras fusionar y comprobar la nueva web, archivar
`test:migration` y retirar sus pruebas del CI y la puerta de publicación.
Conservar el inventario editorial y la evidencia sin convertirlos en tests
recurrentes. La retirada exige verificar que no se pierde ningún control
general de enlaces, seguridad o publicación.

## Cierre editorial y publicación con rama gh-pages

Tras la revisión de 30/10/2026 se aprobaron las dos páginas históricas adaptadas
(`CC.html` y `KM2024.html`), la conservación de `KM2024.md` **solo en Git**
y el mantenimiento del generador `piefirma/` con sus diez ficheros.
Los enlaces a los 15 materiales históricos autorizados se ofrecen sin
distribuir los recursos de referencia exclusivamente histórica.

La revisión ES/EN **asistida** de los diez bloques se documenta en
[`TRANSLATION_REVIEW_SUMMARY.md`](TRANSLATION_REVIEW_SUMMARY.md); las
correcciones propuestas se muestran íntegramente en
[`TRANSLATION_REVIEW.md`](TRANSLATION_REVIEW.md).
**No hay aprobación de traducciones registrada:** el titular debe validar
la versión definitiva antes de generar los hashes de revisión.

El modelo aprobado es compilar **localmente en Windows (PowerShell)** y enviar
únicamente los archivos `prototype/dist/` a `gh-pages` con `.nojekyll`;
se evita la compilación habitual con GitHub Actions. El workflow de Eleventy
queda exclusivamente bajo ejecución manual. Guía de validación, envío y
reversión: [`PUBLISHING.md`](PUBLISHING.md).

```powershell
# Desde prototype/; solo valida, no publica
.\scripts\publish-gh-pages.ps1

# SOLO tras aprobar traducciones, fusionar los cambios y superar check:publish
.\scripts\publish-gh-pages.ps1 -Publish
```

GitHub Pages requiere configurar explícitamente el origen `gh-pages / (root)`
desde su interfaz. GitHub seguirá realizando su propio despliegue interno
de Pages aunque no se use un workflow personalizado de compilación.

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

## Tarjetas de catálogo · Decisión 24 (confirmada)

**Distribución equilibrada:** tarjetas medianas y adaptables, con título,
categoría, estado, resumen breve y enlace a la ficha. En pantallas anchas,
cuadrícula de hasta tres columnas para la anchura actual del contenedor
(1120 px); en móvil, una columna. Los resúmenes se redactan breves desde los
datos de contenido, sin truncar texto mediante CSS.

La portada puede presentar una selección con mayor énfasis editorial y el
Archivo una disposición cronológica.

## Imágenes selectivas · Decisión 25 (confirmada)

Se muestran imágenes en tarjetas solo si aportan información y se dispone
de un recurso verificado. Si falta la imagen, la tarjeta permanece tipográfica
sin dejar un espacio vacío. Las ilustraciones se declaran en
`src/data/content.json` como `media.es` y `media.en`, con ruta local,
texto alternativo y pie explicativo.

Incluimos un esquema conceptual bilingüe original en el TFG: no pretende
ser una captura de ejecución ni demuestra que el bucle esté implementado.
Las demás tarjetas mantienen su diseño tipográfico, pendientes de recursos
reales revisados. Antes de añadir capturas o imágenes documentales, revisar
privacidad, autoría, licencias, textos alternativos y optimización.

## Portada editorial equilibrada · Decisión 26 (confirmada)

La portada en ambos idiomas contiene una introducción breve con CTA a Proyectos,
una selección de tres fichas representativas (herramienta, investigación e
histórico) y una fila de **tres accesos** a Herramientas, Proyectos y Archivo.
La selección se configura editorialmente mediante `featured`, sin ordenar
automáticamente solo por fecha. Las tarjetas mantienen la densidad media
(decisión 24) y las imágenes selectivas (decisión 25).
El comportamiento móvil de los enlaces a secciones es de una sola columna.
No se añade JavaScript a la portada para este comportamiento.

## Archivo histórico · Decisión 27 (confirmada)

Archivo cronológico descendente con filtros por **Atlas**, **Iniciativas** y
**Documentos**, traducidos al español y al inglés. La cronología muestra primero
2023 y 2019, y aparta en «Sin fecha verificada» los materiales y proyectos
para los que todavía no se dispone de una fecha documental contrastada.

Los filtros se activan mediante un script pequeño y accesible: sin JavaScript
todos los materiales permanecen visibles en la cronología; con él, los botones
indican su estado mediante `aria-pressed` y anuncian el número de resultados.
Los metadatos se editan en `src/data/content.json`, con `archiveYear` y
`archiveCategory` para los proyectos, y `archiveDocuments` para otros archivos.
No se recopilan datos de uso ni se llama a servicios externos.

**Nota de migración:** los enlaces a documentos originales siguen apuntando a
las rutas acordadas, aunque todavía no se han trasladado esos archivos al
directorio compilado del prototipo. Serán preservados antes de publicar.

## Fichas detalladas · Decisión 28 (confirmada)

Las fichas son artículos continuos con estructura semántica.
Solo las extensas (tres o más secciones temáticas opcionales) incluyen
índice contextual con enlaces a anclas HTML y sin dependencia de JavaScript.
En escritorio, el índice permanece en una columna lateral mientras se lee;
en móvil aparece antes del contenido, como un bloque normal.
El índice usa etiquetas accesibles en español e inglés.

Las secciones opcionales se modelan en `src/data/content.json`
(`sections: [{id, es: {title,body}, en: {title,body}}]`).
Los ID permanecen estables entre idiomas. La ficha del TFG utiliza esta
estructura con objetivos, enfoque, integración y estado, sin revelar los
materiales de un repositorio privado. Las fichas breves permanecen sin índice.

## Enlaces y recursos · Decisión 29 (confirmada)

Los accesos principales a aplicaciones y repositorios públicos aparecen
antes del contenido. Si una ficha carece de ellos, no se dibuja un bloque
vacío. Los recursos complementarios se presentan **al final** del artículo,
agrupados bajo Documentación, Descargas y Referencias, mostrando únicamente
los grupos no vacíos. En fichas extensas, el índice contextual enlaza también
a la sección de recursos cuando existe.

El campo editorial opcional `resources` es una lista de objetos
`{type,href,es:{label},en:{label}}`, con tipos
`documentation`, `downloads`, `references`. Se exigen etiquetas
traducidas, enlaces HTTPS o internos absolutos seguros y ausencia de
duplicados con los accesos principales. El validador CI comprueba
los recursos disponibles y el HTML generado.

Para demostrar la funcionalidad se han enlazado **README públicos
existentes** de CSV2SQLite y pdf-fotos-a-imagenes, y la página histórica
`/CC.html` desde Atlas de Conocimiento Crítico (a incorporar al despliegue
definitivo). No se inventan descargas ni materiales del TFG privado.

## Navegación adaptable · Decisión 30 (confirmada)

En escritorio aparecen las cinco secciones de forma directa. En móvil y
tableta estrecha (hasta 1020 px) se utiliza un desplegable semántico
`<details><summary>` que presenta las mismas cinco rutas, con etiquetas
traducidas y el estado actual indicado mediante `aria-current="page"`.
El selector de idioma ES/EN queda siempre visible **fuera** del desplegable.
Los controles mantienen una altura táctil mínima de 44 px. El menú funciona
sin JavaScript y permite navegación con teclado.

En espacios estrechos se acorta únicamente la marca visual del encabezado a
`PedroBlanco`; no se oculta ninguna sección ni el selector de idioma.
La verificación de CI revisa ambas versiones y cinco destinos principales.

## Contenido y catálogo

Las rutas, fichas y traducciones provisionales están en
`src/data/content.json`. Los repositorios públicos se sincronizan desde GitHub
antes de `npm run build`; si falla la API, se conserva el snapshot local.
La selección editorial se gestiona en `src/data/editorial.json`.

## Guía consolidada de diseño

Consultar `DESIGN.md` para el registro de las decisiones 22–30,
las comprobaciones visuales pendientes y la visualización local del artefacto
de GitHub Actions. La personalización principal está acordada; no se requiere
añadir decisiones menores antes de revisar la implementación en navegador.

## Migración selectiva de archivos históricos

El inventario está en `src/data/migration-manifest.json`. `npm run build` copia
exclusivamente archivos de estado `preview` y SHA Git conocido, sin copiar
carpetas antiguas. Esta vista previa no implica aprobación de publicación.

Se ha incorporado provisionalmente `CC.html`, verificando su integridad.
`KM2024.html` está pendiente por enlaces de edición de Canva; las aplicaciones
`piefirma/` y `calculadora-tiempo/` requieren adaptación propia. Las carpetas
retiradas con perfiles personales o exportaciones quedan excluidas.

`npm run test:migration` comprueba esta política mientras dura la transición;
`check:publish` añade los controles estrictos que impiden publicar una
migración o traducción pendiente.

## Actualización manual de contenidos Markdown

Las fichas de **pdf-fotos-a-imagenes** y **CSV2SQLite** usan un texto
editorial en archivos Markdown separados:
`src/content/es/pdf.md`, `src/content/en/pdf.md`,
`src/content/es/csv.md` y `src/content/en/csv.md`.
Sus títulos, resúmenes y enlaces permanecen en `src/data/content.json`.

Para actualizar una descripción extensa basta con editar el archivo Markdown,
revisar su traducción y ejecutar `npm run build && npm run check`.
La conversión usa `markdown-it` con HTML crudo desactivado y sin dependencias
de navegador. Los comandos y ejemplos se muestran como bloques de código.
Las revisiones humanas siguen siendo necesarias antes de publicar.

## Auditoría de enlaces internos y recursos pendientes

El comando `npm run audit:links` comprueba los enlaces y recursos de las páginas
HTML generadas, incluidas referencias absolutas a
`https://pedroblanco.github.io/`. Informa de las rutas que todavía no se
incluyen en la distribución. No impide probar el prototipo porque las
herramientas y parte del archivo multimedia están deliberadamente pendientes
de migrar; sin embargo, `check:publish` sí bloquea la publicación cuando
quedan enlaces locales sin resolver.

**La validación visual del prototipo bilingüe está aceptada por el titular**
(26/10/2026). No implica que la migración de contenidos o privacidad
estén aprobadas; esos controles continúan pendientes.

## Auditoría documentada

Consultar `MIGRATION_AUDIT.md` para el inventario de materiales, riesgos,
rutas pendientes y pasos necesarios antes de publicar.

## Calculadora de tiempo (repositorio privado, contrato v1)

La versión aprobada de `PedroBlanco/calculadora-tiempo` genera el ZIP y
el manifiesto externo con `npm run package:web`. La integración en
Eleventy utiliza **solo** ese artefacto, no una copia del directorio Git.

En Windows, con los dos repositorios clonados, desde
`prototype/` en la rama experimental:

```powershell
.\scripts\build-with-calculator.ps1 -CalculatorRepository "C:\ruta\calculadora-tiempo"
```

El asistente comprueba la rama y el estado de Git, ejecuta pruebas,
genera `web-artifact.json` y el ZIP y verifica la integración.
Sin publicar, y sin transferir archivos del repositorio privado a
la web salvo los recursos de ejecución aprobados.

La CI privada realizó una integración real completa sin desplegar.
En el CI público, al no proporcionarse ZIP autenticado, la herramienta
se omite de la vista previa, sin bloquear la compilación de diseño.

## Contrato común de distribuciones web · web-artifact 1.0.0

El formato de integración de herramientas está formalizado en
`contracts/web-artifact/README.md`, con JSON Schema Draft 2020-12,
ejemplos de herramienta estática y PWA, validador e integridad SHA-256
(opcionalmente contra un ZIP real).

Comprobar su implementación independiente de la calculadora con:

```sh
npm run test:contract
node scripts/validate-web-artifact.mjs contracts/web-artifact/v1.0.0/examples/calculadora-pwa.example.json
```

**Ya se ha probado el ZIP real y su integración estática.**
El integrador especial anterior se ha retirado. La calculadora fue
publicada incrementalmente por la PR #7, sin publicar todavía Eleventy.

## Integrador de web-artifact (solo vista previa)

`npm run integrate:artifact -- --manifest <ruta.json> --artifact <ruta.zip>`
incorpora un paquete previamente construido únicamente si las variables
`WEB_ARTIFACT_EXPECTED_SHA` (commit de origen validado externamente) y
`WEB_ARTIFACT_SITE_DIST` (salida, por defecto `dist`) son coherentes.

El validador limita número de archivos, tamaño, rutas, modo ZIP y scope PWA;
rechaza sobrescribir carpetas. El componente todavía está limitado a
`calculadora-tiempo`, sin publicación automática. Los ensayos sintéticos
se ejecutan con `npm run test:integration`.

## Primera integración real del contrato: calculadora-tiempo

El ZIP `calculadora-tiempo-0.1.0.zip` y su manifiesto v1.0.0 se han
generado y validado dentro de la CI del **repositorio privado**, y el
integrador de esta rama los ha incorporado a una distribución Eleventy
de revisión, sin publicar el sitio.

Resultados verificados (ejecución privada
`PedroBlanco/calculadora-tiempo/actions/runs/40496459816`):
- 99 pruebas de la calculadora, 6 pruebas del contrato y 4 del integrador.
- Integración de 16 archivos de ejecución bajo `/calculadora-tiempo/`.
- Comprobación de procedencia contra el commit esperado de la PR.
- Desaparece la ruta de la calculadora del informe de enlaces faltantes:
  quedan 4 destinos heredados sin migrar.
- Artefacto de revisión privada `eleventy-with-calculadora-preview`.

**Pendiente:** aprobación funcional del usuario en navegador, instalación
y uso sin conexión, upgrade de SW, política definitiva de versiones
aprobadas y revisión de las demás rutas. Los cambios siguen en
las PR de borrador [sitio #4](https://github.com/PedroBlanco/PedroBlanco.github.io/pull/4)
y [calculadora #52](https://github.com/PedroBlanco/calculadora-tiempo/pull/52).
Seguimiento en [issue #6](https://github.com/PedroBlanco/PedroBlanco.github.io/issues/6).

## Integración única mediante web-artifact

La compilación Eleventy utiliza ahora `scripts/stage-approved-tools.mjs`
como receptor único de paquetes aprobados. El antiguo integrador de archivos
específico de la calculadora se ha retirado. Para aportar un paquete real
se usan conjuntamente `WEB_ARTIFACT_MANIFEST`, `WEB_ARTIFACT_ZIP`
y `WEB_ARTIFACT_EXPECTED_SHA`: el sistema valida formato, integridad,
procedencia declarada y archivo ZIP, y limita la extracción a su directorio.

El asistente PowerShell `scripts/build-with-calculator.ps1` usa ya
`npm run package:web`, comprueba que el origen no tenga cambios locales
sin confirmar e integra por el nuevo contrato; no efectúa despliegues.

El control de procedencia definitivo debe reforzarse con un registro de
commits aprobados; por ahora el SHA esperado lo suministra explícitamente
el operador o una CI autorizada.

## Actualización incremental de documentos y firmas

Se han incorporado al prototipo las versiones publicadas y revisadas de
`KM2024.html` y `piefirma/`. El documento conserva su ruta tras eliminar
dos enlaces de edición de terceros. El generador se copia mediante una
lista fija de **diez archivos runtime** con SHA Git comprobado, excluyendo
documentación y cualquier carpeta no autorizada. Se preserva el aspecto de
la herramienta original; quedan pendientes los clientes de correo y la
validación de marca institucional.

Los archivos se toman del mismo repositorio, en sus rutas heredadas, y
el build comprueba que no han cambiado desde la revisión. La vista previa
de Eleventy queda todavía bloqueada para publicación completa.

## Inventario verificable de archivos históricos

`MEDIA_REVIEW.md` documenta los **23 archivos físicos** del inventario
histórico: **15 originales aprobados** para distribución por el titular y
**8 entradas retiradas** de la distribución original (7 referencias históricas
y la portada sustituida). La selección editorial de 22 materiales está cerrada.
Los hashes, tamaños y decisiones constan en `src/data/media-review.json`.
`npm run audit:media` se ejecuta en `test:migration` durante la transición:
verifica integridad, copia de aprobados y exclusión de retirados.

## Revisión editorial bilingüe verificable

`TRANSLATION_REVIEW.md` ofrece una comparación ES/EN de la interfaz,
fichas y documentación Markdown. Las aprobaciones se registran por
bloque en `src/data/translation-review.json`, conservando **dos hashes**
por bloque, uno ES y otro EN, e identificando al revisor y la fecha.

`node scripts/check-translations.mjs --hashes` imprime los hashes,
pero **no marca nada como aprobado**. Si cambia cualquier idioma,
apartado extenso o recurso, el bloque vuelve a revisión.

## Portada segura del archivo de revista

La ruta histórica `/revista/` dispone de una portada documental
curada en `src/curated/revista/index.html` que sustituye una maqueta
inacabada. Los originales aprobados se copian en sus rutas históricas
con verificación de hashes; las referencias musicales no se distribuyen.
El inventario editorial ya está cerrado.

## Puertas de publicación basadas en evidencias

El comando `check:publish` no utiliza ya un fallo incondicional:
identifica las entradas pendientes en el inventario de migración,
los medios sin autorización, los enlaces rotos y los bloques de
traducción aún sin revisión. Ningún recurso pasa a `approved`
por estar disponible en la web antigua; los 15 originales aprobados
tienen autorización manual expresa.

Los archivos autorizados deben incluir `reviewedBy`, `reviewedAt`
y `evidence` de derechos y privacidad. En la salida final se
comprueba también el hash de los recursos aprobados.

## Calculadora ya publicada como distribución de referencia

El prototipo incluye ahora por defecto la **versión pública aprobada**
de `/calculadora-tiempo/` (PR #7). La lista cerrada de dieciséis archivos
con tamaños y hashes Git está en `src/data/published-calculator.json`.
El script `stage-published-calculator.mjs` solo copia esos archivos,
rechaza añadidos, sustituciones y enlaces simbólicos y no modifica
la aplicación publicada.

Cuando se aporta un ZIP y manifiesto con las tres variables
`WEB_ARTIFACT_MANIFEST`, `WEB_ARTIFACT_ZIP` y
`WEB_ARTIFACT_EXPECTED_SHA`, **se usa el integrador genérico**
en lugar de la versión de referencia. El fallback no reconstruye la
aplicación ni recupera código del repositorio privado.

## Enlaces históricos y cierre editorial

`CC.html` y `KM2024.html` mantienen por ahora sus referencias documentales
anteriores a la autorización de distribución. La inclusión de los 15 archivos
aprobados en la compilación no implica que ya se hayan actualizado todos los
enlaces y textos históricos: esa coherencia se verifica antes de publicar.
Las siete referencias históricas sin distribución continúan excluidas.

El conjunto `test:migration` comprueba temporalmente estos casos concretos.
`npm run check` verifica los enlaces y la estructura general de forma
reutilizable para las siguientes actualizaciones de la web.

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
