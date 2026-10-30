import fs from "node:fs/promises";
import path from "node:path";
import {verifyPinnedCheckout} from "./verify-pinned-checkout.mjs";
import snapshot from "../src/data/published-calculator.json" with {type:"json"};

const src=path.resolve("../calculadora-tiempo"),dest=path.resolve("dist/calculadora-tiempo");


export async function stagePublishedCalculator(){
 if(snapshot.path!=="/calculadora-tiempo/"||snapshot.files.length!==16)throw Error("Published calculator inventory changed");
 const expected=new Set(snapshot.files.map(f=>f.path));
 if(expected.size!==snapshot.files.length)throw Error("Duplicate calculator runtime path");
 const discovered=[];
 async function walk(dir,prefix=""){
  for(const item of await fs.readdir(dir,{withFileTypes:true})){
   const rel=prefix+item.name;
   if(item.isDirectory())await walk(path.join(dir,item.name),rel+"/");
   else if(item.isFile())discovered.push(rel);
   else throw Error("Unsafe calculator runtime source: "+rel);
  }
 }
 await walk(src);
 if(discovered.length!==expected.size||discovered.some(f=>!expected.has(f)))
  throw Error("Published calculator directory differs from pinned runtime inventory");
 const contents=[];
 for(const entry of snapshot.files){
  if(!entry.path||entry.path.startsWith("/")||entry.path.includes("\\")||entry.path.split("/").some(s=>!s||s==="."||s==="..")||!/^[a-f0-9]{40}$/.test(entry.gitBlobSha))
   throw Error("Invalid published calculator manifest");
  const name=path.join(src,entry.path),stat=await fs.lstat(name);
  if(!stat.isFile()||stat.isSymbolicLink())throw Error("Unsafe calculator runtime: "+entry.path);
  const raw=await fs.readFile(name);
  const bytes=verifyPinnedCheckout(raw,{path:entry.path,expectedBytes:entry.bytes,expectedSha:entry.gitBlobSha});
  contents.push({path:entry.path,bytes});
 }
 try{await fs.mkdir(dest);}catch(e){throw Error("Refusing to overwrite calculator route: "+e.message);}
 for(const f of contents){
  const file=path.join(dest,f.path);
  await fs.mkdir(path.dirname(file),{recursive:true});
  await fs.writeFile(file,f.bytes,{flag:"wx"});
 }
 console.log("Staged published calculator baseline: "+contents.length+" checksum-pinned runtime files.");
}
