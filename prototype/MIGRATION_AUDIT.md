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
