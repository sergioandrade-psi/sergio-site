// Temas: cada arquivo .md desta pasta vira uma página em /temas/nome-do-arquivo/
export default {
  layout: "tema.njk",
  eleventyComputed: {
    permalink: (data) => `/temas/${data.page.fileSlug}/`,
    assunto_whatsapp: (data) => data.assunto_mensagem,
  },
};
