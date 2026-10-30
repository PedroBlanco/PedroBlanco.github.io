# Paquete de revisión ES/EN · Eleventy

**Estado:** borrador generado para facilitar la revisión humana. **No supone aprobación de ninguna traducción.**

La revisión incluye los **10 bloques editoriales**: interfaz del sitio y nueve fichas. Cuando cambian los textos ES **o EN**, incluso apartados extensos, medios y recursos, las aprobaciones anteriores deben revisarse de nuevo.

## Cómo revisar

1. Comprobar correspondencia fiel entre ambas versiones, naturalidad inglesa, títulos, nombres propios y terminología.
2. Indicar correcciones en los archivos fuente (no únicamente en este documento): `src/data/content.json`, `src/content/es/*.md`, `src/content/en/*.md`.
3. Registrar la aprobación de cada bloque con `sourceDigest` y `targetDigest`, generados con `node scripts/check-translations.mjs --hashes`, y metadatos `reviewedBy` y `reviewedAt`. El registro está en `src/data/translation-review.json`.
4. Ejecutar `npm run check` y, antes del despliegue completo, `node scripts/check-translations.mjs --strict`. El reporte y los hashes cambian cuando cambie el contenido.

**Ninguna aprobación se concede por silencio ni por traducción automática.**

## Interfaz del sitio

| Clave | Español | Inglés |
|---|---|---|
| `name` | Español | English |
| `site` | Proyectos, herramientas y conocimiento | Projects, tools and knowledge |
| `tagline` | Software, investigación y archivo de proyectos | Software, research and project archive |
| `intro` | Herramientas utilizables, proyectos de desarrollo e investigación y una memoria accesible de trabajos anteriores. | Usable tools, development and research projects, and an accessible record of earlier work. |
| `nav.home` | Inicio | Home |
| `nav.tools` | Herramientas | Tools |
| `nav.projects` | Proyectos | Projects |
| `nav.archive` | Archivo | Archive |
| `nav.about` | Acerca de | About |
| `more` | Ver ficha | View details |
| `try` | Abrir herramienta / sitio | Open tool / website |
| `code` | Repositorio público | Public repository |
| `catalog` | Otros repositorios públicos | Other public repositories |
| `catalogInfo` | Catálogo complementario sincronizable con GitHub y sujeto a selección editorial. | Additional GitHub repository catalogue with editorial inclusion and exclusion rules. |
| `archiveInfo` | Fichas históricas y documentación preservada en sus rutas originales. | Historical profiles and documents preserved at their original URLs. |
| `aboutText` | Espacio personal para compartir herramientas de software, proyectos de investigación y trabajos anteriores. Los contenidos publicados no representan necesariamente a las organizaciones con las que he colaborado. | Personal space for sharing software tools, research projects and earlier work. Published content does not necessarily represent organizations I have worked with. |
| `featured` | Selección de trabajos | Selected work |
| `all` | Explorar | Explore |
| `year` | Archivo histórico | Historical archive |
| `status.active` | Activo | Active |
| `status.finished` | Finalizado | Finished |
| `status.historic` | Histórico | Historical |
| `kind.tool` | Herramienta | Tool |
| `kind.project` | Proyecto | Project |
| `kind.archive` | Archivo | Archive |
| `back` | Volver al listado | Back to overview |
| `offline` | Repositorio público | Public repository |
| `notFound` | Página no encontrada | Page not found |
| `notFoundBody` | La página puede haberse trasladado o retirado. Puedes consultar el archivo y los proyectos disponibles. | This page may have moved or been retired. Browse the archive and available projects instead. |
| `footer` | Sitio personal · Proyectos, herramientas y archivo | Personal site · Projects, tools and archive |
| `home.heroAction` | Explorar proyectos | Explore projects |
| `home.exploreTitle` | Explora el sitio | Explore the site |
| `home.exploreDescriptions.tools` | Aplicaciones y utilidades disponibles para usar. | Apps and useful software tools. |
| `home.exploreDescriptions.projects` | Desarrollo de software, investigación y repositorios públicos. | Software development, research and public repositories. |
| `home.exploreDescriptions.archive` | Proyectos anteriores y documentación preservada. | Earlier projects and preserved documentation. |
| `archiveView.title` | Archivo histórico | Historical archive |
| `archiveView.intro` | Proyectos históricos y recursos documentales organizados por períodos y categorías. | Historical projects and documentary resources organized by date and category. |
| `archiveView.all` | Todos | All |
| `archiveView.atlas` | Atlas | Atlases |
| `archiveView.initiatives` | Iniciativas | Initiatives |
| `archiveView.documents` | Documentos | Documents |
| `archiveView.undated` | Sin fecha verificada | Date not verified |
| `archiveView.count` | elementos | items |
| `archiveView.view` | Abrir ficha o recurso | Open page or resource |
| `archiveView.filtersLabel` | Filtrar por categoría | Filter by category |
| `resources.title` | Documentación y recursos | Documentation and resources |
| `resources.documentation` | Documentación | Documentation |
| `resources.downloads` | Descargas | Downloads |
| `resources.references` | Referencias | References |

