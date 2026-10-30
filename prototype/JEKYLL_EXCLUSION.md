# Seguridad de publicación durante la transición

El sitio público continúa generándose con Jekyll desde `master` hasta realizar una migración explícita. El directorio `prototype/` es código de desarrollo y se excluye de la generación mediante `/_config.yml` (`exclude: - prototype`). Fusionar la PR del prototipo no activa el despliegue Eleventy. Las páginas públicas `CC.html` y `KM2024.html` permanecen sin cambios en `master`; las versiones curadas para la compilación están en `prototype/legacy-staged/`.

`npm run check:publish` sigue siendo un requisito separado antes de poner en producción Eleventy; hoy hay traducciones pendientes de revisión y entradas de migración que deben resolverse. No se ha autorizado ni ejecutado un despliegue del nuevo generador.
