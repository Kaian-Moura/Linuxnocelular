---
title: Executar, revisar e publicar o site
description: Reproduza o projeto Docusaurus, valide o build e publique no GitHub Pages ou em hospedagem estática.
sidebar_position: 3
last_verified: '2026-10-10'
---

## Resultado e requisitos

Você vai executar este site localmente e produzir os arquivos estáticos para publicação. Dificuldade: básica para uso local, intermediária para GitHub/CI. É necessário um computador com Node.js 22 LTS e npm, Git e acesso aos pacotes no primeiro install. O projeto fixa versões de dependências e mantém `package-lock.json`; use `npm ci` para reproduzir a instalação.

Não é necessário conectar o telefone nem alterar seus drivers para construir a documentação. Os testes do site verificam o projeto web, não executam os comandos dos tutoriais. Nunca faça uma revisão de conteúdo rodando exemplos de flash automaticamente.

## Preparação e execução local

Obtenha uma cópia do repositório real pelo GitHub ou transfira a pasta do projeto. No terminal do computador, entre na pasta onde está `package.json`:

```bash
node --version
npm --version
npm ci
npm start
```

Os dois primeiros comandos mostram versões; `npm ci` instala conforme o lockfile e substitui `node_modules`, portanto não use essa pasta para guardar trabalho próprio. `npm start` inicia desenvolvimento em `http://localhost:3000`, restrito ao loopback por padrão. Para encerrar, use `Ctrl+C`.

Abra home, uma página extensa e o assistente. Teste temas claro/escuro, largura de celular e navegação por teclado. A busca local depende do índice de produção: para validar seus resultados, use o build, não apenas o servidor de desenvolvimento.

## Verificações reproduzíveis

```bash
npm test
npm run check:content
npm run check:snippets
npm run build
npm run check:links
npm run serve
```

Os testes unitários cobrem regras de decisão e condições de segurança; a revisão automática de conteúdo confere metadados e estrutura mínima. O build compila MDX, rotas, Mermaid e o índice de busca, falhando em links de documento quebrados. O verificador de HTML confere destinos e âncoras internas. `serve` permite revisar o resultado estático, normalmente na porta 3000 se livre.

`check:snippets` requer Bash e Python 3 no computador e usa apenas seus parsers para conferir os exemplos dessas linguagens. Ele não executa o conteúdo dos blocos, não comprova compatibilidade com um telefone e não substitui a revisão técnica dos procedimentos.

Para teste automatizado no navegador, instale o Chromium do Playwright no ambiente de desenvolvimento:

```bash
npx playwright install chromium
npm run test:browser
```

Isso baixa um navegador de teste; não muda o telefone. Em Linux sem bibliotecas de execução, consulte as [dependências documentadas do Playwright](https://playwright.dev/docs/browsers) e instale somente as exigidas pela sua distribuição. O teste inicia um servidor próprio na porta 4173, verifica busca e recomendações, e encerra o servidor que criou. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` permite usar um Chromium já instalado, quando compatível.

## Links externos

```bash
npm run check:external
```

O relatório fica em `reports/external-links.json`. O script faz requisições aos links da documentação com timeout e concorrência limitada, registrando status/redirecionamento. Ele não burla proteção anti-bot. Revise `404` e `410`; trate bloqueios e timeout como inconclusivos e faça verificação manual. Disponibilidade HTTP não atesta que a informação citada esteja correta.

## Preparar GitHub sem inventar um endereço

Crie um repositório na sua conta/organização e copie sua URL real. O projeto entregue não presume uma conta pública nem publica automaticamente. Faça commit dos fontes e do lockfile; `build`, `node_modules`, ambientes e resultados temporários são ignorados.

```bash
git status
git add .
git commit -m "Documentação inicial de smartphones com Linux"
```

Antes de `git add .`, revise mudanças e segredos. Se for uma pasta ainda sem Git, inicialize com `git init -b main` primeiro. Configure o remote com a URL real pelo seu fluxo habitual e confira com `git remote -v` antes de enviar. Nenhum token deve entrar em arquivo versionado. Leia `CONTRIBUTING.md` e `SECURITY.md`.

## GitHub Pages

O workflow `.github/workflows/pages.yml` é acionado **manualmente** por `workflow_dispatch`. Configure Settings → Pages → Source como GitHub Actions no repositório. A ação oficial obtém domínio e subcaminho, e os passa ao Docusaurus; assim, links e recursos respeitam `/nome-do-repositorio/` ou um domínio próprio.

O workflow executa testes/build/revisão de links, envia somente `build/` e usa o ambiente `github-pages` para deploy. Permissões de Pages e OIDC ficam restritas ao workflow de publicação. A CI de pull requests só precisa ler o código. Revise proteções de branch e de ambiente antes de habilitar publicação de conteúdo não revisado.

Uma publicação pública torna os arquivos acessíveis a qualquer pessoa. Faça a revisão de licença, dados pessoais e procedimentos de risco antes de acionar o workflow. Preparar o workflow localmente não equivale a um deploy já executado.

## Outras hospedagens estáticas

Configure comando `npm ci && npm run build` e diretório publicado `build`. Ajuste a origem e o caminho por variáveis de ambiente:

```bash
DOCUSAURUS_URL=https://seu-dominio.example DOCUSAURUS_BASE_URL=/ npm run build
```

O domínio `.example` é ilustrativo; substitua pela origem real. `DOCUSAURUS_URL` contém protocolo/domínio; `DOCUSAURUS_BASE_URL` contém caminho iniciando e terminando em `/`. `GITHUB_REPOSITORY` é opcional para links GitHub/edição. O projeto não carrega `.env.example` automaticamente e não deve receber segredos de backend: os arquivos finais são públicos.

Para testar subcaminho antes de deploy, faça um build com a base pretendida, execute `check:links` com a mesma variável e sirva o build. Verifique abrir uma página diretamente, recarregar, buscar e carregar assets. Não use um rewrite universal para `index.html` sem avaliar rotas estáticas emitidas.

## Rollback e aceitação

Guarde commit e artefato do último build aprovado. Se a publicação regredir, publique esse commit pelo mesmo fluxo; não apague o histórico. Se atualizar dependências, preserve o lockfile anterior e revise changelogs. Atualize os pacotes Docusaurus em conjunto.

Aceitação: build e links passam; busca encontra termos reais; o assistente não recomenda nativo sem requisitos; home/desktop móvel têm leitura e foco utilizáveis; URLs diretas funcionam no subcaminho de produção. Mudanças nos tutoriais ainda exigem revisão humana de fontes e segurança.

## Fontes e verificação

Revisão documental: **10/10/2026**. [Instalação Docusaurus](https://docusaurus.io/docs/installation), [deploy Docusaurus](https://docusaurus.io/docs/deployment), [Mermaid](https://docusaurus.io/docs/markdown-features/diagrams), [busca local](https://github.com/easyops-cn/docusaurus-search-local), [workflows Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) e [saídas configure-pages](https://github.com/actions/configure-pages/blob/main/action.yml). Resultados efetivamente executados nesta edição ficam no relatório de entrega do repositório.