## calculator: Calculadora de tiempo / Time calculator

| Elemento | Español | Inglés |
|---|---|---|
| title | Calculadora de tiempo | Time calculator |
| summary | Herramienta web para calcular periodos y méritos conforme al artículo 129 de la Ley 5/2023. | Web tool for calculating periods and service merits under Article 129 of Andalusian Law 5/2023. |
| detail | Aplicación web progresiva con lógica de cómputo de periodos. La ficha documenta su objetivo; el cálculo se realiza en la aplicación independiente. | Progressive web app that calculates time periods. This page describes the project; calculations are performed in a separate application. |

## signature: Generador de firmas / Email signature generator

| Elemento | Español | Inglés |
|---|---|---|
| title | Generador de firmas | Email signature generator |
| summary | Herramienta para generar firmas HTML de correo electrónico corporativo. | Tool for generating corporate HTML email signatures. |
| detail | Generador de firmas HTML con validación y escapado de los datos del formulario incorporados. Se mantiene la plantilla histórica hasta confirmar su identidad institucional y compatibilidad con clientes de correo. | HTML email signature generator with form input validation and HTML escaping. The historical template is retained; institutional branding and compatibility across email clients may still need separate checks. |

## pdf: PDF de fotos a imágenes / PDF photos to images

| Elemento | Español | Inglés |
|---|---|---|
| title | PDF de fotos a imágenes | PDF photos to images |
| summary | Extracción automática de fotografías individuales desde páginas PDF escaneadas. | Automatic extraction of individual photographs from scanned PDF pages. |
| detail | Utilidad Python FOSS para separar fotografías escaneadas, con corrección opcional de la inclinación. | FOSS Python tool to separate scanned photographs, with optional deskewing. |
| Recurso documentation · https://github.com/PedroBlanco/pdf-fotos-a-imagenes/blob/main/README.md | Instrucciones y requisitos de uso | Instructions and usage requirements |

### Descripción extendida — ES

Herramienta FOSS en Python que **extrae fotografías individuales de documentos PDF escaneados**, especialmente cuando varias fotos están separadas sobre una misma página.

### Cómo funciona

El programa renderiza las páginas del PDF mediante **pypdfium2**, detecta las regiones fotográficas con una versión adaptada de `autocrop`, recorta las imágenes y puede corregir automáticamente su inclinación. Permite exportarlas en formato JPEG o PNG.

### Requisitos y ejecución

Requiere **Python 3.11 o posterior** y las dependencias especificadas en el repositorio (entre ellas, pypdfium2, Pillow y NumPy). Tras instalar el paquete, un ejemplo sencillo es:

```sh
pdf-fotos-a-imagenes album.pdf
```

También admite varios documentos, carpetas y un directorio de salida personalizado. La documentación del repositorio detalla las opciones de calidad, resolución y calibración del fondo.

