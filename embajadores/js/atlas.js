// ********** Funciones y datos comunes del atlas **********

// Suponemos que ya hemos cargado Leaflet

console.log (document.head.querySelector("[name~=application-name][content]").content +', versión ' + document.head.querySelector("[name~=version][content]").content);
console.log ('Iniciando scripts de Atlas...');

function init_scale_options () {
    return {
        position: 'bottomleft',
        maxWidth: 200,
        metric: true,
        imperial: false,
        updateWhenIdle: false 
    };
}

function init_zoom_options () {
    return {
        position: 'bottomleft',
        zoomInTitle: 'Ampliar',
        zoomOutTitle: 'Reducir'
    };
}

function init_cluster_options () {
    return {
        showCoverageOnHover: false
        // ,
        // spiderfyOnMaxZoom: false
        // ,
        // disableClusteringAtZoom: false
    };
}

// TODO: Hacer comprobaciones sobre _zoom
function init_map_options ( _zoom ) {
    return {
        // attributionControl: false,
        zoomControl: false,
        zoom: _zoom,
        // Con un nivel 14 minimizaríamos los errores 503 del servidor, pero no los eliminamos (p.e. suroeste de Linares en nivel 15)
        maxZoom: 17,
        minZoom: 5,
        zoomDelta: 0.5,
        zoomSnap: 0.5,
        zooms: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17],
        // Opciones para L.control.layers.tree
        selectorBack: false,
        closedSymbol: '&#8862; &#x1f5c0;',
        openedSymbol: '&#8863; &#x1f5c1;',
        collapsed: false,
      };
}

function init_attribution_options () {
    return {
        prefix: 'Leaflet.',
        position: 'bottomright'
      };
}

// TODO: ¿Podría/debería implementar aquí las diferentes búsquedas? Títulos, etiquetas, ...
function init_search_options ( _layer ) {
    return {
        container: 'findbox',
        layer: _layer,
        initial: false,
        collapsed: false,
        textErr: 'No se ha podido encontrar ningún mapa',
        textCancel: 'Cancelar',
        textPlaceholder: 'p.e. Maquetación',
        propertyName: 'title',
        zoom: 16
    };
}

function init_icon_oil_drop ( ) {
    var _icon = 'images/marker-oil-drop-fit.png';
    var _shadow = 'images/marker-oil-drop-fit-shadow.png';

    return L.icon ({
        iconUrl: _icon,
        iconSize: [25,41],
        iconAnchor: [12,39],
        shadowUrl: _shadow,
        shadowSize: [41,41],
        shadowAnchor: [30,37],
        popupAnchor: [1,-33]
    });
}

// TODO: Configurar nuevo marcador para los embajadores
function init_icon_ambassador ( ) {
    var _icon = 'images/marker_km_32.png';

    return L.icon ({
        iconUrl: _icon,
        iconSize: [40,40],
        iconAnchor: [20,16],
        popupAnchor: [0,-14]
    });
}

// function map_popup () {
//     var _popup = '<h6><a href="{{url}}">{{frontMatter.hint}}</a>'+
//     '<br/>'+
//     '<span class="small">Etiquetas: <i>{{frontMatter.tags}}</i></span></h6>';

//     return _popup;
// }

// ********** Registros e inicializaciones **********

// *** No va aquí
// Handlebars.registerPartial('map_popup', '{{map_popup}}');
