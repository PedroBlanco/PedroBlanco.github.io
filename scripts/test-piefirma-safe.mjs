import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root=path.resolve("piefirma");
const script=fs.readFileSync(path.join(root,"safe-values.js"),"utf8");
const scope={};vm.runInNewContext(script,scope);
const generate=scope.safeSignatureRender;
const base={nombreapellidos:"Nombre Apellido",cargo:"Técnico",organismo1:"Organismo",
  organismo2:"Unidad",direccion:"Calle 10",tel_fijo:"957000000",
  tel_fijo_corp:"515000",tel_movil:"600000000",tel_movil_corp:"600000",
  email:"persona@juntadeandalucia.es"};
const logo="data:image/png;base64,aGVsbG8=";
test("single-pass HTML escaping preserves literal user field tokens",()=>{
 const output=generate("NOMBREAPELLIDOS CARGO ORG1 DIRECCION EMAIL IMG_BLOB",
 {...base,nombreapellidos:"Ana & TEL",cargo:"<b>Directora</b>",organismo1:'"Ejemplo"',direccion:"C/ López"},logo);
 assert.ok(output.includes("Ana &amp; TEL"));
 assert.ok(output.includes("&lt;b&gt;Directora&lt;/b&gt;"));
 assert.ok(output.includes("&quot;Ejemplo&quot;"));
 assert.ok(output.includes(logo));
 assert.equal(output.includes("<b>"),false);
});
test("email, numbers, limits and image data are checked before serialization",()=>{
 assert.throws(()=>generate("EMAIL",{...base,email:"persona@example.org"},logo),/correo/);
 assert.throws(()=>generate("TEL",{...base,tel_fijo:"123abc123"},logo),/Teléfono/);
 assert.throws(()=>generate("MOV_C",{...base,tel_movil_corp:"123"},logo),/Extensión/);
 assert.throws(()=>generate("NOMBREAPELLIDOS",{...base,nombreapellidos:"a".repeat(151)},logo),/Campo/);
 assert.throws(()=>generate("IMG_BLOB",base,"other"),/logotipo/);
});
test("event handlers do not invoke duplicate generation",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const a=html.indexOf('src="safe-values.js"'),b=html.indexOf('src="generar_html.js"');
 assert.ok(a>=0&&b>a);
 assert.equal(/onclick="downloadFile\(\)"/.test(html),false);
 const generator=fs.readFileSync(path.join(root,"generar_html.js"),"utf8");
 assert.ok(generator.includes("safeSignatureRender("));
 assert.equal(generator.includes("replaceAll ( 'NOMBREAPELLIDOS'"),false);
 assert.ok(generator.includes("if (!a) return;"));
});
