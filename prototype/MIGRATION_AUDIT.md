# Auditoría de migración · 26/10/2026

**Estado:** revisión visual del prototipo 11ty aceptada. Publicación bloqueada
hasta verificar contenido, derechos, privacidad, enlaces y herramientas.
El conjunto original permanece intacto en `master` y en el historial Git.

## Inventario y decisiones de conservación

| Ruta heredada | Alcance aproximado | Tratamiento | Pendiente |
| --- | --- | --- | --- |
| `/mapeo/` | 38 archivos | Ficha histórica | No recuperar CSV, JSON, PHP ni datos personales |
| `/embajadores/` | ~90 archivos | Ficha histórica | Excluir perfiles y fotografías personales |
| `/art-of-hosting/` | ~65 archivos | Ficha histórica | Excluir fichas e imágenes de participantes |
| `/mapas/` | 164 archivos | Ficha histórica | Conservar referencia al atlas oficial; revisar rutas interiores documentales |
| `/calculadora-tiempo/` | 13 archivos antiguos | Herramienta activa | Sustituir por distribución de origen verificada; probar PWA offline |
| `/piefirma/` | 10 archivos | Herramienta activa | Corregir interpolación HTML de entradas, validaciones y branding |
| `/revista/` | 20 archivos, ~101 MB | Conservación documental selectiva | Revisar vídeo, audio, imágenes, licencias y peso de publicación |
| `/CC.html` | ~3 kB | En vista previa | Comprobar todos los enlaces, incluido vídeo de /revista/ |
| `/KM2024.html` | ~1 kB | Revisión pendiente | Sustituir enlaces Canva de tipo edit por accesos públicos de lectura confirmados |
| `/CROQUETAS2024.pdf` | ~8,6 MB | Revisión pendiente | Derechos y accesibilidad del documento |
| `/NEXUM2024.pdf` | ~70,6 MB | Revisión pendiente | Derechos, peso y presentación de la descarga |
| `/NEXUM2024.pptx` | ~22,1 MB | Revisión pendiente | Derechos y conveniencia de publicar versión editable |

**Los tamaños son de archivos fuente presentes en Git; no indican cuántos
bytes transferirá la web tras la migración.**

## Enlaces pendientes detectados automáticamente

La versión de Eleventy compila 28 rutas bilingües (más una página 404 y un
documento original `CC.html`). La auditoría de enlaces locales detecta
estos objetivos todavía ausentes de la distribución:

- `/calculadora-tiempo/` — debe incorporarse la versión vigente.
- `/piefirma/` — conservar, pero previamente corregir seguridad.
- `/KM2024.html` — corregir enlaces de edición y preservar URL.
- `/revista/` — revisar aplicación/índice y referencias visuales.
- `/revista/2023-10-17_Revista_Enredados_Presentacion.mp4` — vídeo enlazado
  desde el documento histórico `CC.html`.

Una referencia a `/404/` se detectó inicialmente por un metadato canónico
incorrecto y se corrigió para utilizar `/404.html`.

## Secuencia de migración propuesta

1. **Herramientas activas:** conservar primero la distribución actual de la
   calculadora y preparar una versión de piefirma con escapado de entradas,
   pruebas de generación y revisión de identidad corporativa.
2. **Documentos ligeros:** revisar individualmente los HTML históricos,
   sustituyendo accesos de edición de terceros por enlaces públicos confirmados.
3. **Archivos grandes:** decidir conservación en Pages u otra ubicación
   duradera únicamente después de comprobar licencia, privacidad y acceso.
4. **Enlaces antiguos:** mantener raíces históricas, redirigir únicamente
   enlaces documentales seguros; retirar rutas personales sin reproducir
   nombres propios en redirecciones.
5. **Salida de producción:** construir desde lista blanca, verificar enlaces
   e idiomas, auditar datos personales, revisar traducciones y publicar por
   workflow separado con posibilidad de reversión.

## Situación de trabajo (27/10/2026)

