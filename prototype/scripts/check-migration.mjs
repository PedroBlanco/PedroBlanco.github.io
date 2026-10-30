import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import manifest from "../src/data/migration-manifest.json" with {type:"json"};
import mediaManifest from "../src/data/media-review.json" with {type:"json"};
const dist=path.resolve("dist");
const gitSha=data=>createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");
const staged=manifest.entries.filter(x=>x.status==="preview"||x.status==="approved");
const names=staged.map(x=>x.path).sort();
if(JSON.stringify(names)!==JSON.stringify(["CC.html","KM2024.html"]))throw Error("Unreviewed document list changed");
for(const entry of staged){
 const loc=path.join(dist,entry.path);
 if(!fs.existsSync(loc)||gitSha(fs.readFileSync(loc))!==entry.gitBlobSha)throw Error("Missing or modified staged document: "+entry.path);
}
for(const entry of manifest.entries.filter(x=>x.status!=="preview"&&x.status!=="approved")){
 const target=path.join(dist,entry.path);
 if(entry.status==="curated-index"){
  if(entry.path!=="revista/"||!fs.existsSync(target)||!fs.statSync(target).isDirectory())
    throw Error("Missing curated historical archive");
  // The historical landing page remains curated; only individually approved
  // media from the separate review manifest may coexist under /revista/.
  const expected=new Set(["index.html",...mediaManifest.entries
   .filter(e=>e.status==="approved"&&e.ownerDecision==="preserve-full"&&e.path.startsWith("revista/"))
   .map(e=>e.path.slice("revista/".length))]);
  const actual=[];
  const walkRevista=(dir,prefix="")=>{
   for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const rel=prefix+item.name,loc=path.join(dir,item.name);
    if(item.isDirectory())walkRevista(loc,rel+"/");
    else if(item.isFile())actual.push(rel);
    else throw Error("Unexpected non-file in curated archive: "+rel);
   }
  };
  walkRevista(target);
  if(JSON.stringify(actual.sort())!==JSON.stringify([...expected].sort()))
   throw Error("Curated archive output differs from its approved-media allowlist");
  const document=fs.readFileSync(path.join(target,"index.html"),"utf8");
  if(!document.includes('data-curated-archive="revista-v1"')||/<script\b|<img\b|<video\b|<audio\b/i.test(document))
    throw Error("Unreviewed active or multimedia content in curated archive");
  continue;
 }
 if(entry.status==="preview-tool"||entry.status==="approved-tool"){
  if(entry.path!=="piefirma/"||entry.files?.length!==10)throw Error("Unexpected legacy tool");
  if(!fs.existsSync(target)||!fs.statSync(target).isDirectory())
   throw Error("Missing staged tool "+entry.path+"; complete npm run build before running npm run check");
  const actual=[];
  const walk=(dir,pre="")=>{
   for(const x of fs.readdirSync(dir,{withFileTypes:true})){
    const rel=pre+x.name;
    if(x.isDirectory())walk(path.join(dir,x.name),rel+"/");
    else {if(!x.isFile())throw Error("Unsafe legacy output: "+rel);actual.push(rel);}
   }
  };
  walk(target);
  const expected=entry.files.map(x=>x.path).sort();
  if(JSON.stringify(actual.sort())!==JSON.stringify(expected))throw Error("Unvetted tool asset in output");
  for(const f of entry.files)if(gitSha(fs.readFileSync(path.join(target,f.path)))!==f.gitBlobSha)throw Error("Tool asset was modified: "+f.path);
  const html=fs.readFileSync(path.join(target,"index.html"),"utf8");
  if(!html.includes('src="safe-values.js"'))throw Error("Signature hardening not loaded");
  continue;
 }
 if(entry.path==="calculadora-tiempo/"&&entry.status==="published-tool"){
  if(!fs.existsSync(target))throw Error("Calculator integration requested but build missing");
  continue; // Separately validated by check-calculator.mjs.
 }
 if(entry.status==="retire"&&entry.path==="KM2024.md"){
  if(fs.existsSync(target))throw Error("Source-only Markdown was published: "+entry.path);
  continue;
 }
 if(entry.status==="retire"){
  // The retired application's root becomes a historical page, with no former assets.
  const allowed=["mapeo/","embajadores/","art-of-hosting/","mapas/"];
  if(!allowed.includes(entry.path))throw Error("Unrecognized retired route: "+entry.path);
  if(!fs.existsSync(target)||!fs.statSync(target).isDirectory())throw Error("Missing historical replacement: "+entry.path);
  const names=fs.readdirSync(target);
  if(names.length!==1||names[0]!=="index.html")throw Error("Former application data still present at: "+entry.path);
  const html=fs.readFileSync(path.join(target,"index.html"),"utf8");
  if(!html.includes('class="detail-prose"'))throw Error("Historical replacement not rendered: "+entry.path);
  continue;
 }
 if(fs.existsSync(target))throw Error("Blocked resource leaked: "+entry.path);
}
const ccSource=fs.readFileSync(path.join(dist,"CC.html"),"utf8");
const video="/revista/2023-10-17_Revista_Enredados_Presentacion.mp4";
if(!ccSource.includes('data-curated-archive="critical-knowledge-v1"')||
   !ccSource.includes('href="https://pedroblanco.github.io'+video+'"')||
   ccSource.includes("Material audiovisual pendiente"))
 throw Error("Approved historical video link missing or obsolete notice remains");
const km=fs.readFileSync(path.join(dist,"KM2024.html"),"utf8");
if(km.includes('/edit"')||km.includes("Documento PDF pendiente"))
 throw Error("Editing link or obsolete pending review message in KM2024");
for(const original of ["CROQUETAS2024.pdf","NEXUM2024.pdf","NEXUM2024.pptx"]){
 if(!km.includes('href="https://pedroblanco.github.io/'+original+'"'))
  throw Error("Approved local document link missing from KM2024: "+original);
}
const cc=fs.readFileSync(path.join(dist,"CC.html"),"utf8");
if(/<script\b|mailto:|data:/i.test(cc))throw Error("Unsafe active links in staged CC.html");
const links=[...cc.matchAll(/href=["']([^"']+)["']/g)].map(x=>x[1]);
if(!links.length||links.some(x=>!x.startsWith("https://")))throw Error("Staged CC.html contains non-HTTPS link");
const unresolved=links.filter(s=>s.startsWith("https://pedroblanco.github.io/")&&!fs.existsSync(path.join(dist,new URL(s).pathname.slice(1))));
if(unresolved.length)console.warn("Legacy page links to "+unresolved.length+" not-yet-staged original media file(s).");
if(process.argv.includes("--strict")){
 const pending=manifest.entries.filter(x=>["hold","preview","preview-tool"].includes(x.status));
 if(pending.length)throw Error("Full Eleventy deployment blocked by "+pending.length+" outstanding migration review(s): "+pending.map(x=>x.path).join(", "));
}
console.log("Selective preservation verified: "+staged.length+" fixed original file; "+manifest.entries.filter(x=>x.status==="retire").length+" retired applications excluded.");
