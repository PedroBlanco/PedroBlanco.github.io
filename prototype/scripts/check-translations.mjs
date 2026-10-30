import fs from "node:fs/promises";
import {createHash} from "node:crypto";
import content from "../src/data/content.json" with {type:"json"};
import {normalizeReviewLineEndings} from "./review-line-endings.mjs";

const approvals=JSON.parse(await fs.readFile(new URL("../src/data/translation-review.json",import.meta.url),"utf8")).approved;
const strict=process.argv.includes("--strict");
const printHashes=process.argv.includes("--hashes");

async function localized(item,lang){
  const extras={
    label:item[lang],
    sections:(item.sections||[]).map(s=>({id:s.id,...s[lang]})),
    media:item.media?.[lang]||null,
    resources:(item.resources||[]).map(r=>({type:r.type,href:r.href,...r[lang]})),
  };
  let markdown="";
  if(item.markdown)markdown=normalizeReviewLineEndings(await fs.readFile(new URL("../src/content/"+lang+"/"+item.id+".md",import.meta.url),"utf8"));
  return {extras,markdown};
}
const checks=[{id:"site-ui",es:{extras:content.langs.es,markdown:""},en:{extras:content.langs.en,markdown:""}}];
for(const item of content.items){
  if(!item.en?.title||!item.es?.title)throw Error("Missing ES/EN title for "+item.id);
  checks.push({id:item.id,es:await localized(item,"es"),en:await localized(item,"en")});
}
const hash=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
let pending=0,stale=0;
for(const check of checks){
  const sourceDigest=hash(check.es),targetDigest=hash(check.en);
  const state=approvals[check.id];
  if(printHashes)console.log(JSON.stringify({id:check.id,sourceDigest,targetDigest}));
  if(!state?.reviewed){pending++;if(!printHashes)console.log("TRANSLATION PENDING: "+check.id);}
  else if(state.sourceDigest!==sourceDigest||state.targetDigest!==targetDigest){
    stale++;if(!printHashes)console.log("TRANSLATION STALE: "+check.id);
  }else if(!state.reviewedBy||!/^\d{4}-\d{2}-\d{2}$/.test(state.reviewedAt||"")){
    stale++;if(!printHashes)console.log("TRANSLATION MISSING REVIEW AUDIT: "+check.id);
  }
}
if(!printHashes)console.log("Translation review: "+(checks.length-pending-stale)+" approved, "+pending+" pending, "+stale+" stale");
if(strict&&(pending||stale)){console.error("Publishing blocked until translation review is complete.");process.exitCode=1;}
