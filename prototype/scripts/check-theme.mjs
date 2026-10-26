import fs from "node:fs";
const css=fs.readFileSync(new URL("../src/styles/site.css",import.meta.url),"utf8");
const darkBreak="@media (prefers-color-scheme: dark)";
if(!css.includes(darkBreak))throw Error("Missing dark-mode override");
const [light,dark]=css.split(darkBreak);
const get=(css,key)=>{
 const match=css.match(new RegExp("--"+key+":\\s*(#[0-9A-Fa-f]{6})\\s*;"));
 if(!match)throw Error("Missing token "+key);
 return match[1];
};
const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255)
 .map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
const lum=s=>{const [r,g,b]=rgb(s);return r*.2126+g*.7152+b*.0722;};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return ((Math.max(x,y)+.05)/(Math.min(x,y)+.05));};
const tests=[
 ["light","--ink on --bg",get(light,"ink"),get(light,"bg")],
 ["light","--ink on --surface",get(light,"ink"),get(light,"surface")],
 ["light","--primary on --bg",get(light,"primary"),get(light,"bg")],
 ["light","--primary on --surface",get(light,"primary"),get(light,"surface")],
 ["light","--muted on --bg",get(light,"muted"),get(light,"bg")],
 ["light","--muted on --surface",get(light,"muted"),get(light,"surface")],
 ["light","--chip-ink on --chip-bg",get(light,"chip-ink"),get(light,"chip-bg")],
 ["light","--accent-text on --bg",get(light,"accent-text"),get(light,"bg")],
 ["light","--white on --primary","#FFFFFF",get(light,"primary")],
 ["dark","--ink on --bg",get(dark,"ink"),get(dark,"bg")],
 ["dark","--ink on --surface",get(dark,"ink"),get(dark,"surface")],
 ["dark","--primary on --surface",get(dark,"primary"),get(dark,"surface")],
 ["dark","--muted on --bg",get(dark,"muted"),get(dark,"bg")],
 ["dark","--muted on --surface",get(dark,"muted"),get(dark,"surface")],
 ["dark","--chip-ink on --chip-bg",get(dark,"chip-ink"),get(dark,"chip-bg")],
 ["dark","--dark-bg on --primary",get(dark,"bg"),get(dark,"primary")]
];
for(const [mode,label,fg,bg] of tests){const value=ratio(fg,bg);if(value<4.5)throw Error(mode+": insufficient contrast "+label+" ("+value.toFixed(2)+":1)");}
if(!light.includes("--accent: #9D7029;"))throw Error("Approved decorative accent changed");
if(css.includes("@import")||/fonts\\.googleapis\\.com/.test(css))throw Error("External fonts are not intended");
console.log("Theme verified: "+tests.length+" light/dark foreground contrast checks >= 4.5:1");
