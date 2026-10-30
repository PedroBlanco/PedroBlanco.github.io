import test from "node:test";
import assert from "node:assert/strict";
import {readFile,mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {validateManifest,verifyArtifact} from "./validate-web-artifact.mjs";

const staticManifest=JSON.parse(await readFile(new URL("../contracts/web-artifact/v1.0.0/examples/static.example.json",import.meta.url),"utf8"));
const pwaManifest=JSON.parse(await readFile(new URL("../contracts/web-artifact/v1.0.0/examples/calculadora-pwa.example.json",import.meta.url),"utf8"));
const clone=x=>structuredClone(x);
const reject=(transform,source=pwaManifest)=>{
 const m=clone(source);transform(m);assert.throws(()=>validateManifest(m));
};
test("both supplied example manifests comply with the stable contract",()=>{
 assert.equal(validateManifest(staticManifest).type,"static");
 assert.equal(validateManifest(pwaManifest).type,"pwa");
});
test("rejects unsupported schema version or undocumented fields",()=>{
 reject(m=>{m.schemaVersion="1.1.0"});
 reject(m=>{m.unexpected="secret"});
 reject(m=>{m.artifact.newField="value"});
});
test("enforces stable application identifiers and isolated routes",()=>{
 reject(m=>{m.id="../other"});
 reject(m=>{m.basePath="/"});
 reject(m=>{m.basePath="/otra-app/"});
 reject(m=>{m.basePath="/calculadora-tiempo/../"});
});
test("requires a complete PWA declaration with matching scope",()=>{
 reject(m=>{delete m.pwa});
 reject(m=>{m.pwa.scope="/"});
 reject(m=>{m.pwa.manifest="../secret.webmanifest"});
 reject(m=>{m.pwa.serviceWorker="src//sw.js"});
 reject(m=>{m.pwa.manifest="assets/%2e%2e/file"});
 reject(m=>{m.pwa.serviceWorker=m.pwa.manifest});
 reject(m=>{m.pwa={...m.pwa,extra:123}});
 reject(m=>{m.type="static"});
});
test("requires a SemVer version, origin SHA and SHA-256",()=>{
 reject(m=>{m.version="v0.1"});
 reject(m=>{m.version="1.0.0-01"});
 reject(m=>{m.source.commit="main"});
 reject(m=>{m.artifact.sha256="0".repeat(63)});
 reject(m=>{m.artifact.sizeBytes=0});
 reject(m=>{m.artifact.filename="../unsafe.zip"});
 const m=clone(staticManifest);m.version="1.0.0-rc.2+build.7";
 assert.equal(validateManifest(m).version,"1.0.0-rc.2+build.7");
});
test("ZIP size and checksum checks verify actual bytes, not just declarations",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"web-contract-"));
 try{
  // Pure bytes are sufficient here: ZIP entry-level verification belongs to the integrator, not this validator.
  const bytes=Buffer.from("sample archive bytes: entry-level validation is a later phase");
  const file=join(dir,"sample.zip");
  await writeFile(file,bytes);
  const m=clone(staticManifest);
  m.artifact.filename="sample.zip";m.artifact.sizeBytes=bytes.length;
  m.artifact.sha256=createHash("sha256").update(bytes).digest("hex");
  const result=await verifyArtifact(m,file);
  assert.equal(result.sha256,m.artifact.sha256);
  const wrong=clone(m);wrong.artifact.sizeBytes++;
  await assert.rejects(()=>verifyArtifact(wrong,file),/size mismatch/);
  wrong.artifact.sizeBytes=m.artifact.sizeBytes;wrong.artifact.sha256="0".repeat(64);
  await assert.rejects(()=>verifyArtifact(wrong,file),/SHA-256 mismatch/);
  wrong.artifact.sha256=m.artifact.sha256;wrong.artifact.filename="other.zip";
  await assert.rejects(()=>verifyArtifact(wrong,file),/basename/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
