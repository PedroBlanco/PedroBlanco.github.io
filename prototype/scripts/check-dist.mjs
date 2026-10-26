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
for(const [localPath,lang] of [["index.html","es"],["en/index.html","en"]]){
 const html=fs.readFileSync(path.join(dist,localPath),"utf8");
 if(!html.includes('<section class="home-explore wrap"')||!html.includes('class="hero-actions"'))
  throw Error("Missing editorial homepage composition in "+localPath);
 const expected=lang==="es"?["/herramientas/","/proyectos/","/archivo/"]:["/en/tools/","/en/projects/","/en/archive/"];
 for(const href of expected)if(!html.includes('class="section-link" href="'+href+'"'))
  throw Error("Missing homepage section access "+href);
 if((html.match(/class="card"/g)||[]).length!==3)
  throw Error("Expected three editorially featured project cards at "+localPath);
}
for(const [archivePath,lang] of [["archivo/index.html","es"],["en/archive/index.html","en"]]){
 const html=fs.readFileSync(path.join(dist,archivePath),"utf8");
 const years=["2023","2019","undated"];
 for(const year of years)if(!html.includes('id="archive-period-'+year+'"'))throw Error("Missing chronological group "+year+" in "+archivePath);
 for(const category of ["all","atlas","initiatives","documents"])if(!html.includes('data-archive-filter="'+category+'"'))throw Error("Missing archive filter "+category+" in "+archivePath);
 for(const type of ["atlas","initiatives","documents"])if(!html.includes('data-archive-category="'+type+'"'))throw Error("Missing archive category "+type+" in "+archivePath);
 if(!html.includes('src="/scripts/archive-filter.js"'))throw Error("Missing progressive filter script in "+archivePath);
 if((html.match(/data-archive-entry(?!-)/g)||[]).length!==7)throw Error("Expected seven historical entries in "+archivePath);
 if(!html.includes('role="group"')||!html.includes('aria-pressed="true"'))throw Error("Missing accessible filter controls in "+archivePath);
}
if(!fs.existsSync(path.join(dist,"scripts/archive-filter.js")))throw Error("Missing filter asset");
const privatePaths=["mapeo/2019-04-11 EXPORT lista_fichas_mapeo.csv","embajadores/embajadores","art-of-hosting/participantes","mapas/autores"];
for(const p of privatePaths){if(fs.existsSync(path.join(dist,p))){console.error("PRIVATE/RETIRED CONTENT IN BUILD "+p);process.exitCode=1;}}
for(const item of content.items){
 if(!item.media)continue;
 for(const lang of ["es","en"]){
  const media=item.media[lang];
  if(!media?.src?.startsWith("/media/")||!media.alt?.trim()||!media.caption?.trim())throw Error("Invalid media metadata: "+item.id+" "+lang);
  if(!fs.existsSync(path.join(dist,media.src.slice(1))))throw Error("Missing image: "+media.src);
  const route=content.routes.find(r=>r.section==="detail"&&r.id===item.id&&r.lang===lang);
  const html=fs.readFileSync(path.join(dist,route.path,"index.html"),"utf8");
  if(!html.includes('src="'+media.src+'"')||!html.includes('alt="'+media.alt+'"'))throw Error("Missing localized media in "+route.path);
 }
}
if(!fs.existsSync(path.join(dist,"404.html"))){console.error("MISSING 404.html");process.exitCode=1;}
if(!process.exitCode)console.log("Validated "+paths.size+" bilingual routes and 404 page; no retired personal directories copied");
