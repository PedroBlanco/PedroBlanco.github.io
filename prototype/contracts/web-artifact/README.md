# Contrato de artefacto web 1.0.0 · `web-artifact-v1`

**Estado:** contrato documentado y verificable en la rama experimental de Eleventy; **todavía NO integrado con una distribución real de calculadora-tiempo ni autorizado para publicación**.

## Objetivo y límites

Cada repositorio de herramienta produce una **distribución web estática autónoma**.
El sitio web la incorpora después de comprobar su identidad, integridad y compatibilidad.
La herramienta **no** recibe permisos de escritura sobre el repositorio web ni sobre GitHub Pages.

- Especificación interna versionada, **no estándar sectorial**: JSON Schema [Draft 2020-12](https://json-schema.org/draft/2020-12/) + reglas semánticas y operativas.
- El contrato es independiente de npm, Python, PHP o cualquier herramienta de compilación.
- Herramientas privadas: se entrega **solamente** el artefacto web, nunca el código privado, credenciales ni los archivos de desarrollo.
- Entrega obligatoria de **dos elementos distintos**: `web-artifact.json` (manifiesto) y un archivo ZIP de la distribución. El manifiesto permanece **FUERA** del ZIP: así no se crea una dependencia circular con el resumen del paquete.

## Campos de `web-artifact.json`

| Campo | Obligación | Significado |
|---|---|---|
| `schemaVersion` | Sí | Exactamente `1.0.0` |
| `id` | Sí | Identificador estable en minúsculas, números y guiones |
| `version` | Sí | Versión de la herramienta conforme a SemVer 2.0.0 |
| `basePath` | Sí | Siempre `/${id}/`; el sitio reserva esa ruta |
| `entryPoint` | Sí | `index.html`, en la raíz del ZIP |
| `type` | Sí | `static` o `pwa` |
| `source.repository` | Sí | Repositorio de origen `owner/name` |
| `source.commit` | Sí | SHA Git completo (40 dígitos hexadecimales) del origen validado |
| `artifact.format` | Sí | `zip` |
| `artifact.filename` | Sí | Nombre único del archivo ZIP |
| `artifact.sha256` | Sí | SHA-256 hexadecimal en minúsculas **del ZIP, no de la carpeta** |
| `artifact.sizeBytes` | Sí | Número exacto de bytes del ZIP |
| `pwa` | Solo PWA | `manifest`, `serviceWorker` (rutas relativas al ZIP) y `scope` idéntico a `basePath` |

No se admiten campos desconocidos: los cambios se negocian y versionan.
Los ejemplos JSON incorporados son **sintéticos**, con SHA-256 y tamaño ficticios. No son paquetes válidos ni prueban la calculadora.

## Contrato del ZIP y del repositorio de origen

1. El ZIP contiene directamente `index.html` y todos los recursos estáticos del proyecto, **sin directorio `dist/` exterior**. No contiene el manifiesto externo.
2. Se incluyen solo archivos de ejecución explícitamente permitidos. Se excluyen claves, tokens, `.env`, datos personales, `.git`, pruebas internas y carpetas de dependencias no necesarias en tiempo de ejecución.
3. Todas las entradas deben ser rutas relativas limpias: sin `../`, absolutas, enlaces simbólicos, archivos especiales, duplicados, ni extracción fuera del destino. Un validador de ZIP deberá rechazar estos casos **antes de integrar** (fase siguiente).
4. Referencias a CSS, JS y recursos válidas cuando el sitio esté servido en `basePath`. Evitar rutas al dominio raíz que pertenezcan a otra aplicación.
5. Las PWA restringen su manifiesto y su service worker al subdirectorio asignado, y usan versiones de caché compatibles con actualizaciones.
6. El repositorio de origen documenta el comando para pruebas y compilación, genera la distribución de manera repetible e identifica qué commit la produjo.
7. El sitio mantiene un **registro de versiones aprobadas por identificador**, con un solo dueño por ruta. La publicación construye el sitio completo de manera atómica, sin permitir que un artefacto sobrescriba otro.
8. El sistema de publicación conserva el paquete anterior para reversión. Ningún comando de generación incluye `git push`, merges ni despliegues implícitos.

**Seguridad:** un hash no prueba quién creó el ZIP si el valor proviene del mismo archivo no fiable. La versión aprobada, el commit de origen y el resumen deben contrastarse con un registro/canal autorizado. Las attestations y el SBOM se podrán añadir en una versión posterior, sin afirmarlos disponibles ahora.

## Etapas de validación

| Etapa | Control | Disponible |
|---|---|---|
| Metadatos | JSON Schema 2020-12, SemVer, `basePath=id`, ámbito PWA | Sí, `validate-web-artifact.mjs` |
| Integridad | Calcular SHA-256 y tamaño del ZIP local indicado y cotejarlos con el manifiesto | Sí, opción `--artifact` |
| Procedencia | Corroborar commit/origen contra el registro de versión **aprobada** | Pendiente |
| ZIP | Inspección de entradas, permisos, rutas, tamaño y extracción contenida (solo prueba) | **Prototipo** |
| Integración | Copiar a ruta aislada, revisar manifiesto y scope PWA, rechazar colisiones | **Prototipo** |
| Publicación | Pruebas de sitio completo, revisión de PR y autorización explícita | Pendiente |

Los controles que faltan son bloqueantes para admitir paquetes de terceros como distribuciones de producción. Validar el esquema **no implica** aprobar un artefacto.

## Compatibilidad y evolución

- `schemaVersion=1.0.0` define el formato: **cambios incompatibles** requieren una versión mayor del contrato y otro esquema.
- Correcciones aclaratorias sin cambio de significado pueden documentarse conservando 1.0.0.
- La `version` del software es independiente de `schemaVersion`.
- Los publicadores deben **rechazar versiones del contrato que no conocen**, en vez de interpretarlas parcialmente.

## Uso local (sin publicación)

Desde `prototype/`, tras `npm install`:

```sh
npm run test:contract
node scripts/validate-web-artifact.mjs contracts/web-artifact/v1.0.0/examples/static.example.json
node scripts/validate-web-artifact.mjs ruta/al/web-artifact.json --artifact ruta/al/paquete.zip
```

El segundo ejemplo solo valida estructura; el tercero valida estructura **y los bytes de su ZIP**. Las pruebas unitarias incluyen casos válidos y rechazos. Ninguno ejecuta despliegues.

## Siguiente fase acordada

**Prueba realizada:** `PedroBlanco/calculadora-tiempo` entrega ZIP y
manifiesto desde `npm run package:web`. La CI privada verificó la
distribución real con este contrato y la integró en Eleventy de forma
aislada. La PR #52 se fusionó y la versión runtime se publicó por la
PR #7 sin desplegar aún el rediseño de Eleventy. Pendiente: registro
central de versiones aprobadas y pruebas PWA instalables/offline.

## Integrador experimental para calculadora-tiempo

El módulo `scripts/integrate-web-artifact.mjs` valida el ZIP **antes** de
extraerlo a la distribución Eleventy y exige `WEB_ARTIFACT_EXPECTED_SHA`
como commit de origen autorizado por el llamante. Solo admite
`PedroBlanco/calculadora-tiempo` y su ruta asignada, rechaza symlinks,
rutas peligrosas, entradas duplicadas, archivos especiales, límites de
descompresión y sobrescrituras. Usa una carpeta temporal y no publica.

Se trata de una prueba de integración, no de una garantía completa de
procedencia: la procedencia ha de verificarse en una CI de confianza, y el
registro de versiones aprobadas se desarrollará antes del despliegue.
