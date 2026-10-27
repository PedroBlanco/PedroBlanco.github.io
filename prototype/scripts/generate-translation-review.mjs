import fs from "node:fs/promises";
import content from "../src/data/content.json" with {type:"json"};
const flatten=(o,prefix="")=>Object.entries(o||{}).flatMap(([k,v])=>v&&typeof v==="object"&&!Array.isArray(v)?flatten(v,prefix+k+"."):[{key:prefix+k,val:v}]);
const cell=v=>String(v??"").replaceAll("|","\\|").replaceAll("\n"," · ");
const header=\`# Paquete de revisión ES/EN · Eleventy

**Estado:** borrador generado para facilitar la revisión humana. **No supone aprobación de ninguna traducción.**

La revisión incluye los **10 bloques editoriales**: interfaz del sitio y nueve fichas. Cuando cambian los textos ES **o EN**, incluso apartados extensos, medios y recursos, las aprobaciones anteriores deben revisarse de nuevo.

## Cómo revisar

1. Comprobar correspondencia fiel entre ambas versiones, naturalidad inglesa, títulos, nombres propios y terminología.
2. Indicar correcciones en los archivos fuente (no únicamente en este documento): \\\`src/data/content.json\\\`, \\\`src/content/es/*.md\\\`, \\\`src/content/en/*.md\\\`.
3. Registrar la aprobación de cada bloque con \\\`sourceDigest\\\` y \\\`targetDigest\\\`, generados con \\\`node scripts/check-translations.mjs --hashes\\\`, y metadatos \\\`reviewedBy\\\` y \\\`reviewedAt\\\`. El registro está en \\\`src/data/translation-review.json\\\`.
4. Ejecutar \\\`npm run check\\\` y, antes del despliegue completo, \\\`node scripts/check-translations.mjs --strict\\\`. El reporte y los hashes cambian cuando cambie el contenido.

**Ninguna aprobación se concede por silencio ni por traducción automática.**

## Interfaz del sitio

| Clave | Español | Inglés |
|---|---|---|
\`;
let output=header;
const en=new Map(flatten(content.langs.en).map(x=>[x.key,x.val]));
for(const x of flatten(content.langs.es)){
 const v=z=>z&&typeof z==="object"?cell(JSON.stringify(z)):cell(z);
 output+="| \`"+x.key+"\` | "+v(x.val)+" | "+v(en.get(x.key))+" |\n";
}
for(const item of content.items){
 output+="\n## "+item.id+": "+item.es.title+" / "+item.en.title+"\n\n";
 output+="| Elemento | Español | Inglés |\n|---|---|---|\n";
 for(const k of ["title","summary","detail"])output+="| "+k+" | "+cell(item.es[k])+" | "+cell(item.en[k])+" |\n";
 for(const s of item.sections||[]){
  output+="| Apartado \`"+s.id+"\` — título | "+cell(s.es?.title)+" | "+cell(s.en?.title)+" |\n";
  output+="| Apartado \`"+s.id+"\` — texto | "+cell(s.es?.body)+" | "+cell(s.en?.body)+" |\n";
 }
 if(item.media)for(const k of ["alt","caption"]){
  if(item.media.es?.[k]||item.media.en?.[k])output+="| Imagen — "+k+" | "+cell(item.media.es?.[k])+" | "+cell(item.media.en?.[k])+" |\n";
 }
 for(const r of item.resources||[]){
  output+="| Recurso "+r.type+" · "+cell(r.href)+" | "+cell(r.es?.label)+" | "+cell(r.en?.label)+" |\n";
 }
 if(item.markdown){
  const es=await fs.readFile(new URL("../src/content/es/"+item.id+".md",import.meta.url),"utf8");
  const en=await fs.readFile(new URL("../src/content/en/"+item.id+".md",import.meta.url),"utf8");
  output+="\n### Descripción extendida — ES\n\n"+es+"\n\n### Extended description — EN\n\n"+en+"\n";
 }
}
const file=new URL("../TRANSLATION_REVIEW.md",import.meta.url);
if(process.argv.includes("--check")){
 const saved=await fs.readFile(file,"utf8");
 if(saved!==output)throw Error("Translation review snapshot is outdated; run npm run translations:report and commit the result.");
 console.log("Translation review snapshot is current ("+content.items.length+" project fiches and site UI).");
}else{
 await fs.writeFile(file,output,"utf8");
 console.log("Updated TRANSLATION_REVIEW.md; human approval remains separate.");
}
