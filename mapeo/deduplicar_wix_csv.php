<?php

require_once "Class_UUID.php";

$fichero = '2019-04-11 EXPORT lista_fichas_mapeo.csv';

$resultado_csv = array ();

// Carpeta destino de archivos deduplicados generados
$dedup_dir = 'dedup\\';

// Archivo con los datos de los tags
$fichero_tags = $dedup_dir.'tags.csv';

// Archivo con los datos relacionados de cada tag con cada iniciativa
$fichero_comun = $dedup_dir.'iniciativa-tag.csv';

// Contiene los datos (nombre y handler) de los tags deduplicados generados
$tags = array ();
// Inicio de los campos a deduplicar [17,51]
$ini_deduplicados = 17;
// Fin de los campos a deduplicar (son 35 campos; 51-17+1=35)
$fin_deduplicados = 51;

// Relacion entre los tags y las iniciativas
$relacion = array ();

// TODO: Tal vez haya que hacer un par de comprobaciones
$fichero_csv = fopen ( $fichero, 'r' );

// Leemos la cabecera del fichero con todos los datos para buscar los nombres de los tags
$fila_csv = fgetcsv($fichero_csv, 0, ',', '"', '\\');

// Creamos la cabecera para a continuación añadirla al fichero
$fichero_csv_tags = fopen ( $fichero_tags, 'w+' );
$tags[0] = array ( 'ID', 'name' );
fputcsv ( $fichero_csv_tags, $tags[0], ',', '"', '\\' );

for ($i = $ini_deduplicados; $i <= $fin_deduplicados; $i++) {
    print ( $i.' Tag: ' );
    $tags[$i] = array ( UUID::v4(), $fila_csv[$i] );
    fputcsv ( $fichero_csv_tags, $tags[$i], ',', '"', '\\' );
    print ( print_r ( $tags[$i], true ).'<br/>' );
}

fclose ( $fichero_csv_tags );

$fichero_comun_csv = fopen ( $fichero_comun, 'w' );

// Creamos la cabecera para a continuación añadirla al fichero  
$relacion[0] = array ( 'ID', 'idIniciativa', 'idTag' );
fputcsv ( $fichero_comun_csv, $relacion[0] , ',', '"', '\\' );

for ( ; $fila_csv = fgetcsv($fichero_csv, 0, ',', '"', '\\') ; ) {
    for ( $i = $ini_deduplicados; $i <= $fin_deduplicados ; $i++ ) {
        if ( $fila_csv[$i] == 'true' ) {
            print ( $i );
            fputcsv ( $fichero_comun_csv,
                $relacion[] = array (
                    UUID::v4(),
                    $fila_csv[1],
                    $tags[$i][0]
                ), ',', '"', '\\' );
            print ( ' Tag-Iniciativa: '.$tags[$i][1].'-'.$fila_csv[7].'<br/>' );
        }
    }
}

fclose ( $fichero_comun_csv );
