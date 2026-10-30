# Publicación de Eleventy en GitHub Pages (Windows, sin compilación en Actions)

**Estado:** procedimiento preparado; no se ha publicado ni cambiado la fuente de GitHub Pages. La aprobación editorial de las traducciones es un requisito previo.

## Arquitectura

- `master`: código fuente, documentación y proyecto Eleventy en `prototype/`; la web Jekyll actual permanece disponible como respaldo.
- `prototype/dist/`: salida local de Eleventy, regenerada por `npm run build`, ignorada por Git.
- `gh-pages`: solo archivos estáticos de `dist/` y el archivo vacío `.nojekyll`. No incluye fuentes privados, dependencias ni pruebas.
- GitHub Pages: fuente `Deploy from a branch` → `gh-pages` → `/(root)`, **solo después del primer envío controlado**.

GitHub Pages mantiene su propio flujo interno de despliegue incluso con fuente de rama. No se crea ni necesita un workflow de GitHub Actions para compilar Eleventy. La documentación oficial recomienda `.nojekyll` cuando se publica un generador distinto de Jekyll desde una rama. Véase [configuración de origen](https://docs.github.com/es/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) y [creación de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Primera publicación

1. **Revisión ES/EN aprobada el 30/10/2026:** se registraron los diez bloques en `src/data/translation-review.json`, con `reviewedBy`, `reviewedAt`, `sourceDigest` y `targetDigest`. Antes de publicar se vuelven a verificar esas huellas contra el contenido final: cualquier diferencia invalida la aprobación. Los hashes se pueden consultar con `node scripts/check-translations.mjs --hashes` y usan finales de línea normalizados.
2. Fusionar la PR de preparación y actualizar `master` en el ordenador Windows. Comprobar que la copia Git está limpia y coincide con `origin/master`.
3. En PowerShell, desde `prototype/`, ejecutar:

   ```powershell
   .\scripts\publish-gh-pages.ps1
   ```

   El modo predeterminado solo compila y ejecuta `npm run check:publish`. **No crea ramas ni envía archivos.** El control estricto debe terminar correctamente.
4. Revisar la salida `dist/` en un servidor HTTP local (no usar `file://`). Confirmar que `/calculadora-tiempo/`, `/piefirma/`, `/revista/`, `/CC.html`, `/KM2024.html`, las rutas ES/EN y las descargas aprobadas están disponibles. No añadir contenidos excluidos.
5. Cuando se decida iniciar la publicación:

   ```powershell
   .\scripts\publish-gh-pages.ps1 -Publish
   ```

   El script comprueba **antes de compilar** que está en `master` y que el repositorio está limpio. **Repite** la compilación y la puerta estricta. La sincronización de metadatos públicos puede modificar temporalmente `src/data/repositories.json`; el script conserva sus bytes originales y los restaura al acabar la validación (incluso si falla), sin alterar los archivos ya generados en `dist/`. Comprueba después que el origen Git es el esperado, que `master` sigue limpio y actualizado, los límites de tamaño y la ausencia de enlaces simbólicos. Genera una copia temporal de solo los archivos de `dist`, crea `.nojekyll`, hace un commit local de `gh-pages` y realiza `git push` **sin forzar**. Si algo falla, no se altera la fuente pública actual.
6. En GitHub, abrir **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: gh-pages → /(root) → Save**. Este cambio de configuración requiere acceso administrativo a Pages y **no** lo realiza el script.
7. Comprobar el sitio público y el despliegue de Pages, incluidos recursos binarios y dos herramientas activas; documentar el resultado en la issue #13. Solo después cerrar la migración y proceder a la issue #11 para simplificar tests.

## Cambios locales antes de publicar

No publicar desde una rama de diseño ni desde una copia con cambios pendientes.
Si `git status --short --branch` muestra una modificación en
`prototype/src/data/repositories.json` o una carpeta
`prototype/scripts/__pycache__/`, conserva esos datos mediante `git stash`
antes de cambiar a `master`, o revísalos y guárdalos en la rama original.
No son necesarios `git reset --hard`, `git clean -fd` ni un push forzado.
Una vez actualizado `master`, el script deja el árbol limpio incluso cuando
el build actualiza el catálogo de repositorios; los bytecodes Python quedan
ignorados. Un commit local adicional en la rama de diseño permanece en ella,
y no se transfiere a `master` al cambiar de rama.

## Actualizaciones posteriores

`master` contiene el código; repetir `npm run build` y los controles antes de enviar una nueva salida `gh-pages`. No reintroducir pruebas por archivo histórico salvo nuevas funcionalidades que las requieran.

## Reversión

La fuente Jekyll y sus archivos permanecen en `master`. En **Settings → Pages**, volver temporalmente a `Deploy from a branch → master → /(root)` si el despliegue presenta problemas, y comprobar el sitio resultante. Conservar el commit anterior de `gh-pages` para un eventual restablecimiento **sin reescritura forzada del historial**.

## Límites y precauciones

GitHub Pages limita el tamaño del sitio publicado (1 GB); el script impide alcanzar ese máximo y detecta archivos individuales de 100 MB o más. Los 15 originales históricos autorizados suman aproximadamente 169 MiB, antes de añadir el resto del sitio. **No** enviar `prototype/`, dependencias `node_modules/`, ficheros originales no autorizados o material privado a la rama de publicación.
