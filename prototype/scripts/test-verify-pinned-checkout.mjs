import test from "node:test";
import assert from "node:assert/strict";
import {gitBlobSha,verifyPinnedCheckout} from "./verify-pinned-checkout.mjs";

const canonical=Buffer.from("const line = 1;\nconst other = 2;\n","utf8");
const windows=Buffer.from(canonical.toString("utf8").replace(/\n/g,"\r\n"),"utf8");
const meta={path:"app.js",expectedBytes:canonical.length,expectedSha:gitBlobSha(canonical)};

test("original pinned calculator bytes stay byte-identical",()=>{
 assert.deepEqual(verifyPinnedCheckout(canonical,meta),canonical);
});
test("Windows CRLF checkout is restored only to the pinned original",()=>{
 assert.ok(windows.length>canonical.length);
 assert.deepEqual(verifyPinnedCheckout(windows,meta),canonical);
});
test("real edits are rejected even with Windows CRLF",()=>{
 const altered=Buffer.from(windows.toString("utf8").replace("line = 1","line = 3"),"utf8");
 assert.throws(()=>verifyPinnedCheckout(altered,meta),/Calculator runtime changed/);
});
test("binary files never receive text normalization",()=>{
 assert.throws(()=>verifyPinnedCheckout(windows,{...meta,path:"icon.png"}),/Calculator runtime changed/);
});
test("invalid pinned metadata is rejected",()=>{
 assert.throws(()=>verifyPinnedCheckout(canonical,{...meta,expectedSha:"invalid"}),/Invalid pinned runtime metadata/);
});
test("all supported calculator text formats may normalize, but only when pinned",()=>{
 for(const ext of ["html","js","css","svg","webmanifest"]){
  assert.deepEqual(verifyPinnedCheckout(windows,{...meta,path:"file."+ext}),canonical);
 }
});
