# Diseño del sitio · Eleventy (11ty)

Este documento registra las decisiones editoriales y visuales de
la nueva web personal, incluida la paleta provisional en revisión. **El código Eleventy está integrado en `master`, pero el despliegue de la nueva web sigue pendiente.**

## Diseño acordado

| Decisión | Estado | Acuerdo |
| --- | --- | --- |
| 22 | Bruma del Alba (rama de diseño) | Se mantiene «Archivo contemporáneo» con azul bruma `#EDF3F7`, tinta azul `#202F46`, azul petróleo `#245E80`, coral `#C76B51` y variante oscura automática (`#18243A`, `#F4F6FA`, `#9EC5DD`, `#F0AF91`). Pendiente validar la nueva vista previa antes de publicar. |
| 23 | Confirmado | Títulos serif (Georgia/Cambria), texto sans-serif del sistema, sin fuentes descargadas. |
| 24 | Confirmado | Tarjetas medianas responsivas, títulos, categoría, estado, resumen breve y enlace. |
| 25 | Confirmado | Imágenes solo cuando aporten información; texto alternativo, pie y revisión de derechos. |
| 26 | Confirmado | Portada editorial: introducción breve, tres trabajos destacados, accesos a Herramientas, Proyectos y Archivo. |
| 27 | Confirmado | Archivo cronológico descendente con filtros de Atlas/Iniciativas/Documentos, sin fechas inventadas. |
| 28 | Confirmado | Fichas como artículos; índice contextual solo para las extensas, lateral en escritorio y superior en móvil. |
| 29 | Confirmado | Acciones principales al inicio y recursos verificados agrupados por tipo al final. |
| 30 | Confirmado | Menú móvil nativo con `details/summary`, selector de idioma permanentemente visible, cinco entradas. |

## Control de color añadido antes del lanzamiento

Se añade un botón accesible junto al selector ES/EN con tres estados:
`Sistema`, `Claro` y `Oscuro`. Sin preferencia guardada rige el sistema;
el primer clic cambia al aspecto contrario, y se puede volver a `Sistema`.
Se recuerda la elección manual en `localStorage` sin necesidad de conexión,
y los cambios del sistema se respetan siempre que no exista selección manual.
El modo claro u oscuro se aplica antes de cargar la CSS para evitar saltos de
color. En móvil se usa la versión compacta del botón, manteniendo su
nombre accesible y una superficie táctil mínima de 44 px.

La demostración `preview/bruma-del-alba.html` también incluye el botón
operativo. Las rutas Eleventy utilizan la misma hoja de estilo y el mismo
control; las páginas documentales independientes siguen sin scripts para
preservar su carácter de archivo estático. Los diagramas SVG bilingües tienen
variantes fijas en caso de selección manual.

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

El nuevo color puede revisarse sin modificar la web pública desde la rama
`design/bruma-del-alba`. La muestra estática local
`prototype/preview/bruma-del-alba.html` importa la **misma hoja CSS** que
Eleventy, y se sirve desde la raíz de `prototype/`:

```powershell
# Desde prototype/
py -3 -m http.server 8001
```

Abre `http://localhost:8001/preview/bruma-del-alba.html`. Usa la
preferencia de color del sistema (o la simulación en DevTools).
La muestra no se copia a `dist/` ni al sitio público.

Para comprobar las páginas reales, genera `dist/` y sirve
ese directorio desde la raíz del servidor HTTP:

```sh
cd prototype/dist
python -m http.server 8000
```

Después abrir `http://localhost:8000/` o `http://localhost:8000/en/`.
Si se descarga el artefacto del workflow, descomprimirlo primero y servir
ese directorio. Abrir `index.html` por `file://` no es una prueba válida:
la web emplea rutas absolutas desde `/`.

## Antes de publicar

Las traducciones y la revisión editorial anteriores están aprobadas.
Antes de desplegar falta revisar visualmente **Bruma del Alba** en claro/oscuro,
verificar `npm run check:publish` y fusionar la rama de diseño. No publicar
ni cambiar GitHub Pages durante esta revisión.
