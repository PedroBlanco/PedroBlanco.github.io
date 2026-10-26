import fs from "node:fs";
import path from "node:path";
import content from "../src/data/content.json" with {type:"json"};
const dist=path.resolve("dist"),paths=new Set();
for(const route of content.routes){
 const target=route.path?route.path+"/index.html":"index.html";
 if(paths.has(target))throw Error("Duplicate output route: "+target);
 paths.add(target);
 const file=path.join(dist,target);
 if(!fs.existsSync(file)){console.error("MISSING "+target);process.exitCode=1;continue;}
 const html=fs.readFileSync(file,"utf8");
 if(!html.includes('<html lang="'+route.lang+'"')||!html.includes('hreflang="es"')||!html.includes('hreflang="en"')){
   console.error("BAD I18N "+target);process.exitCode=1;
 }
 if(!html.includes('rel="canonical"')){console.error("NO CANONICAL "+target);process.exitCode=1;}
}
const privatePaths=["mapeo/2019-04-11 EXPORT lista_fichas_mapeo.csv","embajadores/embajadores","art-of-hosting/participantes","mapas/autores"];
for(const p of privatePaths){if(fs.existsSync(path.join(dist,p))){console.error("PRIVATE/RETIRED CONTENT IN BUILD "+p);process.exitCode=1;}}
if(!fs.existsSync(path.join(dist,"404.html"))){console.error("MISSING 404.html");process.exitCode=1;}
if(!process.exitCode)console.log("Validated "+paths.size+" bilingual routes and 404 page; no retired personal directories copied");
