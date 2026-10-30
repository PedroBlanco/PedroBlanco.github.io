# Diseño del sitio · Eleventy (11ty)

Este documento registra las decisiones editoriales y visuales confirmadas para
la nueva web personal. **El prototipo no se ha desplegado en GitHub Pages.**

## Diseño acordado

| Decisión | Estado | Acuerdo |
| --- | --- | --- |
| 22 | Provisional | «Archivo contemporáneo»: fondo `#F7F0E6`, texto `#342D2A`, principal `#794654`, acento `#9D7029`. Modo oscuro equivalente. |
| 23 | Confirmado | Títulos serif (Georgia/Cambria), texto sans-serif del sistema, sin fuentes descargadas. |
| 24 | Confirmado | Tarjetas medianas responsivas, títulos, categoría, estado, resumen breve y enlace. |
| 25 | Confirmado | Imágenes solo cuando aporten información; texto alternativo, pie y revisión de derechos. |
| 26 | Confirmado | Portada editorial: introducción breve, tres trabajos destacados, accesos a Herramientas, Proyectos y Archivo. |
| 27 | Confirmado | Archivo cronológico descendente con filtros de Atlas/Iniciativas/Documentos, sin fechas inventadas. |
| 28 | Confirmado | Fichas como artículos; índice contextual solo para las extensas, lateral en escritorio y superior en móvil. |
| 29 | Confirmado | Acciones principales al inicio y recursos verificados agrupados por tipo al final. |
| 30 | Confirmado | Menú móvil nativo con `details/summary`, selector de idioma permanentemente visible, cinco entradas. |

## Accesibilidad y rendimiento

- Todos los destinos de navegación siguen disponibles sin JavaScript.
- Los controles móviles y de idioma tienen objetivos táctiles de al menos 44 px.
- El menú funciona mediante HTML nativo, con etiquetas ES/EN.
- Texto y controles usan variables de color comprobadas en modo claro/oscuro.
- Sin bibliotecas JS de interfaz ni fuentes remotas.
- Las imágenes editoriales son opcionales y sirven para informar, no para rellenar.
- El Archivo muestra todas las entradas sin JS; los filtros son una mejora progresiva.

## Pruebas visuales pendientes (manuales)

- Anchos de 320, 360, 375, 768, 1024 y 1440 px, orientación horizontal/vertical.
- Menú abierto/cerrado con teclado, lector de pantalla y clic/tacto.
- Comprobar que selector EN/ES permanece visible y lleva a la versión equivalente.
- Modo oscuro/claro y preferencias de reducción de movimiento.
- Portada, catálogos, archivo con filtros, ficha corta y ficha larga en ambos idiomas.
- Ausencia de recortes/solapamientos y contraste real en navegadores actuales.
- Verificar contenido editorial y permisos de cada imagen antes de publicar.

## Vista previa

La PR de Eleventy ejecuta compilación y controles automáticos. El workflow
incluye como artefacto descargable el directorio `prototype/dist`, sin desplegarlo.
Para visualizar sus rutas absolutas correctamente, alojar localmente el directorio
en la raíz de un servidor HTTP. Por ejemplo, tras ejecutar `npm run build`:

```sh
cd prototype/dist
python -m http.server 8000
```

Después abrir `http://localhost:8000/` o `http://localhost:8000/en/`.
Si se descarga el artefacto del workflow, descomprimirlo primero y servir
ese directorio. Abrir `index.html` por `file://` no es una prueba válida:
la web emplea rutas absolutas desde `/`.

## Antes de publicar

Revisión editorial de las traducciones, auditoría de privacidad e historial,
conservación de documentos y las herramientas originales, revisión selectiva de
las rutas históricas, validación visual real en navegadores y plan de reversión.
No fusionar la PR de prototipo directamente en `master`.
