import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import test from "node:test";
import yazl from "yazl";
import { integrateWebArtifact } from "./integrate-web-artifact.mjs";

const SHA = "b".repeat(40);
const document = JSON.parse(await readFile(new URL("../contracts/web-artifact/v1.0.0/examples/calculadora-pwa.example.json",import.meta.url),"utf8"));

async function fixture(fn, { extra, pwaScope = "./" } = {}) {
  const tmp = await mkdtemp(join(tmpdir(), "web-artifact-import-"));
  try {
    const target = join(tmp,"calculadora-tiempo-0.1.0.zip");
    const zip = new yazl.ZipFile();
    const assets = [
      ["index.html","<!doctype html><title>Calculator</title>"],
      ["manifest.webmanifest",JSON.stringify({scope:pwaScope,start_url:"./"})],
      ["sw.js","const CACHE = \"built-test\";"],
      ["src/periods.js","export const result = true;"],
      ...(extra || []),
    ];
    for (const [name,body] of assets) zip.addBuffer(Buffer.from(body),name,{mtime:new Date("1980-01-01T00:00:00Z"),mode:0o100644});
    zip.end();
    await pipeline(zip.outputStream, createWriteStream(target));
    const bytes = await readFile(target);
    const manifest = structuredClone(document);
    manifest.source.commit=SHA;
    manifest.artifact.sizeBytes=bytes.length;
    manifest.artifact.sha256=createHash("sha256").update(bytes).digest("hex");
    const manifestPath=join(tmp,"web-artifact.json");
    await writeFile(manifestPath,JSON.stringify(manifest));
    const dist=join(tmp,"out");
    await fn({tmp,archivePath:target,manifestPath,dist,manifest});
  } finally {
    await rm(tmp,{recursive:true,force:true});
  }
}

test("integrates validated static PWA assets in only their assigned folder",async()=>{
  await fixture(async ({archivePath,manifestPath,dist})=>{
    const args={manifestPath,archivePath,siteDist:dist,expectedSourceSha:SHA};
    const result=await integrateWebArtifact(args);
    assert.equal(result.id,"calculadora-tiempo");
    assert.match(await readFile(join(dist,"calculadora-tiempo","src","periods.js"),"utf8"),/result = true/);
    await assert.rejects(()=>integrateWebArtifact(args),/already exists/);
  });
});

test("rejects ZIP with unauthorized hidden file before creating tool folder",async()=>{
  await fixture(async ({archivePath,manifestPath,dist})=>{
    await assert.rejects(
      ()=>integrateWebArtifact({archivePath,manifestPath,siteDist:dist,expectedSourceSha:SHA}),
      /Unsafe ZIP entry/,
    );
    await assert.rejects(readFile(join(dist,"calculadora-tiempo","index.html")),/ENOENT/);
  },{extra:[[".env","test-no-secrets"]]});
});

test("rejects source SHA that does not match the trusted build input",async()=>{
  await fixture(async ({archivePath,manifestPath,dist})=>{
    await assert.rejects(
      ()=>integrateWebArtifact({archivePath,manifestPath,siteDist:dist,expectedSourceSha:"a".repeat(40)}),
      /Source commit/,
    );
  });
});

test("rejects PWAs whose declared scope escapes the tool basePath",async()=>{
  await fixture(async ({archivePath,manifestPath,dist})=>{
    await assert.rejects(
      ()=>integrateWebArtifact({archivePath,manifestPath,siteDist:dist,expectedSourceSha:SHA}),
      /scope escapes/,
    );
  },{pwaScope:"/"});
});
