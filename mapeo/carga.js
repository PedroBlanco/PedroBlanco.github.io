$( window ).load(function() {
	/*
	$.ajax({
	  url: "importar_csv.php",
	  context: document.body,
	  datatype: "json"
	}).done(function(result) {
		procesar_json ( result );
	});
	*/
	
	var cadena_json = '{"0":{"0":"NOMBREs PARTICIPANTE","1":"ID. Participante","2":"CODIGO ficha","3":"T\u00cdTULO de la iniciativa","4":"ENTIDAD promotora","5":"PERSONAS de contacto (Datos)","6":"A\u00f1o DESDE","7":"A\u00d1O HASTA","8":"\u00bfIMPLEMENTADA? (SI o NO)","9":"ORIGEN (EM o INST)","10":"PROVINCIA IMPULSORA","11":"PROVINCIAS APLICACI\u00d3N","12":"T.I: 1-SERVICIOS","13":"T.I. 2-PROCESOS","14":"T.I. 3-GESTION PERSONAS","15":"T.I. 4-PARTICIPACI\u00d3N","16":"T.I. 5-ORGANIZATIVA","17":"T.I. 6-CAMBIO CULTURAL","18":"T.I. 7-TECNOL\u00d3GICA","19":"T.I. 8-TRANSPARENCIA","20":"T.I. 9-COLABORACI\u00d3N","21":"T.I. 10-GEST.CON","22":"T.I. 11-BIENESTAR","23":"T.I. 12-IGUALDAD GEN","24":"T.I. 13-SENSIB.CUIDAD.","25":"T.I. 14-NORMATIVO","26":"A.A. 1-TURISMO","27":"A.A. 2-JUSTICIA","28":"A.A. 3-ADMON PUB.","29":"A.A. 4-INTERIOR","30":"A.A. 5-EMPLEO","31":"A.A. 6-HACIENDA","32":"A.A. 7-IND.ENERG","33":"A.A. 8-EDUCACI\u00d3N","34":"A.A. 9-DEPORTE","35":"A.A. 10-AGRIC-GAN-PESC","36":"A.A. 11-M.AMBIENTE","37":"A.A. 12-ECON.EMP.","38":"A.A. 13-CON-UNIV","39":"A.A. 14-SALUD","40":"A.A. 15-POLIT.SOC.","41":"A.A. 16-MEDIO RURAL","42":"A.A. 17-MOVILIDAD","43":"A.A. 18-CULTURA","44":"A.A. 19-FOMENTO","45":"Ayuntamientos","46":"Diputaciones"},"1":{"0":"Pedro Blanco Wasmer","1":"2","2":"2.1","3":"Observatorio de Pr\u00e1cticas Innovadoras en el Manejo de Enfermedades Cr\u00f3nicas Complejas (OPIMEC)","4":"Secretar\u00eda General de Salud P\u00fablica y Consumo de la Consejer\u00eda de Salud de la Junta de Andaluc\u00eda","5":"Carmen P\u00e9rez Romero","6":"2006","7":"Actualidad","8":"SI","9":"INST","10":"ANDALUCIA","11":"ANDALUCIA","12":"","13":"","14":"","15":"","16":"X","17":"X","18":"","19":"","20":"X","21":"X","22":"","23":"","24":"","25":"","26":"","27":"","28":"","29":"","30":"","31":"","32":"","33":"","34":"","35":"","36":"","37":"","38":"X","39":"X","40":"","41":"","42":"","43":"","44":"","45":"","46":""},"2":{"0":"Pedro Blanco Wasmer","1":"2","2":"2.2","3":"Escuela de pacientes","4":"Escuela Andaluza de Salud P\u00fablica (EASP) - Consejer\u00eda de Salud y Familias de la Junta de Andaluc\u00eda","5":"escueladepacientes.sspa@juntadeandalucia.es","6":"2008","7":"Actualidad","8":"SI","9":"INST","10":"ANDALUCIA","11":"ANDALUCIA","12":"X","13":"X","14":"","15":"X","16":"X","17":"X","18":"","19":"","20":"X","21":"X","22":"","23":"","24":"X","25":"","26":"","27":"","28":"","29":"","30":"","31":"","32":"","33":"","34":"","35":"","36":"","37":"","38":"","39":"X","40":"X","41":"","42":"","43":"","44":"","45":"X","46":""},"3":{"0":"Pedro Blanco Wasmer","1":"2","2":"2.3","3":"Proyecto Genoma M\u00e9dico","4":"Consejer\u00eda de Salud y Familias de la Junta de Andaluc\u00eda","5":"Javier Santoyo L\u00f3pez","6":"2009","7":"Actualidad","8":"SI","9":"INST","10":"ANDALUCIA","11":"SEVILLA","12":"X","13":"","14":"","15":"","16":"","17":"","18":"X","19":"","20":"","21":"X","22":"","23":"","24":"","25":"","26":"","27":"","28":"","29":"","30":"","31":"","32":"","33":"","34":"","35":"","36":"","37":"","38":"X","39":"X","40":"","41":"","42":"","43":"","44":"","45":"","46":""},"4":{"0":"Pedro Blanco Wasmer","1":"2","2":"2.4","3":"@firma: La plataforma corporativa de autenticaci\u00f3n y firma","4":"D.G. de Transformaci\u00f3n Digital de la Consejer\u00eda de Hacienda, Industria y Energ\u00eda de la Junta de Andaluc\u00eda","5":"D.G. de Transformaci\u00f3n Digital de la Consejer\u00eda de Hacienda, Industria y Energ\u00eda de la Junta de Andaluc\u00eda","6":"2003","7":"Actualidad","8":"SI","9":"INST","10":"ANDALUCIA","11":"ANDALUCIA","12":"X","13":"X","14":"","15":"","16":"X","17":"","18":"X","19":"","20":"","21":"","22":"","23":"","24":"","25":"X","26":"","27":"","28":"X","29":"","30":"","31":"","32":"","33":"","34":"","35":"","36":"","37":"","38":"","39":"","40":"","41":"","42":"","43":"","44":"","45":"X","46":"X"},"5":{"0":"Pedro Blanco Wasmer","1":"2","2":"2.6","3":"Tarjeta +Cuidado, tarjeta de Identificaci\u00f3n personal para el Plan de Atenci\u00f3n a Personas Cuidadoras","4":"PiCuida - Estrategia de Cuidados de Andaluc\u00eda, Consejer\u00eda de Salud y Familias de la Junta de Andaluc\u00eda","5":"https:\/\/www.picuida.es\/ciudadania\/contacto\/","6":"2007","7":"Actualidad","8":"SI","9":"INST","10":"ANDALUCIA","11":"ANDALUCIA","12":"X","13":"","14":"","15":"X","16":"X","17":"","18":"","19":"","20":"","21":"","22":"","23":"X","24":"X","25":"","26":"","27":"","28":"","29":"","30":"","31":"","32":"","33":"","34":"","35":"","36":"","37":"","38":"","39":"X","40":"X","41":"","42":"","43":"","44":"","45":"","46":""},"6":{"0":"Pedro Blanco Wasmer","1":"2","2":"2.7","3":"Proyecto \u201cSobre Ruedas\u201d","4":"Secretar\u00eda General de Salud P\u00fablica y Consumo de la Consejer\u00eda de Salud (y Familias, actualmente) de la Junta de Andaluc\u00eda","5":"Secretar\u00eda General de Salud P\u00fablica y Consumo de la Consejer\u00eda de Salud (y Familias, actualmente) de la Junta de Andaluc\u00eda","6":"2009","7":"Actualidad","8":"SI","9":"INST","10":"ANDALUCIA","11":"ANDALUCIA","12":"X","13":"","14":"","15":"X","16":"","17":"","18":"X","19":"","20":"X","21":"","22":"","23":"","24":"X","25":"","26":"","27":"","28":"","29":"","30":"","31":"","32":"","33":"X","34":"","35":"","36":"","37":"","38":"","39":"X","40":"","41":"","42":"X","43":"","44":"","45":"X","46":""}}';
	
	procesar_json ( cadena_json );
});

