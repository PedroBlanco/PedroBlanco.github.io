import { defineConfig } from "astro/config";
// Explicit routes are generated from bilingual content data; no framework auto-prefix.
export default defineConfig({site:"https://pedroblanco.github.io",output:"static",trailingSlash:"always"});
