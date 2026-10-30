// Recreate only the ignored Eleventy output. Never touch source or Git history.
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(fileURLToPath(new URL("..",import.meta.url)));
if(path.resolve(process.cwd())!==root)throw Error("Run from prototype/ only");
const packageData=JSON.parse(await fs.readFile(path.join(root,"package.json"),"utf8"));
if(packageData.name!=="pedroblanco-prototype-eleventy")throw Error("Unexpected project");
const output=path.join(root,"dist");
if(path.dirname(output)!==root||path.basename(output)!=="dist")throw Error("Unsafe build output path");
try{
 const stat=await fs.lstat(output);
 if(stat.isSymbolicLink()||!stat.isDirectory())throw Error("Refusing to clean unexpected dist path");
 await fs.rm(output,{recursive:true});
 console.log("Previous generated dist/ removed; starting clean build.");
}catch(err){
 if(err.code!=="ENOENT")throw err;
}