function procesar_json ( json )
{
	var resultado = JSON.parse ( json );
	console.log ( 'Cargadas ' + ( Object.keys(resultado).length - 1) + ' iniciativas' );
	
	var cabecera = '<thead>';
	cabecera += '<th data-priority="2">'+resultado['0']['2']+'</th>';
	cabecera += '<th data-priority="1">'+resultado['0']['3']+'</th>';
	cabecera += '<th data-priority="3">'+resultado['0']['4']+'</th>';
	cabecera += '</thead>';
	$('#resultados').append ( cabecera );
	
	var cuerpo = '<tbody>';
	var total = Object.keys(resultado).length;
	for ( var i = 1 ; i < total ; i++ ) {
		var indice = "'"+i+"'";
		cuerpo += '<tr>';
		cuerpo += '<td>Ficha '+resultado[i]['2']+'</td>';
// FIXME: Con dialog y popup o sin ellos no se puede referenciar a una ficha directamente (p.e. no se puede
// guardar en marcadores (al generarse dinamicamente con JavaScript)  
//		cuerpo += '<td><a href="#ficha_'+resultado[i]['2']+'" data-rel="dialog" data-transition="pop">'+resultado[i]['3']+'</a></td>';
		cuerpo += '<td><a href="#ficha_'+resultado[i]['2']+'">'+resultado[i]['3']+'</a></td>';
		cuerpo += '<td>'+resultado[i]['4']+'</td>';
		cuerpo += '</tr>';
		
		crear_ficha ( resultado[i] );
	}
	cuerpo += '</tbody>';
	$('#resultados').append ( cuerpo );
	
	$('#searchFilterReveal').next('.ui-textinput-clear-button').click();
}

function crear_ficha ( ficha )
{
	var id = 'ficha_' + ficha[2];
	console.log ( 'Creando ficha: ' + id );
	
	var texto_ficha = '<div data-role="page" id="'+id+'"><div data-role="toolbar" data-type="header" data-theme="b">';
	texto_ficha += '<h1>Ficha '+ficha[2]+'</h1>';
	texto_ficha += '</div><div role="main" class="ui-content">';
	texto_ficha += '<div class="ui-body">';
	texto_ficha += '<p><h2>'+ficha[3]+'</h2></p>';
	texto_ficha += '<p><ul><h3>Datos de la iniciativa:</h3>';
	texto_ficha += '<li>Entidad promotora: '+ficha[4]+'</li>';
	texto_ficha += '<li>Datos de contacto: '+ficha[5]+'</li>';
	texto_ficha += '<li>Duraci&oacute;n: '+ficha[6]+'-'+ficha[7]+'</li>';
	texto_ficha += '<li>Estado: '+((ficha[8]==='SI')?'Implementado':'En proceso de implementaci&oacute;n')+'</li>';
	texto_ficha += '</ul></p>';
	texto_ficha += '</div>';
	texto_ficha += '</div><div data-role="toolbar" data-type="footer"><div class="ui-grid-solo ui-responsive"><a href="#principal" data-rel="back" class="ui-button ui-shadow ui-corner-all ui-button-inline"><span class="ui-icon ui-icon-back"></span>&nbsp;&nbsp;&nbsp;Vuelta a la p&aacute;gina principal</a></div></div></div>';
	
	$('body').append ( texto_ficha );
}
