# Prototipo de renovación (no publicado)

La implementación vive exclusivamente en la carpeta prototype/ de una rama independiente.
No publicar ni fusionar este contenido hasta revisar privacidad, enlaces y contenido bilingüe.

## Comandos

cd prototype
npm install
npm run dev
npm run build
npm run check

El comando build intenta sincronizar el catálogo de repositorios **públicos** desde GitHub.
Si no hay red o se alcanza el límite de solicitudes, utiliza el snapshot incluido en
src/data/repositories.json. La selección editorial está en src/data/editorial.json.

## Comparación

Astro y Eleventy usan los mismos datos de src/data/content.json y el mismo CSS.
Comprobar: cinco secciones, ES en /, EN en /en/, selector visible, fichas traducidas,
cuatro rutas históricas, enlaces externos públicos, 404, compilación y experiencia móvil.

## Límites conocidos

- master permanece intacta; nada se despliega automáticamente.
- Las traducciones del prototipo son borradores y requieren revisión humana.
- El TFG tiene origen privado; su ficha no expone repositorio ni archivos privados.
- Las aplicaciones históricas NO se borran todavía. Se necesita una operación posterior
  controlada para retirar archivos, revisar datos personales y conservar rutas selectivas.
- Los enlaces interiores con nombres personales se retirarán de la versión publicada.
- Cualquier redirección en GitHub Pages será mediante páginas estáticas y no un HTTP 301 real.
- Al migrar, copiar de forma selectiva los activos vigentes y documentos históricos,
  nunca todas las carpetas antiguas sin revisión.
