# Celular → Linux

Base de conhecimento em português brasileiro sobre reaproveitar smartphones como computadores Linux. Inclui Linux nativo, Android com Termux/PRoot/chroot, decisão por requisitos, hardware, recuperação e projetos. O estudo original é um OnePlus 9 Pro; **não existe imagem ou método universal**.

## Executar

Node.js 22 LTS e npm são necessários. Dentro desta pasta:

```bash
npm ci
npm start
```

Abra http://localhost:3000. Para produção e busca local:

```bash
npm run verify
npm run serve
```

## Testar

```bash
npm test
npm run check:content
npm run check:snippets
npm run build
npm run check:links
npx playwright install chromium
npm run test:browser
npm run check:external
```

O último comando faz requisições HTTP e registra resultados inconclusivos/bloqueados; não é parte da CI obrigatória. Os testes do site **não validam procedimentos em todos os smartphones**.

`check:snippets` requer Bash e Python 3 e confere apenas sintaxe, sem executar os exemplos. O relatório de validação também contém os comandos para repetir os testes em subdiretório.

## Organização

- `docs/`: conceitos, caminhos, compatibilidade, preparação, hardware, diagnóstico, recuperação, projetos e comunidade.
- `src/`: home, tema e assistente de decisão React, sem backend ou coleta própria.
- `templates/`: modelos de tutorial, dispositivo e registro de teste.
- `scripts/`: validação editorial, links internos e disponibilidade de fontes externas.
- `tests/`: invariantes de decisão e testes de navegador.
- `.github/workflows/`: CI e publicação manual no GitHub Pages.

## Publicar

Crie um repositório real e configure GitHub Pages para GitHub Actions. Execute manualmente o workflow Pages. O domínio/subcaminho são obtidos pela ação oficial; links GitHub só aparecem quando `GITHUB_REPOSITORY` é definido. Não há origem fictícia nem deploy executado automaticamente por esta entrega.

Outra hospedagem estática: build `npm ci && npm run build`, saída `build/`. Configure `DOCUSAURUS_URL` e `DOCUSAURUS_BASE_URL` conforme [.env.example](.env.example). Leia o [guia completo](docs/comunidade/publicacao.md).

## Evidências e limites

Revisão inicial: 10/10/2026. Os capítulos indicam fontes, condições e limites; o anúncio de mudança de postmarketOS para Nura está contextualizado. Informações documentais não são testes em hardware. Adaptações privadas do OnePlus não são distribuídas como suporte genérico. Fontes que bloquearam automação são identificadas.

## Contribuir e licenças

Veja a [arquitetura](ARCHITECTURE.md) e o [relatório de validação e pendências](VALIDATION.md) para manutenção e avaliação desta entrega.

Veja [CONTRIBUTING.md](CONTRIBUTING.md) e [SECURITY.md](SECURITY.md). Código original: [MIT](LICENSE). Documentação original: [CC BY-SA 4.0](LICENSE-DOCS.md). Material externo conserva sua licença e não é relicenciado por citação. Não envie firmware proprietário, credenciais ou imagens pessoais.
