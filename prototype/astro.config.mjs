import { defineConfig } from "astro/config";
export default defineConfig({site:"https://pedroblanco.github.io",output:"static",trailingSlash:"always",i18n:{defaultLocale:"es",locales:["es","en"],routing:{prefixDefaultLocale:false}}});
