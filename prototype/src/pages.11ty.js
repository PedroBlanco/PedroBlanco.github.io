import content from "./data/content.json" with { type: "json" };
import {readFileSync} from "node:fs";
import MarkdownIt from "markdown-it";
const md = new MarkdownIt({html:false,linkify:false,typographer:false});
import repositories from "./data/repositories.json" with { type: "json" };
import editorial from "./data/editorial.json" with { type: "json" };
import {root, sectionUrl, itemUrl, alternateUrl, publicCatalog} from "./data/utils.mjs";

const esc=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const link=(href,label,other="")=>'<a href="'+esc(href)+'"'+other+'>'+esc(label)+'</a>';
const badge=(label)=>'<span class="chip">'+esc(label)+'</span>';
const mediaFigure=(item,lang,className)=>{const m=item?.media?.[lang];return m&&m.src?.startsWith('/media/')&&m.alt&&m.caption?'<figure class="'+esc(className)+'"><img src="'+esc(m.src)+'" alt="'+esc(m.alt)+'" width="740" height="260" loading="lazy" decoding="async"><figcaption>'+esc(m.caption)+'</figcaption></figure>':'';};
function renderArchive(items,documents,lang,t){
  const view=t.archiveView;
  const entries=[
    ...items.filter(item=>item.kind==="archive").map(item=>({
      key:item.id,url:itemUrl(item,lang),year:item.archiveYear??null,
      category:item.archiveCategory,title:item[lang].title,summary:item[lang].summary
    })),
    ...(documents||[]).map(doc=>({
      key:doc.id,url:doc.url,year:doc.archiveYear??null,
      category:doc.archiveCategory,title:doc[lang].title,summary:doc[lang].summary
    }))
  ];
  const byYear=new Map();
  for(const entry of entries){
    if(!["atlas","initiatives","documents"].includes(entry.category))throw Error("Unknown archive category: "+entry.key);
    if(entry.year!==null&&(!Number.isInteger(entry.year)||entry.year<1900))throw Error("Unverified archive year: "+entry.key);
    const key=entry.year===null?"undated":String(entry.year);
    if(!byYear.has(key))byYear.set(key,[]);
    byYear.get(key).push(entry);
  }
  const years=[...byYear.keys()].sort((a,b)=>a==="undated"?1:b==="undated"?-1:Number(b)-Number(a));
  const cats=["all","atlas","initiatives","documents"];
  const filters='<div class="archive-filters" role="group" aria-label="'+esc(view.filtersLabel)+'" hidden>'
    +cats.map((cat,i)=>'<button class="archive-filter" type="button" data-archive-filter="'+cat+'" aria-controls="archive-items" aria-pressed="'+(i===0?'true':'false')+'">'+esc(view[cat])+'</button>').join('')
    +'</div><p class="archive-count" aria-live="polite" data-archive-count hidden></p>';
  const periods=years.map(year=>{
    const heading=year==="undated"?view.undated:year;
    const cards=byYear.get(year).map(entry=>
      '<article class="archive-entry" data-archive-entry data-archive-category="'+esc(entry.category)+'">'
      +'<div class="chips">'+badge(view[entry.category])+'</div>'
      +'<h3>'+link(entry.url,entry.title)+'</h3><p>'+esc(entry.summary)+'</p>'
      +link(entry.url,view.view+' →',' class="archive-entry-link"')+'</article>'
    ).join('');
    return '<section class="archive-period" data-archive-period aria-labelledby="archive-period-'+esc(year)+'">'
    +'<h2 id="archive-period-'+esc(year)+'">'+esc(heading)+'</h2>'
    +'<div class="archive-period-items">'+cards+'</div></section>';
  }).join('');
  return '<section class="section wrap" aria-labelledby="archive-heading">'
    +'<h1 id="archive-heading">'+esc(view.title)+'</h1><p class="lede">'+esc(view.intro)+'</p>'
    +filters+'<div class="archive-timeline" id="archive-items">'+periods+'</div></section>';
}