### Licencia

Distribuido como software libre bajo **GPL-3.0-only**. Consultar el repositorio y los avisos de terceros para las condiciones completas.


### Extended description — EN

FOSS Python tool for **extracting individual photographs from scanned PDF documents**, especially when multiple photos appear separately on a single page.

### How it works

The tool renders PDF pages using **pypdfium2**, detects photographs with an adapted `autocrop` implementation, crops them and can automatically correct their skew (tilt). It exports JPEG or PNG images.

### Requirements and usage

Requires **Python 3.11 or later** and the dependencies listed in the repository (including pypdfium2, Pillow and NumPy). After installing the package:

```sh
pdf-fotos-a-imagenes album.pdf
```

Multiple PDFs, folders and custom output directories are supported. The repository's documentation describes quality, resolution and background calibration options.

### License

Released as free software under **GPL-3.0-only**. See the repository and third-party notices for full licensing terms.


## csv: CSV2SQLite / CSV2SQLite

| Elemento | Español | Inglés |
|---|---|---|
| title | CSV2SQLite | CSV2SQLite |
| summary | Conversión de archivos CSV grandes a bases de datos SQLite por lotes. | Chunked conversion of large CSV files into SQLite databases. |
| detail | Utilidad de procesamiento de datos cuyo repositorio contiene el código y las instrucciones de uso. | Data-processing utility; its repository contains the code and usage instructions. |
| Recurso documentation · https://github.com/PedroBlanco/CSV2SQLite/blob/main/README.md | Guía y documentación del proyecto | Project guide and documentation |

### Descripción extendida — ES

Utilidad para **transformar archivos CSV grandes en bases de datos SQLite**, procesando las filas por lotes. Está orientada a archivos que resultan difíciles de abrir directamente en programas de hojas de cálculo.

### Uso

El script Python se ejecuta desde la terminal con un CSV como argumento:

```sh
python procesar_csv.py datos.csv
```

Permite elegir el nombre de la base de datos, mostrar el progreso y ajustar la cantidad de filas procesadas en cada lote:

```sh
python procesar_csv.py --db_name datos.db --chunksize 10 datos.csv
```

### Requisitos y consideraciones

Necesita Python 3 y las dependencias indicadas en el repositorio. La herramienta crea una tabla SQLite con una columna `id` y las columnas del CSV. Conviene revisar previamente la estructura y la codificación de los datos.


### Extended description — EN

Utility for **converting large CSV files into SQLite databases**, processing rows in chunks. It is intended for CSV files that are impractical to open directly in spreadsheet applications.

### Usage

Run the Python script from a terminal, passing the source CSV:

```sh
python procesar_csv.py data.csv
```

The database name, progress reporting and number of rows per processing chunk are configurable:

```sh
python procesar_csv.py --db_name data.db --chunksize 10 data.csv
```

### Requirements and considerations

Requires Python 3 and the dependencies documented in the repository. The utility creates one SQLite table containing an `id` column and the CSV columns. It is advisable to review the input structure and encoding before conversion.


## research: Narrativa adaptativa en videojuegos / Adaptive narrative in video games

