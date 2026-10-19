# Site de Sérgio Andrade · Psicólogo

Site publicado em https://www.sergioandradepsi.com.br

O site é gerado pelo **Eleventy** a partir de arquivos de texto, e o conteúdo é editado pelo painel do **Pages CMS** (https://app.pagescms.org). Cada alteração salva no painel atualiza o site sozinha em cerca de um minuto, pelo Netlify.

## Onde fica cada coisa

| No painel | Arquivo | O que edita |
|---|---|---|
| Artigos | `src/conteudos/*.md` | Um arquivo por artigo |
| Temas | `src/temas/*.md` | As seis páginas de “Como posso ajudar” |
| Página inicial | `src/_data/home.json` | Todos os textos e fotos da página inicial |
| Dados do consultório | `src/_data/site.json` | WhatsApp, e-mail, Instagram, endereço, Google |
| Textos fixos das páginas | `src/_data/paginas.json` | Frases repetidas em artigos e temas, página 404 |
| Política de privacidade | `src/privacidade.md` | Texto da política |
| Fotos | `src/assets/img/` | Todas as imagens |

O layout fica em `src/_includes/` e o visual em `src/assets/css/style.min.css`. Mudanças nesses arquivos alteram o design: faça só se souber o que está mudando.

## Convenções de escrita

- **Itálico verde nos títulos:** coloque a palavra entre asteriscos. Ex.: `Talvez você esteja *sentindo*…`
- **Parágrafos nos campos de texto longo:** deixe uma linha em branco entre eles.
- **Observação em letra menor nas páginas de tema:** escreva o parágrafo inteiro em itálico.
- **Rascunho:** desmarque “Publicar no site” no artigo.

## Rodar no computador (opcional)

```
npm install
npm start
```

O site abre em http://localhost:8080. Para gerar a versão final: `npm run build` (o resultado fica em `_site/`).
