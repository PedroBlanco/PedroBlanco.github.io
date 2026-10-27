import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import manifest from "../src/data/migration-manifest.json" with {type:"json"};
const dist=path.resolve("dist");
const gitSha=data=>createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");
const staged=manifest.entries.filter(x=>x.status==="preview");
if(staged.length!==1||staged[0].path!=="CC.html")throw Error("Preview inventory changed: review checks");
for(const entry of staged){
 const loc=path.join(dist,entry.path);
 if(!fs.existsSync(loc)||gitSha(fs.readFileSync(loc))!==entry.gitBlobSha)throw Error("Missing or modified staged document: "+entry.path);
}
for(const entry of manifest.entries.filter(x=>x.status!=="preview")){
 const target=path.join(dist,entry.path);
 if(entry.path==="calculadora-tiempo/"&&entry.status==="hold"&&(process.env.CALCULADORA_WEB_DIST||process.env.WEB_ARTIFACT_MANIFEST)){
  if(!fs.existsSync(target))throw Error("Calculator integration requested but build missing");
  continue; // Separately validated by check-calculator.mjs.
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
const cc=fs.readFileSync(path.join(dist,"CC.html"),"utf8");
if(/<script\b|mailto:|data:/i.test(cc))throw Error("Unsafe active links in staged CC.html");
const links=[...cc.matchAll(/href=["']([^"']+)["']/g)].map(x=>x[1]);
if(!links.length||links.some(x=>!x.startsWith("https://")))throw Error("Staged CC.html contains non-HTTPS link");
const unresolved=links.filter(s=>s.startsWith("https://pedroblanco.github.io/")&&!fs.existsSync(path.join(dist,new URL(s).pathname.slice(1))));
if(unresolved.length)console.warn("Legacy page links to "+unresolved.length+" not-yet-staged original media file(s).");
if(process.argv.includes("--strict"))throw Error("Cannot publish: historical assets still pending review, security migration and manual authorization.");
console.log("Selective preservation verified: "+staged.length+" fixed original file; "+manifest.entries.filter(x=>x.status==="retire").length+" retired applications excluded.");
