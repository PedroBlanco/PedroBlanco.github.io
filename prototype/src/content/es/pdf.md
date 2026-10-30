Herramienta FOSS en Python que **extrae fotografías individuales de documentos PDF escaneados**, especialmente cuando varias fotos están separadas sobre una misma página.

### Cómo funciona

El programa renderiza las páginas del PDF mediante **pypdfium2**, detecta las regiones fotográficas con una versión adaptada de `autocrop`, recorta las imágenes y puede corregir automáticamente su inclinación. Permite exportarlas en formato JPEG o PNG.

### Requisitos y ejecución

Requiere **Python 3.11 o posterior** y las dependencias especificadas en el repositorio (entre ellas, pypdfium2, Pillow y NumPy). Tras instalar el paquete, un ejemplo sencillo es:

```sh
pdf-fotos-a-imagenes album.pdf
```

También admite varios documentos, carpetas y un directorio de salida personalizado. La documentación del repositorio detalla las opciones de calidad, resolución y calibración del fondo.

### Licencia

Distribuido como software libre bajo **GPL-3.0-only**. Consultar el repositorio y los avisos de terceros para las condiciones completas.