| Elemento | Español | Inglés |
|---|---|---|
| title | Narrativa adaptativa en videojuegos | Adaptive narrative in video games |
| summary | TFG sobre un sistema reutilizable para explorar el bucle de adaptación narrativa y conectarlo a varios motores. | Bachelor's thesis exploring a reusable closed-loop narrative adaptation system and its integration with multiple game engines. |
| detail | Trabajo de investigación y desarrollo. La ficha pública se limita al objetivo y el enfoque general; el repositorio de trabajo es privado. | Research and development project. This public profile covers its purpose and high-level approach; the source repository is private. |
| Apartado `objetivos` — título | Objetivos | Goals |
| Apartado `objetivos` — texto | Diseñar e implementar un sistema reutilizable para explorar el bucle cerrado de adaptación narrativa y estudiar su integración con motores de juego existentes. | Design and implement a reusable system for exploring closed-loop narrative adaptation and study how it can be integrated with existing game engines. |
| Apartado `enfoque` — título | Enfoque | Approach |
| Apartado `enfoque` — texto | Separar el sistema de adaptación de los juegos conectados para estudiar distintas formas de observación, decisión y respuesta. La ficha presenta el enfoque general sin exponer material de trabajo privado. | Keep the adaptation system separate from connected games to study different ways of observing, deciding and responding. This page describes the general approach without disclosing private working materials. |
| Apartado `integracion` — título | Integración con motores | Game engine integration |
| Apartado `integracion` — texto | Examinar qué información pueden facilitar distintos motores y cómo podrían aplicarse intervenciones narrativas. Las capacidades concretas deben evaluarse en cada integración. | Examine which information different engines can expose and how narrative interventions might be applied. Specific capabilities must be assessed for each integration. |
| Apartado `estado` — título | Estado y documentación | Status and documentation |
| Apartado `estado` — texto | Proyecto de investigación y desarrollo en curso. Los resultados públicos se incorporarán después de su revisión editorial; el repositorio de trabajo no es público. | Ongoing research and development project. Public results will be added after editorial review; the working repository is not public. |
| Imagen — alt | Diagrama conceptual: juego o motor, observación, decisión y adaptación, unidos por retroalimentación. | Conceptual diagram: game or engine, observation, decision and adaptation, joined by feedback. |
| Imagen — caption | Esquema conceptual del bucle de adaptación, no evidencia de una implementación completa. | Conceptual adaptation loop, not evidence of a complete implementation. |

## mapas: Atlas de Conocimiento Crítico / Critical Knowledge Atlas

| Elemento | Español | Inglés |
|---|---|---|
| title | Atlas de Conocimiento Crítico | Critical Knowledge Atlas |
| summary | Proyecto histórico de mapas de conocimiento crítico. La versión oficial continúa en un sitio independiente. | Historical critical-knowledge mapping project. Its official version remains on an independent website. |
| detail | Se conserva una ficha contextual en lugar de la copia de la aplicación que antes se alojaba aquí. | This historical profile replaces the former local application copy. |
| Recurso documentation · /CC.html | Materiales de Conocimiento Crítico | Critical Knowledge resources |

## mapeo: Mapeo de Iniciativas Innovadoras (2019) / Innovation Initiatives Mapping (2019)

| Elemento | Español | Inglés |
|---|---|---|
| title | Mapeo de Iniciativas Innovadoras (2019) | Innovation Initiatives Mapping (2019) |
| summary | Prototipo de un mapa de iniciativas innovadoras en la administración pública. | Prototype for mapping innovation initiatives in public administration. |
| detail | Se conserva su historia, no la aplicación ni las antiguas exportaciones de participantes. | Only a historical description is retained, not the application or old participant data exports. |

## embajadores: Atlas de Embajadores del Conocimiento / Knowledge Ambassadors Atlas

| Elemento | Español | Inglés |
|---|---|---|
| title | Atlas de Embajadores del Conocimiento | Knowledge Ambassadors Atlas |
| summary | Prototipo histórico para representar comunidades y grupos de intercambio de conocimiento. | Historical prototype for visualizing knowledge-sharing communities and groups. |
| detail | Ficha histórica sin perfiles ni fotografías personales de la aplicación original. | Historical profile without the individual profiles or photographs from the former application. |

## art-of-hosting: El Arte de la Innovación Colaborativa / The Art of Collaborative Innovation

| Elemento | Español | Inglés |
|---|---|---|
| title | El Arte de la Innovación Colaborativa | The Art of Collaborative Innovation |
| summary | Atlas histórico vinculado a un taller de innovación colaborativa celebrado en 2023. | Historical atlas associated with a collaborative-innovation workshop in 2023. |
| detail | Se documenta el proyecto sin conservar la aplicación pública de perfiles de participantes. | The project is documented without retaining the participant-profile application. |
