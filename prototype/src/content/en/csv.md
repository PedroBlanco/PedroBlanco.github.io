Utility for **converting large CSV files into SQLite databases**, processing rows in chunks. It is intended for CSV files that are impractical to open directly in spreadsheet applications.

### Usage

Run the Python script from a terminal, passing the source CSV:

```sh
python procesar_csv.py data.csv
```

The database name, progress reporting and number of rows per processing chunk are configurable:

```sh
python procesar_csv.py --db_name data.db --chunksize 10 data.csv
```

### Requirements and considerations

Requires Python 3 and the dependencies documented in the repository. The utility creates one SQLite table containing an `id` column and the CSV columns. It is advisable to review the input structure and encoding before conversion.
