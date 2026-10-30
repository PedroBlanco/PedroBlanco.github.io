Utilidad para **transformar archivos CSV grandes en bases de datos SQLite**, procesando las filas por lotes. Está orientada a archivos que resultan difíciles de abrir directamente en programas de hojas de cálculo.

### Uso

El script Python se ejecuta desde la terminal con un CSV como argumento:

```sh
python procesar_csv.py datos.csv
```

Permite elegir el nombre de la base de datos, mostrar el progreso y ajustar la cantidad de filas procesadas en cada lote:

```sh
python procesar_csv.py --db_name datos.db --chunksize 10 datos.csv
```

### Requisitos y consideraciones

Necesita Python 3 y las dependencias indicadas en el repositorio. La herramienta crea una tabla SQLite con una columna `id` y las columnas del CSV. Conviene revisar previamente la estructura y la codificación de los datos.
