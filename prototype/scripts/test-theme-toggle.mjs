import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const source=readFileSync(new URL("../src/scripts/theme-toggle.js",import.meta.url),"utf8");
function scenario({dark=false,saved=null,lang="es",blockedStorage=false,loading=false}={}){
 const storageData=new Map();
 if(saved!==null)storageData.set("pedroblanco-color-mode",saved);
 const rootAttributes=new Map();
 const buttonAttributes=new Map();
 const imgAttributes=new Map([["src","/media/adaptation-loop-es.svg"],["data-theme-image","/media/adaptation-loop-es.svg"]]);
 const icon={textContent:"◐"},label={textContent:"Sistema"};
 let click=null,mediaChanged=null,ready=null;
 const root={
  lang, setAttribute:(k,v)=>rootAttributes.set(k,String(v)),
  removeAttribute:k=>rootAttributes.delete(k),
  getAttribute:k=>rootAttributes.get(k)??null
 };
 const button={
  hidden:true,querySelector:s=>s==="[data-theme-icon]"?icon:s==="[data-theme-label]"?label:null,
  setAttribute:(k,v)=>buttonAttributes.set(k,String(v)),
  addEventListener:(k,fn)=>{if(k==="click")click=fn;}
 };
 const image={getAttribute:k=>imgAttributes.get(k)??null,setAttribute:(k,v)=>imgAttributes.set(k,v)};
 const media={
  matches:dark,
  addEventListener:(k,fn)=>{if(k==="change")mediaChanged=fn;}
 };
 const storage={
  getItem:k=>{if(blockedStorage)throw Error("storage blocked");return storageData.get(k)??null;},
  setItem:(k,v)=>{if(blockedStorage)throw Error("storage blocked");storageData.set(k,v);},
  removeItem:k=>{if(blockedStorage)throw Error("storage blocked");storageData.delete(k);}
 };
 const document={
  documentElement:root,
  readyState:loading?"loading":"complete",
  addEventListener:(k,fn)=>{if(k==="DOMContentLoaded")ready=fn;},
  querySelectorAll:sel=>sel==="[data-theme-toggle]"?[button]:sel==="img[data-theme-image]"?[image]:[]
 };
 const window={localStorage:storage,matchMedia:()=>media};
 vm.runInNewContext(source,{document,window});
 return {
  root,button,icon,label,media,storageData,
  mode:()=>root.getAttribute("data-theme"),
  src:()=>image.getAttribute("src"),
  click:()=>{assert.ok(click,"click bound");click();},
  ready:()=>{assert.ok(ready,"DOM ready bound");ready();},
  systemChanged:darkNow=>{media.matches=darkNow;assert.ok(mediaChanged);mediaChanged();},
  aria:()=>buttonAttributes.get("aria-label")
 };
}

test("system default, first click switches appearance, and third restores system",()=>{
 const app=scenario();
 assert.equal(app.mode(),null);
 assert.equal(app.label.textContent,"Sistema");
 assert.equal(app.button.hidden,false);
 assert.match(app.aria(),/Cambiar a oscuro/);
 app.click();assert.equal(app.mode(),"dark");
 assert.equal(app.label.textContent,"Oscuro");
 assert.equal(app.src(),"/media/adaptation-loop-es-dark.svg");
 assert.equal(app.storageData.get("pedroblanco-color-mode"),"dark");
 app.click();assert.equal(app.mode(),"light");
 assert.equal(app.src(),"/media/adaptation-loop-es-light.svg");
 app.click();assert.equal(app.mode(),null);
 assert.equal(app.src(),"/media/adaptation-loop-es.svg");
 assert.equal(app.storageData.has("pedroblanco-color-mode"),false);
});

test("system dark first click switches to light",()=>{
 const app=scenario({dark:true,lang:"en"});
 assert.equal(app.label.textContent,"System");
 assert.match(app.aria(),/Switch to light/);
 app.click();assert.equal(app.mode(),"light");
 app.click();assert.equal(app.mode(),"dark");
 app.click();assert.equal(app.mode(),null);
});

test("manual saved preference survives page load; invalid preference is ignored",()=>{
 const saved=scenario({saved:"dark",lang:"en"});
 assert.equal(saved.mode(),"dark");
 assert.equal(saved.label.textContent,"Dark");
 assert.equal(saved.src(),"/media/adaptation-loop-es-dark.svg");
 const invalid=scenario({saved:"sepia"});
 assert.equal(invalid.mode(),null);
 assert.equal(invalid.label.textContent,"Sistema");
});

test("OS changes update system mode but do not overwrite a manual override",()=>{
 const app=scenario();
 app.systemChanged(true);
 assert.equal(app.mode(),null);
 assert.match(app.aria(),/Cambiar a claro/);
 app.click();
 assert.equal(app.mode(),"light");
 app.systemChanged(false);
 assert.equal(app.mode(),"light");
 assert.equal(app.label.textContent,"Claro");
});

test("blocked localStorage does not break manual switching",()=>{
 const app=scenario({blockedStorage:true});
 app.click();assert.equal(app.mode(),"dark");
 app.click();assert.equal(app.mode(),"light");
 app.click();assert.equal(app.mode(),null);
});

test("early initialization restores theme before DOMContentLoaded",()=>{
 const app=scenario({saved:"dark",loading:true});
 assert.equal(app.mode(),"dark");
 assert.equal(app.button.hidden,true);
 app.ready();
 assert.equal(app.button.hidden,false);
 assert.equal(app.label.textContent,"Oscuro");
});

test("image variants are provided without scripts or active content",()=>{
 for(const lang of ["es","en"])for(const mode of ["light","dark"]){
  const svg=readFileSync(new URL("../src/media/adaptation-loop-"+lang+"-"+mode+".svg",import.meta.url),"utf8");
  assert.match(svg,/<svg\s/);
  assert.doesNotMatch(svg,/<script\b|<foreignObject\b|<style\b/i);
  assert.match(svg,new RegExp(mode==="light"?"#EDF3F7":"#18243A"));
 }
});
