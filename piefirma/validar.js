function validar () {
    var nombre = document.querySelector('input[name=nombreapellidos]');
    var tel_fijo = document.querySelector('input[name=tel_fijo]');
    var tel_fijo_corp = document.querySelector('input[name=tel_fijo_corp]');
    var tel_movil = document.querySelector('input[name=tel_movil]');
    var tel_movil_corp = document.querySelector('input[name=tel_movil_corp]');

    var estado = true;

    if ( tel_fijo.reportValidity() ) {
        tel_fijo_corp.required = tel_fijo.required;
        if ( ! tel_fijo_corp.reportValidity() ) {
            estado = false;
        }
    } else {
        tel_fijo_corp.required = false;
    }

    if ( tel_movil.reportValidity() ) {
        tel_movil_corp.required = tel_movil.required;
        if ( ! tel_movil_corp.reportValidity() ) {
            estado = false;
        }
    } else {
        tel_movil_corp.required = false;
    }

    if ( ! nombre.reportValidity() ) {
        estado = false;
    }

    return estado;
}

document.addEventListener('DOMContentLoaded', function () {
    var tel_fijo = document.querySelector('input[name=tel_fijo]');
    var tel_fijo_corp = document.querySelector('input[name=tel_fijo_corp]');
    var tel_movil = document.querySelector('input[name=tel_movil]');
    var tel_movil_corp = document.querySelector('input[name=tel_movil_corp]');

    var arr_tel = Array();
    var arr_tel_todos = Array();

    arr_tel.push(tel_fijo);
    arr_tel.push(tel_movil);

    arr_tel_todos.push(tel_fijo);
    arr_tel_todos.push(tel_fijo_corp);
    arr_tel_todos.push(tel_movil);
    arr_tel_todos.push(tel_movil_corp);

    const inputListener = function (e) {return arr_tel.filter(function (i) {return i !== e.target;}).forEach(function (i) {return i.required = !e.target.value.length;})};

    arr_tel.forEach(function (i) { return i.addEventListener('input', inputListener);});
    arr_tel_todos.forEach(function (i) { return i.addEventListener('change', validar);});
});
