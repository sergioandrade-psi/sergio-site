// Configuração do Eleventy. O Sérgio não precisa mexer aqui:
// todo o conteúdo editável fica em src/_data, src/temas e src/conteudos.

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
  "agosto", "setembro", "outubro", "novembro", "dezembro"];

// Datas podem chegar como texto ("2026-09-02") ou como data (quando salvas pelo painel)
function iso(d) {
  if (!d) return "";
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

function escapar(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true, trimBlocks: true, lstripBlocks: true });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.ignores.add("src/assets/**");

  // ---------- Coleções ----------
  eleventyConfig.addCollection("artigos", (api) =>
    api.getFilteredByGlob("src/conteudos/*.md")
      .filter((p) => p.data.publicar !== false)
      .sort((a, b) => iso(b.data.publicado_em).localeCompare(iso(a.data.publicado_em))));

  eleventyConfig.addCollection("temas", (api) =>
    api.getFilteredByGlob("src/temas/*.md")
      .sort((a, b) => (a.data.ordem ?? 99) - (b.data.ordem ?? 99)));

  // ---------- Filtros ----------
  // *palavra* vira itálico verde nos títulos
  eleventyConfig.addFilter("destaque", (s) =>
    escapar(s).replace(/\*([^*]+)\*/g, '<em class="em">$1</em>'));

  eleventyConfig.addFilter("paragrafos", (s) =>
    String(s ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
      .map((p) => "<p>" + escapar(p).replace(/\n/g, "<br>") + "</p>").join("\n"));

  eleventyConfig.addFilter("quebras", (s) => escapar(s).replace(/\n/g, "<br>"));

  eleventyConfig.addFilter("whatsapp", (site, assunto) => {
    const msg = assunto
      ? site.whatsapp.mensagem_tema.replace("{tema}", assunto)
      : site.whatsapp.mensagem;
    return "https://wa.me/" + String(site.whatsapp.numero).replace(/\D/g, "") + "?text=" + encodeURIComponent(msg);
  });

  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("iso", iso);
  eleventyConfig.addFilter("doisDigitos", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("hoje", () => new Date().toISOString().slice(0, 10));
  eleventyConfig.addFilter("ano", () => new Date().getFullYear());
  eleventyConfig.addFilter("dataExtenso", (d) => {
    const [a, m, dia] = iso(d).split("-").map(Number);
    return dia ? `${dia} de ${MESES[m - 1]} de ${a}` : "";
  });

  eleventyConfig.addFilter("enderecoUrl", (s) => encodeURIComponent(s));

  // Artigos de um tema: primeiro os do próprio tema, depois os marcados como "também neste tema"
  eleventyConfig.addFilter("artigosDoTema", (artigos, tema) => {
    const proprios = artigos.filter((a) => a.data.tema === tema);
    const extras = artigos.filter((a) => a.data.tema !== tema && (a.data.tambem_nos_temas || []).includes(tema));
    return proprios.concat(extras);
  });

  eleventyConfig.addFilter("outrosArtigos", (artigos, url, n = 2) =>
    artigos.filter((a) => a.url !== url).slice(0, n));

  eleventyConfig.addFilter("temaPorSlug", (temas, slug) =>
    temas.find((t) => t.page.fileSlug === slug));

  eleventyConfig.addFilter("semEste", (lista, url) => lista.filter((x) => x.url !== url));

  // ---------- Dados estruturados (SEO) ----------
  const ld = (obj) => '<script type="application/ld+json">' +
    JSON.stringify({ "@context": "https://schema.org", "@graph": obj }).replace(/</g, "\\u003c") + "</script>";

  const ids = (site) => ({
    consultorio: { "@type": "Psychologist", "@id": site.url + "/#consultorio", name: `${site.nome} ${site.sobrenome} – ${site.profissao}`, url: site.url + "/" },
    pessoa: { "@type": "Person", "@id": site.url + "/#sergio", name: `${site.nome} ${site.sobrenome}`, jobTitle: site.profissao, url: site.url + "/#sobre" },
    website: { "@type": "WebSite", "@id": site.url + "/#website", url: site.url + "/" },
  });

  const migalhas = (site, itens) => ({
    "@type": "BreadcrumbList",
    itemListElement: itens.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item: site.url + item })),
  });

  const faq = (id, perguntas) => ({
    "@type": "FAQPage", "@id": id,
    mainEntity: (perguntas || []).map((p) => ({ "@type": "Question", name: p.pergunta, acceptedAnswer: { "@type": "Answer", text: p.resposta } })),
  });

  eleventyConfig.addFilter("ldHome", (home, site, temas) => {
    const e = site.endereco, nome = `${site.nome} ${site.sobrenome}`;
    const assuntos = ["Terapia Comportamental", "Análise do Comportamento", ...temas.map((t) => t.data.nome)];
    const dias = { "Segunda a sexta": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "Segunda a sábado": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] };
    return ld([
      {
        "@type": "Psychologist", "@id": site.url + "/#consultorio",
        name: `${nome} – ${site.profissao}`, alternateName: site.nome_site, description: site.seo.descricao_curta,
        url: site.url + "/", image: site.url + home.hero.foto.imagem, logo: site.url + "/assets/img/favicon.svg",
        telephone: "+" + site.whatsapp.numero.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, "$1-$2-$3-$4"),
        email: site.email, currenciesAccepted: "BRL",
        address: { "@type": "PostalAddress", name: e.local, streetAddress: e.rua, addressLocality: e.cidade, addressRegion: e.uf, postalCode: e.cep, addressCountry: "BR" },
        geo: { "@type": "GeoCoordinates", latitude: Number(e.latitude), longitude: Number(e.longitude) },
        hasMap: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(e.busca_mapa),
        openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: dias[site.horario.dias] || dias["Segunda a sexta"], opens: site.horario.abre, closes: site.horario.fecha }],
        areaServed: [{ "@type": "City", name: e.cidade }, { "@type": "AdministrativeArea", name: `Região Metropolitana de ${e.cidade}` }, { "@type": "Country", name: "Brasil" }],
        knowsAbout: assuntos, sameAs: [site.instagram.url], employee: { "@id": site.url + "/#sergio" },
      },
      {
        "@type": "Person", "@id": site.url + "/#sergio", name: nome, jobTitle: site.profissao, url: site.url + "/#sobre",
        image: site.url + home.sobre.foto.imagem, worksFor: { "@id": site.url + "/#consultorio" }, knowsAbout: assuntos, sameAs: [site.instagram.url],
        hasCredential: [
          { "@type": "EducationalOccupationalCredential", name: `Registro profissional de psicólogo – ${site.crp}`, credentialCategory: "Registro profissional", recognizedBy: { "@type": "Organization", name: site.conselho } },
          ...home.sobre.formacao.filter((f) => !/^Doutorando/i.test(f)).map((f) => ({
            "@type": "EducationalOccupationalCredential",
            name: f.replace(/^Mestre em/i, "Mestrado em").replace(/^Especialista em/i, "Especialização em"),
            credentialCategory: /^Especialista/i.test(f) ? "certificate" : "degree",
          })),
        ],
      },
      { "@type": "WebSite", "@id": site.url + "/#website", url: site.url + "/", name: `${nome} – ${site.profissao} em ${e.cidade}`, inLanguage: "pt-BR", publisher: { "@id": site.url + "/#consultorio" } },
      faq(site.url + "/#duvidas", home.duvidas.perguntas),
    ]);
  });

  eleventyConfig.addFilter("ldTema", (t, url, site) => {
    const i = ids(site);
    return ld([
      { "@type": "WebPage", "@id": site.url + url, url: site.url + url, name: t.titulo, description: t.seo_descricao, inLanguage: "pt-BR", about: t.nome,
        isPartOf: { "@type": "WebSite", "@id": i.website["@id"], url: i.website.url }, provider: i.consultorio },
      faq(site.url + url + "#faq", t.perguntas),
      migalhas(site, [["Início", "/"], ["Como posso ajudar", "/#ajuda"], [t.nome, url]]),
    ]);
  });

  eleventyConfig.addFilter("ldArtigo", (a, url, site, temaNome) => {
    const i = ids(site);
    return ld([
      { "@type": "Article", "@id": site.url + url + "#artigo", headline: a.titulo, description: a.linha_fina,
        image: [site.url + site.seo.imagem_compartilhamento], datePublished: iso(a.publicado_em), dateModified: iso(a.atualizado_em || a.publicado_em),
        inLanguage: "pt-BR", author: i.pessoa, publisher: i.consultorio, mainEntityOfPage: site.url + url, about: temaNome,
        isPartOf: { "@type": "WebSite", "@id": i.website["@id"], url: i.website.url } },
      migalhas(site, [["Início", "/"], ["Conteúdos", "/conteudos/"], [a.titulo, url]]),
    ]);
  });

  eleventyConfig.addFilter("ldColecao", (artigos, site) => {
    const i = ids(site);
    return ld([
      { "@type": "CollectionPage", "@id": site.url + "/conteudos/", url: site.url + "/conteudos/", name: "Artigos de psicologia", inLanguage: "pt-BR",
        isPartOf: { "@type": "WebSite", "@id": i.website["@id"], url: i.website.url },
        hasPart: [...artigos].sort((a, b) => a.page.fileSlug.localeCompare(b.page.fileSlug)).map((a) => ({ "@type": "Article", headline: a.data.titulo, url: site.url + a.url })) },
      migalhas(site, [["Início", "/"], ["Conteúdos", "/conteudos/"]]),
    ]);
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
}
