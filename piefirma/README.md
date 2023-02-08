# Generador de _Firma de correo electrónico_ corporativa

Según el [Manual de Identidad Corporativa de la Junta de Andalucía] (pág. 309), la firma de los correos electrónicos deben tener una apariencia determinada:

> La firma de correo elecrónico es una de las aplicaciones de marca que tiene más uso y visibililidad en el día a día de la entidad. Su diseño ha de ser sencillo y funcional, basado en elementos básicos de la identidad corporativa, adaptados a las condiciones de este medio en concreto.

Este _aplicativo_ sirve para generar el pie de firma en un documento HTML con el formato descrito.

Sólo hace falta un servidor web estático para alojar los archivos del _aplicativo_, puesto que para generar la firma no se necesita ejecutar nada en el servidor (generador en el lado del cliente).

Los archivos HTML de firma que se generan ocupan unos 10KB aproximadamente, llevando el logotipo corporativo embebido (codificado en base64).

El _aplicativo_ consiste en:

- `index.html`
  - Formulario web que toma los datos con los que se va a generar la firma.
- `config.js`
  - Script llamado por `index.html` con los valores configurables:
    - `show_header`: `true` para mostrar la cabecera, `false` para ocultarla (útil oara incrustar en un marco).
    - `home_url`: url a la que apunta el título de la página (en la cabecera).
- `validar.js`
  - Script llamado por `index.html` para validar los datos del formulario web anterior.
- `generar_html.js`
  - Script llamado por `index.html` que combina los datos del formulario web anterior y genera un documento HTML con el pie de firma.
- `res/`
  - Archivos de imágenes y hojas de estilo.

## Referencias

- [Manual de Identidad Corporativa de la Junta de Andalucía]:
  - [Versión actualizada a 26/04/2021]: páginas 309 y 310.

[manual de identidad corporativa de la junta de andalucía]: https://juntadeandalucia.es/organismos/presidenciaadministracionpublicaeinterior/areas/comunicacion-social/identidad-corporat-JdA.html
[versión actualizada a 26/04/2021]: https://juntadeandalucia.es/export/drupaljda/Manual-IC-JdA-_26-4-21.pdf
