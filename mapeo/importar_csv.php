<?php

$prefijo_fichero = '2019-04-04';

$fichero_cabecera = 'cabecera.json';
$cabecera_procesada = false;

$lista_ficheros_json = 'datos.json';

$lista_json = Array();

$array_ficheros = glob ( $prefijo_fichero.'-*.csv' );

foreach ( $array_ficheros as $fichero) {
    $fichero_json = substr ( $fichero, 0, -4 ).'.json';
    
    
    $resultado_csv = array ();
    
    $resultado_json = '{"0":';
    
    // TODO: Tal vez haya que hacer un par de comprobaciones
    $fichero_csv = fopen ( $fichero, 'r' );
    
    // Si no hemos incluido un fichero con la cabecera, lo creamos extrayendo la cabecera del primer csv
    // Si lo hemos incluido descartamos la cabecera del csv (no hacemos nada con ella)
    $fila_csv = fgetcsv($fichero_csv, 0, ',', '"', '\\');
    if ( ! $cabecera_procesada ) {
        $cabecera_procesada = true;
        file_put_contents( $fichero_cabecera , json_encode ( $fila_csv, JSON_FORCE_OBJECT ) );
        echo $fichero_cabecera.'<br/>';
        $lista_json[] = $fichero_cabecera;
    }

    echo $fichero_json.'<br/>';
    
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
    
    file_put_contents( $fichero_json , $resultado_json );
    
    $lista_json[] = $fichero_json;
}

file_put_contents( $lista_ficheros_json , json_encode ( $lista_json ) );
