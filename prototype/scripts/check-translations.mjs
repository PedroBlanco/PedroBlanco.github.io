import fs from "node:fs/promises";
import {createHash} from "node:crypto";
import content from "../src/data/content.json" with {type:"json"};
const approvals=JSON.parse(await fs.readFile(new URL("../src/data/translation-review.json",import.meta.url),"utf8")).approved;
const strict=process.argv.includes("--strict");
const checks=[{id:"site-ui",source:content.langs.es,target:content.langs.en},...content.items.map(i=>({id:i.id,source:i.es,target:i.en}))];
let pending=0,stale=0;
for(const x of checks){
 if(!x.target?.title && x.id!=="site-ui")throw Error("Missing English content for "+x.id);
 const digest=createHash("sha256").update(JSON.stringify(x.source)).digest("hex");
 const state=approvals[x.id];
 if(!state?.reviewed){pending++;console.log("TRANSLATION PENDING: "+x.id);}
 else if(state.sourceDigest!==digest){stale++;console.log("TRANSLATION STALE: "+x.id);}
}
console.log("Translation review: "+(checks.length-pending-stale)+" approved, "+pending+" pending, "+stale+" stale");
if(strict&&(pending||stale)){console.error("Publishing blocked until translation review is complete.");process.exitCode=1;}
