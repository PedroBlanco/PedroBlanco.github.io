import {createHash} from "node:crypto";

export function gitBlobSha(bytes){
 return createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
}

// Accept exact original bytes, or undo CRLF checkout conversion only if the
// resulting original Git blob is recovered byte-for-byte. Never accept edits.
export function verifyPinnedCheckout(bytes,{path,expectedBytes,expectedSha}){
 if(!Buffer.isBuffer(bytes)||!Number.isSafeInteger(expectedBytes)||expectedBytes<0||
    !/^[a-f0-9]{40}$/.test(expectedSha))throw Error("Invalid pinned runtime metadata");
 if(bytes.length===expectedBytes&&gitBlobSha(bytes)===expectedSha)return bytes;
 if(!/\.(?:html|js|css|svg|webmanifest)$/i.test(path)||
    !bytes.includes(Buffer.from("\r\n")))throw Error("Calculator runtime changed: "+path);
 let text;
 try{text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);}
 catch{throw Error("Calculator runtime changed: "+path);}
 const original=Buffer.from(text.replace(/\r\n/g,"\n"),"utf8");
 if(original.length!==expectedBytes||gitBlobSha(original)!==expectedSha)
  throw Error("Calculator runtime changed: "+path);
 return original;
}
