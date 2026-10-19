// Artigos: cada arquivo .md desta pasta vira uma página em /conteudos/nome-do-arquivo/
export default {
  layout: "artigo.njk",
  og_tipo: "article",
  eleventyComputed: {
    // Artigos marcados como rascunho (publicar: false) não são publicados
    permalink: (data) => (data.publicar === false ? false : `/conteudos/${data.page.fileSlug}/`),
  },
};