- **Realizado por ChatGPT:** diseño visual y navegación, fichas Markdown,
  inventario selectivo de archivos, documento `CC.html` de vista previa,
  auditoría de rutas y preparación del integrador de calculadora.
- **Calculadora:** el repositorio privado dispone del comando
  `npm run build:web`. La nueva integración opcional
  `prototype/scripts/stage-calculator.mjs` acepta exclusivamente los 16
  archivos de la distribución de ejecución e impide copiar carpetas de
  desarrollo. **No se ha ejecutado aún con el artefacto real**.
- **Generador de firmas:** sigue pendiente de una versión revisada y de
  pruebas funcionales de exportación y compatibilidad con clientes de correo.
- **Usuario:** ya ha probado el prototipo visual satisfactoriamente. Por ahora
  no tiene que tocar `master`, crear secretos ni publicar nada.
- **Última aprobación requerida:** uso de marca del generador, derechos de
  archivos multimedia, traducciones y autorización de publicación.

Seguimiento de tareas y aceptación: [issue #5](https://github.com/PedroBlanco/PedroBlanco.github.io/issues/5).

## Controles disponibles

- `npm run build`: compila Eleventy y copia solo documentos con estado
  `preview` y blob SHA declarado.
- `npm run check`: valida rutas ES/EN, elementos gráficos, contraste y
  migración; informa de enlaces aún no incluidos.
- `npm run audit:links`: muestra enlaces que dejarían de funcionar tras migrar.
- `npm run check:publish`: **bloquea** distribución incompleta,
  migraciones pendientes y traducciones sin revisión.

Importante: retirar archivos del directorio publicado **no los elimina del
historial Git, clones, forks o cachés**. La auditoría y eventual remediación
del historial deben evaluarse por separado.

Este documento registra el estado de la PR experimental. No constituye una
autorización para fusionar o publicar.

## Actualización tras autorización de publicación (27/10/2026)

Publicaciones incrementales confirmadas en `master`, sin fusionar la
PR #4 (Eleventy):

- PR #7: 16 archivos de la calculadora, desde distribución autorizada.
- PR #8: corrección de validación y escapado en el generador de firmas.
- PR #9: enlaces de edición de Canva retirados de `KM2024.html`.

La vista previa Eleventy ya conserva por lista blanca `CC.html`,
`KM2024.html` y los diez archivos runtime del generador de firmas,
comprobados mediante SHA de blob Git. La calculadora se incluye al
proporcionar el artefacto `web-artifact` con su commit esperado.

**Pendiente para publicar el rediseño completo:** derechos de
`/revista/` y su vídeo, documentación adjunta de Croquetas y NEXUM,
revisión editorial de diez conjuntos de traducción, validación de marca
y clientes de correo, y pruebas de instalación/actualización PWA
(no imprescindibles para el despliegue limitado de #7).

La autorización general de publicación no implica afirmar que estos
controles se hayan superado: la nueva web se desplegará únicamente
cuando su distribución completa se pueda verificar sin pérdidas.

## Enlaces documentales pendientes de permisos — versión editorial

El índice `CC.html` de la rama Eleventy conserva los enlaces externos
históricos pero sustituye el enlace al MP4 local de 2023 por una nota
de revisión de derechos y privacidad. `KM2024.html` conserva los
enlaces de lectura externos y sustituye el enlace al PDF local
`CROQUETAS2024.pdf` por una nota equivalente. El contenido original
continúa en el historial y la web antigua hasta el despliegue final.
**No se ha aprobado ni copiado el vídeo ni el PDF.** Ambas modificaciones
están fijadas por hash de blob Git en el inventario de migración.

## Endurecimiento de enlaces del prototipo

Tras incorporar la versión pública fijada de `/calculadora-tiempo/` y
editar las versiones del prototipo de `CC.html` y `KM2024.html`,
la auditoría de enlaces internos forma parte de las pruebas de CI
en modo estricto. Los materiales audiovisuales/documentales de
origen permanecen sin copiar y deben tratarse conforme a la issue #10.
