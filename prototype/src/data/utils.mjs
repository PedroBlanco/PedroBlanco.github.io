export { default as repositories } from "./repositories.json" with { type: "json" };
export { default as editorial } from "./editorial.json" with { type: "json" };
export { default as content } from "./content.json" with { type: "json" };
export const root = "https://pedroblanco.github.io";
export function sectionUrl(lang,section){
 const es={home:"/",tools:"/herramientas/",projects:"/proyectos/",archive:"/archivo/",about:"/acerca-de/"};
 const en={home:"/en/",tools:"/en/tools/",projects:"/en/projects/",archive:"/en/archive/",about:"/en/about/"};
 return (lang==="en"?en:es)[section];
}
export function itemUrl(item,lang){
 if(item.kind==="archive") return lang==="es"?"/"+item.slug+"/":"/en/archive/"+item.slug+"/";
 return (lang==="es"?(item.kind==="tool"?"/herramientas/":"/proyectos/"):(item.kind==="tool"?"/en/tools/":"/en/projects/"))+item.slug+"/";
}
export function alternateUrl(route,lang,items){
 return route.section==="detail"?itemUrl(items.find(i=>i.id===route.id),lang):sectionUrl(lang,route.section==="missing"?"home":route.section);
}
export function publicCatalog(repos,editorial,items){
 const featuredSources = new Set(items.map(i=>i.source).filter(Boolean));
 return repos.filter(r=>!editorial.exclude.includes(r.name))
 .filter(r=>!featuredSources.has(r.url))
 .filter(r=>!editorial.include.length || editorial.include.includes(r.name))
 .map(r=>({...r,featured:editorial.featured.includes(r.name)}))
 .sort((a,b)=>Number(b.featured)-Number(a.featured)||a.name.localeCompare(b.name));
}
