import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {checkPublicationSafety} from "./check-publication-safety.mjs";

const migration=entries=>({schema:1,entries});
const media=entries=>({schemaVersion:1,entries});
const approval={reviewedBy:"repository-owner",reviewedAt:"2026-10-30",evidence:"Approved by owner"};
function fixture(t){
 const dist=fs.mkdtempSync(path.join(os.tmpdir(),"pages-safety-"));
 t.after(()=>fs.rmSync(dist,{recursive:true,force:true}));
 const write=(name,text)=>{
  const full=path.join(dist,name);
  fs.mkdirSync(path.dirname(full),{recursive:true});
  fs.writeFileSync(full,text);
 };
 const sha=name=>{
  const data=fs.readFileSync(path.join(dist,name));
  return createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");
 };
 const run=(routes=[],assets=[])=>checkPublicationSafety({dist,migrationManifest:migration(routes),mediaManifest:media(assets)});
 return {dist,write,sha,run};
}
test("empty dist with no protected content is valid",t=>{
 const f=fixture(t);
 assert.deepEqual(f.run(),{approvedMedia:0,protectedRoutes:0});
});
test("approved new media needs evidence, matching hash and published file",t=>{
 const f=fixture(t);f.write("archive/document.pdf","synthetic");
 const entry={path:"archive/document.pdf",status:"approved",ownerDecision:"preserve-full",bytes:9,
  gitBlobSha:f.sha("archive/document.pdf"),...approval};
 assert.equal(f.run([],[entry]).approvedMedia,1);
 f.write("archive/document.pdf","modified");
 assert.throws(()=>f.run([],[entry]),/approved media size|approved output changed/);
 assert.throws(()=>f.run([],[{...entry,reviewedBy:null}]),/unreviewed media approval/);
});
test("retired and reference-only originals cannot be published",t=>{
 const f=fixture(t);f.write("archive/no-audio.mp3","synthetic");
 const ref={path:"archive/no-audio.mp3",status:"retire",ownerDecision:"reference-only"};
 assert.throws(()=>f.run([],[ref]),/blocked media published/);
});
test("curated archives reject unreviewed files and active markup",t=>{
 const f=fixture(t);
 f.write("archive/index.html",'<main data-curated-archive="safe"></main>');
 const entry={path:"archive/",status:"curated-index"};
 f.run([entry]);
 f.write("archive/hidden.csv","personal records");
 assert.throws(()=>f.run([entry]),/approved-media allowlist/);
 f.write("archive/index.html",'<main data-curated-archive="safe"><script>bad()</script></main>');
 assert.throws(()=>f.run([entry]),/unreviewed active content/);
});
test("historical replacement cannot bring back retired applications",t=>{
 const f=fixture(t);const entry={path:"retired/",status:"retire",kind:"application"};
 f.write("retired/index.html",'<div class="detail-prose">historical note</div>');
 f.run([entry]);
 f.write("retired/private.csv","private");
 assert.throws(()=>f.run([entry]),/extra assets/);
});
test("legacy tool must contain exactly pinned files and security helper",t=>{
 const f=fixture(t);
 f.write("tool/index.html",'<script src="safe-values.js"></script>');
 f.write("tool/safe-values.js","safe()");
 const entry={path:"tool/",status:"approved-tool",files:[
  {path:"index.html",gitBlobSha:f.sha("tool/index.html")},
  {path:"safe-values.js",gitBlobSha:f.sha("tool/safe-values.js")}
 ],...approval};
 f.run([entry]);
 f.write("tool/unreviewed.js","unsafe()");
 assert.throws(()=>f.run([entry]),/unexpected legacy tool assets/);
});
test("pending migrations, duplicates and traversal block publication",t=>{
 const f=fixture(t);
 assert.throws(()=>f.run([{path:"new/",status:"hold"}]),/pending migration/);
 assert.throws(()=>f.run([{path:"../private",status:"retire"}]),/unsafe\/duplicate migration/);
 assert.throws(()=>f.run([],[{path:"archive//file",status:"retire"}]),/unsafe\/duplicate media/);
});

test("strict link auditing fails on newly introduced broken local links",t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"pages-link-"));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const dist=path.join(root,"dist");
 fs.mkdirSync(dist);
 fs.writeFileSync(path.join(dist,"index.html"),'<a href="/not-found/">Broken local link</a>');
 const script=fileURLToPath(new URL("./audit-links.mjs",import.meta.url));
 const bad=spawnSync(process.execPath,[script,"--strict"],{cwd:root,encoding:"utf8",timeout:15000});
 assert.equal(bad.status===0,false);
 assert.match(bad.stderr+bad.stdout,/Publication blocked.*unresolved local links/);
 fs.mkdirSync(path.join(dist,"not-found"));
 fs.writeFileSync(path.join(dist,"not-found","index.html"),"<p>Now exists</p>");
 const good=spawnSync(process.execPath,[script,"--strict"],{cwd:root,encoding:"utf8",timeout:15000});
 assert.equal(good.status,0,good.stderr);
});

test("retired archive index needs an explicit curated replacement",t=>{
 const f=fixture(t);
 f.write("archive/index.html",'<main data-curated-archive="safe"></main>');
 const retired={path:"archive/index.html",status:"retire"};
 assert.throws(()=>f.run([],[retired]),/blocked media published/);
 f.run([{path:"archive/",status:"curated-index"}],[retired]);
});
