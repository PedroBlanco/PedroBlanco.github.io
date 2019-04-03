<?php

$nombre_fichero = '2019-04-03.csv';

$resultado_csv = array ();

$resultado_json = '{"0":';

// TODO: Tal vez haya que hacer un par de comprobaciones
$fichero_csv = fopen ( $nombre_fichero, 'r' );

//$fila_csv = fgetcsv($fichero_csv, 0, ',', '"', '\\');
for ( $i = 0 ; $fila_csv = fgetcsv($fichero_csv, 0, ',', '"', '\\' ) ; $i++, $resultado_json .= ',"'.$i.'":' )
{
        $resultado_csv[] = $fila_csv;
//        print_r ( $fila_csv );
//        print ( '<br/>' );
        $resultado_json .= json_encode ( $fila_csv, JSON_FORCE_OBJECT );
}

fclose($fichero_csv);

$resultado_json = substr_replace( $resultado_json, '', - strlen(',"'.$i.'":' ));

$resultado_json .= '}';

print ( $resultado_json );

