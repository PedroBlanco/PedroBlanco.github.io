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

`npm run check` comprueba esta política; `check:publish` sigue bloqueado
hasta cerrar la revisión de las migraciones, traducciones y privacidad.

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

## Calculadora de tiempo (repositorio de origen privado)

El proyecto privado `PedroBlanco/calculadora-tiempo` ya genera su
distribución pública mediante `npm run build:web`. Para incluir **solo
esa distribución** en una compilación local de Eleventy:

```powershell
# En el clon local de calculadora-tiempo:
npm ci
npm run build:web

# En el clon público de PedroBlanco.github.io, rama prototype/eleventy-bilingual:
cd prototype
$env:CALCULADORA_WEB_DIST = "C:\\ruta\\a\\calculadora-tiempo\\dist"
npm run build
npm run check
```

El integrador comprueba exactamente los 16 archivos de ejecución, incluido
`ui.js`, `src/areas.js`, `src/deadlines.js`, el SW construido y
`.nojekyll`. No accede al código de test ni a las carpetas internas del
repositorio privado, no publica credenciales y no hace push.

Sin la variable de entorno, la integración no se realiza y la ruta queda
señalada como pendiente. La CI pública **no tiene acceso** al repositorio
privado. Antes de producción será necesario aportar un artefacto aprobado
a la compilación definitiva, con controles de procedencia y revisión.

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

**No se ha adaptado ni probado todavía un ZIP real de la calculadora al
contrato v1:** esa es la siguiente fase, separada de este commit.
El antiguo integrador ad hoc sigue sin modificaciones funcionales y
el despliegue en `master` continúa deshabilitado.

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
