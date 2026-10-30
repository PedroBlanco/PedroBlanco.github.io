import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import manifest from "../src/data/migration-manifest.json" with { type:"json" };
const sourceRoot=path.resolve(".."),dist=path.resolve("dist"),seen=new Set();
function validPath(p){return typeof p==="string"&&!p.startsWith("/")&&!p.includes("\\")&&!p.includes("\0")&&p.split("/").every(part=>part!=="."&&part!=="..");}
function gitSha(data){return createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");}
// Checkout Windows may convert line endings of tracked text files to CRLF.
// Reversing that conversion is allowed only when the result matches the pinned Git blob.
async function readPinned(filePath, expectedSha, label){
 let bytes=await fs.readFile(filePath);
 if(gitSha(bytes)===expectedSha)return bytes;
 if(!/\.(?:html|js|css|md)$/i.test(label))throw Error("Changed legacy file, review before updating manifest: "+label);
 const canonical=Buffer.from(bytes.toString("utf8").replace(/\r\n/g,"\n"),"utf8");
 if(gitSha(canonical)!==expectedSha)throw Error("Changed legacy file, review before updating manifest: "+label);
 return canonical;
}

let staged=0;
for(const item of manifest.entries){
 if(!validPath(item.path)||seen.has(item.path)||!["preview","approved","preview-tool","approved-tool","published-tool","curated-index","hold","retire"].includes(item.status))throw Error("Invalid manifest entry");
 seen.add(item.path);
 if(item.status==="preview-tool"||item.status==="approved-tool"){
  if(item.path!=="piefirma/"||item.files?.length!==10)throw Error("Unknown legacy tool or incomplete allowlist");
  const seenFiles=new Set();
  for(const file of item.files){
   if(!validPath(file.path)||seenFiles.has(file.path)||!(/^[a-f0-9]{40}$/.test(file.gitBlobSha)))throw Error("Invalid tool file manifest");
   seenFiles.add(file.path);
   const src=path.join(sourceRoot,item.path,file.path);
   const out=path.join(dist,item.path,file.path);
   const stat=await fs.lstat(src);
   if(!stat.isFile()||stat.isSymbolicLink())throw Error("Unsafe legacy tool asset: "+file.path);
   const bytes=await readPinned(src,file.gitBlobSha,item.path+file.path);
   await fs.mkdir(path.dirname(out),{recursive:true});
   await fs.writeFile(out,bytes,{flag:"wx"});
   staged++;
  }
  continue;
 }
 if(item.status!=="preview"&&item.status!=="approved")continue;
 if(!["document","binary"].includes(item.kind)||!(/^[a-f0-9]{40}$/.test(item.gitBlobSha||"")))throw Error("Unpinned preview file: "+item.path);
 // Keep the live GitHub Pages roots untouched until final deployment.
 // Curated HTML is pinned inside prototype/; original master files remain public as-is.
 const curated=new Set(["CC.html","KM2024.html"]);
 const input=curated.has(item.path) ? path.resolve("legacy-staged",item.path) : path.join(sourceRoot,item.path);
 const output=path.join(dist,item.path),stat=await fs.lstat(input);
 if(!stat.isFile()||stat.isSymbolicLink())throw Error("Unsafe source: "+item.path);
 const contents=await readPinned(input,item.gitBlobSha,item.path);
 await fs.mkdir(path.dirname(output),{recursive:true});
 await fs.writeFile(output,contents,{flag:"wx"});
 staged++;
}
console.log("Staged "+staged+" checksum-pinned historical file(s). No folders copied.");
