import fs from "node:fs/promises";
const owner="PedroBlanco", out=new URL("../src/data/repositories.json",import.meta.url);
const token=process.env.GITHUB_TOKEN;
try{
 let all=[];
 for(let page=1;page<=5;page++){
  const r=await fetch("https://api.github.com/users/"+owner+"/repos?type=public&per_page=100&page="+page,{headers:{"Accept":"application/vnd.github+json",...(token?{"Authorization":"Bearer "+token}:{})},signal:AbortSignal.timeout(7500)});
  if(!r.ok)throw new Error("GitHub HTTP "+r.status);
  const data=await r.json();if(!Array.isArray(data))throw new Error("Unexpected response");
  all.push(...data.filter(x=>x.private===false));
  if(data.length<100)break;
 }
 if(!all.length)throw new Error("No public repos");
 const output=all.map(x=>({name:x.name,url:x.html_url,description:x.description||"",fork:Boolean(x.fork),archived:Boolean(x.archived),updatedAt:x.pushed_at||null})).sort((a,b)=>a.name.localeCompare(b.name));
 await fs.writeFile(out,JSON.stringify(output,null,2)+"\n");console.log("Synced "+output.length+" public repositories");
}catch(err){console.warn("GitHub sync unavailable; using committed public snapshot: "+err.message)}
