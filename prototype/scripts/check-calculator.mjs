import fs from "node:fs";
import path from "node:path";
const root=path.resolve("dist/calculadora-tiempo");
const strict=process.argv.includes("--strict");
if(!fs.existsSync(root)){if(strict)throw Error("Calculator distribution missing");console.warn("Calculator dist absent from prototype; local tool artifact not supplied.");process.exit(0);}
const expected=["index.html","app.js","ui.js","styles.css","manifest.webmanifest","icon.svg","sw.js",".nojekyll","src/areas.js","src/deadlines.js","src/time.js","src/periods.js","src/requirement.js","src/scoring.js","src/seniority.js","src/article129.js"];
for(const rel of expected)if(!fs.existsSync(path.join(root,rel)))throw Error("Missing calculator runtime: "+rel);
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
if(!html.includes('src="./ui.js"')||!html.includes('src="./app.js"'))throw Error("Outdated calculator runtime");
const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
if(sw.includes("__BUILD_HASH__"))throw Error("Service worker has unexpanded build hash");
console.log("Calculator runtime checked: "+expected.length+" assets");