const resourceTypes=["documentation","downloads","references"];
function safeResourceHref(href){
 return typeof href==="string"&&(href.startsWith("/")&&!href.startsWith("//")||/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(href));
}
function renderResources(item,lang,t){
 const source=Array.isArray(item.resources)?item.resources:[];
 if(!source.length)return "";
 const groups=resourceTypes.map(type=>{
   const group=source.filter(x=>x.type===type);
   if(!group.length)return "";
   const links=group.map(entry=>{
     if(!safeResourceHref(entry.href)||!entry[lang]?.label)throw Error("Invalid resource "+item.id+" "+lang);
     return '<li>'+link(entry.href,entry[lang].label)+'</li>';
   }).join("");
   return '<section class="resource-group"><h3>'+esc(t.resources[type])+'</h3><ul>'+links+'</ul></section>';
 }).join("");
 if(source.some(x=>!resourceTypes.includes(x.type)))throw Error("Unknown resource type "+item.id);
 return '<section class="detail-section resources-section" id="recursos"><h2>'+esc(t.resources.title)+'</h2><div class="resource-groups">'+groups+'</div></section>';
}
function detailHtml(item,lang){
 if(!item.markdown)return '<p>'+esc(item[lang].detail)+'</p>';
 if(!/^[a-z0-9-]+$/.test(item.id)||!["es","en"].includes(lang))throw Error("Invalid Markdown content key");
 const filename=new URL("./content/"+lang+"/"+item.id+".md",import.meta.url);
 const source=readFileSync(filename,"utf8");
 return '<div class="markdown-content">'+md.render(source)+'</div>';
}
function renderDetail(item,lang,t,backSection){
  const sections=Array.isArray(item.sections)?item.sections:[];
  const extensive=sections.length>=3;
  const introTitle=lang==="es"?"Sobre este proyecto":"About this project";
  const privacyNote=item.kind==="archive"
    ?'<p class="muted">'+(lang==="es"
      ?"La aplicación anterior se ha retirado de la publicación prevista; esta página preservará su contexto histórico."
      :"The former application is being retired from the planned publication; this page preserves its historical context.")+'</p>'
    :"";
  const intro='<section id="resumen" class="detail-section"><h2>'+esc(introTitle)+'</h2>'+detailHtml(item,lang)+privacyNote+'</section>';
  const resources=renderResources(item,lang,t);
  const articleBody=intro
    +sections.map(section=>'<section class="detail-section" id="'+esc(section.id)+'"><h2>'+esc(section[lang].title)+'</h2><p>'+esc(section[lang].body)+'</p></section>').join('')
    +resources;
  const articleContent=extensive
    ?'<div class="detail-layout"><nav class="detail-toc" aria-label="'+esc(lang==="es"?"Índice de la ficha":"Page contents")+'">'
      +'<h2 class="detail-toc-title">'+esc(lang==="es"?"En esta página":"On this page")+'</h2><ol>'
      +'<li>'+link("#resumen",introTitle)+'</li>'
      +sections.map(section=>'<li>'+link("#"+section.id,section[lang].title)+'</li>').join("")
      +(resources?'<li>'+link("#recursos",t.resources.title)+'</li>':"")
      +'</ol></nav><div class="detail-prose">'+articleBody+'</div></div>'
    :'<div class="detail-prose">'+articleBody+'</div>';
  const actions=[item.live?link(item.live,t.try):"",item.source?link(item.source,t.code):""].filter(Boolean).join("");
  return '<article class="section wrap detail'+(extensive?' detail-long':'')+'">'
    +link(sectionUrl(lang,backSection),"← "+t.back)
    +'<p class="eyebrow">'+esc(t.kind[item.kind])+' · '+esc(t.status[item.status])+'</p>'
    +'<h1>'+esc(item[lang].title)+'</h1><p class="lede">'+esc(item[lang].summary)+'</p>'
    +(actions?'<div class="actions">'+actions+'</div>':"")
    +mediaFigure(item,lang,'detail-media')+articleContent+'</article>';
}

