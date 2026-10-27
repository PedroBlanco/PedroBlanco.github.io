/* Render a signature with strict validation and single-pass HTML escaping.
 * Fields are untrusted; the institutional template remains developer-controlled. */
(function (global) {
  "use strict";
  const MAX = {nombreapellidos:150,cargo:150,organismo1:150,organismo2:150,
    direccion:200,tel_fijo:9,tel_fijo_corp:6,tel_movil:9,tel_movil_corp:6,email:254};
  const TOKENS = {
    NOMBREAPELLIDOS:"nombreapellidos",CARGO:"cargo",ORG1:"organismo1",
    ORG2:"organismo2",DIRECCION:"direccion",TEL_C:"tel_fijo_corp",
    TEL:"tel_fijo",MOV_C:"tel_movil_corp",MOV:"tel_movil",EMAIL:"email"
  };
  function escapeText(raw) {
    return String(raw).replace(/[&<>"']/g, function (ch) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
    });
  }
  function normalize(raw) {
    const out = {};
    for (const key of Object.keys(MAX)) {
      const text = String(raw[key] == null ? "" : raw[key]).trim();
      if (text.length > MAX[key] || /[\u0000-\u001f\u007f]/.test(text)) {
        throw new Error("Campo no válido: " + key);
      }
      out[key] = text;
    }
    if (!out.nombreapellidos || !out.cargo || !out.organismo1 || !out.organismo2 || !out.direccion) {
      throw new Error("Completa los campos obligatorios.");
    }
    if (!/^[^\s@<>\x22\x27]+@juntadeandalucia\.es$/i.test(out.email)) {
      throw new Error("Introduce un correo corporativo válido.");
    }
    for (const key of ["tel_fijo","tel_movil"]) {
      if (out[key] && !/^[0-9]{9}$/.test(out[key])) throw new Error("Teléfono inválido: " + key);
    }
    for (const key of ["tel_fijo_corp","tel_movil_corp"]) {
      if (out[key] && !/^[0-9]{6}$/.test(out[key])) throw new Error("Extensión inválida: " + key);
    }
    if (!out.tel_fijo && !out.tel_movil) throw new Error("Introduce al menos un teléfono.");
    return out;
  }
  function render(template,fields,logo) {
    const values=normalize(fields);
    if(typeof logo!=="string" || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(logo)) {
      throw new Error("El logotipo todavía no está disponible.");
    }
    return template.replace(/NOMBREAPELLIDOS|CARGO|ORG1|ORG2|DIRECCION|TEL_C|TEL|MOV_C|MOV|EMAIL|IMG_BLOB/g,
      function (token) {return token==="IMG_BLOB" ? logo : escapeText(values[TOKENS[token]]);});
  }
  global.safeSignatureRender=render;
})(typeof window==="undefined" ? globalThis : window);
