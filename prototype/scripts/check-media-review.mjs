import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import manifest from "../src/data/media-review.json" with {type:"json"};
const source=path.resolve(".."), output=path.resolve("dist");
const allowedCategories=new Set(["document","presentation","video","audio","spreadsheet","html","image"]);
const allowedStatuses=new Set(["hold","approved","retire"]);
if(manifest.schemaVersion!==1||!Array.isArray(manifest.entries))throw Error("Unexpected media review manifest format");
const all=manifest.entries;
const seen=new Set();
for(const e of all){
 if(typeof e.path!=="string"||e.path.startsWith("/")||e.path.includes("\\")||e.path.split("/").some(p=>!p||p==="."||p==="..")||seen.has(e.path))
  throw Error("Unsafe/duplicate media review entry: "+e.path);
 seen.add(e.path);
 if(!allowedCategories.has(e.category)||!allowedStatuses.has(e.status)||!/^[a-f0-9]{40}$/.test(e.gitBlobSha)||!Number.isSafeInteger(e.bytes)||e.bytes<0||!e.reason)
  throw Error("Incomplete media review entry: "+e.path);
 if(e.status==="approved"&&(!e.reviewedBy||!/^\d{4}-\d{2}-\d{2}$/.test(e.reviewedAt||"")||!e.evidence))
  throw Error("Missing explicit rights/privacy approval metadata for "+e.path);
 const name=path.join(source,e.path);
 const info=fs.lstatSync(name);
 if(!info.isFile()||info.isSymbolicLink()||info.size!==e.bytes)throw Error("Media source modified, missing or unsafe: "+e.path);
 const sha=createHash("sha1").update(Buffer.from("blob "+info.size+"\0"));
 const stream=fs.createReadStream(name);
 for await (const data of stream)sha.update(data);
 if(sha.digest("hex")!==e.gitBlobSha)throw Error("Media source hash changed; re-review: "+e.path);
 if(e.status==="approved"){
  if(!fs.existsSync(path.join(output,e.path)))
    throw Error("Approved resource missing from site output: "+e.path);
  const outputBytes=fs.readFileSync(path.join(output,e.path));
  const outputHash=createHash("sha1").update(Buffer.from("blob "+outputBytes.length+"\0")).update(outputBytes).digest("hex");
  if(outputHash!==e.gitBlobSha)throw Error("Approved media output differs from reviewed source: "+e.path);
 }
 if(e.path==="revista/index.html"&&e.status==="retire"&&fs.existsSync(path.join(output,e.path))){
  const curated=fs.readFileSync(path.join(output,e.path),"utf8");
  if(!curated.includes('data-curated-archive="revista-v1"')||curated.includes("Artículo 1")||/<script\b|<img\b|<video\b|<audio\b/i.test(curated))
    throw Error("Original placeholder or unreviewed media leaked into curated archive");
 }else if(e.status!=="approved"&&fs.existsSync(path.join(output,e.path))){
  throw Error("Unreviewed media copied into published artifact: "+e.path);
 }
}
const actual=[];
function walk(dir, prefix=""){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const rel=prefix+entry.name,loc=path.join(dir,entry.name);
  if(entry.isDirectory())walk(loc,rel+"/");
  else {if(!entry.isFile())throw Error("Source media symlink or non-file "+rel);actual.push("revista/"+rel);}
 }
}
walk(path.join(source,"revista"));
for(const name of fs.readdirSync(source))if(/^(?:CROQUETAS2024|NEXUM2024)\.(?:pdf|pptx)$/.test(name))actual.push(name);
const unlisted=actual.filter(x=>!seen.has(x)),missing=all.map(x=>x.path).filter(x=>!actual.includes(x));
if(unlisted.length||missing.length)throw Error("Media inventory changed: unlisted="+unlisted.join(", ")+" missing="+missing.join(", "));
const counts=all.reduce((o,e)=>{o[e.category]=(o[e.category]||0)+1;return o;},{});
console.log("Media audit OK: "+all.length+" files, "+all.reduce((a,e)=>a+e.bytes,0)+" bytes; categories="+JSON.stringify(counts)+".");
console.log("Review status: "+all.filter(e=>e.status==="hold").length+" on hold; "+all.filter(e=>e.status==="approved").length+" approved.");
if(process.argv.includes("--strict")&&all.some(e=>e.status==="hold"))throw Error("Full archive publication blocked: "+all.filter(e=>e.status==="hold").length+" media files still require a rights/privacy decision.");