function render(route){
 const {langs,items}=content;const t=langs[route.lang];
 const item=route.id?items.find(x=>x.id===route.id):null;
 const title=item?item[route.lang].title:route.section==="home"?t.site:t.nav[route.section]||t.notFound;
 const section=route.section==="detail"?(item.kind==="archive"?"archive":item.kind==="tool"?"tools":"projects"):route.section;
 const es=root+alternateUrl(route,"es",items),en=root+alternateUrl(route,"en",items);
 const canonical=route.section==="missing"?root+"/404.html":root+"/"+(route.path?route.path+"/":"");
 const navigation=Object.entries(t.nav).map(([key,label])=>link(sectionUrl(route.lang,key),label,section===key?' aria-current="page"':"")).join("");
 const switchLang=link(route.lang==="es"?en:es,route.lang==="es"?"EN":"ES",' class="lang" lang="'+(route.lang==="es"?"en":"es")+'" aria-label="'+(route.lang==="es"?"Read in English":"Leer en español")+'"');
 let body="";
 if(route.section==="home")body+='<section class="hero wrap"><p class="eyebrow">'+esc(t.tagline)+'</p><h1>'+esc(t.site)+'</h1><p class="lede">'+esc(t.intro)+'</p><div class="hero-actions">'+link(sectionUrl(route.lang,"projects"),t.home.heroAction,' class="primary-link"')+'</div></section>';
 if(route.section==="detail"&&item)body+=renderDetail(item,route.lang,t,section);
 if(route.section==="about")body+='<section class="section wrap detail"><h1>'+esc(t.nav.about)+'</h1><p class="lede">'+esc(t.aboutText)+'</p></section>';
 if(route.section==="missing")body+='<section class="section wrap detail"><h1>'+esc(t.notFound)+'</h1><p>'+esc(t.notFoundBody)+'</p>'+link(sectionUrl(route.lang,"archive"),t.nav.archive)+'</section>';
 if(["home","tools","projects","archive"].includes(route.section)){
   const visible=items.filter(x=>route.section==="home"?x.featured:route.section==="tools"?x.kind==="tool":route.section==="projects"?x.kind==="project":x.kind==="archive");
   const cards=visible.map(x=>'<article class="card">'+mediaFigure(x,route.lang,'card-media')+'<div class="chips">'+badge(t.kind[x.kind])+badge(t.status[x.status])+'</div><h3>'+link(itemUrl(x,route.lang),x[route.lang].title)+'</h3><p>'+esc(x[route.lang].summary)+'</p>'+link(itemUrl(x,route.lang),t.more+" →")+'</article>').join("");
   if(route.section==="archive")body+=renderArchive(items,content.archiveDocuments,route.lang,t);
   else{
     body+='<section class="section wrap"><div class="section-head"><h2>'+esc(route.section==="home"?t.featured:t.nav[route.section])+'</h2>'+(route.section==="home"?link(sectionUrl(route.lang,"projects"),t.all):"")+'</div><div class="cards">'+cards+'</div>';
   }
   if(route.section==="projects"){
      const catalog=publicCatalog(repositories,editorial,items);
      body+='<h2>'+esc(t.catalog)+'</h2><p class="muted">'+esc(t.catalogInfo)+'</p><ul class="catalog">'
      +catalog.map(r=>'<li>'+link(r.url,r.name)+'<small>'+esc(r.description)+'</small><div class="chips">'+(r.fork?badge("Fork"):"")+(r.archived?badge(t.status.historic):"")+(r.featured?badge("★"):"")+'</div></li>').join("")+'</ul>';
   }
   if(route.section!=="archive")body+='</section>';
   if(route.section==="home"){
      const destinations=["tools","projects","archive"];
      body+='<section class="home-explore wrap" aria-labelledby="home-explore-title"><div class="section-head"><h2 id="home-explore-title">'+esc(t.home.exploreTitle)+'</h2></div><div class="home-section-links">'
        +destinations.map(key=>'<a class="section-link" href="'+esc(sectionUrl(route.lang,key))+'"><span class="section-link-title">'+esc(t.nav[key])+' <span aria-hidden="true">→</span></span><span class="section-link-summary">'+esc(t.home.exploreDescriptions[key])+'</span></a>').join('')
        +'</div></section>';
   }
 }
 return '<!doctype html><html lang="'+esc(route.lang)+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark">'
 +'<title>'+esc(title)+' · PedroBlanco</title><meta name="description" content="'+esc(item?item[route.lang].summary:t.intro)+'">'
 +'<link rel="canonical" href="'+esc(canonical)+'"><link rel="alternate" hreflang="es" href="'+esc(es)+'"><link rel="alternate" hreflang="en" href="'+esc(en)+'"><link rel="alternate" hreflang="x-default" href="'+esc(es)+'"><link rel="stylesheet" href="/styles/site.css">'
 +(route.section==="archive"?'<script src="/scripts/archive-filter.js" defer></script>':'')
 +'</head><body><a class="skip" href="#main">'+(route.lang==="es"?"Saltar al contenido":"Skip to content")+'</a><header class="site-header"><div class="wrap header-inner">'
 +'<a class="brand" href="'+esc(sectionUrl(route.lang,"home"))+'">PedroBlanco<span class="brand-tagline"><span aria-hidden="true"> /</span> '+esc(t.site)+'</span></a>'
 +'<div class="header-controls"><nav class="desktop-nav" aria-label="'+(route.lang==="es"?"Navegación principal":"Primary navigation")+'">'+navigation+'</nav>'
 +switchLang
 +'<details class="mobile-menu"><summary class="menu-toggle"><span class="menu-label">'+(route.lang==="es"?"Menú":"Menu")+'</span><span class="menu-symbol" aria-hidden="true">☰</span></summary>'
 +'<nav class="mobile-nav" aria-label="'+(route.lang==="es"?"Navegación móvil":"Mobile navigation")+'">'+navigation+'</nav></details></div>'
 +'</div></header><main id="main">'+body+'</main><footer class="site-footer"><div class="wrap">'+esc(t.footer)+'</div></footer></body></html>';
}
export default class BilingualPages{
 data(){return {routes:[...content.routes,{path:"404",lang:"es",section:"missing"}],pagination:{data:"routes",size:1,alias:"route"},permalink:data=>data.route.section==="missing"?"/404.html":"/"+(data.route.path?data.route.path+"/":"")+"index.html",eleventyExcludeFromCollections:true};}
 render(data){return render(data.route);}
}
