# Política de migración y compatibilidad (decisiones 1–21)

**No ejecutar sobre master hasta aprobar el generador, revisar traducciones y realizar la auditoría de privacidad.**

## Rutas principales inmutables

- /mapas/ => ficha histórica y vínculo a https://conocimientocritico.github.io/
- /mapeo/ => ficha histórica
- /embajadores/ => ficha histórica
- /art-of-hosting/ => ficha histórica
- /calculadora-tiempo/ => conservar la PWA desde su repositorio de origen
- /piefirma/ => conservar la aplicación y actualizar seguridad y referencias institucionales
- Recursos CC.html, KM2024.html, revista/, PDF/PPTX y archivos documentales:
  conservar sus rutas tras revisar derechos y privacidad.

## Rutas interiores

Compatibilidad **selectiva** con una lista blanca creada tras revisar enlaces entrantes:
- No redirigir sistemáticamente páginas de personas, autores o participantes.
- No publicar /embajadores/embajadores/*, /art-of-hosting/participantes/*,
  exportaciones /mapeo/*.csv o los JSON de contactos sin revisión y autorización.
- Páginas interiores documentales aprobadas: crear páginas HTML de redirección estática
  o de archivo con contexto; GitHub Pages no ofrece HTTP 301 configurable.
- Para las rutas retiradas: 404 bilingüe con navegación hacia /archivo/.
- Establecer un manifiesto de URLs que se pruebe automáticamente antes de migrar.

## Retirada de datos

Eliminar datos del árbol publicado NO elimina el historial de Git ni cachés externas.
La remediación del historial, si procede, es una tarea separada que requiere
evaluar el alcance, los colaboradores, los forks y las consecuencias de reescribir historia.
No utilizar el historial como repositorio de datos personales cuyo acceso deba restringirse.

## Modelo de publicación elegido

- / en español; /en/ en inglés; todas las fichas traducidas y revisadas.
- Cinco secciones: Inicio, Herramientas, Proyectos, Archivo, Acerca de.
- Fichas progresivas y catálogo GitHub público con inclusión/exclusión editorial.
- No se conecta el hosting propio con la web de proyectos.
- El TFG tiene código privado: únicamente ficha de descripción pública acordada.
- No fusionar ninguno de estos prototipos tal cual: la decisión final requiere
  ensamblar una rama de migración que preserve aplicaciones y documentos elegidos.

## Antes de desplegar

1. Aprobar la elección Astro / Eleventy con CI, comparación visual y mantenimiento.
2. Validar todos los enlaces absolutos y rutas interiores admitidas.
3. Revisar permisos, créditos, datos personales y traducciones; ejecutar check:publish.
4. Preparar catálogo completo e inventario de documentos históricos.
5. Probar versión móvil, teclado, lectores de pantalla y rendimiento.
6. Revisar PR final y plan de reversión; cambiar master solo tras aprobación.
