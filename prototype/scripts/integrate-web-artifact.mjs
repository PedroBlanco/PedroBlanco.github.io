import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { pathToFileURL } from "node:url";
import yauzl from "yauzl";
import { validateManifest, verifyArtifact } from "./validate-web-artifact.mjs";

const LIMIT_FILES = 100;
const LIMIT_TOTAL = 80 * 1024 * 1024;
const LIMIT_FILE = 20 * 1024 * 1024;
const RESERVED = new Set([".git", "node_modules", "tests", "test", "scripts", ".github"]);

function safeEntry(name, directory = false) {
  if (typeof name !== "string" || name.length > 300 || !/^[A-Za-z0-9._/-]+$/.test(name)) return false;
  const normalized = directory ? name.slice(0, -1) : name;
  const parts = normalized.split("/");
  if (!parts.length || parts.some((v) => !v || v === "." || v === ".." || RESERVED.has(v))) return false;
  if (parts.some((v) => v.startsWith(".") && v !== ".nojekyll")) return false;
  return true;
}

function contained(siteRoot, sub) {
  const full = path.resolve(siteRoot, sub);
  if (!full.startsWith(path.resolve(siteRoot) + path.sep)) throw Error("Path escapes output");
  return full;
}

function pwaUrl(value, origin) {
  if (typeof value !== "string") throw Error("Invalid PWA URL");
  const parsed = new URL(value, origin);
  if (parsed.origin !== new URL(origin).origin) throw Error("External PWA scope not permitted");
  return parsed.pathname;
}

export async function integrateWebArtifact({
  manifestPath,
  archivePath,
  siteDist,
  expectedSourceSha,
}) {
  if (!/^[a-f0-9]{40}$/.test(expectedSourceSha ?? "")) throw Error("An authoritative expected source commit is required");
  const manifest = validateManifest(JSON.parse(await fsp.readFile(manifestPath, "utf8")));
  if (manifest.id !== "calculadora-tiempo" || manifest.source.repository !== "PedroBlanco/calculadora-tiempo") {
    throw Error("Unregistered tool, source repository or target directory");
  }
  if (manifest.source.commit !== expectedSourceSha) throw Error("Source commit does not match authorized input");
  if (manifest.artifact.sizeBytes > 30 * 1024 * 1024) throw Error("Archive exceeds project size limit");
  await verifyArtifact(manifest, archivePath);

  const root = path.resolve(siteDist);
  const output = contained(root, manifest.id);
  if (fs.existsSync(output)) throw Error("Tool directory already exists: refuse overwrite");
  await fsp.mkdir(root, { recursive: true });
  const temp = await fsp.mkdtemp(path.join(root, ".web-artifact-stage-"));
  let zip;
  try {
    zip = await yauzl.openPromise(archivePath, { lazyEntries: true, validateEntrySizes: true });
    const seen = new Set();
    let total = 0;
    let count = 0;
    for await (const entry of zip.eachEntry()) {
      const name = entry.fileName;
      const isDir = name.endsWith("/");
      if (!safeEntry(name, isDir)) throw Error("Unsafe ZIP entry: " + name);
      if (seen.has(name.toLowerCase())) throw Error("Duplicate ZIP entry: " + name);
      seen.add(name.toLowerCase());
      if (++count > LIMIT_FILES) throw Error("Too many ZIP entries");
      const type = (entry.externalFileAttributes >>> 16) & 0o170000;
      if (type && type !== (isDir ? 0o040000 : 0o100000)) throw Error("Symlink or special ZIP entry rejected: " + name);
      if (entry.uncompressedSize > LIMIT_FILE || (total += entry.uncompressedSize) > LIMIT_TOTAL) throw Error("ZIP decompression limit exceeded");
      if (entry.compressedSize > 0 && entry.uncompressedSize > Math.max(4096, entry.compressedSize * 200)) throw Error("Suspicious ZIP compression ratio");
      const target = contained(temp, name);
      if (isDir) {
        await fsp.mkdir(target, { recursive: true });
        continue;
      }
      await fsp.mkdir(path.dirname(target), { recursive: true });
      const input = await zip.openReadStreamPromise(entry);
      await pipeline(input, fs.createWriteStream(target, { flags: "wx", mode: 0o644 }));
    }
    if (!seen.has(manifest.entryPoint.toLowerCase())) throw Error("ZIP entryPoint is missing");
    if (manifest.type === "pwa") {
      for (const file of [manifest.pwa.manifest, manifest.pwa.serviceWorker]) {
        if (!seen.has(file.toLowerCase())) throw Error("Missing declared PWA resource " + file);
      }
      const m = JSON.parse(await fsp.readFile(contained(temp, manifest.pwa.manifest), "utf8"));
      const origin = "https://example.invalid" + manifest.basePath;
      for (const key of ["scope", "start_url"]) {
        if (m[key] && !pwaUrl(m[key], origin).startsWith(manifest.basePath)) throw Error("PWA " + key + " escapes assigned scope");
      }
      const sw = await fsp.readFile(contained(temp, manifest.pwa.serviceWorker), "utf8");
      if (sw.includes("__BUILD_HASH__")) throw Error("Uncompiled service worker");
    }
    await fsp.rename(temp, output);
    return { path: output, entries: count, uncompressedBytes: total, id: manifest.id };
  } finally {
    zip?.close();
    await fsp.rm(temp, { recursive: true, force: true });
  }
}

async function main(args) {
  if (args.length !== 4 || args[0] !== "--manifest" || args[2] !== "--artifact") {
    throw Error("Usage: node scripts/integrate-web-artifact.mjs --manifest path.json --artifact file.zip (set WEB_ARTIFACT_EXPECTED_SHA and WEB_ARTIFACT_SITE_DIST)");
  }
  const result = await integrateWebArtifact({
    manifestPath: args[1],
    archivePath: args[3],
    expectedSourceSha: process.env.WEB_ARTIFACT_EXPECTED_SHA,
    siteDist: process.env.WEB_ARTIFACT_SITE_DIST ?? "dist",
  });
  console.log("Integrated web-artifact " + result.id + " (" + result.entries + " files) into review output; no deployment");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
