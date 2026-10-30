import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {Script} from "node:vm";
import path from "node:path";

const rel="revista/crucigrama-002.html";
const bytes=readFileSync(path.resolve("..",rel));
const html=bytes.toString("utf8");
const manifest=JSON.parse(readFileSync("src/data/media-review.json","utf8"));
const entry=manifest.entries.find(e=>e.path===rel);
const blob=data=>createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");

function inspect(source){
 assert.match(source,/<!doctype html>/i);
 assert.match(source,/<html[^>]+lang="es"/i);
 assert.match(source,/MIT License/);
 assert.match(source,/Copyright \(c\) 2019 Viresh Ratnakar/);
 assert.match(source,/github\.com\/viresh-ratnakar\/exolve/);
 assert.doesNotMatch(source,/<script\b[^>]*\bsrc=/i);
 assert.doesNotMatch(source,/<iframe\b/i);
 assert.match(source,/createExolve\(puzzleText\)/);
 const puzzle=/const puzzleText\s*=\s*\x60([\s\S]*?)\x60;/m.exec(source)?.[1];
 assert.ok(puzzle,"Embedded Exolve specification missing");
 const value=key=>new RegExp("^\\s*"+key+":\\s*(.+)$","m").exec(puzzle)?.[1]?.trim();
 assert.equal(value("exolve-title"),"Crucigrama #2");
 assert.equal(value("exolve-setter"),"Pedro Blanco Wasmer");
 assert.equal(value("exolve-copyright"),"2022 Revista EnRed@2.0");
 assert.equal(value("exolve-language"),"es Latin");
 const width=Number(value("exolve-width")),height=Number(value("exolve-height"));
 assert.equal(width,28);assert.equal(height,15);
 const section=(start,end)=>{
  const a=puzzle.indexOf("exolve-"+start+":");
  const b=puzzle.indexOf(end==="end"?"exolve-end":"exolve-"+end+":",a+8);
  assert.ok(a>=0&&b>a,"Missing Exolve section "+start);
  return puzzle.slice(a+start.length+8,b);
 };
 const rows=section("grid","across").split("\n").map(line=>line.trim().replace(/\s+/g,"")).filter(Boolean);
 assert.equal(rows.length,height,"Incorrect grid row count");
 assert.ok(rows.every(row=>row.length===width),"Incorrect grid width");
 const count=(x,y)=>(section(x,y).match(/^\s*\d+\s+\S/gm)||[]).length;
 assert.equal(count("across","down"),19);
 assert.equal(count("down","end"),19);
 return {width,height,horizontalClues:19,verticalClues:19};
}
test("crossword #2 matches pinned blob and is owner-approved for redistribution",()=>{
 assert.ok(entry);
 const original=blob(bytes)===entry.gitBlobSha ? bytes : Buffer.from(html.replace(/\r\n/g,"\n"),"utf8");
 assert.equal(original.length,entry.bytes);
 assert.equal(blob(original),entry.gitBlobSha);
 assert.equal(entry.status,"approved");
 assert.ok(entry.reviewedAt&&entry.reviewedBy&&entry.evidence);
 assert.equal(entry.ownerDecision,"preserve-full");
});
test("Exolve license and complete crossword #2 specification are present",()=>{
 const result=inspect(html);
 console.log("Crossword #2 static check:",JSON.stringify(result),"- owner-approved; browser operation remains unverified");
});
test("inline scripts parse as JavaScript without executing their contents",()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
 assert.ok(scripts.length>0);
 for(const source of scripts)new Script(source,{filename:"crossword-002.inline.js"});
});
test("corrupt grid and removed attribution are detected",()=>{
 const mutated=html.replace("exolve-width: 28","exolve-width: 27");
 assert.notEqual(mutated,html);
 assert.throws(()=>inspect(mutated),/strictly equal|Incorrect grid width/);
 assert.throws(()=>inspect(html.replace("MIT License","License removed")),/MIT License/);
 const altered=html.replace("exolve-setter: Pedro Blanco Wasmer","exolve-setter: Unverified");
 assert.notEqual(altered,html);
 assert.throws(()=>inspect(altered),error=>
  error.code==="ERR_ASSERTION"&&error.operator==="strictEqual"&&
  error.actual==="Unverified"&&error.expected==="Pedro Blanco Wasmer"
 );
});
