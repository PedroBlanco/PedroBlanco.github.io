import fs from "node:fs";
import path from "node:path";
const root=path.resolve("dist"), strict=process.argv.includes("--strict");
const broken=new Map(), pages=[];
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const pathname=path.join(dir,entry.name);
  if(entry.isDirectory())walk(pathname);
  else if(entry.isFile()&&pathname.endsWith(".html"))pages.push(pathname);
 }
}
walk(root);
for(const file of pages){
 const html=fs.readFileSync(file,"utf8");
 const refs=[...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)].map(x=>x[1]);
 const origin=path.relative(root,file).replaceAll(path.sep,"/");
 const rootBase="/"+origin.replace(/index\.html$/,"");
 for(const raw of refs){
  if(raw.startsWith("#")||/^(?:mailto:|tel:|data:|javascript:)/i.test(raw))continue;
  let url;
  try{url=new URL(raw,"https://pedroblanco.github.io"+rootBase);}
  catch{continue;}
  if(url.hostname!=="pedroblanco.github.io")continue;
  const rel=decodeURIComponent(url.pathname).replace(/^\/+/,"");
  if(rel.split("/").some(s=>s===".."||s==="."))throw Error("Unsafe generated link: "+raw);
  const dest=path.join(root,rel);
  if(!fs.existsSync(dest)&&!fs.existsSync(path.join(dest,"index.html"))){
   const label="/"+rel;
   if(!broken.has(label))broken.set(label,new Set());
   broken.get(label).add(origin);
  }
 }
}
const report=[...broken.entries()].map(([uri,from])=>({uri,sourcePages:[...from].sort()})).sort((a,b)=>a.uri.localeCompare(b.uri));
console.log("Local route audit: "+pages.length+" HTML pages; "+report.length+" unresolved target(s).");
for(const issue of report)console.warn("MISSING "+issue.uri+" <- "+issue.sourcePages.slice(0,4).join(", ")+(issue.sourcePages.length>4?" (+"+(issue.sourcePages.length-4)+")":""));
if(strict&&report.length)throw Error("Publication blocked by "+report.length+" unresolved local links");
