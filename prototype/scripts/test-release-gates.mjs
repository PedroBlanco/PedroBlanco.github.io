import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import media from "../src/data/media-review.json" with {type:"json"};
import migration from "../src/data/migration-manifest.json" with {type:"json"};
import content from "../src/data/content.json" with {type:"json"};
import approvals from "../src/data/translation-review.json" with {type:"json"};

function verify(script,blocked,message){
  const run=spawnSync(process.execPath,["scripts/"+script,"--strict"],{
    cwd:process.cwd(),encoding:"utf8",timeout:60000,
  });
  if(run.error)throw run.error;
  if(blocked){
    assert.notEqual(run.status,0,script+" unexpectedly allowed publication");
    assert.match(run.stdout+run.stderr,message);
  }else{
    assert.equal(run.status,0,script+" blocked approved publication:\n"+run.stderr);
  }
}
test("review-incomplete migration cannot pass strict publication gate",()=>{
 const pending=migration.entries.some(x=>["hold","preview","preview-tool"].includes(x.status));
 verify("check-migration.mjs",pending,/outstanding migration review/);
});
test("unreviewed multimedia cannot pass strict publication gate",()=>{
 const pending=media.entries.some(x=>x.status==="hold");
 verify("check-media-review.mjs",pending,/media files still require a rights\/privacy decision/);
});
test("unreviewed bilingual content cannot pass strict publication gate",()=>{
 const count=1+content.items.length;
 const missing=Object.keys(approvals.approved).length<count;
 verify("check-translations.mjs",missing,/Publishing blocked until translation review/);
});
