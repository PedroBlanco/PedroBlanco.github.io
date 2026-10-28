import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import path from "node:path";

const root=path.resolve("..");
const rel="revista/crucigrama-001.html";
const bytes=readFileSync(path.join(root,rel));
const html=bytes.toString("utf8");
const manifest=JSON.parse(readFileSync("src/data/media-review.json","utf8"));
const entry=manifest.entries.find(x=>x.path===rel);
const gitBlobSha=data=>createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");

function examine(source){
 assert.match(source,/<!doctype html>/i);
 assert.match(source,/<html[^>]+lang="es"/i);
 assert.match(source,/MIT License/);
 assert.match(source,/Copyright \(c\) 2019 Viresh Ratnakar/);
 assert.match(source,/https:\/\/github\.com\/viresh-ratnakar\/exolve/);
 assert.doesNotMatch(source,/<script\b[^>]*\bsrc=/i);
 assert.match(source,/createExolve\(puzzleText\)/);
 const puzzle=/const puzzleText\s*=\s*\x60([\s\S]*?)\x60;/m.exec(source)?.[1];
 assert.ok(puzzle,"Missing embedded Exolve definition");
 const get=key=>new RegExp("^\\s*"+key+":\\s*(.+)$","m").exec(puzzle)?.[1]?.trim();
 assert.equal(get("exolve-title"),"Crucigrama #1");
 assert.equal(get("exolve-setter"),"Verónica Sirvent Segura");
 assert.equal(get("exolve-copyright"),"2022 Revista EnRed@2.0");
 assert.equal(get("exolve-language"),"es Latin");
 const w=Number(get("exolve-width")),h=Number(get("exolve-height"));
 assert.equal(w,18);assert.equal(h,26);
 const section=(first,last)=>{
  const from=puzzle.indexOf("exolve-"+first+":");
  const to=puzzle.indexOf(last==="end"?"exolve-end":"exolve-"+last+":",from+8);
  assert.ok(from>=0&&to>from,"Missing section "+first);
  return puzzle.slice(from+first.length+8,to);
 };
 const grid=section("grid","across").split("\n").map(x=>x.trim().replace(/\s+/g,"")).filter(Boolean);
 assert.equal(grid.length,h,"Incorrect grid row count");
 assert.ok(grid.every(x=>x.length===w),"Incorrect grid width");
 const count=(type,next)=>(section(type,next).match(/^\s*\d+\s+\S/gm)||[]).length;
 assert.equal(count("across","down"),8);
 assert.equal(count("down","end"),6);
 return {width:w,height:h,across:8,down:6};
}
test("original crossword matches pinned Git blob and is not approved",()=>{
 assert.ok(entry);
 assert.equal(bytes.length,entry.bytes);
 assert.equal(gitBlobSha(bytes),entry.gitBlobSha);
 assert.equal(entry.status,"hold");
 assert.equal(entry.ownerDecision,"preserve-full");
});
test("Exolve license, crossword content and structure are intact",()=>{
 const x=examine(html);
 console.log("Crossword static checks:",JSON.stringify(x),"- rights and browser operation NOT cleared");
});
test("incorrect grid size is rejected",()=>{
 const changed=html.replace("exolve-height: 26","exolve-height: 27");
 assert.notEqual(changed,html);
 assert.throws(()=>examine(changed),/row count/);
});
test("missing license and altered byline are rejected",()=>{
 assert.throws(()=>examine(html.replace("MIT License","License not found")),/MIT License/);
 assert.throws(()=>examine(html.replace("exolve-setter: Verónica Sirvent Segura","exolve-setter: Unknown")),/Verónica Sirvent Segura/);
});
