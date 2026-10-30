import fs from "node:fs/promises";
import {readFileSync} from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const schema=JSON.parse(readFileSync(new URL("../contracts/web-artifact/v1.0.0/schema.json",import.meta.url),"utf8"));
const ajv=new Ajv2020({allErrors:true,strict:true,validateSchema:true});
const check=ajv.compile(schema);

function safeFilePath(rel){
 return typeof rel==="string"&&!rel.startsWith("/")&&
   rel.split("/").every(part=>part.length>0&&part!=="."&&part!=="..")&&
   !rel.includes("\\")&&!rel.includes("%")&&!rel.includes("?")&&!rel.includes("#");
}

export function validateManifest(manifest){
 if(!check(manifest)){
  const errors=check.errors.map(e=>e.instancePath+" "+e.message).join("; ");
  throw Error("web-artifact schema invalid: "+errors);
 }
 if(manifest.basePath!=="/"+manifest.id+"/")throw Error("basePath must be /"+manifest.id+"/");
 if(manifest.type==="pwa"){
  if(manifest.pwa.scope!==manifest.basePath)throw Error("PWA scope must match basePath");
  for(const key of ["manifest","serviceWorker"]){
   if(!safeFilePath(manifest.pwa[key]))throw Error("Unsafe PWA relative path: "+key);
  }
  if(manifest.pwa.manifest===manifest.pwa.serviceWorker)throw Error("PWA manifest and serviceWorker must be different");
 }
 return manifest;
}

export async function verifyArtifact(manifest,filename){
 validateManifest(manifest);
 if(path.basename(filename)!==manifest.artifact.filename)
  throw Error("ZIP basename does not match artifact.filename");
 const stat=await fs.lstat(filename);
 if(!stat.isFile()||stat.isSymbolicLink())throw Error("ZIP must be a regular file");
 if(stat.size!==manifest.artifact.sizeBytes)throw Error("ZIP byte size mismatch");
 const bytes=await fs.readFile(filename);
 const digest=createHash("sha256").update(bytes).digest("hex");
 if(digest!==manifest.artifact.sha256)throw Error("ZIP SHA-256 mismatch");
 return {filename:manifest.artifact.filename,bytes:stat.size,sha256:digest};
}

async function cli(args){
 if(args.length!==1&&!(args.length===3&&args[1]==="--artifact")){
  throw Error("Usage: node scripts/validate-web-artifact.mjs <web-artifact.json> [--artifact <file.zip>]");
 }
 const manifest=validateManifest(JSON.parse(await fs.readFile(args[0],"utf8")));
 if(args.length===3){
  const checked=await verifyArtifact(manifest,args[2]);
  console.log("VALID web-artifact v1.0.0; integrity OK: "+checked.filename+" ("+checked.bytes+" bytes)");
 }else console.log("VALID web-artifact v1.0.0 metadata: "+manifest.id+"@"+manifest.version+" (ZIP NOT checked)");
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 cli(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
}
