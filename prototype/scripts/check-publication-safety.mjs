import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import migration from "../src/data/migration-manifest.json" with {type:"json"};
import media from "../src/data/media-review.json" with {type:"json"};

// Reusable publication safety checks; no inventory of individual historical projects.
// Staging validates original approved sources; this gate checks the generated output.
export function checkPublicationSafety({dist, migrationManifest, mediaManifest}) {
  const fail=reason=>{throw Error("Publication safety: "+reason);};
  const approved=(x)=>Boolean(x.reviewedBy&&/^\d{4}-\d{2}-\d{2}$/.test(x.reviewedAt||"")&&x.evidence);
  const validPath=p=>typeof p==="string"&&p.length>0&&!p.startsWith("/")&&!p.includes("\\")&&!p.includes("\0")&&
    p.split("/").filter(Boolean).every(seg=>seg!=="."&&seg!=="..")&&p.replace(/\/$/,"").length>0;
  const safe=(p)=>{
    if(!validPath(p))fail("unsafe path: "+String(p));
    const file=path.resolve(dist,p);
    if(!file.startsWith(path.resolve(dist)+path.sep))fail("escaped dist: "+p);
    return file;
  };
  const fileInfo=(p)=>{
    const filename=safe(p);
    if(!fs.existsSync(filename))return null;
    const info=fs.lstatSync(filename);
    if(info.isSymbolicLink())fail("symbolic link: "+p);
    return info;
  };
  const needFile=p=>{const st=fileInfo(p);if(!st?.isFile())fail("missing approved file: "+p);return st;};
  const needDir=p=>{const st=fileInfo(p);if(!st?.isDirectory())fail("missing approved directory: "+p);};
  const listing=prefix=>{
    const list=[];
    function walk(folder,relative=""){
      for(const item of fs.readdirSync(folder,{withFileTypes:true})){
        const name=relative+item.name;
        if(item.isDirectory())walk(path.join(folder,item.name),name+"/");
        else if(item.isFile())list.push(name);
        else fail("unsafe output entry: "+prefix+name);
      }
    }
    walk(safe(prefix));
    return list.sort();
  };
  const gitHash=p=>{
    const buf=fs.readFileSync(safe(p));
    return createHash("sha1").update(Buffer.from("blob "+buf.length+"\0")).update(buf).digest("hex");
  };
  const ensureBlob=(p,expected)=>{
    needFile(p);
    if(!/^[a-f0-9]{40}$/.test(expected||"")||gitHash(p)!==expected)
      fail("approved output changed: "+p);
  };
  if(migrationManifest.schema!==1||!Array.isArray(migrationManifest.entries)||
     mediaManifest.schemaVersion!==1||!Array.isArray(mediaManifest.entries))fail("invalid manifest");
  if(!fs.existsSync(dist)||!fs.statSync(dist).isDirectory())fail("missing dist");
  const mediaByPath=new Map();
  for(const item of mediaManifest.entries){
    if(!validPath(item.path)||mediaByPath.has(item.path))fail("unsafe/duplicate media entry");
    if(!["approved","retire","hold"].includes(item.status))fail("unknown media status: "+item.path);
    mediaByPath.set(item.path,item);
    if(item.status==="approved"){
      if(item.ownerDecision!=="preserve-full"||!approved(item))fail("unreviewed media approval: "+item.path);
      const st=needFile(item.path);
      if(!Number.isSafeInteger(item.bytes)||st.size!==item.bytes)fail("approved media size: "+item.path);
      ensureBlob(item.path,item.gitBlobSha);
    }else if(item.path!=="revista/index.html"&&fileInfo(item.path)){
      fail("blocked media published: "+item.path);
    }
  }
  const migrationPaths=new Set();
  for(const item of migrationManifest.entries){
    if(!validPath(item.path)||migrationPaths.has(item.path))fail("unsafe/duplicate migration entry");
    migrationPaths.add(item.path);
    if(["preview","preview-tool","hold"].includes(item.status))fail("pending migration approval: "+item.path);
    if(item.status==="approved"){
      if(!approved(item))fail("document approval missing: "+item.path);
      ensureBlob(item.path,item.gitBlobSha);
    }else if(item.status==="approved-tool"){
      if(!approved(item)||!Array.isArray(item.files)||!item.files.length)fail("legacy tool not approved");
      needDir(item.path);
      const expected=[];
      for(const file of item.files){
        if(!validPath(file.path))fail("unsafe approved tool file");
        ensureBlob(item.path+file.path,file.gitBlobSha);
        expected.push(file.path);
      }
      if(JSON.stringify(listing(item.path))!==JSON.stringify(expected.sort()))
        fail("unexpected legacy tool assets: "+item.path);
      if(!fs.readFileSync(safe(item.path+"index.html"),"utf8").includes('src="safe-values.js"'))
        fail("required legacy security script missing: "+item.path);
    }else if(item.status==="curated-index"){
      needDir(item.path);
      const page=item.path+"index.html";
      needFile(page);
      const document=fs.readFileSync(safe(page),"utf8");
      if(!document.includes('data-curated-archive=')||/<script\b|<img\b|<video\b|<audio\b/i.test(document))
        fail("unreviewed active content in curated index: "+page);
      const expected=["index.html",...mediaManifest.entries.filter(m=>m.status==="approved"&&m.path.startsWith(item.path)).map(m=>m.path.slice(item.path.length))].sort();
      if(JSON.stringify(listing(item.path))!==JSON.stringify(expected))
        fail("curated archive differs from approved-media allowlist: "+item.path);
    }else if(item.status==="retire"){
      if(item.kind==="application"){
        needDir(item.path);
        if(JSON.stringify(listing(item.path))!==JSON.stringify(["index.html"]))
          fail("retired application has extra assets: "+item.path);
        if(!fs.readFileSync(safe(item.path+"index.html"),"utf8").includes('class="detail-prose"'))
          fail("retired application not replaced by historical page: "+item.path);
      }else if(fileInfo(item.path))fail("retired source published: "+item.path);
    }else if(item.status!=="published-tool"){
      fail("unknown migration status: "+item.status);
    }
  }
  return {approvedMedia:mediaManifest.entries.filter(x=>x.status==="approved").length,
          protectedRoutes:migrationManifest.entries.length};
}

if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/,""))){
  const result=checkPublicationSafety({dist:path.resolve("dist"),migrationManifest:migration,mediaManifest:media});
  console.log("Publication safety OK: "+result.approvedMedia+" approved media files; "+result.protectedRoutes+" migration protections.");
}
