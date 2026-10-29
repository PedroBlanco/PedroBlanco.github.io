import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import manifest from "../src/data/media-review.json" with {type:"json"};
const root=path.resolve(".."), out=path.resolve("dist");
function sha(bytes){return createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");}
let copied=0;
for(const e of manifest.entries){
 if(e.status!=="approved")continue;
 if(e.path==="revista/index.html"||e.ownerDecision!=="preserve-full"||!e.reviewedAt||!e.reviewedBy||!e.evidence)throw Error("Invalid media approval");
 if(!e.path||e.path.startsWith("/")||e.path.includes("\\")||e.path.split("/").some(s=>!s||s==="."||s===".."))throw Error("Invalid path");
 const src=path.join(root,e.path),dst=path.join(out,e.path);
 const stat=await fs.lstat(src);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size!==e.bytes)throw Error("Approved source invalid: "+e.path);
 const bytes=await fs.readFile(src);
 if(sha(bytes)!==e.gitBlobSha)throw Error("Approved source mismatch: "+e.path);
 await fs.mkdir(path.dirname(dst),{recursive:true});
 await fs.writeFile(dst,bytes,{flag:"wx"});
 copied++;
}
console.log("Approved media staged: "+copied);
