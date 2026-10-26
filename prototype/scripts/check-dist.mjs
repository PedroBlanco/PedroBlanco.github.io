import fs from "node:fs";
import path from "node:path";
const dist=path.resolve("dist");
const required=["index.html","en/index.html","herramientas/index.html","proyectos/index.html","archivo/index.html","acerca-de/index.html","en/tools/index.html","en/projects/index.html","en/archive/index.html","en/about/index.html","mapas/index.html","mapeo/index.html","embajadores/index.html","art-of-hosting/index.html","en/archive/mapas/index.html","herramientas/pdf-fotos-a-imagenes/index.html","en/tools/pdf-fotos-a-imagenes/index.html","proyectos/narrativa-adaptativa/index.html","en/projects/narrativa-adaptativa/index.html"];
for(const f of required){const p=path.join(dist,f);if(!fs.existsSync(p)){console.error("MISSING "+f);process.exitCode=1;}else{const t=fs.readFileSync(p,"utf8");if(!t.includes('rel="alternate"')||!t.includes("lang=")){console.error("BAD I18N "+f);process.exitCode=1;}}}
if(!process.exitCode)console.log("Validated "+required.length+" bilingual and legacy routes");
