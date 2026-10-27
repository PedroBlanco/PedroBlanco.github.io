import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import baseline from "../src/data/published-calculator.json" with {type:"json"};
const root=path.resolve("dist/calculadora-tiempo");
const strict=process.argv.includes("--strict");
if(!fs.existsSync(root)){if(strict)throw Error("Calculator distribution missing");console.warn("Calculator dist absent from prototype; local tool artifact not supplied.");process.exit(0);}
const expected=["index.html","app.js","ui.js","styles.css","manifest.webmanifest","icon.svg","sw.js",".nojekyll","src/areas.js","src/deadlines.js","src/time.js","src/periods.js","src/requirement.js","src/scoring.js","src/seniority.js","src/article129.js"];
for(const rel of expected)if(!fs.existsSync(path.join(root,rel)))throw Error("Missing calculator runtime: "+rel);
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
if(!html.includes('src="./ui.js"')||!html.includes('src="./app.js"'))throw Error("Outdated calculator runtime");
const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
if(sw.includes("__BUILD_HASH__"))throw Error("Service worker has unexpanded build hash");
if(!process.env.WEB_ARTIFACT_MANIFEST){
 const sha=bytes=>createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 const seen=new Set(),items=[];
 const walk=(folder,prefix="")=>{
  for(const f of fs.readdirSync(folder,{withFileTypes:true})){
   const rel=prefix+f.name,at=path.join(folder,f.name);
   if(f.isDirectory())walk(at,rel+"/");
   else if(f.isFile())items.push(rel);
   else throw Error("Unexpected calculator output type: "+rel);
  }
 };
 walk(root);
 const expectedSet=new Set(baseline.files.map(x=>x.path));
 if(items.length!==expectedSet.size||items.some(x=>!expectedSet.has(x)))throw Error("Unexpected calculator output file");
 for(const f of baseline.files){
  if(seen.has(f.path))throw Error("Duplicate baseline file");seen.add(f.path);
  const bytes=fs.readFileSync(path.join(root,f.path));
  if(bytes.length!==f.bytes||sha(bytes)!==f.gitBlobSha)throw Error("Published calculator baseline differs: "+f.path);
 }
}
console.log("Calculator runtime checked: "+expected.length+" assets");
