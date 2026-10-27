// Tomado/modificado de https://web.archive.org/web/20200508082503/http://html5-demos.appspot.com/static/a.download.html

var container = document.querySelector('#container');
var output = document.querySelector('#output');

const MIME_TYPE = 'text/html';

// Rockstars use event delegation!
document.body.addEventListener('dragstart', function(e) {
  var a = e.target;
  if (a.classList.contains('dragout')) {
    e.dataTransfer.setData('DownloadURL', a.dataset.downloadurl);
  }
}, false);

document.body.addEventListener('dragend', function(e) {
  var a = e.target;
  if (a.classList.contains('dragout')) {
    cleanUp(a);
  }
}, false);

var cleanUp = function(a) {
  if (!a) return;
  a.textContent = 'pie_firma.html';
  a.dataset.disabled = true;

  // Need a small delay for the revokeObjectURL to work properly.
  setTimeout(function() {
    window.URL.revokeObjectURL(a.href);
  }, 1500);
};

var orig_pie_firma = '<!DOCTYPE html>\
<html lang="es">\
<head>\
<meta charset="UTF-8"/>\
<style>a.pie {font-size: 11px;text-decoration: none;color: #3366ff;}</style>\
<title>NOMBREAPELLIDOS</title>\
</head>\
<body>\
<table width="700" border="0" cellspacing="0" cellpadding="0" style="font-family: Source Sans Pro, sans-serif, Verdana; color: #313B26; line-height: 18px; text-align: left;">\
<tr>\
<td width="700" align="left" valign="center">\
<a class="pie" href="http://www.juntadeandalucia.es" target="_blank">\
<img src="IMG_BLOB" alt="Marca gen&eacute;rica de la Junta de Andaluc&iacute;a" style="width:180px;"/>\
</a>\
</td>\
</tr>\
<tr>\
<td width="700" align="left" valign="center">\
<p style="font-family: Source Sans Pro, sans-serif, Verdana; font-size: 14px; margin-left:60px; margin-top: 0px;"><strong>NOMBREAPELLIDOS</strong><br/>\
<span style="font-family: Source Sans Pro, sans-serif, Verdana; font-size: 13px; color: #9B9A9D; margin-top: 0px;">CARGO</span><br/>\
<span style="font-family: Source Sans Pro, sans-serif, Verdana; font-size: 13px; color: #9B9A9D; margin-top: 0px;">ORG1</span><br/>\
<span style="font-family: Source Sans Pro, sans-serif, Verdana; font-size: 13px; color: #9B9A9D; margin-top: 0px;">ORG2</span>\
</p>\
<p style="font-family: Source Sans Pro, sans-serif, Verdana; margin-top: 4px; font-size: 11px; line-height: 16px; margin-left:60px">DIRECCION<br/>\
<span>\
T: <a class="pie" href="tel:TEL">TEL</a> (<a class="pie" href="tel:TEL_C">TEL_C</a>)\
 | \
M: <a class="pie" href="tel:MOV">MOV</a> (<a class="pie" href="tel:MOV_C">MOV_C</a>)\
</span><br/>\
<span><a class="pie" href="mailto:EMAIL" >EMAIL</a>&nbsp;|&nbsp;\
<a class="pie" href="http://www.juntadeandalucia.es" target="_blank" style="color: #313B26; text-decoration:none;">www.juntadeandalucia.es</a></span><br/>\
</p>\
</td>\
</tr>\
</table>\
</body>\
</html>';

var downloadFile = function() {
  // Si el formulario no valida, no continuamos en la generación de la firma
  if ( ! validar () ) {
    limpia_firma ();
    return false;
  }
  window.URL = window.webkitURL || window.URL;

  var prevLink = output.querySelector('a');
  if (prevLink) {
    window.URL.revokeObjectURL(prevLink.href);
    output.replaceChildren();
  }

  var formValues = {};
  ["nombreapellidos","cargo","organismo1","organismo2","direccion",
   "tel_fijo","tel_fijo_corp","tel_movil","tel_movil_corp","email"].forEach(function (name) {
    formValues[name] = document.getElementById(name).value;
  });
  var pie_firma;
  try {
    pie_firma = [safeSignatureRender(orig_pie_firma, formValues, _img_blob)];
  } catch (error) {
    alert(error.message);
    limpia_firma();
    return false;
  }

  var bb = new Blob( pie_firma,
    {type: MIME_TYPE} );

  var a = document.createElement('a');
  a.download = 'pie_firma.html';
  a.href = window.URL.createObjectURL(bb);
  a.textContent = a.download;
  // FIXME: Debería ser un valor calculado
  a.tabIndex = 13;

  a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
  a.draggable = true; // Don't really need, but good practice.
  a.classList.add('dragout');

  output.appendChild(a);

  container.style.display='inline';

  a.onclick = function(e) {
    if ('disabled' in this.dataset) {
      return false;
    }

    cleanUp(this);
  };

  return false;
};

// Tomado de https://stackoverflow.com/a/20285053/15662904
function toDataURL(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
        // Parece que es una imagen de 1x1 pixel blanco
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}

var _img_blob;

toDataURL('res/JdA-logo-email.png', function(dataUrl) {
    _img_blob = dataUrl;
})


function limpia_firma () {

  container.style.display='none';
  cleanUp(output.querySelector('a'));

}