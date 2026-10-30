import fs from "node:fs";
const css=fs.readFileSync(new URL("../src/styles/site.css",import.meta.url),"utf8");
const darkBreak="@media (prefers-color-scheme: dark)";
if(!css.includes(darkBreak))throw Error("Missing automatic dark-mode override");
const [light,dark]=css.split(darkBreak);
const get=(source,key)=>{
 const match=source.match(new RegExp("--"+key+":\\s*(#[0-9A-Fa-f]{6})\\s*;"));
 if(!match)throw Error("Missing color token "+key);
 return match[1].toUpperCase();
};
const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255)
 .map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
const lum=s=>{const [r,g,b]=rgb(s);return r*.2126+g*.7152+b*.0722;};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return ((Math.max(x,y)+.05)/(Math.min(x,y)+.05));};
const expected={
 light:{bg:"#EDF3F7",surface:"#FFFFFF",ink:"#202F46",primary:"#245E80",accent:"#C76B51"},
 dark:{bg:"#18243A",surface:"#23334A",ink:"#F4F6FA",primary:"#9EC5DD",accent:"#F0AF91"}
};
const sourceByMode={light,dark};
for(const [mode,tokens] of Object.entries(expected)){
 const source=sourceByMode[mode];
 for(const [name,value] of Object.entries(tokens))
  if(get(source,name)!==value)throw Error("Bruma del Alba "+mode+" token "+name+" differs from approved palette");
}
const cases=[];
for(const [mode,source] of Object.entries(sourceByMode)){
 const pair=(label,a,b)=>cases.push([mode,label,get(source,a),get(source,b)]);
 pair("body ink/background","ink","bg");
 pair("body ink/card","ink","surface");
 pair("link/background","primary","bg");
 pair("link/card","primary","surface");
 pair("muted/background","muted","bg");
 pair("muted/card","muted","surface");
 pair("badge ink/badge background","chip-ink","chip-bg");
 pair("accent text/background","accent-text","bg");
 pair("accent text/card","accent-text","surface");
 pair("focus/background","focus","bg");
 pair("focus/card","focus","surface");
 pair("menu button text/background","surface","primary");
 if(mode==="light")cases.push([mode,"primary action label","#FFFFFF",get(source,"primary")]);
 else pair("dark primary action label","bg","primary");
}
for(const [mode,label,foreground,background] of cases){
 const value=ratio(foreground,background);
 if(value<4.5)throw Error(mode+": insufficient contrast "+label+" ("+value.toFixed(2)+":1)");
}
if(css.includes("@import")||/fonts\.googleapis\.com/.test(css))
 throw Error("External fonts are not intended");
console.log("Bruma del Alba: "+cases.length+" light/dark text contrast checks >= 4.5:1; system dark mode present.");
