import { resolve } from "node:path";
import { integrateWebArtifact } from "./integrate-web-artifact.mjs";

const manifest = process.env.WEB_ARTIFACT_MANIFEST;
const archive = process.env.WEB_ARTIFACT_ZIP;
const sourceSha = process.env.WEB_ARTIFACT_EXPECTED_SHA;

const provided = [manifest, archive, sourceSha].filter(Boolean).length;
if (provided === 0) {
  console.log("web-artifact: no approved package supplied; optional tool staging skipped");
} else {
  if (provided !== 3) {
    throw Error("WEB_ARTIFACT_MANIFEST, WEB_ARTIFACT_ZIP and WEB_ARTIFACT_EXPECTED_SHA must be provided together");
  }
  const result = await integrateWebArtifact({
    manifestPath: resolve(manifest),
    archivePath: resolve(archive),
    expectedSourceSha: sourceSha,
    siteDist: resolve("dist"),
  });
  console.log("Accepted tool: " + result.id + "; " + result.entries + " entries; no deployment");
}
