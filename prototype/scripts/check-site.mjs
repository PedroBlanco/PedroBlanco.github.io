import fs from "node:fs";
import path from "node:path";
import content from "../src/data/content.json" with {type:"json"};

// Permanent site checks: use current content/routes, not a fixed migration inventory.
const dist=path.resolve("dist");
if(!fs.existsSync(dist)||!fs.statSync(dist).isDirectory())
 throw Error("Missing Eleventy dist/; run npm run build first");
if(!Array.isArray(content.routes)||!Array.isArray(content.items))
 throw Error("Invalid content routing manifest");
const seen=new Set();
const routeFiles=new Map();
function safeRoute(route){
 if(typeof route.path!=="string"||route.path.startsWith("/")||route.path.includes("\\")||
    route.path.split("/").some(p=>p==="."||p==="..")||route.path.includes("\0"))
  throw Error("Unsafe route in content data");
 if(!["es","en"].includes(route.lang))throw Error("Unexpected route language");
 return route.path?route.path+"/index.html":"index.html";
}
for(const route of content.routes){
 const rel=safeRoute(route);
 if(seen.has(rel))throw Error("Duplicate generated route: "+rel);
 seen.add(rel);
 const file=path.join(dist,rel);
 if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error("Missing generated page: "+rel);
 const html=fs.readFileSync(file,"utf8");
 if(!html.includes('<html lang="'+route.lang+'"'))throw Error("Wrong document language: "+rel);
 for(const token of ['hreflang="es"','hreflang="en"','rel="canonical"'])
  if(!html.includes(token))throw Error("Missing "+token+" in "+rel);
 routeFiles.set(route.path,html);
}
const notFound=path.join(dist,"404.html");
if(!fs.existsSync(notFound)||!fs.statSync(notFound).isFile())throw Error("Missing 404.html");
let images=0;
for(const item of content.items){
 if(!item.media)continue;
 for(const lang of ["es","en"]){
  const media=item.media[lang];
  if(!media?.src?.startsWith("/media/")||media.src.includes("..")||
     !media.alt?.trim()||!media.caption?.trim())throw Error("Incomplete media: "+item.id+" "+lang);
  const file=path.join(dist,media.src.slice(1));
  if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error("Missing media file: "+media.src);
  const detail=content.routes.find(x=>x.section==="detail"&&x.id===item.id&&x.lang===lang);
  if(!detail)throw Error("Missing localized detail page: "+item.id+" "+lang);
  const html=routeFiles.get(detail.path);
  if(!html?.includes('src="'+media.src+'"')||!html.includes('alt="'+media.alt+'"'))
   throw Error("Missing localized image in "+detail.path);
  images++;
 }
}
console.log("Site OK: "+seen.size+" routes, 404 page and "+images+" localized image references");
