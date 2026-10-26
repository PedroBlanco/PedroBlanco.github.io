import fs from "node:fs/promises";
import path from "node:path";
const source=process.env.CALCULADORA_WEB_DIST;
if(!source){console.log("Calculator: private build artifact not provided; staging skipped.");process.exit(0);}
const expected=["index.html","app.js","ui.js","styles.css","manifest.webmanifest","icon.svg","sw.js",".nojekyll",
"src/areas.js","src/deadlines.js","src/time.js","src/periods.js","src/requirement.js","src/scoring.js","src/seniority.js","src/article129.js"];
const src=path.resolve(source),dest=path.resolve("dist/calculadora-tiempo");
const actual=[];
async function walk(folder,base=""){
 for(const entry of await fs.readdir(folder,{withFileTypes:true})){
  if(!entry.isFile()&&!entry.isDirectory())throw Error("Unexpected symbolic link in calculator build");
  const rel=base+entry.name;
  if(entry.isDirectory())await walk(path.join(folder,entry.name),rel+"/");
  else actual.push(rel);
 }
}
await walk(src);
if(expected.length!==actual.length||expected.some(n=>!actual.includes(n)))throw Error("Calculator dist differs from authoritative build:web contract: "+actual.join(","));
if((await fs.readFile(path.join(src,"sw.js"),"utf8")).includes("__BUILD_HASH__"))throw Error("Unbuilt service worker");
await fs.mkdir(dest,{recursive:true});
for(const rel of expected){
 const location=path.join(dest,rel);
 await fs.mkdir(path.dirname(location),{recursive:true});
 await fs.copyFile(path.join(src,rel),location,fs.constants.COPYFILE_EXCL);
}
console.log("Calculator: copied "+expected.length+" approved runtime assets from the private project's web artifact.");
