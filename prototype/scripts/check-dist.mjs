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
const researchItem=content.items.find(x=>x.id==="research");
for(const lang of ["es","en"]){
 const researchRoute=content.routes.find(x=>x.section==="detail"&&x.id==="research"&&x.lang===lang);
 const researchHtml=fs.readFileSync(path.join(dist,researchRoute.path,"index.html"),"utf8");
 if(!researchHtml.includes('class="detail-layout"')||!researchHtml.includes('class="detail-toc"'))
  throw Error("Missing contextual index in "+researchRoute.path);
 for(const section of [{id:"resumen"},...(researchItem.sections||[])]){
  if(!researchHtml.includes('href="#'+section.id+'"')||!researchHtml.includes('id="'+section.id+'"'))
   throw Error("Broken detail anchor "+section.id+" in "+researchRoute.path);
 }
 const shortRoute=content.routes.find(x=>x.section==="detail"&&x.id==="csv"&&x.lang===lang);
 const shortHtml=fs.readFileSync(path.join(dist,shortRoute.path,"index.html"),"utf8");
 if(shortHtml.includes('class="detail-toc"')||!shortHtml.includes('class="detail-prose"'))
  throw Error("Short profile incorrectly has an index in "+shortRoute.path);
}
// Verify real and translated documentation resources, without unsafe URLs.
const resourceGroups=["documentation","downloads","references"];
let resourcesFound=0;
for(const item of content.items){
 const resources=item.resources||[];
 const urls=new Set([item.live,item.source].filter(Boolean));
 const countByType=new Set();
 for(const resource of resources){
  if(!resourceGroups.includes(resource.type))throw Error("Invalid resource category "+item.id);
  if(typeof resource.href!=="string"||!(resource.href.startsWith("/")&&!resource.href.startsWith("//")||/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(resource.href)))
    throw Error("Unsafe resource URL "+item.id);
  if(urls.has(resource.href))throw Error("Duplicate primary action as supplementary resource "+item.id);
  if(!resource.es?.label||!resource.en?.label)throw Error("Untranslated resource "+item.id);
  if(urls.has(resource.href))throw Error("Repeated resource link "+item.id);
  urls.add(resource.href);countByType.add(resource.type);resourcesFound++;
 }
 for(const lang of ["es","en"]){
  const route=content.routes.find(r=>r.section==="detail"&&r.id===item.id&&r.lang===lang);
  const html=fs.readFileSync(path.join(dist,route.path,"index.html"),"utf8");
  if(resources.length){
   if(!html.includes('id="recursos"'))throw Error("Missing supplementary resources "+route.path);
   for(const type of countByType)if(!html.includes(content.langs[lang].resources[type]))throw Error("Untranslated resource heading "+route.path);
   for(const res of resources)if(!html.includes('href="'+res.href+'"')||!html.includes(res[lang].label))throw Error("Missing resource "+route.path);
  }else if(html.includes('id="recursos"'))throw Error("Empty resources displayed "+route.path);
  const primary=[item.live,item.source].filter(Boolean);
  if(!primary.length&&html.includes('class="actions"'))throw Error("Empty action group "+route.path);
  if((item.sections||[]).length>=3&&resources.length&&!html.includes('href="#recursos"'))throw Error("Missing resource index link "+route.path);
 }
}
if(resourcesFound!==3)throw Error("Expected three verified resource examples, got "+resourcesFound);
// Native mobile navigation, bilingual switch visible without opening the menu.
for(const [target,lang] of [["index.html","es"],["en/index.html","en"],["herramientas/index.html","es"],["en/tools/index.html","en"]]){
 const html=fs.readFileSync(path.join(dist,target),"utf8");
 const headerStart=html.indexOf('<header class="site-header">');
 const headerEnd=html.indexOf('</header>',headerStart);
 if(headerStart<0||headerEnd<0)throw Error("Header not present: "+target);
 const header=html.slice(headerStart,headerEnd);
 const mainNav=header.indexOf('<nav class="desktop-nav"');
 const details=header.indexOf('<details class="mobile-menu">');
 const summary=header.indexOf('<summary class="menu-toggle">');
 const mobileNav=header.indexOf('<nav class="mobile-nav"');
 const langAnchor=header.indexOf('class="lang"');
 if(!(mainNav>=0&&details>mainNav&&summary>details&&mobileNav>summary&&langAnchor>mainNav&&langAnchor<details))
  throw Error("Invalid native menu or hidden language switch: "+target);
 const wanted=lang==="es"?["/","/herramientas/","/proyectos/","/archivo/","/acerca-de/"]:["/en/","/en/tools/","/en/projects/","/en/archive/","/en/about/"];
 for(const href of wanted){
  const search='href="'+href+'"';
  if(header.split(search).length-1 < 2)throw Error("Missing mobile or desktop nav "+href+" in "+target);
 }
 if(!header.includes("aria-current="))throw Error("Current page state not exposed: "+target);
 if(!header.includes(">"+(lang==="es"?"Menú":"Menu")+"</span>"))throw Error("Untranslated menu label: "+target);
 const alternate=target.includes("tools/")?'href="https://pedroblanco.github.io/herramientas/"':target.includes("herramientas/")?'href="https://pedroblanco.github.io/en/tools/"':lang==="es"?'href="https://pedroblanco.github.io/en/"':'href="https://pedroblanco.github.io/"';
 if(!header.includes(alternate))throw Error("Language switch missing: "+target);
}
for(const lang of ["es","en"]){
 const file=lang==="es"?"herramientas/pdf-fotos-a-imagenes/index.html":"en/tools/pdf-fotos-a-imagenes/index.html";
 const html=fs.readFileSync(path.join(dist,file),"utf8");
 if(!html.includes('class="markdown-content"')||!html.includes("<pre><code")||!html.includes("pypdfium2"))
  throw Error("Markdown content missing in "+file);
 const csv=lang==="es"?"herramientas/csv2sqlite/index.html":"en/tools/csv2sqlite/index.html";
 const csvHtml=fs.readFileSync(path.join(dist,csv),"utf8");
 if(!csvHtml.includes('class="markdown-content"')||!csvHtml.includes("procesar_csv.py"))
  throw Error("Markdown CSV documentation missing: "+csv);
}
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
