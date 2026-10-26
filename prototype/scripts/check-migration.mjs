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
for(const entry of manifest.entries.filter(x=>x.status!=="preview"))
 if(fs.existsSync(path.join(dist,entry.path)))throw Error("Blocked/retired resource leaked: "+entry.path);
const cc=fs.readFileSync(path.join(dist,"CC.html"),"utf8");
if(/<script\b|mailto:|data:/i.test(cc))throw Error("Unsafe active links in staged CC.html");
const links=[...cc.matchAll(/href=["']([^"']+)["']/g)].map(x=>x[1]);
if(!links.length||links.some(x=>!x.startsWith("https://")))throw Error("Staged CC.html contains non-HTTPS link");
const unresolved=links.filter(s=>s.startsWith("https://pedroblanco.github.io/")&&!fs.existsSync(path.join(dist,new URL(s).pathname.slice(1))));
if(unresolved.length)console.warn("Legacy page links to "+unresolved.length+" not-yet-staged original media file(s).");
if(process.argv.includes("--strict"))throw Error("Cannot publish: historical assets still pending review, security migration and manual authorization.");
console.log("Selective preservation verified: "+staged.length+" fixed original file; "+manifest.entries.filter(x=>x.status==="retire").length+" retired applications excluded.");
