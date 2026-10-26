export default function(config){config.addPassthroughCopy({"src/styles":"styles"});config.addPassthroughCopy({"src/media":"media"});config.addPassthroughCopy({"src/scripts":"scripts"});}
export const config={dir:{input:"src",output:"dist"},templateFormats:["11ty.js"],htmlTemplateEngine:false};
